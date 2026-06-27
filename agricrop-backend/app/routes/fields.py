"""
AgriCrop Backend - Field Routes
Endpoints for farm field management (CRUD operations).
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.field_service import (
    add_field,
    list_fields,
    get_field_detail,
    edit_field,
    remove_field,
    find_nearby_fields
)
from app.utils.helpers import format_response
from app.utils.validators import validate_field_data

fields_bp = Blueprint("fields", __name__)


@fields_bp.route("", methods=["GET"])
@jwt_required()
def get_fields():
    """Retrieve all fields belonging to the authenticated user."""
    try:
        user_id = get_jwt_identity()
        fields_list, err = list_fields(user_id)
        if err:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        res, code = format_response(fields_list, "Fields retrieved successfully.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred fetching fields: {str(e)}", status_code=500)
        return jsonify(res), code


@fields_bp.route("", methods=["POST"])
@jwt_required()
def create_field():
    """Create a new farm field for the authenticated user."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        # Validate field data
        is_valid, err_msg = validate_field_data(data)
        if not is_valid:
            res, code = format_response(message=err_msg, status_code=400)
            return jsonify(res), code

        field, err = add_field(user_id, data)
        if err:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        res, code = format_response(field, "Field created successfully.", 201)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred creating field: {str(e)}", status_code=500)
        return jsonify(res), code


@fields_bp.route("/<field_id>", methods=["GET"])
@jwt_required()
def get_field(field_id):
    """Retrieve details of a specific field."""
    try:
        user_id = get_jwt_identity()
        field, err = get_field_detail(field_id, user_id)
        if err:
            res, code = format_response(message=err, status_code=404)
            return jsonify(res), code

        res, code = format_response(field, "Field details retrieved.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred fetching field details: {str(e)}", status_code=500)
        return jsonify(res), code


@fields_bp.route("/<field_id>", methods=["PUT"])
@jwt_required()
def update_field(field_id):
    """Update field details."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}

        field, err = edit_field(field_id, user_id, data)
        if err:
            res, code = format_response(message=err, status_code=400)
            return jsonify(res), code

        res, code = format_response(field, "Field updated successfully.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred updating field: {str(e)}", status_code=500)
        return jsonify(res), code


@fields_bp.route("/<field_id>", methods=["DELETE"])
@jwt_required()
def delete_field(field_id):
    """Delete a farm field."""
    try:
        user_id = get_jwt_identity()
        success, err = remove_field(field_id, user_id)
        if err:
            res, code = format_response(message=err, status_code=400)
            return jsonify(res), code

        res, code = format_response(message="Field deleted successfully.", status_code=200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred deleting field: {str(e)}", status_code=500)
        return jsonify(res), code


@fields_bp.route("/nearby", methods=["GET"])
@jwt_required()
def get_nearby_fields():
    """Find fields near a point. Optional query parameters: lat, lng, max_dist."""
    try:
        lat = request.args.get("latitude")
        lng = request.args.get("longitude")
        max_dist = request.args.get("max_distance", 10000, type=int)

        if not lat or not lng:
            res, code = format_response(message="Latitude and longitude are required.", status_code=400)
            return jsonify(res), code

        try:
            lat = float(lat)
            lng = float(lng)
        except ValueError:
            res, code = format_response(message="Coordinates must be numeric.", status_code=400)
            return jsonify(res), code

        fields_list, err = find_nearby_fields(lng, lat, max_dist)
        if err:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        res, code = format_response(fields_list, "Nearby fields retrieved.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred searching nearby fields: {str(e)}", status_code=500)
        return jsonify(res), code
