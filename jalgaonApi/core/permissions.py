"""
Core RBAC Permission Classes for Jalgaon.com Admin Panel.

These DRF permission classes enforce role-based access control across
all admin-panel and protected endpoints. They check the `role` field
on the User model.

Usage in views:
    from core.permissions import IsAdminRole, IsModerator

    class MyAdminView(APIView):
        permission_classes = [IsAdminRole]
"""

from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """
    Allows access only to users with admin-level roles:
    super_admin, admin.
    """
    message = "You do not have admin privileges to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ('super_admin', 'admin')


class IsSuperAdmin(BasePermission):
    """
    Allows access only to super_admin users.
    Used for sensitive operations like role assignment and platform settings.
    """
    message = "Only Super Admins can perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'super_admin'


class IsContentManager(BasePermission):
    """
    Allows access to content management roles:
    super_admin, admin, content_manager.
    """
    message = "You do not have content management privileges."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ('super_admin', 'admin', 'content_manager')


class IsModerator(BasePermission):
    """
    Allows access to moderation roles:
    super_admin, admin, content_manager, moderator.
    """
    message = "You do not have moderation privileges."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in (
            'super_admin', 'admin', 'content_manager', 'moderator'
        )


class IsStaffRole(BasePermission):
    """
    Allows access to any staff-level role (all internal roles).
    Excludes: advertiser, business_owner, registered_user, guest.
    """
    message = "You do not have staff privileges."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in (
            'super_admin', 'admin', 'content_manager',
            'news_editor', 'seo_manager', 'moderator', 'support'
        )


class IsNewsEditor(BasePermission):
    """
    Allows access to news/blog publishing roles:
    super_admin, admin, content_manager, news_editor.
    """
    message = "You do not have publishing privileges."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in (
            'super_admin', 'admin', 'content_manager', 'news_editor'
        )


class IsBusinessOwnerOrAdmin(BasePermission):
    """
    Allows access to business owners (for their own content) and admins.
    Object-level permission check should be used with this for ownership.
    """
    message = "You must be the business owner or an admin."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in (
            'super_admin', 'admin', 'content_manager',
            'moderator', 'business_owner'
        )
