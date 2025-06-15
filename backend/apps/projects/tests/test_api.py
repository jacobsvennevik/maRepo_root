import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .factories import ProjectFactory
from backend.apps.accounts.tests.factories import CustomUserFactory

@pytest.mark.django_db
def test_project_list_unauthenticated():
    """
    Test that unauthenticated users cannot access the project list.
    """
    client = APIClient()
    url = reverse('project-list')
    response = client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_project_list_authenticated():
    """
    Test that authenticated users can access their own projects.
    """
    user = CustomUserFactory()
    ProjectFactory(owner=user)
    ProjectFactory(owner=user)
    ProjectFactory() # Belongs to another user

    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse('project-list')
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2

@pytest.mark.django_db
def test_create_school_project():
    """
    Test creating a school project.
    """
    user = CustomUserFactory()
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse('project-list')
    data = {
        'name': 'History Thesis',
        'project_type': 'school',
        'course_name': 'History 101',
    }
    response = client.post(url, data, format='json')

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['name'] == 'History Thesis'
    assert response.data['project_type'] == 'school'
    assert response.data['course_name'] == 'History 101'

@pytest.mark.django_db
def test_create_self_study_project():
    """
    Test creating a self-study project.
    """
    user = CustomUserFactory()
    client = APIClient()
    client.force_authenticate(user=user)
    url = reverse('project-list')
    data = {
        'name': 'Learn Django',
        'project_type': 'self_study',
        'goal_description': 'Master Django Rest Framework',
    }
    response = client.post(url, data, format='json')

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['name'] == 'Learn Django'
    assert response.data['project_type'] == 'self_study'
    assert response.data['goal_description'] == 'Master Django Rest Framework' 