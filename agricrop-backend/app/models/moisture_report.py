"""
AgriCrop Backend - Moisture Report Model Helpers
Functions for soil moisture report CRUD and trend analysis.
"""

from datetime import datetime, timezone

from bson import ObjectId


def create_report(mongo, user_id, data):
    """
    Create a new soil moisture report.
    Returns the inserted document's _id.
    """
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    report_doc = {
        "user_id": user_id,
        "temperature": float(data.get("temperature", 0)),
        "humidity": float(data.get("humidity", 0)),
        "rainfall": float(data.get("rainfall", 0)),
        "wind_speed": float(data.get("wind_speed", 0)),
        "soil_type": data.get("soil_type", ""),
        "predicted_moisture": float(data.get("predicted_moisture", 0)),
        "moisture_level": data.get("moisture_level", "moderate"),
        "recommendations": data.get("recommendations", []),
        "field_id": ObjectId(data["field_id"]) if data.get("field_id") else None,
        "created_at": datetime.now(timezone.utc),
    }

    result = mongo.db.moisture_reports.insert_one(report_doc)
    return result.inserted_id


def get_user_reports(mongo, user_id, limit=20):
    """Get the most recent moisture reports for a user."""
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    reports = list(
        mongo.db.moisture_reports.find({"user_id": user_id})
        .sort("created_at", -1)
        .limit(limit)
    )
    return reports


def get_moisture_trends(mongo, user_id):
    """
    Aggregate moisture data over time for trend analysis.
    Groups by date and computes average predicted moisture per day.
    """
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    pipeline = [
        {"$match": {"user_id": user_id}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at"
                    }
                },
                "avg_moisture": {"$avg": "$predicted_moisture"},
                "avg_temperature": {"$avg": "$temperature"},
                "avg_humidity": {"$avg": "$humidity"},
                "avg_rainfall": {"$avg": "$rainfall"},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
        {"$limit": 90},  # Last 90 days max
    ]

    result = list(mongo.db.moisture_reports.aggregate(pipeline))
    return result
