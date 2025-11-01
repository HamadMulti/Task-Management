from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone
from .models import Project, Task, TaskComment, TaskAttachment
from .serializers import (
    ProjectSerializer, TaskSerializer, TaskCreateSerializer, 
    TaskUpdateSerializer, TaskCommentSerializer, TaskAttachmentSerializer
)
from .permissions import IsAdminOrModeratorForProject, TaskPermission


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    Standard users can view all but only add new tasks.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # For POST (create), allow authenticated users
        if request.method == 'POST':
            return request.user.is_authenticated
            
        # For PUT, PATCH, DELETE, only allow admins
        return request.user.is_authenticated and request.user.role == 'admin'

    def has_object_permission(self, request, view, obj):
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions only for admins or object creator
        return (request.user.role == 'admin' or 
                (hasattr(obj, 'created_by') and obj.created_by == request.user))


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrModeratorForProject]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'created_by']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Project.objects.all()
        user = self.request.user
        
        # Admins can see all projects
        if user.role == 'admin':
            return queryset
        
        # Standard users can see projects they created or are members of
        return queryset.filter(
            Q(created_by=user) | Q(members=user)
        ).distinct()

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to the project"""
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(id=user_id)
            project.members.add(user)
            return Response({'message': f'User {user.username} added to project'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['delete'])
    def remove_member(self, request, pk=None):
        """Remove a member from the project"""
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(id=user_id)
            project.members.remove(user)
            return Response({'message': f'User {user.username} removed from project'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    permission_classes = [TaskPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'project', 'assigned_to', 'created_by']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['title', 'due_date', 'created_at', 'priority']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        return TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.select_related('project', 'created_by', 'assigned_to').prefetch_related('comments', 'attachments')
        user = self.request.user
        
        # Admins can see all tasks
        if user.role == 'admin':
            return queryset
        
        # Standard users can see tasks in projects they have access to
        return queryset.filter(
            Q(project__created_by=user) | 
            Q(project__members=user) |
            Q(assigned_to=user) |
            Q(created_by=user)
        ).distinct()

    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Get tasks assigned to the current user"""
        tasks = self.get_queryset().filter(assigned_to=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue tasks"""
        tasks = self.get_queryset().filter(
            due_date__lt=timezone.now(),
            status__in=['todo', 'in_progress']
        )
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for tasks"""
        queryset = self.get_queryset()
        
        stats = {
            'total_tasks': queryset.count(),
            'my_tasks': queryset.filter(assigned_to=request.user).count(),
            'completed_tasks': queryset.filter(status='completed').count(),
            'overdue_tasks': queryset.filter(
                due_date__lt=timezone.now(),
                status__in=['todo', 'in_progress']
            ).count(),
            'high_priority': queryset.filter(priority='high').count(),
            'urgent_priority': queryset.filter(priority='urgent').count(),
        }
        
        # Task status distribution
        status_distribution = queryset.values('status').annotate(count=Count('id'))
        stats['status_distribution'] = {item['status']: item['count'] for item in status_distribution}
        
        # Priority distribution
        priority_distribution = queryset.values('priority').annotate(count=Count('id'))
        stats['priority_distribution'] = {item['priority']: item['count'] for item in priority_distribution}
        
        return Response(stats)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to the task"""
        task = self.get_object()
        comment_text = request.data.get('comment')
        
        if not comment_text:
            return Response({'error': 'comment is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        comment = TaskComment.objects.create(
            task=task,
            user=request.user,
            comment=comment_text
        )
        
        serializer = TaskCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Change task status"""
        task = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in [choice[0] for choice in Task.STATUS_CHOICES]:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        task.status = new_status
        if new_status == 'completed':
            task.completed_at = timezone.now()
        else:
            task.completed_at = None
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)


class TaskCommentViewSet(viewsets.ModelViewSet):
    queryset = TaskComment.objects.all()
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskAttachmentViewSet(viewsets.ModelViewSet):
    queryset = TaskAttachment.objects.all()
    serializer_class = TaskAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task']

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)