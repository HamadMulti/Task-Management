from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    
    posts_count = serializers.ReadOnlyField()
    is_parent = serializers.ReadOnlyField()
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'color', 'icon',
            'is_active', 'order', 'parent', 'posts_count', 'is_parent',
            'children', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        if obj.is_parent:
            children = obj.children.filter(is_active=True)
            return CategorySerializer(children, many=True, context=self.context).data
        return []


class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating categories"""
    
    class Meta:
        model = Category
        fields = [
            'name', 'description', 'color', 'icon',
            'is_active', 'order', 'parent'
        ]
    
    def validate_parent(self, value):
        if value and self.instance and value == self.instance:
            raise serializers.ValidationError("A category cannot be its own parent.")
        return value


class CategoryTreeSerializer(serializers.ModelSerializer):
    """Serializer for category tree structure"""
    
    children = serializers.SerializerMethodField()
    posts_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'color', 'icon',
            'order', 'posts_count', 'children'
        ]
    
    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by('order', 'name')
        return CategoryTreeSerializer(children, many=True, context=self.context).data