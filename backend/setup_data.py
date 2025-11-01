#!/usr/bin/env python
"""
Django script to set up admin user and create test data
"""
import os
import sys
import django

# Add the backend directory to the path
sys.path.append('D:/Miscellaneous/Project Management/advanced_app/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from tasks.models import Project, Task
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

def setup_admin_and_data():
    print("Setting up admin user and test data...")
    
    # Update the superuser role to admin
    try:
        admin_user = User.objects.get(username='maaz')
        admin_user.role = 'admin'
        admin_user.save()
        print(f"✓ Updated {admin_user.username} role to admin")
    except User.DoesNotExist:
        print("✗ Admin user 'maaz' not found")
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
        print(f"✓ Created project: {project.name}")
    else:
        print(f"✓ Project already exists: {project.name}")
    
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
            print(f"✓ Created task: {task.title}")
        else:
            print(f"✓ Task already exists: {task.title}")
    
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
        print(f"✓ Created standard user: {standard_user.username}")
    else:
        print(f"✓ Standard user already exists: {standard_user.username}")
    
    print("\nData Summary:")
    print(f"Projects: {Project.objects.count()}")
    print(f"Tasks: {Task.objects.count()}")
    print(f"Users: {User.objects.count()}")
    print(f"Admin users: {User.objects.filter(role='admin').count()}")

if __name__ == '__main__':
    setup_admin_and_data()