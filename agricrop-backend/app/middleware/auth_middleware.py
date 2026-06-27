"""
AgriCrop Backend - JWT Auth Middleware
Custom error handlers for JWT authentication failures.
"""

from flask import jsonify


def register_jwt_handlers(jwt):
    """Register custom JWT error handlers on the JWTManager instance."""

    @jwt.expired_token_loader
    def expired_token_handler(jwt_header, jwt_payload):
        return jsonify({
            "success": False,
            "message": "Your session has expired. Please log in again.",
            "data": None,
            "error": "token_expired"
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_handler(error_string):
        return jsonify({
            "success": False,
            "message": "Invalid authentication token.",
            "data": None,
            "error": "invalid_token",
            "details": error_string
        }), 401

    @jwt.unauthorized_loader
    def unauthorized_handler(error_string):
        return jsonify({
            "success": False,
            "message": "Authentication required. Please provide a valid token.",
            "data": None,
            "error": "authorization_required",
            "details": error_string
        }), 401

    @jwt.revoked_token_loader
    def revoked_token_handler(jwt_header, jwt_payload):
        return jsonify({
            "success": False,
            "message": "Token has been revoked.",
            "data": None,
            "error": "token_revoked"
        }), 401
