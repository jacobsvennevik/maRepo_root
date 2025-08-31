from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sessions', views.ReflectionSessionViewSet, basename='reflection-session')
router.register(r'entries', views.ReflectionEntryViewSet, basename='reflection-entry')
router.register(r'checklists', views.ChecklistViewSet, basename='checklist')
router.register(r'recommendations', views.RecommendationViewSet, basename='recommendation')

urlpatterns = [
    path('', include(router.urls)),
    path('streak/', views.ReflectionStreakView.as_view(), name='reflection-streak'),
    path('summary/', views.ReflectionSummaryView.as_view(), name='reflection-summary'),
]
