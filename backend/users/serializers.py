from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    
    skills_list = serializers.ListField(read_only=True, source='get_skills_list')
    interests_list = serializers.ListField(read_only=True, source='get_interests_list')
    
    class Meta:
        model = UserProfile
        fields = [
            'website', 'twitter_username', 'github_username', 'linkedin_username',
            'company', 'job_title', 'skills', 'interests', 'skills_list', 
            'interests_list', 'receives_notifications', 'is_public'
        ]


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.CharField(read_only=True, source='get_full_name')
    role_display = serializers.CharField(read_only=True, source='get_role_display')
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'bio', 'location', 'birth_date', 'avatar', 'phone_number', 
            'is_verified', 'role', 'role_display', 'date_created', 'date_updated', 'profile'
        ]
        read_only_fields = ['id', 'is_verified', 'date_created', 'date_updated']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 
            'password', 'password_confirm', 'bio', 'location', 'phone_number'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password.')


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user information"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'bio', 'location', 
            'birth_date', 'avatar', 'phone_number'
        ]
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class AdminUserSerializer(serializers.ModelSerializer):
    """Admin serializer for user management with role modification"""
    
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.CharField(read_only=True, source='get_full_name')
    role_display = serializers.CharField(read_only=True, source='get_role_display')
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'bio', 'location', 'birth_date', 'avatar', 'phone_number', 
            'is_verified', 'role', 'role_display', 'is_active', 'is_staff',
            'date_created', 'date_updated', 'profile', 'password'
        ]
        read_only_fields = ['id', 'date_created', 'date_updated']
    
    def update(self, instance, validated_data):
        """Update user with optional password change"""
        password = validated_data.pop('password', None)
        
        # Update all other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password only if provided
        if password and password.strip():
            instance.set_password(password)
        
        instance.save()
        return instance


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = UserProfile
        fields = [
            'website', 'twitter_username', 'github_username', 'linkedin_username',
            'company', 'job_title', 'skills', 'interests', 
            'receives_notifications', 'is_public'
        ]