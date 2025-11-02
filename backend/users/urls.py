from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views, admin_views

app_name = 'users'

urlpatterns = [
    # Authentication URLs
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile URLs
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.UpdateUserView.as_view(), name='update_profile'),
    path('profile/update-details/', views.UpdateUserProfileView.as_view(), name='update_profile_details'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    
    # User Management URLs
    path('current/', views.current_user, name='current_user'),
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/<int:id>/', views.UserDetailView.as_view(), name='user_detail'),
    
    # Admin URLs
    path('admin/users/', views.AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:id>/', views.AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/users/<int:user_id>/promote/', views.promote_user, name='promote_user'),
    path('admin/users/<int:user_id>/demote/', views.demote_user, name='demote_user'),
    
    # User management endpoints
    path('users/create/', admin_views.create_user, name='create_user'),
    path('users/toggle-status/<int:user_id>/', admin_views.toggle_user_status, name='toggle_user_status'),
]