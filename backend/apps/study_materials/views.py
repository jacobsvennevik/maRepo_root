from rest_framework import viewsets
from .models import StudyMaterial
from .serializers import StudyMaterialSerializer

class StudyMaterialViewSet(viewsets.ModelViewSet):
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialSerializer 