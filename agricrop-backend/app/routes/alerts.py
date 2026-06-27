"""
AgriCrop Backend - Alert/Notification Routes
Endpoints for retrieving, reading, and counting user alerts.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.alert_service import (
    list_alerts,
    mark_alert_as_read,
    mark_all_alerts_as_read,
    count_unread_alerts
)
from app.utils.helpers import format_response

alerts_bp = Blueprint("alerts", __name__)


@alerts_bp.route("", methods=["GET"])
@jwt_required()
def get_alerts():
    """Retrieve the recent notifications/alerts list for the authenticated user."""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get("limit", 50, type=int)

        alerts_list, err = list_alerts(user_id, limit)
        if err:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        res, code = format_response(alerts_list, "Alerts retrieved successfully.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred fetching alerts: {str(e)}", status_code=500)
        return jsonify(res), code


@alerts_bp.route("/<notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_read(notification_id):
    """Mark a specific alert as read."""
    try:
        user_id = get_jwt_identity()
        success, err = mark_alert_as_read(notification_id, user_id)
        if err:
            res, code = format_response(message=err, status_code=400)
            return jsonify(res), code

        res, code = format_response(message="Alert marked as read.", status_code=200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred marking alert as read: {str(e)}", status_code=500)
        return jsonify(res), code


@alerts_bp.route("/read-all", methods=["PUT"])
@jwt_required()
def read_all():
    """Mark all unread alerts of the user as read."""
    try:
        user_id = get_jwt_identity()
        success, err = mark_all_alerts_as_read(user_id)
        if err:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        res, code = format_response(message="All alerts marked as read.", status_code=200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred marking all alerts as read: {str(e)}", status_code=500)
        return jsonify(res), code


@alerts_bp.route("/unread-count", methods=["GET"])
@jwt_required()
def unread_count():
    """Get the count of unread alerts for the authenticated user."""
    try:
        user_id = get_jwt_identity()
        count, err = count_unread_alerts(user_id)
        if err is not None:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        res, code = format_response({"unread_count": count}, "Unread alert count retrieved.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred fetching unread count: {str(e)}", status_code=500)
        return jsonify(res), code
