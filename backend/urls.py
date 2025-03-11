"""
URL configuration for backend project.
...
"""
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
import debug_toolbar    
from rest_framework.routers import DefaultRouter
from backend.apps.accounts.views_api import CustomUserViewSet
from backend.apps.documents.views_api import DocumentViewSet
from backend.apps.generation.views_api import FlashcardSetViewSet, FlashcardViewSet, MindMapViewSet



router = DefaultRouter()
router.register(r'users', CustomUserViewSet, basename='user')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'flashcardsets', FlashcardSetViewSet, basename='flashcardset')
router.register(r'flashcards', FlashcardViewSet, basename='flashcard')
router.register(r'mindmaps', MindMapViewSet, basename='mindmap')

urlpatterns = [
    path("admin/", admin.site.urls),
    path('__debug__/', include('debug_toolbar.urls')),
    path('accounts/', include('backend.apps.accounts.urls')),    
    path('generation/', include('backend.apps.generation.urls')),
    path('documents/', include('backend.apps.documents.urls')),
    path('api/', include(router.urls)),
]
