from django.urls import path
from .views_api import CustomUserViewSet
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # ... other API endpoints ...
]