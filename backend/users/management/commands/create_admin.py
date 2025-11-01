from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates an admin user if it does not exist'

    def handle(self, *args, **options):
        email = 'user@admin.com'
        username = 'adminuser'
        password = 'Admin@123'
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Admin user with email {email} already exists'))
            return
        
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User with username {username} already exists'))
            return
        
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created admin user: {username}'))
        self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
        self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
