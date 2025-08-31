from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test user for E2E testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='test@example.com',
            help='Email for the test user'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='testpass123',
            help='Password for the test user'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Test',
            help='First name for the test user'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='User',
            help='Last name for the test user'
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        try:
            # Check if user already exists
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                }
            )

            if created:
                # Set password for new user
                user.set_password(password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created test user: {email}')
                )
            else:
                # Update password for existing user
                user.set_password(password)
                user.save()
                self.stdout.write(
                    self.style.WARNING(f'Test user already exists, updated password: {email}')
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating test user: {str(e)}')
            ) 