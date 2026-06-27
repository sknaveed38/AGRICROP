"""
AgriCrop Backend - Moisture Service
Business logic for soil moisture prediction, model inference, database storage, and alerts.
"""

import traceback
from app import mongo
from app.models.moisture_report import create_report, get_user_reports, get_moisture_trends
from app.models.notification import create_notification
from app.utils.helpers import serialize_doc, get_moisture_recommendations


def predict_moisture_levels(user_id, data):
    """
    Run soil moisture prediction, save to database, and trigger alerts if critical.
    Returns (prediction_result, error_message).
    """
    try:
        # Import the prediction logic from the AI package
        from ai.moisture_model.predict import predict_moisture

        # Construct features dictionary for model input
        features_dict = {
            "temperature": float(data.get("temperature", 0)),
            "humidity": float(data.get("humidity", 0)),
            "rainfall": float(data.get("rainfall", 0)),
            "wind_speed": float(data.get("wind_speed", 0)),
            "soil_type": data.get("soil_type", "Loamy")
        }

        # Run prediction via Random Forest model pipeline
        prediction = predict_moisture(features_dict)

        if not prediction.get("success", False):
            return None, prediction.get("error", "AI model prediction failed.")

        moisture_level = float(prediction.get("moisture_level", 0.0))
        evaporation_rate = float(prediction.get("evaporation_rate", 0.0))
        water_requirement = float(prediction.get("water_requirement", 0.0))

        # Get moisture recommendations based on moisture percentage and soil type
        soil_type = features_dict["soil_type"]
        rec_data = get_moisture_recommendations(moisture_level, soil_type)

        # Prepare document data
        report_data = {
            "temperature": features_dict["temperature"],
            "humidity": features_dict["humidity"],
            "rainfall": features_dict["rainfall"],
            "wind_speed": features_dict["wind_speed"],
            "soil_type": soil_type,
            "predicted_moisture": moisture_level,
            "moisture_level": rec_data["moisture_level"],  # e.g., low, optimal, excessive
            "recommendations": rec_data["recommendations"],
            "field_id": data.get("field_id")
        }

        # Save moisture report to MongoDB
        report_id = create_report(mongo, user_id, report_data)

        # Create alert if soil moisture is below 30%
        if moisture_level < 30.0:
            severity = "critical" if moisture_level < 20.0 else "warning"
            create_notification(
                mongo,
                user_id,
                notification_type="moisture_alert",
                title=f"Low Soil Moisture Alert",
                message=f"Soil moisture has dropped to {moisture_level:.1f}% ({rec_data['status']}). Irrigation is highly recommended.",
                severity=severity,
                metadata={
                    "report_id": str(report_id),
                    "moisture_level": moisture_level,
                    "soil_type": soil_type
                }
            )

        # Build response payload
        result = {
            "report_id": str(report_id),
            "moisture_level": moisture_level,
            "evaporation_rate": evaporation_rate,
            "water_requirement": water_requirement,
            "status": rec_data["status"],
            "risk_level": prediction.get("risk_level", "Medium"),
            "recommendations": rec_data["recommendations"],
            "soil_characteristics": rec_data["soil_characteristics"]
        }

        return result, None

    except ImportError:
        return None, "Moisture prediction model is not available. Please ensure the AI model is properly initialized."
    except Exception as e:
        traceback.print_exc()
        return None, f"Moisture prediction failed: {str(e)}"


def get_user_moisture_reports(user_id, limit=20):
    """
    Get recent moisture reports for a user.
    Returns (reports_list, error_message).
    """
    try:
        reports = get_user_reports(mongo, user_id, limit=limit)
        serialized = [serialize_doc(report) for report in reports]
        return serialized, None
    except Exception as e:
        return None, f"Failed to retrieve moisture reports: {str(e)}"


def get_user_moisture_trends(user_id):
    """
    Get average moisture trends aggregated over time for a user.
    Returns (trends_list, error_message).
    """
    try:
        trends = get_moisture_trends(mongo, user_id)
        serialized = [serialize_doc(trend) for trend in trends]
        return serialized, None
    except Exception as e:
        return None, f"Failed to retrieve moisture trends: {str(e)}"
