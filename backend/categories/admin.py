from django.contrib import admin
from django.utils.html import format_html
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Category admin"""
    
    list_display = [
        'name', 'slug', 'parent', 'posts_count', 'color_tag',
        'is_active', 'order', 'created_at'
    ]
    list_filter = ['is_active', 'parent', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']
    list_editable = ['order', 'is_active']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Appearance', {
            'fields': ('color', 'icon')
        }),
        ('Organization', {
            'fields': ('parent', 'order')
        }),
        ('Settings', {
            'fields': ('is_active',)
        }),
    )
    
    def color_tag(self, obj):
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px;">{}</span>',
            obj.color,
            obj.color
        )
    color_tag.short_description = 'Color'
    
    def posts_count(self, obj):
        return obj.posts_count
    posts_count.short_description = 'Posts Count'
