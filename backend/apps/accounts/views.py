# accounts/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .forms import RegistrationForm

@api_view(["POST"])
def register_user(request):
    # request.data is the JSON payload from React
    form = RegistrationForm(request.data)
    if form.is_valid():
        form.save()
        return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)
    return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import generics
from .models import CustomUser
from .serializers import CustomUserSerializer

class UserCreateView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer