"""
AgriCrop Backend - Map Service
Business logic for geospatial queries, outbreak mapping, and heatmap data formatting.
"""

from app import mongo
from app.models.disease_report import get_outbreak_data
from app.utils.helpers import serialize_doc


def get_geojson_outbreaks(filters=None):
    """
    Query disease reports based on filters and format as a GeoJSON FeatureCollection.
    Returns (geojson_data, error_message).
    """
    try:
        reports = get_outbreak_data(mongo, filters)
        features = []

        for report in reports:
            location = report.get("location")
            if not location or not isinstance(location, dict):
                continue
            
            coords = location.get("coordinates")
            if not coords or len(coords) < 2:
                continue

            # GeoJSON coordinates are [longitude, latitude]
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(coords[0]), float(coords[1])]
                },
                "properties": {
                    "id": str(report["_id"]),
                    "disease_name": report.get("disease_name", "Unknown"),
                    "confidence": float(report.get("confidence", 0.0)),
                    "severity": report.get("severity", "low"),
                    "crop_type": report.get("crop_type", "Rice"),
                    "image_url": report.get("image_url", ""),
                    "created_at": report.get("created_at").isoformat() if report.get("created_at") else None
                }
            }
            features.append(feature)

        geojson = {
            "type": "FeatureCollection",
            "features": features
        }

        return geojson, None
    except Exception as e:
        return None, f"Failed to retrieve outbreak geo-data: {str(e)}"


def get_heatmap_points(filters=None):
    """
    Get aggregated coordinates and intensities for heatmap visualization.
    Returns (heatmap_data, error_message).
    """
    try:
        reports = get_outbreak_data(mongo, filters)
        points = []

        for report in reports:
            location = report.get("location")
            if not location or not isinstance(location, dict):
                continue
            
            coords = location.get("coordinates")
            if not coords or len(coords) < 2:
                continue

            # Leaflet.heat expects [latitude, longitude, intensity] or similar
            # We return both a list format [lat, lng, intensity] and a dict format for maximum compatibility
            points.append({
                "latitude": float(coords[1]),
                "longitude": float(coords[0]),
                "intensity": float(report.get("confidence", 100.0)) / 100.0,
                "disease_name": report.get("disease_name", "Unknown")
            })

        return points, None
    except Exception as e:
        return None, f"Failed to retrieve heatmap points: {str(e)}"
