from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access view.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow administrators to edit.
    """

    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions are only allowed to administrators
        return request.user and request.user.is_authenticated and request.user.is_admin()


class IsModeratorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow moderators and admins to edit.
    """

    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions are only allowed to moderators and admins
        return request.user and request.user.is_authenticated and request.user.can_moderate()


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions are only allowed to the owner of the object
        return obj.user == request.user or request.user.can_moderate()


class IsAdminOrOwner(permissions.BasePermission):
    """
    Custom permission to only allow admins or owners to access.
    """

    def has_object_permission(self, request, view, obj):
        return (request.user and request.user.is_authenticated and 
                (obj.user == request.user or request.user.is_admin()))


class IsAuthenticated(permissions.BasePermission):
    """
    Custom permission to only allow authenticated users.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated