"""
AgriCrop Backend - Auth Service
Business logic for user authentication, registration, and profile management.
"""

import bcrypt
from bson import ObjectId

from app import mongo
from app.models.user import create_user, find_user_by_email, find_user_by_id, update_user_profile
from app.utils.helpers import serialize_doc


def register_user(full_name, email, password):
    """
    Register a new user.
    Returns (user_data, error_message). One of them will be None.
    """
    # Check if user already exists
    existing_user = find_user_by_email(mongo, email)
    if existing_user:
        return None, "An account with this email already exists."

    # Create the user
    user_id = create_user(mongo, full_name, email, password)

    # Fetch the created user (without password)
    user = find_user_by_id(mongo, user_id)
    user_data = _sanitize_user(user)

    return user_data, None


def authenticate_user(email, password):
    """
    Authenticate a user with email and password.
    Returns (user_data, error_message). One of them will be None.
    """
    user = find_user_by_email(mongo, email)
    if not user:
        return None, "Invalid email or password."

    # Verify password
    stored_password = user.get("password", b"")
    if isinstance(stored_password, str):
        stored_password = stored_password.encode("utf-8")

    if not bcrypt.checkpw(password.encode("utf-8"), stored_password):
        return None, "Invalid email or password."

    user_data = _sanitize_user(user)
    return user_data, None


def get_user_profile(user_id):
    """
    Get user profile by ID.
    Returns (user_data, error_message).
    """
    user = find_user_by_id(mongo, user_id)
    if not user:
        return None, "User not found."

    user_data = _sanitize_user(user)
    return user_data, None


def update_profile(user_id, profile_data):
    """
    Update user profile fields.
    Returns (user_data, error_message).
    """
    result = update_user_profile(mongo, user_id, profile_data)
    if result is None:
        return None, "No valid fields to update."

    if result.matched_count == 0:
        return None, "User not found."

    # Fetch updated user
    user = find_user_by_id(mongo, user_id)
    user_data = _sanitize_user(user)

    return user_data, None


def _sanitize_user(user_doc):
    """Remove sensitive fields and serialize the user document."""
    if user_doc is None:
        return None

    sanitized = serialize_doc(user_doc)
    # Remove password from the response
    sanitized.pop("password", None)
    return sanitized
