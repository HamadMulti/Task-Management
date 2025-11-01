from django.contrib import admin
from django.utils.html import format_html
from .models import Post, Tag, Comment, Like, Bookmark


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """Tag admin"""
    
    list_display = ['name', 'slug', 'color_tag', 'posts_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']
    
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


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ['author', 'created_at']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """Post admin"""
    
    list_display = [
        'title', 'author', 'category', 'status', 'is_published',
        'is_featured', 'views_count', 'likes_count', 'comments_count', 'created_at'
    ]
    list_filter = [
        'status', 'is_published', 'is_featured', 'category',
        'created_at', 'author'
    ]
    search_fields = ['title', 'content', 'author__username', 'author__email']
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    list_editable = ['status', 'is_published', 'is_featured']
    inlines = [CommentInline]
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'content', 'excerpt', 'featured_image')
        }),
        ('Classification', {
            'fields': ('author', 'category', 'tags')
        }),
        ('Publishing', {
            'fields': ('status', 'is_published', 'is_featured', 'allow_comments', 'published_at')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('views_count', 'likes_count'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['views_count', 'likes_count']
    filter_horizontal = ['tags']
    
    def comments_count(self, obj):
        return obj.comments_count
    comments_count.short_description = 'Comments'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """Comment admin"""
    
    list_display = [
        'post', 'author', 'content_preview', 'parent',
        'is_approved', 'created_at'
    ]
    list_filter = ['is_approved', 'created_at', 'post']
    search_fields = ['content', 'author__username', 'post__title']
    ordering = ['-created_at']
    list_editable = ['is_approved']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    """Like admin"""
    
    list_display = ['post', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['post__title', 'user__username']
    ordering = ['-created_at']


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    """Bookmark admin"""
    
    list_display = ['post', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['post__title', 'user__username']
    ordering = ['-created_at']
