"""
Model Utility Functions

This module provides utility functions for common model operations,
data analysis, and model management across the generation app.
"""

from django.db import models
from django.db.models import Q, Count, Avg, Max, Min, Sum, F
from django.utils import timezone
from typing import Dict, Any, List, Optional, Tuple, Union
from datetime import timedelta
import json


def get_model_stats(model_class, filters: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Get comprehensive statistics for a model.
    
    Args:
        model_class: Django model class
        filters: Optional filters to apply
        
    Returns:
        Dictionary with model statistics
    """
    queryset = model_class.objects.all()
    if filters:
        queryset = queryset.filter(**filters)
    
    total_count = queryset.count()
    
    # Get field statistics
    field_stats = {}
    for field in model_class._meta.fields:
        if field.get_internal_type() in ['CharField', 'TextField']:
            # Text field statistics
            non_empty = queryset.filter(**{f"{field.name}__isnull": False}).exclude(**{field.name: ""}).count()
            field_stats[field.name] = {
                'total': total_count,
                'non_empty': non_empty,
                'empty_percentage': ((total_count - non_empty) / total_count * 100) if total_count > 0 else 0
            }
        elif field.get_internal_type() in ['IntegerField', 'FloatField', 'DecimalField']:
            # Numeric field statistics
            values = queryset.filter(**{f"{field.name}__isnull": False}).values_list(field.name, flat=True)
            if values:
                field_stats[field.name] = {
                    'count': len(values),
                    'average': sum(values) / len(values),
                    'min': min(values),
                    'max': max(values)
                }
        elif field.get_internal_type() == 'DateTimeField':
            # DateTime field statistics
            non_null = queryset.filter(**{f"{field.name}__isnull": False})
            if non_null.exists():
                field_stats[field.name] = {
                    'count': non_null.count(),
                    'earliest': non_null.earliest(field.name).__getattribute__(field.name),
                    'latest': non_null.latest(field.name).__getattribute__(field.name)
                }
    
    return {
        'total_count': total_count,
        'field_statistics': field_stats,
        'filters_applied': filters or {}
    }


def get_model_field_usage(model_class, field_name: str, filters: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Get usage statistics for a specific field.
    
    Args:
        model_class: Django model class
        field_name: Name of the field to analyze
        filters: Optional filters to apply
        
    Returns:
        Dictionary with field usage statistics
    """
    queryset = model_class.objects.all()
    if filters:
        queryset = queryset.filter(**filters)
    
    field = model_class._meta.get_field(field_name)
    
    if field.get_internal_type() == 'CharField':
        # Get value distribution for CharField
        values = queryset.filter(**{f"{field_name}__isnull": False}).exclude(**{field_name: ""})
        value_counts = values.values(field_name).annotate(count=Count(field_name)).order_by('-count')
        
        return {
            'field_type': 'CharField',
            'total_values': values.count(),
            'unique_values': value_counts.count(),
            'top_values': list(value_counts[:10]),
            'empty_count': queryset.filter(Q(**{f"{field_name}__isnull": True}) | Q(**{field_name: ""})).count()
        }
    
    elif field.get_internal_type() in ['IntegerField', 'FloatField']:
        # Get numeric distribution
        values = queryset.filter(**{f"{field_name}__isnull": False})
        
        if values.exists():
            stats = values.aggregate(
                count=Count(field_name),
                avg=Avg(field_name),
                min=Min(field_name),
                max=Max(field_name)
            )
            
            # Get value ranges
            range_stats = {}
            if stats['min'] is not None and stats['max'] is not None:
                range_size = (stats['max'] - stats['min']) / 10 if stats['max'] != stats['min'] else 1
                for i in range(10):
                    start = stats['min'] + (i * range_size)
                    end = start + range_size
                    count = values.filter(**{f"{field_name}__gte": start, f"{field_name}__lt": end}).count()
                    range_stats[f"{start:.2f}-{end:.2f}"] = count
            
            return {
                'field_type': field.get_internal_type(),
                'statistics': stats,
                'range_distribution': range_stats,
                'null_count': queryset.filter(**{f"{field_name}__isnull": True}).count()
            }
    
    elif field.get_internal_type() == 'JSONField':
        # Get JSON field usage patterns
        values = queryset.filter(**{f"{field_name}__isnull": False}).exclude(**{field_name: {}})
        
        if values.exists():
            # Analyze JSON structure
            sample_values = list(values.values_list(field_name, flat=True)[:100])
            key_usage = {}
            
            for value in sample_values:
                if isinstance(value, dict):
                    for key in value.keys():
                        key_usage[key] = key_usage.get(key, 0) + 1
            
            return {
                'field_type': 'JSONField',
                'total_values': values.count(),
                'sample_analyzed': len(sample_values),
                'common_keys': sorted(key_usage.items(), key=lambda x: x[1], reverse=True)[:10],
                'empty_count': queryset.filter(Q(**{f"{field_name}__isnull": True}) | Q(**{field_name: {}})).count()
            }
    
    return {
        'field_type': field.get_internal_type(),
        'message': 'Field type analysis not implemented'
    }


def get_model_relationships(model_class) -> Dict[str, Any]:
    """
    Get information about model relationships.
    
    Args:
        model_class: Django model class
        
    Returns:
        Dictionary with relationship information
    """
    relationships = {
        'foreign_keys': [],
        'many_to_many': [],
        'one_to_one': [],
        'reverse_relationships': []
    }
    
    # Analyze forward relationships
    for field in model_class._meta.fields:
        if field.is_relation:
            rel_info = {
                'field_name': field.name,
                'related_model': field.related_model.__name__ if field.related_model else 'Unknown',
                'related_name': field.remote_field.related_name or f"{model_class.__name__.lower()}_set",
                'on_delete': str(field.remote_field.on_delete),
                'null': field.null,
                'blank': field.blank
            }
            
            if field.many_to_one:
                relationships['foreign_keys'].append(rel_info)
            elif field.one_to_one:
                relationships['one_to_one'].append(rel_info)
    
    # Analyze many-to-many relationships
    for field in model_class._meta.many_to_many:
        rel_info = {
            'field_name': field.name,
            'related_model': field.related_model.__name__ if field.related_model else 'Unknown',
            'related_name': field.remote_field.related_name or f"{model_class.__name__.lower()}_set",
            'through': field.remote_field.through.__name__ if field.remote_field.through else None
        }
        relationships['many_to_many'].append(rel_info)
    
    # Analyze reverse relationships
    for field in model_class._meta.get_fields():
        if field.is_relation and field.auto_created and not field.concrete:
            rel_info = {
                'field_name': field.name,
                'related_model': field.related_model.__name__ if field.related_model else 'Unknown',
                'field_type': 'reverse_' + ('many' if field.many_to_many else 'one'),
                'related_name': field.remote_field.related_name
            }
            relationships['reverse_relationships'].append(rel_info)
    
    return relationships


def get_model_performance_metrics(model_class, time_field: str = 'created_at', 
                                time_range: timedelta = timedelta(days=30)) -> Dict[str, Any]:
    """
    Get performance metrics for a model over time.
    
    Args:
        model_class: Django model class
        time_field: Name of the time field to use for analysis
        time_range: Time range to analyze
        
    Returns:
        Dictionary with performance metrics
    """
    cutoff_time = timezone.now() - time_range
    
    # Check if time field exists
    try:
        field = model_class._meta.get_field(time_field)
        if not isinstance(field, models.DateTimeField):
            return {'error': f'Field {time_field} is not a DateTimeField'}
    except models.FieldDoesNotExist:
        return {'error': f'Field {time_field} does not exist'}
    
    # Get recent and historical counts
    recent_count = model_class.objects.filter(**{f"{time_field}__gte": cutoff_time}).count()
    historical_count = model_class.objects.filter(**{f"{time_field}__lt": cutoff_time}).count()
    
    # Get creation rate
    if time_range.days > 0:
        daily_rate = recent_count / time_range.days
        weekly_rate = daily_rate * 7
        monthly_rate = daily_rate * 30
    else:
        daily_rate = weekly_rate = monthly_rate = 0
    
    # Get time-based distribution
    time_distribution = {}
    if time_range.days >= 7:
        # Weekly distribution
        for i in range(min(8, time_range.days // 7 + 1)):
            week_start = cutoff_time + timedelta(weeks=i)
            week_end = week_start + timedelta(weeks=1)
            count = model_class.objects.filter(
                **{f"{time_field}__gte": week_start, f"{time_field}__lt": week_end}
            ).count()
            time_distribution[f"Week {i+1}"] = count
    
    return {
        'time_field': time_field,
        'time_range_days': time_range.days,
        'recent_count': recent_count,
        'historical_count': historical_count,
        'total_count': recent_count + historical_count,
        'creation_rates': {
            'daily': daily_rate,
            'weekly': weekly_rate,
            'monthly': monthly_rate
        },
        'time_distribution': time_distribution,
        'growth_rate': (recent_count / max(1, historical_count)) if historical_count > 0 else float('inf')
    }


def bulk_update_model_fields(model_class, filters: Dict[str, Any], 
                           updates: Dict[str, Any], batch_size: int = 1000) -> Dict[str, Any]:
    """
    Bulk update model fields with progress tracking.
    
    Args:
        model_class: Django model class
        filters: Filters to apply for selection
        updates: Field updates to apply
        batch_size: Number of records to update in each batch
        
    Returns:
        Dictionary with update results
    """
    queryset = model_class.objects.filter(**filters)
    total_count = queryset.count()
    
    if total_count == 0:
        return {
            'total_records': 0,
            'updated_records': 0,
            'batches_processed': 0,
            'message': 'No records found matching filters'
        }
    
    # Validate update fields
    model_fields = {field.name for field in model_class._meta.fields}
    invalid_fields = set(updates.keys()) - model_fields
    
    if invalid_fields:
        return {
            'error': f'Invalid fields: {invalid_fields}',
            'valid_fields': list(model_fields)
        }
    
    # Process in batches
    updated_count = 0
    batches_processed = 0
    
    for offset in range(0, total_count, batch_size):
        batch = queryset[offset:offset + batch_size]
        batch_count = batch.count()
        
        # Update batch
        batch.update(**updates)
        updated_count += batch_count
        batches_processed += 1
    
    return {
        'total_records': total_count,
        'updated_records': updated_count,
        'batches_processed': batches_processed,
        'batch_size': batch_size,
        'filters_applied': filters,
        'fields_updated': list(updates.keys())
    }


def get_model_data_quality_report(model_class, filters: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generate a data quality report for a model.
    
    Args:
        model_class: Django model class
        filters: Optional filters to apply
        
    Returns:
        Dictionary with data quality metrics
    """
    queryset = model_class.objects.all()
    if filters:
        queryset = queryset.filter(**filters)
    
    total_count = queryset.count()
    
    if total_count == 0:
        return {
            'total_records': 0,
            'quality_score': 0.0,
            'message': 'No records found'
        }
    
    quality_metrics = {}
    total_score = 0
    max_score = 0
    
    for field in model_class._meta.fields:
        field_score = 0
        max_field_score = 100
        
        # Check for null values
        null_count = queryset.filter(**{f"{field.name}__isnull": True}).count()
        null_percentage = (null_count / total_count) * 100
        
        if field.null:
            # Null is allowed
            if null_percentage <= 10:
                field_score += 30  # Good: low null percentage
            elif null_percentage <= 30:
                field_score += 20  # Acceptable: moderate null percentage
            else:
                field_score += 10  # Poor: high null percentage
        else:
            # Null is not allowed
            if null_percentage == 0:
                field_score += 40  # Perfect: no nulls
            else:
                field_score += 0   # Poor: nulls where not allowed
        
        # Check for empty strings in text fields
        if field.get_internal_type() in ['CharField', 'TextField']:
            empty_count = queryset.filter(**{f"{field.name}__exact": ""}).count()
            empty_percentage = (empty_count / total_count) * 100
            
            if empty_percentage <= 5:
                field_score += 30  # Good: few empty strings
            elif empty_percentage <= 15:
                field_score += 20  # Acceptable: some empty strings
            else:
                field_score += 10  # Poor: many empty strings
        
        # Check for default values
        if field.has_default():
            default_count = queryset.filter(**{field.name: field.default}).count()
            default_percentage = (default_count / total_count) * 100
            
            if default_percentage <= 20:
                field_score += 20  # Good: few default values
            elif default_percentage <= 50:
                field_score += 15  # Acceptable: moderate default values
            else:
                field_score += 10  # Poor: many default values
        
        # Check for unique constraints
        if field.unique:
            unique_count = queryset.values(field.name).distinct().count()
            uniqueness_percentage = (unique_count / total_count) * 100
            
            if uniqueness_percentage >= 95:
                field_score += 20  # Good: high uniqueness
            elif uniqueness_percentage >= 80:
                field_score += 15  # Acceptable: moderate uniqueness
            else:
                field_score += 10  # Poor: low uniqueness
        
        quality_metrics[field.name] = {
            'score': field_score,
            'max_score': max_field_score,
            'percentage': (field_score / max_field_score) * 100,
            'null_percentage': null_percentage,
            'issues': []
        }
        
        # Add specific issues
        if null_percentage > 0 and not field.null:
            quality_metrics[field.name]['issues'].append(f"Contains {null_percentage:.1f}% null values (not allowed)")
        
        if field.get_internal_type() in ['CharField', 'TextField']:
            empty_count = queryset.filter(**{f"{field.name}__exact": ""}).count()
            empty_percentage = (empty_count / total_count) * 100
            if empty_percentage > 20:
                quality_metrics[field.name]['issues'].append(f"Contains {empty_percentage:.1f}% empty strings")
        
        total_score += field_score
        max_score += max_field_score
    
    overall_quality = (total_score / max_score) * 100 if max_score > 0 else 0
    
    return {
        'total_records': total_count,
        'quality_score': overall_quality,
        'field_metrics': quality_metrics,
        'overall_assessment': 'Excellent' if overall_quality >= 90 else 'Good' if overall_quality >= 75 else 'Acceptable' if overall_quality >= 60 else 'Needs Improvement',
        'filters_applied': filters or {}
    }


def export_model_data(model_class, filters: Dict[str, Any] = None, 
                     fields: List[str] = None, format: str = 'json') -> Union[str, Dict[str, Any]]:
    """
    Export model data in various formats.
    
    Args:
        model_class: Django model class
        filters: Optional filters to apply
        fields: List of fields to export (None for all)
        format: Export format ('json', 'csv', 'dict')
        
    Returns:
        Exported data in specified format
    """
    queryset = model_class.objects.all()
    if filters:
        queryset = queryset.filter(**filters)
    
    if fields:
        queryset = queryset.values(*fields)
    else:
        queryset = queryset.values()
    
    data = list(queryset)
    
    if format == 'json':
        return json.dumps(data, indent=2, default=str)
    elif format == 'csv':
        if not data:
            return ""
        
        # Generate CSV
        import csv
        from io import StringIO
        
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        
        return output.getvalue()
    elif format == 'dict':
        return {
            'model': model_class.__name__,
            'total_records': len(data),
            'fields': list(data[0].keys()) if data else [],
            'data': data,
            'filters_applied': filters or {}
        }
    else:
        return {'error': f'Unsupported format: {format}'}
