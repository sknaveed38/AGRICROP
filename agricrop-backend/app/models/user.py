"""
AgriCrop Backend - User Model Helpers
Functions for user CRUD operations with MongoDB via PyMongo.
"""

from datetime import datetime, timezone

import bcrypt
from bson import ObjectId


def create_user(mongo, full_name, email, password):
    """
    Create a new user with hashed password.
    Returns the inserted document's _id.
    """
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    user_doc = {
        "full_name": full_name,
        "email": email.lower().strip(),
        "password": hashed_password,
        "location": None,
        "farm_area": None,
        "crop_type": None,
        "profile_image": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = mongo.db.users.insert_one(user_doc)
    return result.inserted_id


def find_user_by_email(mongo, email):
    """Find a user document by email address."""
    return mongo.db.users.find_one({"email": email.lower().strip()})


def find_user_by_id(mongo, user_id):
    """Find a user document by its ObjectId."""
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)
    return mongo.db.users.find_one({"_id": user_id})


def update_user_profile(mongo, user_id, profile_data):
    """
    Update user profile fields (location, farm_area, crop_type, etc.).
    Only updates fields that are present in profile_data.
    Returns the update result.
    """
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    allowed_fields = ["full_name", "location", "farm_area", "crop_type", "profile_image"]
    update_fields = {}

    for field in allowed_fields:
        if field in profile_data:
            update_fields[field] = profile_data[field]

    if not update_fields:
        return None

    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = mongo.db.users.update_one(
        {"_id": user_id},
        {"$set": update_fields}
    )
    return result
