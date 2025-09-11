"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SORT_OPTIONS } from './constants';
import type { SortChipsProps } from './types';

export function SortChips({
  currentSort,
  sortDirection,
  onSortChange,
  onDirectionChange,
  className,
}: SortChipsProps) {
  const handleSortClick = (sort: typeof currentSort) => {
    if (currentSort === sort) {
      // Toggle direction if same sort is clicked
      onDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort with default direction
      onSortChange(sort);
      onDirectionChange('desc'); // Default to descending for most sorts
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className="text-sm font-medium text-gray-700">Sort by:</span>
      <div className="flex items-center space-x-1">
        {SORT_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={currentSort === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortClick(option.value)}
            className={cn(
              'h-8 px-3 text-xs font-medium transition-all duration-200',
              currentSort === option.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            )}
            aria-pressed={currentSort === option.value}
          >
            {option.label}
            {currentSort === option.value && (
              <div className="ml-1 flex items-center">
                {sortDirection === 'asc' ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
