from rest_framework import viewsets, permissions
from .models import FlashcardSet, Flashcard
from .serializers import FlashcardSetSerializer, FlashcardSerializer

class FlashcardSetViewSet(viewsets.ModelViewSet):
    queryset = FlashcardSet.objects.all()
    serializer_class = FlashcardSetSerializer
    # permission_classes = [permissions.IsAuthenticated]

class FlashcardViewSet(viewsets.ModelViewSet):
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer
    # permission_classes = [permissions.IsAuthenticated]
