from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

class Command(BaseCommand):
    help = 'Get or create an auth token for a user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='The username of the user')

    def handle(self, *args, **options):
        User = get_user_model()
        username = options['username']
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User "{username}" does not exist.'))
            return

        token, created = Token.objects.get_or_create(user=user)
        self.stdout.write(self.style.SUCCESS(f'Auth Token for {username}: {token.key}')) 