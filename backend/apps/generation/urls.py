from django.urls import path
from .views import generate_flashcards_view, generate_mindmap_view

urlpatterns = [
    path('flashcards/generate/', generate_flashcards_view, name="generate_flashcards"),
    path('mindmap/generate/', generate_mindmap_view, name="generate_mindmap"),
]
