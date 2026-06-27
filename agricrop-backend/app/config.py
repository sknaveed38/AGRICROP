"""
AgriCrop Backend - Configuration
Loads settings from environment variables with sensible defaults.
"""

import os
from datetime import timedelta


class Config:
    """Flask application configuration."""

    # Gemini API
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

    # Flask core
    SECRET_KEY = os.environ.get("SECRET_KEY", "agricrop-default-secret-key-change-in-production")
    DEBUG = os.environ.get("FLASK_DEBUG", "False").lower() in ("true", "1", "yes")

    # JWT settings
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "agricrop-jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    # MongoDB
    _raw_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/agricrop")
    MONGO_URI = _raw_uri
    if "://" in _raw_uri:
        try:
            from urllib.parse import quote_plus, urlparse, urlunparse
            # 1. Escape credentials if @ is present in remainder
            _scheme, _rest = _raw_uri.split("://", 1)
            if "@" in _rest:
                _credentials, _address = _rest.rsplit("@", 1)
                if ":" in _credentials:
                    _user, _password = _credentials.split(":", 1)
                    _raw_uri = f"{_scheme}://{quote_plus(_user)}:{quote_plus(_password)}@{_address}"
            
            # 2. Inject default database path if missing
            _parsed = urlparse(_raw_uri)
            if not _parsed.path or _parsed.path == "/":
                _parsed = _parsed._replace(path="/agricrop")
            
            MONGO_URI = urlunparse(_parsed)
        except Exception:
            pass

    # File uploads
    UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH = int(os.environ.get("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))  # 16MB default

    # Allowed file extensions for image uploads
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
