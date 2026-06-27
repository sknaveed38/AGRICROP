"""
AgriCrop Backend - Notification Model Helpers
Functions for user notification CRUD, read status, and unread counts.
"""

from datetime import datetime, timezone

from bson import ObjectId


def create_notification(mongo, user_id, notification_type, title, message, severity="info", metadata=None):
    """
    Create a new notification for a user.
    Returns the inserted document's _id.
    """
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    notification_doc = {
        "user_id": user_id,
        "type": notification_type,
        "title": title,
        "message": message,
        "severity": severity,  # info, warning, critical
        "metadata": metadata or {},
        "is_read": False,
        "created_at": datetime.now(timezone.utc),
    }

    result = mongo.db.notifications.insert_one(notification_doc)
    return result.inserted_id


def get_user_notifications(mongo, user_id, limit=50):
    """Get the most recent notifications for a user, newest first."""
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    notifications = list(
        mongo.db.notifications.find({"user_id": user_id})
        .sort("created_at", -1)
        .limit(limit)
    )
    return notifications


def mark_as_read(mongo, notification_id, user_id):
    """Mark a single notification as read."""
    if isinstance(notification_id, str):
        notification_id = ObjectId(notification_id)
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    result = mongo.db.notifications.update_one(
        {"_id": notification_id, "user_id": user_id},
        {"$set": {"is_read": True}}
    )
    return result


def mark_all_as_read(mongo, user_id):
    """Mark all of a user's notifications as read."""
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    result = mongo.db.notifications.update_many(
        {"user_id": user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return result


def get_unread_count(mongo, user_id):
    """Get the count of unread notifications for a user."""
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    count = mongo.db.notifications.count_documents({
        "user_id": user_id,
        "is_read": False
    })
    return count
