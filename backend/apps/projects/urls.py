from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, reset_test_database

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path('api/', include(router.urls)),
    path('test-utils/reset_db/', reset_test_database, name='reset_test_database'),
] 