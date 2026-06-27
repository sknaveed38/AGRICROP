"""
Soil Moisture Feature Preprocessing
====================================

Converts raw sensor / weather dictionaries into the numeric feature
vectors expected by the moisture prediction pipeline.
"""

import logging

import numpy as np

from ai.moisture_model.model import SOIL_TYPES, FEATURE_NAMES, NUM_FEATURES

logger = logging.getLogger(__name__)

# Required numeric fields in the input dictionary
_NUMERIC_FIELDS = ['temperature', 'humidity', 'rainfall', 'wind_speed']


def preprocess_features(data_dict: dict) -> np.ndarray:
    """
    Transform a raw data dictionary into a model-ready feature vector.

    Parameters
    ----------
    data_dict : dict
        Must contain the keys ``temperature``, ``humidity``, ``rainfall``,
        ``wind_speed`` (numeric) and ``soil_type`` (one of
        :data:`SOIL_TYPES`).

    Returns
    -------
    numpy.ndarray
        2-D array of shape ``(1, 10)`` – a single sample with 4 weather
        features + 6 one-hot encoded soil-type features.

    Raises
    ------
    KeyError
        If a required field is missing.
    ValueError
        If ``soil_type`` is not in :data:`SOIL_TYPES`.
    """
    # ---- numeric features ----
    features = [float(data_dict[field]) for field in _NUMERIC_FIELDS]

    # ---- one-hot encode soil_type ----
    soil = data_dict['soil_type']
    if soil not in SOIL_TYPES:
        raise ValueError(
            f"Unknown soil type '{soil}'. Must be one of: {SOIL_TYPES}"
        )
    one_hot = [1.0 if st == soil else 0.0 for st in SOIL_TYPES]
    features.extend(one_hot)

    feature_array = np.array(features, dtype=np.float64).reshape(1, -1)

    logger.debug("Preprocessed features: %s", dict(zip(FEATURE_NAMES, features)))
    return feature_array


def validate_inputs(data_dict: dict) -> tuple:
    """
    Validate that all required fields are present and correctly typed.

    Parameters
    ----------
    data_dict : dict
        The raw input dictionary to validate.

    Returns
    -------
    tuple[bool, str]
        ``(is_valid, error_message)``.  If ``is_valid`` is ``True`` the
        ``error_message`` is an empty string.
    """
    if not isinstance(data_dict, dict):
        return False, "Input must be a dictionary."

    # ---- check required keys ----
    required_keys = _NUMERIC_FIELDS + ['soil_type']
    missing = [k for k in required_keys if k not in data_dict]
    if missing:
        return False, f"Missing required fields: {', '.join(missing)}"

    # ---- check numeric fields ----
    for field in _NUMERIC_FIELDS:
        value = data_dict[field]
        try:
            float(value)
        except (TypeError, ValueError):
            return False, (
                f"Field '{field}' must be numeric, got: {value!r}"
            )

    # ---- check soil_type ----
    soil = data_dict.get('soil_type')
    if soil not in SOIL_TYPES:
        return False, (
            f"Invalid soil_type '{soil}'. Must be one of: {', '.join(SOIL_TYPES)}"
        )

    # ---- range sanity checks (warnings, not hard errors) ----
    temp = float(data_dict['temperature'])
    if temp < -10 or temp > 60:
        logger.warning(
            "Temperature %.1f°C is outside typical range [-10, 60].", temp,
        )

    humidity = float(data_dict['humidity'])
    if humidity < 0 or humidity > 100:
        return False, f"Humidity must be between 0 and 100, got: {humidity}"

    rainfall = float(data_dict['rainfall'])
    if rainfall < 0:
        return False, f"Rainfall cannot be negative, got: {rainfall}"

    wind_speed = float(data_dict['wind_speed'])
    if wind_speed < 0:
        return False, f"Wind speed cannot be negative, got: {wind_speed}"

    return True, ""
