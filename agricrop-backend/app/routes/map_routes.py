"""
AgriCrop Backend - Map Routes
Endpoints for geospatial mapping of disease outbreaks and disease density heatmap data.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.map_service import get_geojson_outbreaks, get_heatmap_points
from app.utils.helpers import format_response

map_bp = Blueprint("map", __name__)


@map_bp.route("/outbreaks", methods=["GET"])
@jwt_required()
def outbreaks():
    """Retrieve disease outbreaks formatted as a GeoJSON FeatureCollection."""
    try:
        # Extract filters
        filters = {}
        if request.args.get("crop_type"):
            filters["crop_type"] = request.args.get("crop_type")
        if request.args.get("disease_name"):
            filters["disease_name"] = request.args.get("disease_name")
            
        # Parse bounding box bbox=sw_lng,sw_lat,ne_lng,ne_lat
        bbox_str = request.args.get("bbox")
        if bbox_str:
            try:
                bbox_vals = [float(v) for v in bbox_str.split(",")]
                if len(bbox_vals) == 4:
                    filters["bbox"] = bbox_vals
            except ValueError:
                pass

        geojson, err = get_geojson_outbreaks(filters)
        if err:
            res, code = format_response(message=err, status_code=500)
            return jsonify(res), code

        # GeoJSON FeatureCollection is directly returned inside the 'data' field
        res, code = format_response(geojson, "Outbreak GeoJSON retrieved successfully.", 200)
        return jsonify(res), code

    except Exception as e:
        res, code = format_response(message=f"An error occurred fetching outbreaks: {str(e)}", status_code=500)
        return jsonify(res), code


@map_bp.route("/heatmap", methods=["GET"])
@jwt_required()
def heatmap():
    """Retrieve coordinates and intensity weights for disease density heatmaps."""
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
        res, code = format_response(message=f"An error occurred fetching heatmap: {str(e)}", status_code=500)
        return jsonify(res), code
