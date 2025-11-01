#!/bin/bash

# TaskMaster Deployment Script
# This script helps deploy the application to production

echo "🚀 TaskMaster Deployment Script"
echo "=================================="

# Function to deploy backend
deploy_backend() {
    echo "📦 Deploying Backend..."
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        python -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate  # Linux/Mac
    # For Windows: venv\Scripts\activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    # Run migrations
    python manage.py makemigrations
    python manage.py migrate
    
    # Collect static files
    python manage.py collectstatic --noinput
    
    # Create superuser (optional)
    echo "Create superuser? (y/n)"
    read create_superuser
    if [ "$create_superuser" = "y" ]; then
        python manage.py createsuperuser
    fi
    
    echo "✅ Backend deployment complete!"
    cd ..
}

# Function to deploy frontend
deploy_frontend() {
    echo "🎨 Deploying Frontend..."
    cd frontend
    
    # Install dependencies
    npm install
    
    # Build for production
    npm run build
    
    echo "✅ Frontend build complete!"
    echo "📁 Build files are in frontend/build/"
    cd ..
}

# Function to start development servers
start_dev() {
    echo "🛠️ Starting Development Servers..."
    
    # Start backend in background
    cd backend
    source venv/bin/activate  # Linux/Mac
    python manage.py runserver &
    backend_pid=$!
    cd ..
    
    # Start frontend
    cd frontend
    npm start &
    frontend_pid=$!
    cd ..
    
    echo "🟢 Backend running on http://localhost:8000"
    echo "🟢 Frontend running on http://localhost:3000"
    echo "Press Ctrl+C to stop servers"
    
    # Wait for interrupt
    trap "kill $backend_pid $frontend_pid" EXIT
    wait
}

# Main menu
echo "Select deployment option:"
echo "1) Deploy Backend Only"
echo "2) Deploy Frontend Only"
echo "3) Deploy Both (Full Deployment)"
echo "4) Start Development Servers"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_backend
        ;;
    2)
        deploy_frontend
        ;;
    3)
        deploy_backend
        deploy_frontend
        echo "🎉 Full deployment complete!"
        ;;
    4)
        start_dev
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac