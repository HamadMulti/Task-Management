from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import F, Q
from .models import Post, Tag, Comment, Like, Bookmark
from .serializers import (
    PostSerializer, PostListSerializer, PostCreateUpdateSerializer,
    TagSerializer, CommentSerializer, CommentCreateSerializer
)
from users.permissions import IsOwnerOrReadOnly, IsModeratorOrReadOnly


class PostListView(generics.ListCreateAPIView):
    """List all posts or create a new post"""
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'author', 'status', 'is_published', 'is_featured']
    search_fields = ['title', 'content', 'excerpt', 'tags__name']
    ordering_fields = ['created_at', 'updated_at', 'published_at', 'views_count', 'likes_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Post.objects.select_related('author', 'category').prefetch_related('tags')
        
        # Admin and moderators can see all posts
        if self.request.user.is_authenticated and self.request.user.can_moderate():
            return queryset
        
        # Authors can see their own posts (published and unpublished)
        if self.request.user.is_authenticated:
            return queryset.filter(
                Q(is_published=True, status='published') | 
                Q(author=self.request.user)
            )
        
        # Anonymous users only see published posts
        return queryset.filter(is_published=True, status='published')
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateUpdateSerializer
        return PostListSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a post"""
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = Post.objects.select_related('author', 'category').prefetch_related('tags', 'comments')
        
        # Filter published posts for non-owners
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True, status='published')
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PostCreateUpdateSerializer
        return PostSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Increment view count
        Post.objects.filter(id=instance.id).update(views_count=F('views_count') + 1)
        instance.refresh_from_db()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        # Only allow author or staff to update
        post = self.get_object()
        if post.author != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only edit your own posts.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow author or staff to delete
        if instance.author != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only delete your own posts.")
        instance.delete()


class UserPostsView(generics.ListAPIView):
    """List posts by a specific user"""
    
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        queryset = Post.objects.filter(author_id=user_id).select_related('author', 'category').prefetch_related('tags')
        
        # Filter published posts for non-owners
        if not self.request.user.is_authenticated or (
            self.request.user.id != int(user_id) and not self.request.user.is_staff
        ):
            queryset = queryset.filter(is_published=True, status='published')
        
        return queryset.order_by('-created_at')


class TagListView(generics.ListCreateAPIView):
    """List all tags or create a new tag"""
    
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class PostCommentsView(generics.ListCreateAPIView):
    """List comments for a post or create a new comment"""
    
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        post_slug = self.kwargs['post_slug']
        return Comment.objects.filter(
            post__slug=post_slug,
            is_approved=True,
            parent=None
        ).select_related('author').order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == 'POST':
            post_slug = self.kwargs['post_slug']
            post = get_object_or_404(Post, slug=post_slug)
            context['post'] = post
        return context


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request, post_slug):
    """Toggle like status for a post"""
    post = get_object_or_404(Post, slug=post_slug)
    like, created = Like.objects.get_or_create(post=post, user=request.user)
    
    if not created:
        like.delete()
        post.likes_count = F('likes_count') - 1
        liked = False
    else:
        post.likes_count = F('likes_count') + 1
        liked = True
    
    post.save()
    post.refresh_from_db()
    
    return Response({
        'liked': liked,
        'likes_count': post.likes_count
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_bookmark(request, post_slug):
    """Toggle bookmark status for a post"""
    post = get_object_or_404(Post, slug=post_slug)
    bookmark, created = Bookmark.objects.get_or_create(post=post, user=request.user)
    
    if not created:
        bookmark.delete()
        bookmarked = False
    else:
        bookmarked = True
    
    return Response({'bookmarked': bookmarked})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_bookmarks(request):
    """Get user's bookmarked posts"""
    bookmarks = Bookmark.objects.filter(user=request.user).select_related('post__author', 'post__category')
    posts = [bookmark.post for bookmark in bookmarks]
    serializer = PostListSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def post_stats(request):
    """Get post statistics"""
    stats = {
        'total_posts': Post.objects.filter(is_published=True).count(),
        'total_comments': Comment.objects.filter(is_approved=True).count(),
        'total_likes': Like.objects.count(),
        'total_tags': Tag.objects.count(),
    }
    return Response(stats)
