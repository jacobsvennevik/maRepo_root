# study/urls.py
from django.urls import path
from .views import generate_flashcards_view

urlpatterns = [
    path('generate/', generate_flashcards_view, name="generate_flashcards"),
]