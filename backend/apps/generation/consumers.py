"""
WebSocket consumers for real-time study progress updates.
"""
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.cache import cache
from backend.apps.generation.models import Flashcard, FlashcardSet
from backend.apps.generation.services.spaced_repetition import SpacedRepetitionService

logger = logging.getLogger(__name__)
User = get_user_model()


class StudyProgressConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time study progress updates.
    Handles flashcard reviews, progress tracking, and live updates.
    """
    
    async def connect(self):
        """Accept WebSocket connection and join user-specific group."""
        self.user_id = self.scope["user"].id
        self.user_group_name = f"user_{self.user_id}"
        
        # Join user-specific group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"WebSocket connected for user {self.user_id}")
        
        # Send initial study stats
        await self.send_initial_stats()
    
    async def disconnect(self, close_code):
        """Leave user group when disconnecting."""
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected for user {self.user_id}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'flashcard_review':
                await self.handle_flashcard_review(data)
            elif message_type == 'get_progress':
                await self.send_study_progress()
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Internal server error'
            }))
    
    async def handle_flashcard_review(self, data):
        """Handle flashcard review and broadcast progress update."""
        flashcard_id = data.get('flashcard_id')
        rating = data.get('rating')  # 1-5 scale
        
        if not flashcard_id or not rating:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Missing flashcard_id or rating'
            }))
            return
        
        try:
            # Process the review
            result = await self.process_flashcard_review(flashcard_id, rating)
            
            # Broadcast progress update to user
            await self.channel_layer.group_send(
                self.user_group_name,
                {
                    'type': 'study_progress_update',
                    'data': result
                }
            )
            
        except Exception as e:
            logger.error(f"Error processing flashcard review: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to process review'
            }))
    
    @database_sync_to_async
    def process_flashcard_review(self, flashcard_id, rating):
        """Process flashcard review and return updated progress."""
        try:
            flashcard = Flashcard.objects.get(id=flashcard_id, user=self.scope["user"])
            
            # Update spaced repetition data
            spaced_repetition = SpacedRepetitionService()
            updated_card = spaced_repetition.review_card(flashcard, rating)
            
            # Get updated progress stats
            progress_stats = self.get_user_progress_stats()
            
            return {
                'flashcard_id': flashcard_id,
                'rating': rating,
                'next_review': updated_card.next_review.isoformat() if updated_card.next_review else None,
                'progress_stats': progress_stats,
                'timestamp': updated_card.last_reviewed.isoformat() if updated_card.last_reviewed else None
            }
            
        except Flashcard.DoesNotExist:
            raise Exception("Flashcard not found")
    
    @database_sync_to_async
    def get_user_progress_stats(self):
        """Get comprehensive study progress statistics."""
        user = self.scope["user"]
        
        # Get flashcard statistics
        total_cards = Flashcard.objects.filter(user=user).count()
        reviewed_today = Flashcard.objects.filter(
            user=user,
            last_reviewed__date=timezone.now().date()
        ).count()
        
        # Get due cards count
        due_cards = Flashcard.objects.filter(
            user=user,
            next_review__lte=timezone.now()
        ).count()
        
        # Get streak information
        streak = self.calculate_study_streak(user)
        
        return {
            'total_cards': total_cards,
            'reviewed_today': reviewed_today,
            'due_cards': due_cards,
            'study_streak': streak,
            'completion_rate': (reviewed_today / max(total_cards, 1)) * 100
        }
    
    @database_sync_to_async
    def calculate_study_streak(self, user):
        """Calculate consecutive study days."""
        from django.utils import timezone
        from datetime import timedelta
        
        streak = 0
        current_date = timezone.now().date()
        
        while True:
            has_study = Flashcard.objects.filter(
                user=user,
                last_reviewed__date=current_date
            ).exists()
            
            if has_study:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        return streak
    
    async def send_initial_stats(self):
        """Send initial study statistics on connection."""
        stats = await self.get_user_progress_stats()
        await self.send(text_data=json.dumps({
            'type': 'initial_stats',
            'data': stats
        }))
    
    async def send_study_progress(self):
        """Send current study progress."""
        stats = await self.get_user_progress_stats()
        await self.send(text_data=json.dumps({
            'type': 'study_progress',
            'data': stats
        }))
    
    async def study_progress_update(self, event):
        """Handle study progress update broadcasts."""
        await self.send(text_data=json.dumps({
            'type': 'progress_update',
            'data': event['data']
        }))


class ProjectUpdatesConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time project updates.
    Handles project creation, updates, and file processing status.
    """
    
    async def connect(self):
        """Accept WebSocket connection and join user-specific group."""
        self.user_id = self.scope["user"].id
        self.user_group_name = f"user_{self.user_id}_projects"
        
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"Project WebSocket connected for user {self.user_id}")
    
    async def disconnect(self, close_code):
        """Leave user group when disconnecting."""
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )
        logger.info(f"Project WebSocket disconnected for user {self.user_id}")
    
    async def project_created(self, event):
        """Handle project creation broadcasts."""
        await self.send(text_data=json.dumps({
            'type': 'project_created',
            'data': event['data']
        }))
    
    async def project_updated(self, event):
        """Handle project update broadcasts."""
        await self.send(text_data=json.dumps({
            'type': 'project_updated',
            'data': event['data']
        }))
    
    async def file_processing_update(self, event):
        """Handle file processing status updates."""
        await self.send(text_data=json.dumps({
            'type': 'file_processing_update',
            'data': event['data']
        }))
