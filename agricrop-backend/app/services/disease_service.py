"""
AgriCrop Backend - Disease Service
Business logic for disease prediction, model inference, and result formatting.
"""

import os
import traceback

from app import mongo
from app.models.disease_report import create_report, get_user_reports, get_report_by_id
from app.models.notification import create_notification
from app.utils.helpers import serialize_doc, get_disease_info


# Disease class labels matching the trained model's output order
DISEASE_CLASSES = [
    "Bacterial Blight",
    "Brown Spot",
    "Healthy",
    "Leaf Blast",
    "Leaf Scald",
    "Narrow Brown Spot",
]


def predict_disease_from_image(user_id, image_path, extra_data=None):
    """
    Run disease prediction on an uploaded image using the Gemini Vision API.
    Returns (prediction_result, error_message).
    """
    import base64
    import requests
    import json
    from flask import current_app

    if extra_data is None:
        extra_data = {}

    try:
        api_key = current_app.config.get("GEMINI_API_KEY")
        if not api_key:
            return None, "GEMINI_API_KEY is not configured in the backend .env file. Please add your key to enable accurate AI disease detection."

        if not os.path.exists(image_path):
            return None, "The uploaded image file could not be found for processing."

        # Read and base64-encode the image
        with open(image_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode("utf-8")

        prompt = """
        You are an expert plant pathologist and AI assistant for AgriCrop.
        Analyze this crop leaf or plant image to identify the plant disease and crop type.
        
        You must classify the disease state into one of the following classes:
        - Healthy
        - Leaf Spot
        - Rust
        - Blight
        - Powdery Mildew
        - Bacterial Blight
        - Brown Spot
        - Leaf Blast
        - Leaf Scald
        - Narrow Brown Spot
        
        Rules:
        1. If the image does not show a plant leaf or crop, or if the confidence score for the primary classification is less than 70%, you MUST set the disease name to: "Disease not confidently identified".
        2. Identify the host crop (e.g. Rice, Potato, Wheat, Corn, Tomato, etc.).
           CRITICAL CROP MORPHOLOGY RULES:
           - Grass-like, narrow linear leaves, or clusters of hanging grains/panicles (paddy heads) represent RICE. Do NOT misclassify rice grains/panicles as Eggplant, Potato, or other broadleaf crops!
           - Broad, wide, or lobed leaves represent crops like Eggplant, Potato, or Tomato.
        3. Provide 3-5 real symptoms, 3-5 prevention tips, and 3-5 treatment options. If healthy or not confidently identified, these lists should be empty or contain generic guidance.
        4. Provide the top 3 most likely classifications (with confidence percentages summing to <= 100).
        
        You must return the response as a single valid JSON object containing exactly these keys:
        {
          "disease_name": "Name of the disease (or 'Healthy' or 'Disease not confidently identified')",
          "confidence": 85.5,
          "crop_type": "The host crop name",
          "description": "Brief description of findings",
          "symptoms": ["symptom 1", "symptom 2", ...],
          "prevention": ["prevention 1", "prevention 2", ...],
          "treatment": ["treatment 1", "treatment 2", ...],
          "top_predictions": [
            {"class_name": "Class 1", "confidence": 85.5},
            {"class_name": "Class 2", "confidence": 10.2},
            {"class_name": "Class 3", "confidence": 4.3}
          ]
        }
        
        Do not output any markdown formatting (like ```json), output ONLY the raw JSON string.
        """

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": "image/jpeg",
                                "data": image_data
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return None, f"Gemini API request failed: {response.text}"
            
        res_json = response.json()
        try:
            content_text = res_json["candidates"][0]["content"]["parts"][0]["text"]
            prediction_data = json.loads(content_text)
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            return None, f"Failed to parse Gemini response: {str(e)}"

        disease_name = prediction_data.get("disease_name", "Disease not confidently identified")
        confidence = float(prediction_data.get("confidence", 0.0))
        crop_type = prediction_data.get("crop_type", "Unknown")
        description = prediction_data.get("description", "")
        symptoms = prediction_data.get("symptoms", [])
        prevention = prediction_data.get("prevention", [])
        treatment = prediction_data.get("treatment", [])
        top_predictions = prediction_data.get("top_predictions", [])

        # Double check threshold
        if confidence < 70.0:
            disease_name = "Disease not confidently identified"
            description = "The AI model could not confidently identify a plant disease from the uploaded image (confidence below 70%)."
            symptoms = []
            prevention = []
            treatment = []

        # Determine severity
        disease_name_lower = disease_name.lower()
        if "healthy" in disease_name_lower or "not confidently" in disease_name_lower:
            severity = "low"
        elif confidence >= 90:
            severity = "high"
        elif confidence >= 70:
            severity = "moderate"
        else:
            severity = "low"

        # Prepare report data
        report_data = {
            "image_url": image_path,
            "disease_name": disease_name,
            "confidence": round(confidence, 2),
            "description": description,
            "symptoms": symptoms,
            "prevention": prevention,
            "treatment": treatment,
            "crop_type": crop_type,
            "severity": severity,
            "field_id": extra_data.get("field_id"),
            "latitude": extra_data.get("latitude"),
            "longitude": extra_data.get("longitude"),
            "top_predictions": top_predictions,
        }

        # Save report to database
        report_id = create_report(mongo, user_id, report_data)

        # Create notification if confidence > 80% and it's not healthy/unknown
        if confidence > 80 and "healthy" not in disease_name_lower and "not confidently" not in disease_name_lower:
            create_notification(
                mongo,
                user_id,
                notification_type="disease_alert",
                title=f"Disease Detected: {disease_name}",
                message=f"{disease_name} detected with {confidence:.1f}% confidence. Check the disease report for treatment options.",
                severity="critical" if confidence > 90 else "warning",
                metadata={
                    "report_id": str(report_id),
                    "disease_name": disease_name,
                    "confidence": confidence,
                }
            )

        # Build response
        result = {
            "report_id": str(report_id),
            "disease_name": disease_name,
            "confidence": round(confidence, 2),
            "severity": severity,
            "description": description,
            "symptoms": symptoms,
            "prevention": prevention,
            "treatment": treatment,
            "is_healthy": "healthy" in disease_name_lower,
            "crop_type": crop_type,
            "top_predictions": top_predictions,
        }

        return result, None

    except ImportError:
        return None, "Disease prediction model is not available. Please ensure the AI model is properly installed."
    except FileNotFoundError:
        return None, "The uploaded image file could not be found for processing."
    except Exception as e:
        traceback.print_exc()
        return None, f"Disease prediction failed: {str(e)}"


def get_user_disease_reports(user_id, limit=20):
    """
    Get all disease reports for a user.
    Returns (reports_list, error_message).
    """
    try:
        reports = get_user_reports(mongo, user_id, limit=limit)
        serialized = [serialize_doc(report) for report in reports]
        return serialized, None
    except Exception as e:
        return None, f"Failed to retrieve disease reports: {str(e)}"


def get_disease_report_detail(report_id, user_id=None):
    """
    Get a specific disease report by ID.
    Returns (report_data, error_message).
    """
    try:
        report = get_report_by_id(mongo, report_id)
        if not report:
            return None, "Disease report not found."

        # Optionally verify ownership
        if user_id and str(report.get("user_id")) != str(user_id):
            return None, "You do not have permission to view this report."

        serialized = serialize_doc(report)
        return serialized, None
    except Exception as e:
        return None, f"Failed to retrieve disease report: {str(e)}"
