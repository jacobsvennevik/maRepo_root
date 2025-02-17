# backend/apps/accounts/views_api.py
from rest_framework import viewsets, permissions
from .models import CustomUser
from .serializers import CustomUserSerializer

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    def get_permissions(self):
        if self.action == "create":
            # Allow anyone to create a user (i.e., register)
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
