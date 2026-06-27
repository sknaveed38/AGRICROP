"""
AgriCrop Backend - Analytics Service
Business logic for generating dashboard analytics, aggregating trends, and compiling farm health scores.
"""

from bson import ObjectId
from datetime import datetime, timedelta, timezone
from app import mongo
from app.models.disease_report import get_disease_distribution
from app.models.moisture_report import get_moisture_trends
from app.utils.helpers import serialize_doc


def get_dashboard_stats(user_id):
    """
    Get aggregated dashboard stats for a user:
    - total_farms
    - active_diseases (non-healthy reports count)
    - avg_moisture
    - high_risk_zones (fields with health score < 75 or high risk)
    - recent_reports (last 5 disease reports)
    - recent_alerts (last 5 unread or critical notifications)
    """
    try:
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        # 1. Total farms
        total_farms = mongo.db.fields.count_documents({"user_id": user_id})

        # 2. Active diseases (distinct non-healthy outbreaks reported recently, e.g., last 30 days)
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        active_diseases = mongo.db.disease_reports.count_documents({
            "user_id": user_id,
            "disease_name": {"$ne": "Healthy"},
            "created_at": {"$gte": thirty_days_ago}
        })

        # 3. Average moisture
        moisture_pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": None, "avg_moisture": {"$avg": "$predicted_moisture"}}}
        ]
        moisture_res = list(mongo.db.moisture_reports.aggregate(moisture_pipeline))
        avg_moisture = round(moisture_res[0]["avg_moisture"], 1) if moisture_res else 0.0

        # 4. High risk zones (fields with health score < 70 or active high-severity outbreaks)
        high_risk_zones = mongo.db.fields.count_documents({
            "user_id": user_id,
            "$or": [
                {"health_score": {"$lt": 70}},
                {"status": "high_risk"}
            ]
        })

        # 5. Recent reports (last 5 scans)
        recent_reports = list(
            mongo.db.disease_reports.find({"user_id": user_id})
            .sort("created_at", -1)
            .limit(5)
        )

        # 6. Recent alerts (last 5 notifications)
        recent_alerts = list(
            mongo.db.notifications.find({"user_id": user_id})
            .sort("created_at", -1)
            .limit(5)
        )

        stats = {
            "total_farms": total_farms,
            "active_diseases": active_diseases,
            "avg_moisture": avg_moisture,
            "high_risk_zones": high_risk_zones,
            "recent_reports": [serialize_doc(r) for r in recent_reports],
            "recent_alerts": [serialize_doc(a) for a in recent_alerts]
        }

        return stats, None
    except Exception as e:
        return None, f"Failed to retrieve dashboard stats: {str(e)}"


def get_user_disease_distribution(user_id):
    """
    Retrieve disease type counts for a user.
    """
    try:
        dist = get_disease_distribution(mongo, user_id)
        return [serialize_doc(d) for d in dist], None
    except Exception as e:
        return None, f"Failed to retrieve disease distribution: {str(e)}"


def get_user_moisture_trends(user_id):
    """
    Retrieve daily moisture levels for a user.
    """
    try:
        trends = get_moisture_trends(mongo, user_id)
        return [serialize_doc(t) for t in trends], None
    except Exception as e:
        return None, f"Failed to retrieve moisture trends: {str(e)}"


def get_user_farm_health(user_id):
    """
    Compute farm health scores per field.
    Returns details including field name, crop, area, health score, and risk status.
    """
    try:
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        fields = list(mongo.db.fields.find({"user_id": user_id}).sort("health_score", 1))
        
        health_scores = []
        for field in fields:
            health_scores.append({
                "field_id": str(field["_id"]),
                "name": field.get("name", "Unnamed Field"),
                "crop_type": field.get("crop_type", "Unknown"),
                "health_score": field.get("health_score", 100),
                "soil_type": field.get("soil_type", "Loamy"),
                "area": field.get("area", 0.0),
                "area_unit": field.get("area_unit", "acres"),
                "status": field.get("status", "active")
            })

        return health_scores, None
    except Exception as e:
        return None, f"Failed to retrieve farm health scores: {str(e)}"
