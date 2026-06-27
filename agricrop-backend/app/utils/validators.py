"""
AgriCrop Backend - Input Validators
Validation functions for request data across all endpoints.
"""

import re


def validate_email(email):
    """
    Validate email format using regex.
    Returns (is_valid, error_message).
    """
    if not email or not isinstance(email, str):
        return False, "Email is required."

    email = email.strip()
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    if not re.match(pattern, email):
        return False, "Please provide a valid email address."

    if len(email) > 254:
        return False, "Email address is too long."

    return True, None


def validate_password(password):
    """
    Validate password strength.
    Returns (is_valid, error_message).
    """
    if not password or not isinstance(password, str):
        return False, "Password is required."

    if len(password) < 6:
        return False, "Password must be at least 6 characters long."

    if len(password) > 128:
        return False, "Password must be no more than 128 characters long."

    return True, None


def validate_coordinates(lat, lng):
    """
    Validate geographic coordinates.
    Returns (is_valid, error_message).
    """
    try:
        lat = float(lat)
        lng = float(lng)
    except (TypeError, ValueError):
        return False, "Latitude and longitude must be valid numbers."

    if lat < -90 or lat > 90:
        return False, "Latitude must be between -90 and 90 degrees."

    if lng < -180 or lng > 180:
        return False, "Longitude must be between -180 and 180 degrees."

    return True, None


def validate_field_data(data):
    """
    Validate field creation/update data.
    Returns (is_valid, error_message).
    """
    if not data:
        return False, "Field data is required."

    if not data.get("name") or not isinstance(data.get("name"), str):
        return False, "Field name is required."

    if len(data["name"].strip()) < 1:
        return False, "Field name cannot be empty."

    if len(data["name"].strip()) > 100:
        return False, "Field name must be no more than 100 characters."

    if not data.get("crop_type"):
        return False, "Crop type is required."

    if data.get("area") is not None:
        try:
            area = float(data["area"])
            if area < 0:
                return False, "Area must be a positive number."
        except (TypeError, ValueError):
            return False, "Area must be a valid number."

    if data.get("latitude") is not None and data.get("longitude") is not None:
        is_valid, error = validate_coordinates(data["latitude"], data["longitude"])
        if not is_valid:
            return False, error

    return True, None


def validate_moisture_inputs(data):
    """
    Validate the 5 required inputs for moisture prediction.
    Returns (is_valid, error_message).
    """
    if not data:
        return False, "Moisture prediction data is required."

    required_fields = ["temperature", "humidity", "rainfall", "wind_speed", "soil_type"]

    for field in required_fields:
        if field not in data or data[field] is None:
            return False, f"{field.replace('_', ' ').title()} is required."

    # Validate numeric fields
    numeric_fields = ["temperature", "humidity", "rainfall", "wind_speed"]
    for field in numeric_fields:
        try:
            value = float(data[field])
        except (TypeError, ValueError):
            return False, f"{field.replace('_', ' ').title()} must be a valid number."

    # Range validations
    temperature = float(data["temperature"])
    if temperature < -50 or temperature > 60:
        return False, "Temperature must be between -50°C and 60°C."

    humidity = float(data["humidity"])
    if humidity < 0 or humidity > 100:
        return False, "Humidity must be between 0% and 100%."

    rainfall = float(data["rainfall"])
    if rainfall < 0 or rainfall > 1000:
        return False, "Rainfall must be between 0mm and 1000mm."

    wind_speed = float(data["wind_speed"])
    if wind_speed < 0 or wind_speed > 200:
        return False, "Wind speed must be between 0 and 200 km/h."

    # Validate soil type
    valid_soil_types = [
        "clay", "sandy", "loamy", "silt", "peaty", "chalky",
        "Clay", "Sandy", "Loamy", "Silt", "Peaty", "Chalky",
        "black", "red", "alluvial", "laterite",
        "Black", "Red", "Alluvial", "Laterite"
    ]
    if data["soil_type"] not in valid_soil_types:
        return False, f"Soil type must be one of: clay, sandy, loamy, silt, peaty, chalky, black, red, alluvial, laterite."

    return True, None
