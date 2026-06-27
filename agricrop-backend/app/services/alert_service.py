"""
AgriCrop Backend - Alert Service
Business logic for managing user alerts and notifications.
"""

from app import mongo
from app.models.notification import (
    get_user_notifications,
    mark_as_read,
    mark_all_as_read,
    get_unread_count
)
from app.utils.helpers import serialize_doc


def list_alerts(user_id, limit=50):
    """
    Get all notifications/alerts for a user.
    Returns (alerts_list, error_message).
    """
    try:
        notifications = get_user_notifications(mongo, user_id, limit=limit)
        return [serialize_doc(n) for n in notifications], None
    except Exception as e:
        return None, f"Failed to retrieve alerts: {str(e)}"


def mark_alert_as_read(notification_id, user_id):
    """
    Mark a specific alert as read.
    Returns (success_status, error_message).
    """
    try:
        result = mark_as_read(mongo, notification_id, user_id)
        if result.matched_count == 0:
            return False, "Alert not found or access denied."
        return True, None
    except Exception as e:
        return False, f"Failed to mark alert as read: {str(e)}"


def mark_all_alerts_as_read(user_id):
    """
    Mark all unread alerts for a user as read.
    Returns (success_status, error_message).
    """
    try:
        mark_all_as_read(mongo, user_id)
        return True, None
    except Exception as e:
        return False, f"Failed to mark all alerts as read: {str(e)}"


def count_unread_alerts(user_id):
    """
    Count the number of unread alerts for a user.
    Returns (count, error_message).
    """
    try:
        count = get_unread_count(mongo, user_id)
        return count, None
    except Exception as e:
        return None, f"Failed to retrieve unread alert count: {str(e)}"
