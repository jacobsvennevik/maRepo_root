from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from .models import GeneratedContent, FlashcardSet
from .serializers import GeneratedContentSerializer
from .services.flashcard_generator import FlashcardGenerator
from .services.mindmap_generator import generate_mindmap
from .services.anki_exporter import AnkiExportService
from backend.apps.pdf_service.django_models import Document

class GeneratedContentViewSet(viewsets.ModelViewSet):
    queryset = GeneratedContent.objects.all()
    serializer_class = GeneratedContentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_flashcards_view(request):
    document_id = request.data.get('document_id')
    try:
        document = Document.objects.get(id=document_id, user=request.user)
        if not document.original_text:
            return Response({'error': 'Document text is empty.'}, status=status.HTTP_400_BAD_REQUEST)
        
        generator = FlashcardGenerator()
        flashcards_data = generator.generate_from_content(document.original_text)
        
        generated_content = GeneratedContent.objects.create(
            user=request.user,
            content_type='flashcards',
            original_document=document,
            generated_data=flashcards_data
        )
        return Response(GeneratedContentSerializer(generated_content).data)

    except Document.DoesNotExist:
        return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_mindmap_view(request):
    document_id = request.data.get('document_id')
    try:
        document = Document.objects.get(id=document_id, user=request.user)
        if not document.original_text:
            return Response({'error': 'Document text is empty.'}, status=status.HTTP_400_BAD_REQUEST)
        
        mindmap_data = generate_mindmap(document.original_text)
        
        generated_content = GeneratedContent.objects.create(
            user=request.user,
            content_type='mindmap',
            original_document=document,
            generated_data=mindmap_data
        )
        return Response(GeneratedContentSerializer(generated_content).data)

    except Document.DoesNotExist:
        return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_flashcard_set_to_anki(request, flashcard_set_id):
    """
    Export a specific flashcard set to Anki format (.apkg file).
    """
    try:
        flashcard_set = FlashcardSet.objects.get(
            id=flashcard_set_id, 
            owner=request.user
        )
        
        # Get optional parameters
        include_source = request.GET.get('include_source', 'true').lower() == 'true'
        card_type = request.GET.get('card_type', 'basic')
        
        # Validate card type
        if card_type not in ['basic', 'cloze']:
            return Response(
                {'error': 'Invalid card_type. Must be "basic" or "cloze".'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Export flashcard set
        exporter = AnkiExportService()
        apkg_content = exporter.export_flashcard_set(
            flashcard_set=flashcard_set,
            include_source=include_source,
            card_type=card_type
        )
        
        # Create filename
        safe_title = "".join(c for c in flashcard_set.title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"{safe_title}_flashcards.apkg"
        
        # Return file response
        return exporter.create_http_response(apkg_content, filename)
        
    except FlashcardSet.DoesNotExist:
        return Response(
            {'error': 'Flashcard set not found or you do not have permission to access it.'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to export flashcard set: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_user_flashcards_to_anki(request):
    """
    Export all flashcard sets for the authenticated user to a single Anki deck.
    """
    try:
        # Get optional parameters
        include_source = request.GET.get('include_source', 'true').lower() == 'true'
        deck_name = request.GET.get('deck_name', f"{request.user.email.split('@')[0]}'s Ocean Learn Flashcards")
        
        # Export user's flashcards
        exporter = AnkiExportService()
        apkg_content = exporter.export_user_flashcards(
            user=request.user,
            include_source=include_source
        )
        
        # Create filename
        safe_username = "".join(c for c in request.user.email.split('@')[0] if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"{safe_username}_all_flashcards.apkg"
        
        # Return file response
        return exporter.create_http_response(apkg_content, filename)
        
    except ValueError as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to export flashcards: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_multiple_flashcard_sets_to_anki(request):
    """
    Export multiple flashcard sets to a single Anki deck.
    """
    try:
        # Get flashcard set IDs from request
        flashcard_set_ids = request.data.get('flashcard_set_ids', [])
        if not flashcard_set_ids:
            return Response(
                {'error': 'flashcard_set_ids is required and must be a non-empty list.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get optional parameters
        include_source = request.data.get('include_source', True)
        deck_name = request.data.get('deck_name', 'Ocean Learn Combined Deck')
        
        # Get flashcard sets
        flashcard_sets = FlashcardSet.objects.filter(
            id__in=flashcard_set_ids,
            owner=request.user
        ).prefetch_related('flashcards')
        
        if not flashcard_sets.exists():
            return Response(
                {'error': 'No valid flashcard sets found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Export flashcard sets
        exporter = AnkiExportService()
        apkg_content = exporter.export_multiple_sets(
            flashcard_sets=list(flashcard_sets),
            deck_name=deck_name,
            include_source=include_source
        )
        
        # Create filename
        safe_deck_name = "".join(c for c in deck_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
        filename = f"{safe_deck_name}.apkg"
        
        # Return file response
        return exporter.create_http_response(apkg_content, filename)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to export flashcard sets: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 