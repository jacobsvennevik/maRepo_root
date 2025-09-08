"""
GraphQL schema definitions for flexible frontend queries.
"""
import graphene
from graphene_django import DjangoObjectType, DjangoListField
from graphene_django.filter import DjangoFilterConnectionField
from django.contrib.auth import get_user_model
from backend.apps.projects.models import Project
from backend.apps.generation.models import FlashcardSet, Flashcard
from backend.apps.pdf_service.models import UploadedFile
from backend.apps.reflection.models import ReflectionEntry

User = get_user_model()


class UserType(DjangoObjectType):
    """GraphQL type for User model."""
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "date_joined")
        filter_fields = ["email", "first_name", "last_name"]


class ProjectType(DjangoObjectType):
    """GraphQL type for Project model."""
    files = DjangoListField('backend.apps.generation.schema.UploadedFileType')
    flashcard_sets = DjangoListField('backend.apps.generation.schema.FlashcardSetType')
    
    class Meta:
        model = Project
        fields = "__all__"
        filter_fields = {
            "name": ["exact", "icontains"],
            "type": ["exact"],
            "created_at": ["exact", "gte", "lte"],
            "owner": ["exact"],
        }
        interfaces = (graphene.relay.Node,)


class FlashcardSetType(DjangoObjectType):
    """GraphQL type for FlashcardSet model."""
    flashcards = DjangoListField('backend.apps.generation.schema.FlashcardType')
    
    class Meta:
        model = FlashcardSet
        fields = "__all__"
        filter_fields = {
            "title": ["exact", "icontains"],
            "project": ["exact"],
            "created_at": ["exact", "gte", "lte"],
        }
        interfaces = (graphene.relay.Node,)


class FlashcardType(DjangoObjectType):
    """GraphQL type for Flashcard model."""
    class Meta:
        model = Flashcard
        fields = "__all__"
        filter_fields = {
            "question": ["exact", "icontains"],
            "answer": ["exact", "icontains"],
            "flashcard_set": ["exact"],
            "difficulty": ["exact", "gte", "lte"],
            "next_review": ["exact", "gte", "lte"],
        }
        interfaces = (graphene.relay.Node,)


class UploadedFileType(DjangoObjectType):
    """GraphQL type for UploadedFile model."""
    class Meta:
        model = UploadedFile
        fields = "__all__"
        filter_fields = {
            "filename": ["exact", "icontains"],
            "project": ["exact"],
            "uploaded_at": ["exact", "gte", "lte"],
        }
        interfaces = (graphene.relay.Node,)


class ReflectionEntryType(DjangoObjectType):
    """GraphQL type for ReflectionEntry model."""
    class Meta:
        model = ReflectionEntry
        fields = "__all__"
        filter_fields = {
            "title": ["exact", "icontains"],
            "project": ["exact"],
            "created_at": ["exact", "gte", "lte"],
        }
        interfaces = (graphene.relay.Node,)


class StudyStatsType(graphene.ObjectType):
    """GraphQL type for study statistics."""
    total_cards = graphene.Int()
    reviewed_today = graphene.Int()
    due_cards = graphene.Int()
    study_streak = graphene.Int()
    completion_rate = graphene.Float()
    cards_by_difficulty = graphene.List(graphene.Int)


class ProjectDetailType(graphene.ObjectType):
    """GraphQL type for detailed project information."""
    project = graphene.Field(ProjectType)
    files = graphene.List(UploadedFileType)
    flashcard_sets = graphene.List(FlashcardSetType)
    study_stats = graphene.Field(StudyStatsType)
    recent_reflections = graphene.List(ReflectionEntryType)


class Query(graphene.ObjectType):
    """Root GraphQL query."""
    
    # User queries
    me = graphene.Field(UserType)
    users = DjangoFilterConnectionField(UserType)
    
    # Project queries
    projects = DjangoFilterConnectionField(ProjectType)
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))
    project_detail = graphene.Field(ProjectDetailType, id=graphene.ID(required=True))
    
    # Flashcard queries
    flashcard_sets = DjangoFilterConnectionField(FlashcardSetType)
    flashcards = DjangoFilterConnectionField(FlashcardType)
    due_cards = graphene.List(FlashcardType)
    
    # Study statistics
    study_stats = graphene.Field(StudyStatsType)
    
    def resolve_me(self, info):
        """Get current user."""
        if info.context.user.is_authenticated:
            return info.context.user
        return None
    
    def resolve_projects(self, info, **kwargs):
        """Get user's projects."""
        if not info.context.user.is_authenticated:
            return Project.objects.none()
        return Project.objects.filter(owner=info.context.user)
    
    def resolve_project(self, info, id):
        """Get specific project."""
        if not info.context.user.is_authenticated:
            return None
        try:
            return Project.objects.get(id=id, owner=info.context.user)
        except Project.DoesNotExist:
            return None
    
    def resolve_project_detail(self, info, id):
        """Get detailed project information."""
        if not info.context.user.is_authenticated:
            return None
        
        try:
            project = Project.objects.get(id=id, owner=info.context.user)
            
            # Get related data
            files = UploadedFile.objects.filter(project=project)
            flashcard_sets = FlashcardSet.objects.filter(project=project)
            recent_reflections = ReflectionEntry.objects.filter(
                project=project
            ).order_by('-created_at')[:5]
            
            # Calculate study stats
            study_stats = self.calculate_study_stats(info.context.user, project)
            
            return ProjectDetailType(
                project=project,
                files=files,
                flashcard_sets=flashcard_sets,
                study_stats=study_stats,
                recent_reflections=recent_reflections
            )
        except Project.DoesNotExist:
            return None
    
    def resolve_due_cards(self, info):
        """Get cards due for review."""
        if not info.context.user.is_authenticated:
            return []
        
        from django.utils import timezone
        return Flashcard.objects.filter(
            user=info.context.user,
            next_review__lte=timezone.now()
        ).order_by('next_review')
    
    def resolve_study_stats(self, info):
        """Get comprehensive study statistics."""
        if not info.context.user.is_authenticated:
            return None
        
        return self.calculate_study_stats(info.context.user)
    
    def calculate_study_stats(self, user, project=None):
        """Calculate study statistics for user/project."""
        from django.utils import timezone
        from datetime import timedelta
        
        # Base queryset
        cards_queryset = Flashcard.objects.filter(user=user)
        if project:
            cards_queryset = cards_queryset.filter(flashcard_set__project=project)
        
        # Basic stats
        total_cards = cards_queryset.count()
        reviewed_today = cards_queryset.filter(
            last_reviewed__date=timezone.now().date()
        ).count()
        
        due_cards = cards_queryset.filter(
            next_review__lte=timezone.now()
        ).count()
        
        # Calculate streak
        streak = 0
        current_date = timezone.now().date()
        
        while True:
            has_study = cards_queryset.filter(
                last_reviewed__date=current_date
            ).exists()
            
            if has_study:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        # Cards by difficulty
        cards_by_difficulty = []
        for difficulty in range(1, 6):
            count = cards_queryset.filter(difficulty=difficulty).count()
            cards_by_difficulty.append(count)
        
        completion_rate = (reviewed_today / max(total_cards, 1)) * 100
        
        return StudyStatsType(
            total_cards=total_cards,
            reviewed_today=reviewed_today,
            due_cards=due_cards,
            study_streak=streak,
            completion_rate=completion_rate,
            cards_by_difficulty=cards_by_difficulty
        )


class CreateProjectMutation(graphene.Mutation):
    """Mutation to create a new project."""
    
    class Arguments:
        name = graphene.String(required=True)
        project_type = graphene.String(required=True)
        description = graphene.String()
    
    project = graphene.Field(ProjectType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    def mutate(self, info, name, project_type, description=None):
        """Create a new project."""
        if not info.context.user.is_authenticated:
            return CreateProjectMutation(
                success=False,
                errors=["Authentication required"]
            )
        
        try:
            project = Project.objects.create(
                name=name,
                type=project_type,
                description=description,
                owner=info.context.user
            )
            
            # Broadcast project creation via WebSocket
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{info.context.user.id}_projects",
                {
                    'type': 'project_created',
                    'data': {
                        'id': str(project.id),
                        'name': project.name,
                        'type': project.type,
                        'created_at': project.created_at.isoformat()
                    }
                }
            )
            
            return CreateProjectMutation(
                project=project,
                success=True,
                errors=[]
            )
        except Exception as e:
            return CreateProjectMutation(
                success=False,
                errors=[str(e)]
            )


class ReviewFlashcardMutation(graphene.Mutation):
    """Mutation to review a flashcard."""
    
    class Arguments:
        flashcard_id = graphene.ID(required=True)
        rating = graphene.Int(required=True)  # 1-5 scale
    
    flashcard = graphene.Field(FlashcardType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    
    def mutate(self, info, flashcard_id, rating):
        """Review a flashcard."""
        if not info.context.user.is_authenticated:
            return ReviewFlashcardMutation(
                success=False,
                errors=["Authentication required"]
            )
        
        if rating < 1 or rating > 5:
            return ReviewFlashcardMutation(
                success=False,
                errors=["Rating must be between 1 and 5"]
            )
        
        try:
            flashcard = Flashcard.objects.get(
                id=flashcard_id,
                user=info.context.user
            )
            
            # Update spaced repetition data
            from backend.apps.generation.services.spaced_repetition import SpacedRepetitionService
            spaced_repetition = SpacedRepetitionService()
            updated_card = spaced_repetition.review_card(flashcard, rating)
            
            # Broadcast progress update via WebSocket
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{info.context.user.id}",
                {
                    'type': 'study_progress_update',
                    'data': {
                        'flashcard_id': str(flashcard.id),
                        'rating': rating,
                        'next_review': updated_card.next_review.isoformat() if updated_card.next_review else None,
                        'timestamp': updated_card.last_reviewed.isoformat() if updated_card.last_reviewed else None
                    }
                }
            )
            
            return ReviewFlashcardMutation(
                flashcard=updated_card,
                success=True,
                errors=[]
            )
        except Flashcard.DoesNotExist:
            return ReviewFlashcardMutation(
                success=False,
                errors=["Flashcard not found"]
            )
        except Exception as e:
            return ReviewFlashcardMutation(
                success=False,
                errors=[str(e)]
            )


class Mutation(graphene.ObjectType):
    """Root GraphQL mutation."""
    create_project = CreateProjectMutation.Field()
    review_flashcard = ReviewFlashcardMutation.Field()


# Create a simple schema for now
schema = graphene.Schema(query=Query)
