#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Create superuser if it doesn't exist
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='user@admin.com').exists():
    User.objects.create_superuser(
        username='adminuser',
        email='user@admin.com',
        password='Admin@123',
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    print('Superuser created successfully')
else:
    print('Superuser already exists')
END
