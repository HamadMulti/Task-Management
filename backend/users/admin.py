from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    
    inlines = (UserProfileInline,)
    list_display = [
        'email', 'username', 'first_name', 'last_name', 
        'is_verified', 'is_active', 'date_created', 'avatar_tag'
    ]
    list_filter = ['is_verified', 'is_active', 'is_staff', 'date_created']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-date_created']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': (
                'bio', 'location', 'birth_date', 'avatar', 
                'phone_number', 'is_verified'
            )
        }),
        ('Timestamps', {
            'fields': ('date_created', 'date_updated'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['date_created', 'date_updated']
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'first_name', 'last_name',
                'password1', 'password2'
            ),
        }),
    )
    
    def avatar_tag(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" width="50" height="50" style="border-radius: 50%;" />',
                obj.avatar.url
            )
        return "No Avatar"
    avatar_tag.short_description = 'Avatar'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """User Profile admin"""
    
    list_display = [
        'user', 'company', 'job_title', 'is_public', 
        'receives_notifications'
    ]
    list_filter = ['is_public', 'receives_notifications']
    search_fields = [
        'user__email', 'user__first_name', 'user__last_name',
        'company', 'job_title'
    ]
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Professional Info', {
            'fields': ('company', 'job_title', 'website')
        }),
        ('Social Links', {
            'fields': (
                'twitter_username', 'github_username', 'linkedin_username'
            )
        }),
        ('Skills & Interests', {
            'fields': ('skills', 'interests')
        }),
        ('Settings', {
            'fields': ('receives_notifications', 'is_public')
        }),
    )
