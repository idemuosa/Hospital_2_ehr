from .models import AuditLog

def log_action(user, action, resource_id=None, resource_type=None):
    """
    Utility function to create an audit log entry
    """
    AuditLog.objects.create(
        user_id=str(user.id) if user.is_authenticated else "anonymous",
        user_name=user.username if user.is_authenticated else "Anonymous",
        action=action,
        resource_id=str(resource_id) if resource_id else None,
        resource_type=resource_type
    )
