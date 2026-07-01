from .models import AuditLog

def log_audit_action(actor, action, target_type, target_id, changes=None, request=None):
    """
    Utility function to safely log audit actions across the platform.
    """
    ip_address = None
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')

    AuditLog.objects.create(
        actor=actor if actor and actor.is_authenticated else None,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        changes=changes or {},
        ip_address=ip_address
    )
