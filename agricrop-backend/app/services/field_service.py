"""
AgriCrop Backend - Field Service
Business logic for managing farm fields (CRUD operations).
"""

from app import mongo
from app.models.field import (
    create_field,
    get_user_fields,
    get_field_by_id,
    update_field,
    delete_field,
    get_fields_near
)
from app.utils.helpers import serialize_doc


def add_field(user_id, data):
    """
    Create a new field for a user.
    Returns (field_data, error_message).
    """
    try:
        # Validate coordinates
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        if latitude is None or longitude is None:
            return None, "Latitude and longitude are required to map a field."

        try:
            float(latitude)
            float(longitude)
        except ValueError:
            return None, "Coordinates must be valid numeric values."

        # Insert field
        field_id = create_field(mongo, user_id, data)
        field = get_field_by_id(mongo, field_id, user_id)
        
        return serialize_doc(field), None
    except Exception as e:
        return None, f"Failed to create field: {str(e)}"


def list_fields(user_id):
    """
    Retrieve all fields belonging to a user.
    Returns (fields_list, error_message).
    """
    try:
        fields = get_user_fields(mongo, user_id)
        return [serialize_doc(f) for f in fields], None
    except Exception as e:
        return None, f"Failed to retrieve fields: {str(e)}"


def get_field_detail(field_id, user_id):
    """
    Retrieve details of a specific field.
    Returns (field_data, error_message).
    """
    try:
        field = get_field_by_id(mongo, field_id, user_id)
        if not field:
            return None, "Field not found or access denied."
        return serialize_doc(field), None
    except Exception as e:
        return None, f"Failed to retrieve field details: {str(e)}"


def edit_field(field_id, user_id, data):
    """
    Modify an existing field.
    Returns (field_data, error_message).
    """
    try:
        # First verify the field exists and belongs to the user
        field = get_field_by_id(mongo, field_id, user_id)
        if not field:
            return None, "Field not found or access denied."

        # Perform the update
        result = update_field(mongo, field_id, user_id, data)
        if result is None:
            return None, "No valid fields to update."

        # Fetch and return the updated field
        updated_field = get_field_by_id(mongo, field_id, user_id)
        return serialize_doc(updated_field), None
    except Exception as e:
        return None, f"Failed to update field: {str(e)}"


def remove_field(field_id, user_id):
    """
    Delete a field.
    Returns (success_status, error_message).
    """
    try:
        # First verify the field exists and belongs to the user
        field = get_field_by_id(mongo, field_id, user_id)
        if not field:
            return False, "Field not found or access denied."

        result = delete_field(mongo, field_id, user_id)
        if result.deleted_count == 0:
            return False, "Field could not be deleted."

        return True, None
    except Exception as e:
        return False, f"Failed to delete field: {str(e)}"


def find_nearby_fields(longitude, latitude, max_distance=10000):
    """
    Find fields near a point.
    Returns (fields_list, error_message).
    """
    try:
        fields = get_fields_near(mongo, longitude, latitude, max_distance)
        return [serialize_doc(f) for f in fields], None
    except Exception as e:
        return None, f"Failed to retrieve nearby fields: {str(e)}"
