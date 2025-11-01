from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from tasks.models import Project, Task
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Setup admin user and create test data'

    def handle(self, *args, **options):
        self.stdout.write("Setting up admin user and test data...")
        
        # Update the superuser role to admin
        try:
            admin_user = User.objects.get(username='maaz')
            admin_user.role = 'admin'
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Updated {admin_user.username} role to admin'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('✗ Admin user "maaz" not found'))
            return
        
        # Create a test project
        project, created = Project.objects.get_or_create(
            name="TaskMaster Demo Project",
            defaults={
                'description': "A demo project for testing TaskMaster functionality",
                'created_by': admin_user,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created project: {project.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'✓ Project already exists: {project.name}'))
        
        # Create a few test tasks
        tasks_data = [
            {
                'title': 'Setup Project Structure',
                'description': 'Initialize the project structure and basic configuration',
                'priority': 'high',
                'status': 'completed',
            },
            {
                'title': 'Implement User Authentication',
                'description': 'Set up JWT authentication and user management',
                'priority': 'high',
                'status': 'completed',
            },
            {
                'title': 'Create Task Management System',
                'description': 'Build the core task CRUD functionality',
                'priority': 'urgent',
                'status': 'in_progress',
            },
            {
                'title': 'Add Role-based Permissions',
                'description': 'Implement admin and standard user roles',
                'priority': 'medium',
                'status': 'todo',
            },
            {
                'title': 'Design Dashboard UI',
                'description': 'Create an intuitive dashboard for task overview',
                'priority': 'medium',
                'status': 'todo',
            }
        ]
        
        for i, task_data in enumerate(tasks_data):
            task, created = Task.objects.get_or_create(
                title=task_data['title'],
                defaults={
                    **task_data,
                    'project': project,
                    'created_by': admin_user,
                    'assigned_to': admin_user,
                    'due_date': timezone.now() + timedelta(days=7+i),
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created task: {task.title}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'✓ Task already exists: {task.title}'))
        
        # Create a standard user for testing
        standard_user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User',
                'role': 'user',
            }
        )
        if created:
            standard_user.set_password('testpass123')
            standard_user.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created standard user: {standard_user.username}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'✓ Standard user already exists: {standard_user.username}'))
        
        self.stdout.write("\nData Summary:")
        self.stdout.write(f"Projects: {Project.objects.count()}")
        self.stdout.write(f"Tasks: {Task.objects.count()}")
        self.stdout.write(f"Users: {User.objects.count()}")
        self.stdout.write(f"Admin users: {User.objects.filter(role='admin').count()}")