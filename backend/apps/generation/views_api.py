from rest_framework import viewsets, permissions
from .models import FlashcardSet, Flashcard, MindMap
from .serializers import FlashcardSetSerializer, FlashcardSerializer, MindMapSerializer

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class FlashcardSetViewSet(viewsets.ModelViewSet):
    queryset = FlashcardSet.objects.all()
    serializer_class = FlashcardSetSerializer
    # permission_classes = [permissions.IsAuthenticated]

class FlashcardViewSet(viewsets.ModelViewSet):
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer
    # permission_classes = [permissions.IsAuthenticated]



class MindMapViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing, creating, and generating mind maps.
    """
    serializer_class = MindMapSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return mind maps belonging to the authenticated user.
        return MindMap.objects.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Custom endpoint to generate a mind map from text.
        Expected payload:
        {
            "title": "My Mind Map",
            "text": "Full document text or notes..."
        }
        """
        title = request.data.get("title")
        text = request.data.get("text")
        if not title or not text:
            return Response(
                {"error": "Both title and text are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate mind map content using the AI service.
            mindmap_content = generate_mindmap(text)
        except Exception as e:
            return Response(
                {"error": f"AI generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create and save the MindMap instance.
        mindmap = MindMap.objects.create(
            owner=request.user,
            title=title,
            content=mindmap_content
        )
        serializer = self.get_serializer(mindmap)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
