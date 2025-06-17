# backend/apps/generation/serializers.py
from rest_framework import serializers
from .models import FlashcardSet, Flashcard, GeneratedContent

class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = [
            'id',
            'flashcard_set',  # foreign key reference; you can change this to a nested representation if needed
            'question',
            'answer',
            'updated_at'
        ]

class FlashcardSetSerializer(serializers.ModelSerializer):
    # Assuming that Flashcard model has a foreign key to FlashcardSet and a related_name of 'flashcards'
    flashcards = FlashcardSerializer(many=True, read_only=True)

    class Meta:
        model = FlashcardSet
        fields = [
            'id',
            'title',
            'document',    # assuming a foreign key or relation to Document
            'owner',       # the user who owns the flashcard set
            'created_at',
            'flashcards'   # nested list of flashcards
        ]


# backend/apps/generation/serializers.py

from rest_framework import serializers
from .models import MindMap

class MindMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = MindMap
        fields = ['id', 'title', 'content', 'owner', 'created_at', 'updated_at']

class GeneratedContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedContent
        fields = '__all__'
