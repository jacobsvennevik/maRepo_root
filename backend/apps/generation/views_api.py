from rest_framework import viewsets, permissions
from .models import FlashcardSet, Flashcard, MindMap
from .serializers import FlashcardSetSerializer, FlashcardSerializer, MindMapSerializer

class FlashcardSetViewSet(viewsets.ModelViewSet):
    queryset = FlashcardSet.objects.all()
    serializer_class = FlashcardSetSerializer
    # permission_classes = [permissions.IsAuthenticated]

class FlashcardViewSet(viewsets.ModelViewSet):
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer
    # permission_classes = [permissions.IsAuthenticated]
    

class MindMapViewSet(viewsets.ModelViewSet):
    queryset = MindMap.objects.all()
    serializer_class = MindMapSerializer
    # permission_classes = [permissions.IsAuthenticated]
