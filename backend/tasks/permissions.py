from rest_framework import permissions


class IsAdminOrModeratorForProject(permissions.BasePermission):
    """
    Custom permission for projects:
    - Only admins and moderators can create, update, or delete projects
    - All authenticated users can view projects
    """

    def has_permission(self, request, view):
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Create, update, delete only for admin and moderator
        return (request.user.is_authenticated and 
                request.user.role in ['admin', 'moderator'])

    def has_object_permission(self, request, view, obj):
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions only for admins and moderators
        return request.user.role in ['admin', 'moderator']


class TaskPermission(permissions.BasePermission):
    """
    Custom permission for tasks:
    - All authenticated users can create tasks
    - Admins can do anything
    - Users can update/delete their own created tasks or assigned tasks
    - Users can update status of tasks assigned to them
    """

    def has_permission(self, request, view):
        # All authenticated users can view and create tasks
        if request.method in permissions.SAFE_METHODS or request.method == 'POST':
            return request.user.is_authenticated
        
        # For other methods, check object permissions
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Admin can do anything
        if request.user.role == 'admin':
            return True
            
        # For PATCH (partial update) - used for status updates
        if request.method == 'PATCH':
            # Users can update tasks they created or are assigned to
            return (obj.created_by == request.user or 
                    obj.assigned_to == request.user)
        
        # For PUT and DELETE
        # Users can update/delete tasks they created or are assigned to
        return (obj.created_by == request.user or 
                obj.assigned_to == request.user)
