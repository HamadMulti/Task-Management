from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import UserProfile
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    ChangePasswordSerializer, UserUpdateSerializer, UserProfileUpdateSerializer,
    UserProfileSerializer
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token obtain pair view"""
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Add user data to response
            user = User.objects.get(email=request.data.get('username'))
            user_data = UserSerializer(user).data
            response.data['user'] = user_data
        return response


class UserRegistrationView(APIView):
    """User registration view"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """User login view"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """User logout view"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view"""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change password view"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateUserView(generics.UpdateAPIView):
    """Update user information view"""
    
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UpdateUserProfileView(generics.UpdateAPIView):
    """Update user profile view"""
    
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class UserListView(generics.ListAPIView):
    """List all users view"""
    
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_verified']
    search_fields = ['first_name', 'last_name', 'username', 'email']
    ordering_fields = ['date_created', 'first_name', 'last_name']
    ordering = ['-date_created']


class UserDetailView(generics.RetrieveAPIView):
    """User detail view"""
    
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """Get current user information"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# Admin Views
class AdminUserListView(generics.ListAPIView):
    """Admin view to list all users"""
    queryset = User.objects.all().order_by('-date_created')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.user.is_admin():
            from .serializers import AdminUserSerializer
            return AdminUserSerializer
        return UserSerializer
    
    def get_queryset(self):
        if not self.request.user.is_admin():
            return User.objects.none()
        return User.objects.all().order_by('-date_created')


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """Admin view to manage specific user"""
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_serializer_class(self):
        if self.request.user.is_admin():
            from .serializers import AdminUserSerializer
            return AdminUserSerializer
        return UserSerializer
    
    def get_object(self):
        if not self.request.user.is_admin():
            raise permissions.PermissionDenied("Admin access required")
        return super().get_object()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def promote_user(request, user_id):
    """Promote user to moderator (admin only)"""
    if not request.user.is_admin():
        return Response(
            {'error': 'Admin access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id)
        user.role = 'moderator'
        user.save()
        return Response({
            'message': f'User {user.get_full_name()} promoted to moderator',
            'user': UserSerializer(user).data
        })
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def demote_user(request, user_id):
    """Demote user to regular user (admin only)"""
    if not request.user.is_admin():
        return Response(
            {'error': 'Admin access required'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id)
        if user.is_admin():
            return Response(
                {'error': 'Cannot demote admin user'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        user.role = 'user'
        user.save()
        return Response({
            'message': f'User {user.get_full_name()} demoted to regular user',
            'user': UserSerializer(user).data
        })
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


class CreateAdminUserView(APIView):
    """Admin view to create a new admin user"""
    
    def post(self, request):
        email = request.data.get('email', 'user@admin.com')
        username = request.data.get('username', 'adminuser')
        password = request.data.get('password', 'Admin@123')

        if User.objects.filter(email=email).exists():
            return Response({'error': f'Admin user with email {email} already exists'}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({'error': f'User with username {username} already exists'}, status=400)

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name='Admin',
            last_name='User',
            role='admin'
        )

        return Response({'success': f'Admin user {username} created successfully'})
