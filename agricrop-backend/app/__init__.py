"""
AgriCrop Backend - Application Factory
Initializes Flask app with all extensions, blueprints, and configuration.
"""

import os
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo

# Load environment variables from .env file
load_dotenv()

# Global extension instances
mongo = PyMongo()
jwt = JWTManager()


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Load configuration
    from app.config import Config
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    mongo.init_app(app)
    jwt.init_app(app)

    # Register JWT error handlers
    from app.middleware.auth_middleware import register_jwt_handlers
    register_jwt_handlers(jwt)

    # Register global error handlers
    from app.middleware.error_handler import register_error_handlers
    register_error_handlers(app)

    # Register route blueprints
    from app.routes.auth import auth_bp
    from app.routes.disease import disease_bp
    from app.routes.moisture import moisture_bp
    from app.routes.fields import fields_bp
    from app.routes.map_routes import map_bp
    from app.routes.analytics import analytics_bp
    from app.routes.alerts import alerts_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(disease_bp, url_prefix="/api/disease")
    app.register_blueprint(moisture_bp, url_prefix="/api/moisture")
    app.register_blueprint(fields_bp, url_prefix="/api/fields")
    app.register_blueprint(map_bp, url_prefix="/api/map")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(alerts_bp, url_prefix="/api/alerts")

    # Health check route
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "success": True,
            "message": "AgriCrop API is running",
            "data": {
                "status": "healthy",
                "version": "1.0.0"
            }
        }), 200

    # Serve uploaded images statically
    from flask import send_from_directory
    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        upload_dir = os.path.abspath(app.config.get("UPLOAD_FOLDER", "uploads"))
        return send_from_directory(upload_dir, filename)

    # Startup tasks
    with app.app_context():
        _create_upload_folder(app)
        _create_indexes()

    return app


def _create_upload_folder(app):
    """Create the upload folder if it doesn't exist."""
    upload_folder = app.config.get("UPLOAD_FOLDER", "uploads")
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder, exist_ok=True)


def _create_indexes():
    """Create MongoDB indexes for geospatial queries."""
    try:
        # 2dsphere index on fields collection for geospatial queries
        mongo.db.fields.create_index([("location", "2dsphere")])
        # 2dsphere index on disease_reports collection for outbreak mapping
        mongo.db.disease_reports.create_index([("location", "2dsphere")])
    except Exception as e:
        # Log but don't crash - indexes may already exist or DB may not be ready
        print(f"[AgriCrop] Index creation note: {e}")
