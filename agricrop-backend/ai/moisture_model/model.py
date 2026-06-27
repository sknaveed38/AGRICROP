"""
Soil Moisture Model Definition
===============================

A scikit-learn pipeline (StandardScaler → RandomForestRegressor) that
predicts soil moisture percentage from weather conditions and soil type.
"""

import os
import threading
import logging

import numpy as np
import joblib

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
SOIL_TYPES = ['Sandy', 'Loamy', 'Clay', 'Silt', 'Peaty', 'Chalky']

# Feature vector layout:
# [temperature, humidity, rainfall, wind_speed, is_Sandy, is_Loamy,
#  is_Clay, is_Silt, is_Peaty, is_Chalky]
FEATURE_NAMES = (
    ['temperature', 'humidity', 'rainfall', 'wind_speed']
    + [f'soil_{st}' for st in SOIL_TYPES]
)

NUM_FEATURES = len(FEATURE_NAMES)

MODEL_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models'
)
MODEL_PATH = os.path.join(MODEL_DIR, 'moisture_model.pkl')

# Thread lock for safe model loading / creation
_model_lock = threading.Lock()


def build_pipeline():
    """
    Build a scikit-learn pipeline for soil moisture prediction.

    Pipeline
    --------
    1. **StandardScaler** – zero-mean, unit-variance normalisation.
    2. **RandomForestRegressor** – 100 estimators, max_depth 12.

    Returns
    -------
    sklearn.pipeline.Pipeline
        An *unfitted* pipeline ready for ``.fit(X, y)``.
    """
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler
    from sklearn.ensemble import RandomForestRegressor

    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
        )),
    ])

    logger.info("Moisture prediction pipeline built.")
    return pipeline


def load_model():
    """
    Load the trained moisture prediction pipeline from disk.

    If the saved file does not exist the function will trigger training
    on synthetic data, save the resulting pipeline, and return it.

    A threading lock prevents concurrent creation.

    Returns
    -------
    sklearn.pipeline.Pipeline
        Fitted pipeline ready for ``.predict()``.
    """
    with _model_lock:
        if os.path.exists(MODEL_PATH):
            logger.info("Loading moisture model from %s", MODEL_PATH)
            pipeline = joblib.load(MODEL_PATH)
            logger.info("Moisture model loaded successfully.")
            return pipeline

        logger.warning(
            "Moisture model not found at %s. "
            "Training on synthetic data …",
            MODEL_PATH,
        )

        from ai.moisture_model.train import train_model
        pipeline = train_model()  # trains, saves, and returns the pipeline
        return pipeline
