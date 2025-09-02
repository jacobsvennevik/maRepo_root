"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from backend.apps.accounts.views_api import CustomUserViewSet, EmailTokenObtainPairView
from backend.apps.generation.api_views.flashcard_views import FlashcardSetViewSet, FlashcardViewSet
from backend.apps.generation.api_views.mindmap_views import MindMapViewSet
from backend.apps.projects.views import ProjectViewSet

# API router setup
router = DefaultRouter()
router.register('users', CustomUserViewSet, basename='user')
router.register('flashcard-sets', FlashcardSetViewSet)
router.register('flashcards', FlashcardViewSet)
router.register('mind-maps', MindMapViewSet)
router.register('projects', ProjectViewSet, basename='project')

urlpatterns = [
    # Redirect root to admin
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # Authentication
    path('accounts/', include('django.contrib.auth.urls')),
    # JWT token endpoints (support both with and without trailing slash to avoid APPEND_SLASH issues on POST)
    path('api/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token', EmailTokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/refresh', TokenRefreshView.as_view()),
    
    # API
    path('api/', include(router.urls)),
    path('api/pdf_service/', include('backend.apps.pdf_service.api_urls')),
    path('api/', include('backend.apps.pdf_service.urls')),  # Include upload endpoints
    path('api/auth/', include('rest_framework.urls')),

    # App URLs
    path('generation/', include('backend.apps.generation.urls')),
    path('projects/', include('backend.apps.projects.urls')),
    path('study_materials/', include('backend.apps.study_materials.urls')),
    path('pdf_service/', include('backend.apps.pdf_service.urls')),
    path('reflection/', include('backend.apps.reflection.urls')),
]

# Debug toolbar and static/media files
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns
