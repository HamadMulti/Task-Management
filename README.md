# TaskMaster - Full Stack Web Application

A modern, full-stack web application built with Django REST Framework backend and React TypeScript frontend, featuring user authentication, content management, and a beautiful Material-UI interface.

## 🚀 Features

### Backend (Django REST Framework)
- **User Authentication**: Registration, login, logout with JWT tokens
- **User Profiles**: Extended user profiles with bio, location, social links
- **Content Management**: Posts with categories, tags, and comments
- **Interactive Features**: Likes, bookmarks, and nested comments
- **API Documentation**: Auto-generated API docs with DRF
- **Security**: JWT authentication, CORS handling, input validation
- **Database**: SQLite (development) / PostgreSQL (production ready)

### Frontend (React TypeScript)
- **Modern UI**: Material-UI components with dark/light theme
- **Authentication**: Login, registration, protected routes
- **Responsive Design**: Mobile-first, fully responsive layout
- **State Management**: React Query for server state, Context API for auth
- **Type Safety**: Full TypeScript implementation
- **Form Handling**: React Hook Form with validation
- **Routing**: React Router for navigation

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2.7
- **API**: Django REST Framework 3.14.0
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: SQLite (development)
- **Image Processing**: Pillow
- **CORS**: django-cors-headers
- **Environment**: python-decouple

### Frontend
- **Framework**: React 19 with TypeScript
- **UI Library**: Material-UI (MUI) 5
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios
- **Icons**: Material-UI Icons

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\Activate.ps1
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Copy .env.example to .env and configure
   cp .env.example .env
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "REACT_APP_API_URL=http://localhost:8000/api" > .env
   ```

4. **Start development server**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/current/` - Get current user
- `PATCH /api/auth/profile/update/` - Update user profile

### Posts
- `GET /api/posts/` - List posts (with filtering, search, pagination)
- `POST /api/posts/` - Create new post
- `GET /api/posts/{slug}/` - Get post details
- `PATCH /api/posts/{slug}/` - Update post
- `DELETE /api/posts/{slug}/` - Delete post
- `POST /api/posts/{slug}/like/` - Toggle like
- `POST /api/posts/{slug}/bookmark/` - Toggle bookmark

### Categories
- `GET /api/categories/` - List categories
- `GET /api/categories/tree/` - Category tree structure
- `GET /api/categories/{slug}/` - Category details

### Comments
- `GET /api/posts/{slug}/comments/` - List post comments
- `POST /api/posts/{slug}/comments/` - Create comment

## 📱 Application Structure

### Backend Structure
```
backend/
├── core/                 # Django project settings
├── users/               # User authentication app
├── posts/               # Posts management app
├── categories/          # Categories app
├── manage.py
├── requirements.txt
└── .env
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── auth/       # Authentication components
│   │   ├── layout/     # Layout components
│   │   └── posts/      # Post-related components
│   ├── contexts/       # React contexts (Auth, Theme)
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── types/          # TypeScript type definitions
│   └── App.tsx
├── package.json
└── .env
```

## 🎨 Features Implementation

### Authentication Flow
1. Users can register with email, username, and profile information
2. JWT tokens are used for authentication
3. Automatic token refresh on expiration
4. Protected routes require authentication

### Content Management
1. Users can create posts with rich content
2. Posts can be categorized and tagged
3. Support for featured images
4. Draft and published status
5. SEO-friendly with meta tags

### Interactive Features
1. Like/unlike posts
2. Bookmark posts for later reading
3. Comment on posts with nested replies
4. User profiles with bio and social links

### UI/UX Features
1. Dark/light theme toggle
2. Responsive design for all devices
3. Loading states and error handling
4. Form validation with helpful messages
5. Search and filtering capabilities

## 🔒 Security Features

- JWT token authentication
- CORS protection
- Input validation and sanitization
- Rate limiting (production ready)
- Secure password hashing
- XSS protection

## 🚀 Deployment

### Backend Deployment (Example with Heroku)
1. Configure production settings
2. Set up PostgreSQL database
3. Configure static files with WhiteNoise
4. Set environment variables
5. Deploy with Gunicorn

### Frontend Deployment (Example with Netlify)
1. Build production bundle: `npm run build`
2. Configure environment variables
3. Deploy build folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Advanced search with Elasticsearch
- [ ] File upload improvements
- [ ] Admin dashboard
- [ ] API rate limiting
- [ ] Cache implementation
- [ ] Test coverage improvement
- [ ] Docker containerization

## 🐛 Known Issues

- Some Material-UI Grid component compatibility issues (using Box as alternative)
- React Query devtools only in development mode

## 📞 Support

If you have any questions or issues, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using Django & React**