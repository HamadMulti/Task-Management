from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category
from .serializers import (
    CategorySerializer, CategoryCreateUpdateSerializer, CategoryTreeSerializer
)


class CategoryListView(generics.ListCreateAPIView):
    """List all categories or create a new category"""
    
    queryset = Category.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['parent', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['order', 'name', 'created_at']
    ordering = ['order', 'name']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CategoryCreateUpdateSerializer
        return CategorySerializer
    
    def perform_create(self, serializer):
        serializer.save()


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a category"""
    
    queryset = Category.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CategoryCreateUpdateSerializer
        return CategorySerializer
    
    def perform_destroy(self, instance):
        # Soft delete - just mark as inactive
        instance.is_active = False
        instance.save()


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def category_tree(request):
    """Get category tree structure"""
    categories = Category.objects.filter(is_active=True, parent=None).order_by('order', 'name')
    serializer = CategoryTreeSerializer(categories, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def category_stats(request):
    """Get category statistics"""
    stats = {
        'total_categories': Category.objects.filter(is_active=True).count(),
        'parent_categories': Category.objects.filter(is_active=True, parent=None).count(),
        'child_categories': Category.objects.filter(is_active=True, parent__isnull=False).count(),
    }
    return Response(stats)
