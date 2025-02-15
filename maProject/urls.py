"""
URL configuration for maProject project.
...
"""
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
import debug_toolbar    
from rest_framework.routers import DefaultRouter
from maProject.apps.accounts.views_api import CustomUserViewSet
from maProject.apps.documents.views_api import DocumentViewSet
from maProject.apps.generation.views_api import FlashcardSetViewSet, FlashcardViewSet



router = DefaultRouter()
router.register(r'users', CustomUserViewSet, basename='user')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'flashcardsets', FlashcardSetViewSet, basename='flashcardset')
router.register(r'flashcards', FlashcardViewSet, basename='flashcard')

urlpatterns = [
    path("admin/", admin.site.urls),
    path('__debug__/', include('debug_toolbar.urls')),
    path('accounts/', include('maProject.apps.accounts.urls')),    
    path('generation/', include('maProject.apps.generation.urls')),
    path('documents/', include('maProject.apps.documents.urls')),
    path('api/', include(router.urls)),
]
