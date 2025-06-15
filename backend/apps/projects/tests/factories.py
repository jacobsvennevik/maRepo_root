import factory
from factory.django import DjangoModelFactory
from backend.apps.projects.models import Project
from backend.apps.accounts.tests.factories import CustomUserFactory

class ProjectFactory(DjangoModelFactory):
    class Meta:
        model = Project

    name = factory.Faker('sentence', nb_words=4)
    owner = factory.SubFactory(CustomUserFactory)
    project_type = 'school'  # Default project type

    # Specific fields for 'school' projects
    course_name = factory.Faker('catch_phrase')
    course_code = factory.Faker('bothify', text='???-###')
    teacher_name = factory.Faker('name')

    # Specific fields for 'self_study' projects
    goal_description = factory.Faker('text')
    study_frequency = 'daily' 