from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post, Tag, Comment, Like, Bookmark
from categories.serializers import CategorySerializer
from users.serializers import UserSerializer

User = get_user_model()


class TagSerializer(serializers.ModelSerializer):
    """Serializer for Tag model"""
    
    posts_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'color', 'posts_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model"""
    
    author = UserSerializer(read_only=True)
    replies_count = serializers.ReadOnlyField()
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'author', 'parent', 'replies_count',
            'replies', 'is_approved', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            replies = obj.replies.filter(is_approved=True)[:5]  # Limit replies
            return CommentSerializer(replies, many=True, context=self.context).data
        return []


class PostSerializer(serializers.ModelSerializer):
    """Serializer for Post model with full details"""
    
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    reading_time = serializers.ReadOnlyField()
    comments_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'featured_image',
            'author', 'category', 'tags', 'status', 'is_published', 'is_featured',
            'allow_comments', 'meta_title', 'meta_description', 'published_at',
            'created_at', 'updated_at', 'views_count', 'likes_count',
            'reading_time', 'comments_count', 'is_liked', 'is_bookmarked', 'comments'
        ]
        read_only_fields = [
            'id', 'slug', 'author', 'published_at', 'created_at', 'updated_at',
            'views_count', 'likes_count'
        ]
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarks.filter(user=request.user).exists()
        return False
    
    def get_comments(self, obj):
        if obj.allow_comments:
            comments = obj.comments.filter(is_approved=True, parent=None)[:10]
            return CommentSerializer(comments, many=True, context=self.context).data
        return []


class PostListSerializer(serializers.ModelSerializer):
    """Serializer for Post list view"""
    
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    reading_time = serializers.ReadOnlyField()
    comments_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'author', 'category', 'tags', 'is_published', 'is_featured',
            'published_at', 'created_at', 'views_count', 'likes_count',
            'reading_time', 'comments_count', 'is_liked', 'is_bookmarked'
        ]
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarks.filter(user=request.user).exists()
        return False


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating posts"""
    
    tags_data = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Post
        fields = [
            'title', 'content', 'excerpt', 'featured_image', 'category',
            'tags_data', 'status', 'is_published', 'is_featured',
            'allow_comments', 'meta_title', 'meta_description'
        ]
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags_data', [])
        post = Post.objects.create(**validated_data)
        
        # Handle tags
        for tag_name in tags_data:
            tag, created = Tag.objects.get_or_create(
                name=tag_name.strip().lower()
            )
            post.tags.add(tag)
        
        return post
    
    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags_data', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle tags
        if tags_data is not None:
            instance.tags.clear()
            for tag_name in tags_data:
                tag, created = Tag.objects.get_or_create(
                    name=tag_name.strip().lower()
                )
                instance.tags.add(tag)
        
        return instance


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments"""
    
    class Meta:
        model = Comment
        fields = ['content', 'parent']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        validated_data['post'] = self.context['post']
        return Comment.objects.create(**validated_data)