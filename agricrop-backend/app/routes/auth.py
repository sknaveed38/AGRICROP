"""
AgriCrop Backend - Auth Routes
Endpoints for user registration, login, and profile management.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app.services.auth_service import register_user, authenticate_user, get_user_profile, update_profile
from app.utils.helpers import format_response
from app.utils.validators import validate_email, validate_password

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user account."""
    try:
        data = request.get_json() or {}
        full_name = (data.get("full_name") or data.get("fullName", "")).strip()
        email = data.get("email", "").strip()
        password = data.get("password", "")

        if not full_name:
            res, code = format_response(message="Full name is required.", status_code=400)
            return jsonify(res), code

        if not email or not validate_email(email):
            res, code = format_response(message="A valid email address is required.", status_code=400)
            return jsonify(res), code

        if not password or not validate_password(password):
            res, code = format_response(message="Password must be at least 6 characters long.", status_code=400)
            return jsonify(res), code

        user, err = register_user(full_name, email, password)
        if err:
            res, code = format_response(message=err, status_code=400)
            return jsonify(res), code

        # Generate JWT access token
        access_token = create_access_token(identity=user["_id"])
        
        response_data = {
            "user": user,
            "token": access_token
        }

        res, code = format_response(response_data, "Registration successful.", 201)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred during registration: {str(e)}", status_code=500)
        return jsonify(res), code


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate an existing user and return a JWT."""
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip()
        password = data.get("password", "")

        if not email or not password:
            res, code = format_response(message="Email and password are required.", status_code=400)
            return jsonify(res), code

        user, err = authenticate_user(email, password)
        if err:
            res, code = format_response(message=err, status_code=401)
            return jsonify(res), code

        # Generate JWT access token
        access_token = create_access_token(identity=user["_id"])

        response_data = {
            "user": user,
            "token": access_token
        }

        res, code = format_response(response_data, "Login successful.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred during login: {str(e)}", status_code=500)
        return jsonify(res), code


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    """Fetch the authenticated user's profile information."""
    try:
        user_id = get_jwt_identity()
        user, err = get_user_profile(user_id)
        
        if err:
            res, code = format_response(message=err, status_code=404)
            return jsonify(res), code

        res, code = format_response(user, "Profile retrieved successfully.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred fetching profile: {str(e)}", status_code=500)
        return jsonify(res), code


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update():
    """Update profile fields for the authenticated user."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        # Limit what can be updated directly
        profile_data = {}
        if "full_name" in data or "fullName" in data:
            profile_data["full_name"] = (data.get("full_name") or data.get("fullName", "")).strip()
        if "location" in data:
            profile_data["location"] = data["location"].strip()
        if "farm_area" in data:
            try:
                profile_data["farm_area"] = float(data["farm_area"])
            except ValueError:
                res, code = format_response(message="Farm area must be a number.", status_code=400)
                return jsonify(res), code
        if "crop_type" in data:
            profile_data["crop_type"] = data["crop_type"].strip()
        if "profile_image" in data:
            profile_data["profile_image"] = data["profile_image"]

        user, err = update_profile(user_id, profile_data)
        if err:
            res, code = format_response(message=err, status_code=400)
            return jsonify(res), code

        res, code = format_response(user, "Profile updated successfully.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred updating profile: {str(e)}", status_code=500)
        return jsonify(res), code
