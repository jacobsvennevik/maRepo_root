from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudyMaterialViewSet

router = DefaultRouter()
router.register(r'study_materials', StudyMaterialViewSet, basename='studymaterial')

urlpatterns = [
    path('', include(router.urls)),
] 