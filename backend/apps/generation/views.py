from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import GeneratedContent
from .serializers import GeneratedContentSerializer
from .services.flashcard_generator import generate_flashcards
from .services.mindmap_generator import generate_mindmap
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
        
        flashcards_data = generate_flashcards(document.original_text)
        
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