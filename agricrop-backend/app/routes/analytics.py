"""
AgriCrop Backend - Analytics Routes
Endpoints for compiling dashboard statistics, moisture trends, crop health scores, and charts.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.analytics_service import (
    get_dashboard_stats,
    get_user_disease_distribution,
    get_user_moisture_trends,
    get_user_farm_health
)
from app.services.map_service import get_geojson_outbreaks, get_heatmap_points
from app.utils.helpers import format_response

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    """Retrieve summarized statistics and recent activities for the main dashboard."""
    try:
        user_id = get_jwt_identity()
        stats, err = get_dashboard_stats(user_id)
        if err:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        res, code = format_response(stats, "Dashboard statistics retrieved successfully.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred fetching dashboard: {str(e)}", status_code=500)
        return jsonify(res), code


@analytics_bp.route("/disease-distribution", methods=["GET"])
@jwt_required()
def disease_distribution():
    """Retrieve disease outbreak categories count for the distribution charts."""
    try:
        user_id = get_jwt_identity()
        dist, err = get_user_disease_distribution(user_id)
        if err:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        res, code = format_response(dist, "Disease distribution data retrieved successfully.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred fetching distribution: {str(e)}", status_code=500)
        return jsonify(res), code


@analytics_bp.route("/moisture-trends", methods=["GET"])
@jwt_required()
def moisture_trends():
    """Retrieve historical moisture trends for trend charts."""
    try:
        user_id = get_jwt_identity()
        trends, err = get_user_moisture_trends(user_id)
        if err:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        res, code = format_response(trends, "Moisture trends retrieved successfully.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred fetching trends: {str(e)}", status_code=500)
        return jsonify(res), code


@analytics_bp.route("/farm-health", methods=["GET"])
@jwt_required()
def farm_health():
    """Retrieve comparative health scores and status across different farm fields."""
    try:
        user_id = get_jwt_identity()
        scores, err = get_user_farm_health(user_id)
        if err:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        res, code = format_response(scores, "Farm health scores retrieved successfully.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred fetching health scores: {str(e)}", status_code=500)
        return jsonify(res), code


# ── Dual Routing support for Frontend client calls ──────────────────

@analytics_bp.route("/outbreaks", methods=["GET"])
@jwt_required()
def outbreaks_fallback():
    """Fallback route for outbreaks under /analytics endpoint."""
    try:
        filters = {}
        if request.args.get("crop_type"):
            filters["crop_type"] = request.args.get("crop_type")
        if request.args.get("disease_name"):
            filters["disease_name"] = request.args.get("disease_name")

        geojson, err = get_geojson_outbreaks(filters)
        if err:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        res, code = format_response(geojson, "Outbreak geo-data retrieved successfully.", 200)
        return jsonify(res), code
    except Exception as e:
        res, code = format_response(message=f"Error retrieving outbreaks: {str(e)}", status_code=500)
        return jsonify(res), code


@analytics_bp.route("/heatmap", methods=["GET"])
@jwt_required()
def heatmap_fallback():
    """Fallback route for heatmap under /analytics endpoint."""
    try:
        filters = {}
        if request.args.get("crop_type"):
            filters["crop_type"] = request.args.get("crop_type")
        if request.args.get("disease_name"):
            filters["disease_name"] = request.args.get("disease_name")

        points, err = get_heatmap_points(filters)
        if err:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        res, code = format_response(points, "Heatmap data retrieved successfully.", 200)
        return jsonify(res), code
    except Exception as e:
        res, code = format_response(message=f"Error retrieving heatmap: {str(e)}", status_code=500)
        return jsonify(res), code
