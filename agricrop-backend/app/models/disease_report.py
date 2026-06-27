"""
AgriCrop Backend - Disease Report Model Helpers
Functions for disease report CRUD and geospatial outbreak queries.
"""

from datetime import datetime, timezone

from bson import ObjectId


def create_report(mongo, user_id, data):
    """
    Create a new disease report with image, disease info, and GeoJSON location.
    Returns the inserted document's _id.
    """
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    report_doc = {
        "user_id": user_id,
        "image_url": data.get("image_url", ""),
        "disease_name": data.get("disease_name", "Unknown"),
        "confidence": data.get("confidence", 0.0),
        "description": data.get("description", ""),
        "symptoms": data.get("symptoms", []),
        "prevention": data.get("prevention", []),
        "treatment": data.get("treatment", []),
        "crop_type": data.get("crop_type", ""),
        "severity": data.get("severity", "low"),
        "field_id": ObjectId(data["field_id"]) if data.get("field_id") else None,
        "location": {
            "type": "Point",
            "coordinates": [
                float(data.get("longitude", 0)),
                float(data.get("latitude", 0)),
            ]
        } if data.get("latitude") and data.get("longitude") else None,
        "top_predictions": data.get("top_predictions", []),
        "created_at": datetime.now(timezone.utc),
    }

    result = mongo.db.disease_reports.insert_one(report_doc)
    return result.inserted_id


def get_user_reports(mongo, user_id, limit=20):
    """Get the most recent disease reports for a user."""
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    reports = list(
        mongo.db.disease_reports.find({"user_id": user_id})
        .sort("created_at", -1)
        .limit(limit)
    )
    return reports


def get_report_by_id(mongo, report_id):
    """Get a specific disease report by its ID."""
    if isinstance(report_id, str):
        report_id = ObjectId(report_id)

    return mongo.db.disease_reports.find_one({"_id": report_id})


def get_outbreak_data(mongo, filters=None):
    """
    Get disease reports for outbreak mapping with optional filters.
    Supports filtering by crop_type, disease_name, date range, and bounding box.
    """
    if filters is None:
        filters = {}

    query = {}

    if filters.get("crop_type"):
        query["crop_type"] = filters["crop_type"]

    if filters.get("disease_name"):
        query["disease_name"] = filters["disease_name"]

    # Date range filter
    if filters.get("start_date") or filters.get("end_date"):
        date_query = {}
        if filters.get("start_date"):
            date_query["$gte"] = filters["start_date"]
        if filters.get("end_date"):
            date_query["$lte"] = filters["end_date"]
        query["created_at"] = date_query

    # Bounding box geospatial filter
    if filters.get("bbox"):
        bbox = filters["bbox"]  # [sw_lng, sw_lat, ne_lng, ne_lat]
        query["location"] = {
            "$geoWithin": {
                "$box": [
                    [bbox[0], bbox[1]],  # southwest corner
                    [bbox[2], bbox[3]],  # northeast corner
                ]
            }
        }

    reports = list(
        mongo.db.disease_reports.find(query)
        .sort("created_at", -1)
        .limit(500)
    )
    return reports


def get_disease_distribution(mongo, user_id=None):
    """
    Aggregate disease reports by disease_name for analytics.
    Optionally filter by user_id.
    """
    pipeline = []

    if user_id:
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        pipeline.append({"$match": {"user_id": user_id}})

    pipeline.extend([
        {
            "$group": {
                "_id": "$disease_name",
                "count": {"$sum": 1},
                "avg_confidence": {"$avg": "$confidence"},
                "latest_report": {"$max": "$created_at"},
            }
        },
        {"$sort": {"count": -1}},
    ])

    result = list(mongo.db.disease_reports.aggregate(pipeline))
    return result
