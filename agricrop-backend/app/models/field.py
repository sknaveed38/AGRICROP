"""
AgriCrop Backend - Field Model Helpers
Functions for farm field CRUD operations with GeoJSON support.
"""

from datetime import datetime, timezone

from bson import ObjectId


def create_field(mongo, user_id, data):
    """
    Create a new farm field with GeoJSON Point location.
    Returns the inserted document's _id.
    """
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    field_doc = {
        "user_id": user_id,
        "name": data.get("name", "Unnamed Field"),
        "crop_type": data.get("crop_type", ""),
        "area": data.get("area", 0),
        "area_unit": data.get("area_unit", "acres"),
        "soil_type": data.get("soil_type", ""),
        "irrigation_type": data.get("irrigation_type", ""),
        "location": {
            "type": "Point",
            "coordinates": [
                float(data.get("longitude", 0)),
                float(data.get("latitude", 0)),
            ]
        },
        "address": data.get("address", ""),
        "health_score": data.get("health_score", 100),
        "status": data.get("status", "active"),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = mongo.db.fields.insert_one(field_doc)
    return result.inserted_id


def get_user_fields(mongo, user_id):
    """Get all fields belonging to a user."""
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    fields = list(mongo.db.fields.find({"user_id": user_id}).sort("created_at", -1))
    return fields


def get_field_by_id(mongo, field_id, user_id):
    """Get a specific field by ID, ensuring it belongs to the user."""
    if isinstance(field_id, str):
        field_id = ObjectId(field_id)
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    return mongo.db.fields.find_one({"_id": field_id, "user_id": user_id})


def update_field(mongo, field_id, user_id, data):
    """
    Update a farm field. Only updates provided fields.
    Returns the update result.
    """
    if isinstance(field_id, str):
        field_id = ObjectId(field_id)
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    allowed_fields = [
        "name", "crop_type", "area", "area_unit", "soil_type",
        "irrigation_type", "address", "health_score", "status"
    ]

    update_fields = {}
    for field in allowed_fields:
        if field in data:
            update_fields[field] = data[field]

    # Handle location update separately for GeoJSON format
    if "latitude" in data and "longitude" in data:
        update_fields["location"] = {
            "type": "Point",
            "coordinates": [float(data["longitude"]), float(data["latitude"])]
        }

    if not update_fields:
        return None

    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = mongo.db.fields.update_one(
        {"_id": field_id, "user_id": user_id},
        {"$set": update_fields}
    )
    return result


def delete_field(mongo, field_id, user_id):
    """Delete a farm field by ID, ensuring it belongs to the user."""
    if isinstance(field_id, str):
        field_id = ObjectId(field_id)
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    result = mongo.db.fields.delete_one({"_id": field_id, "user_id": user_id})
    return result


def get_fields_near(mongo, longitude, latitude, max_distance=10000):
    """
    Find fields near a given point within max_distance meters.
    Uses MongoDB's $nearSphere geospatial query.
    """
    fields = list(mongo.db.fields.find({
        "location": {
            "$nearSphere": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [float(longitude), float(latitude)]
                },
                "$maxDistance": int(max_distance)
            }
        }
    }))
    return fields
