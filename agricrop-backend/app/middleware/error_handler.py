"""
AgriCrop Backend - Global Error Handlers
Handles HTTP errors and uncaught exceptions with consistent JSON responses.
"""

from flask import jsonify


def register_error_handlers(app):
    """Register global error handlers on the Flask app."""

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "message": "Bad request. Please check your input data.",
            "data": None,
            "error": "bad_request"
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "message": "The requested resource was not found.",
            "data": None,
            "error": "not_found"
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "success": False,
            "message": "HTTP method not allowed for this endpoint.",
            "data": None,
            "error": "method_not_allowed"
        }), 405

    @app.errorhandler(413)
    def payload_too_large(error):
        return jsonify({
            "success": False,
            "message": "File size exceeds the maximum allowed limit of 16MB.",
            "data": None,
            "error": "payload_too_large"
        }), 413

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            "success": False,
            "message": "An internal server error occurred. Please try again later.",
            "data": None,
            "error": "internal_server_error"
        }), 500

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred.",
            "data": None,
            "error": str(error)
        }), 500
