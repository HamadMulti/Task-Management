from rest_framework import serializers
from .models import Project, Task, TaskComment, TaskAttachment
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']


class ProjectSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'created_by', 'members', 'created_at', 'updated_at', 'is_active', 'task_count']
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_task_count(self, obj):
        return obj.tasks.count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TaskCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'comment', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']


class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskAttachment
        fields = ['id', 'filename', 'file', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_at']


class TaskSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_until_due = serializers.ReadOnlyField()
    
    # Write-only fields for creating/updating
    project_id = serializers.IntegerField(write_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'due_date', 'priority', 'status',
            'project', 'project_id', 'assigned_to', 'assigned_to_id', 'created_by',
            'created_at', 'updated_at', 'completed_at', 'estimated_hours', 
            'actual_hours', 'tags', 'comments', 'attachments', 'is_overdue', 'days_until_due'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_project_id(self, value):
        try:
            project = Project.objects.get(id=value)
            # Check if user has access to this project
            user = self.context['request'].user
            if user.role not in ['admin'] and user not in project.members.all() and project.created_by != user:
                raise serializers.ValidationError("You don't have access to this project.")
            return value
        except Project.DoesNotExist:
            raise serializers.ValidationError("Project does not exist.")
    
    def validate_assigned_to_id(self, value):
        if value is not None:
            try:
                user = User.objects.get(id=value)
                return value
            except User.DoesNotExist:
                raise serializers.ValidationError("User does not exist.")
        return value


class TaskCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for task creation"""
    
    class Meta:
        model = Task
        fields = ['title', 'description', 'due_date', 'priority', 'status', 'project', 'assigned_to', 'estimated_hours', 'tags']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TaskUpdateSerializer(serializers.ModelSerializer):
    """Serializer for task updates"""
    
    class Meta:
        model = Task
        fields = ['title', 'description', 'due_date', 'priority', 'status', 'assigned_to', 'estimated_hours', 'actual_hours', 'tags']