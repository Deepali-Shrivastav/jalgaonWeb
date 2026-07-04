from rest_framework.permissions import BasePermission

class CanSubmitJob(BasePermission):
    """
    Allows access to roles that can submit jobs:
    super_admin, admin, content_manager, news_editor, business_owner, registered_user.
    Essentially any authenticated user for now, but explicitly checking roles is safer.
    """
    message = "You do not have permission to submit a job."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in (
            'super_admin', 'admin', 'content_manager',
            'news_editor', 'business_owner', 'registered_user'
        )

class CanManageJobs(BasePermission):
    """
    Allows access to moderation roles for jobs:
    super_admin, admin, content_manager, moderator.
    """
    message = "You do not have permission to manage jobs."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in (
            'super_admin', 'admin', 'content_manager', 'moderator'
        )
