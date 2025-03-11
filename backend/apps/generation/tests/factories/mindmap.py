import factory
from django.contrib.auth import get_user_model
from backend.apps.generation.mindmap.models import MindMap
from backend.apps.accounts.tests.factories import CustomUserFactory



User = get_user_model()  # This references your custom user model

class MindMapFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = MindMap

    owner = factory.SubFactory(CustomUserFactory)
    title = factory.Faker("sentence")
    content = factory.Faker("text")