from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_api import CustomUserViewSet, EmailTokenObtainPairView

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)

urlpatterns = [
    path("api/auth/login/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/", include(router.urls)),
]