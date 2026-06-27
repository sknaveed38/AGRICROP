"""
Soil Moisture Prediction Service
==================================

Provides the high-level API for predicting soil moisture, evaporation
rate, water requirements, and risk level from weather + soil data.
"""

import logging
import traceback

import numpy as np

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Global model cache
# ---------------------------------------------------------------------------
_cached_pipeline = None


def _get_pipeline():
    """Return the cached pipeline, loading it on first call."""
    global _cached_pipeline
    if _cached_pipeline is None:
        from ai.moisture_model.model import load_model
        logger.info("Lazy-loading moisture prediction pipeline …")
        _cached_pipeline = load_model()
    return _cached_pipeline


def _calculate_evaporation_rate(
    temperature: float,
    humidity: float,
    wind_speed: float,
    rainfall: float,
) -> float:
    """
    Estimate daily evaporation rate using a simplified Penman-style
    formula.

    Formula
    -------
    ``E = 0.5 × T × (1 - H/100) × (1 + W/10) − 0.1 × R``

    where *T* = temperature (°C), *H* = humidity (%), *W* = wind speed
    (km/h), *R* = rainfall (mm).

    The result is clamped to ≥ 0.

    Returns
    -------
    float
        Estimated evaporation rate in **mm / day**.
    """
    evap = (
        0.5 * temperature
        * (1.0 - humidity / 100.0)
        * (1.0 + wind_speed / 10.0)
        - 0.1 * rainfall
    )
    return max(round(evap, 2), 0.0)


def _calculate_water_requirement(
    moisture_level: float,
    temperature: float,
    soil_type: str,
) -> float:
    """
    Estimate water requirement based on moisture deficit from the
    optimal range (60–70 %).

    Logic
    -----
    - Optimal moisture target = 65 %.
    - Deficit = max(0, target − moisture_level).
    - Base litres/acre = deficit × 50  (rough field constant).
    - Adjusted up for higher temperatures and sandy soils.

    Returns
    -------
    float
        Water requirement in **litres / acre**.
    """
    OPTIMAL_MOISTURE = 65.0

    deficit = max(0.0, OPTIMAL_MOISTURE - moisture_level)

    # Base requirement: ~50 litres per acre per percentage-point deficit
    base_litres = deficit * 50.0

    # Temperature adjustment: higher temps → more water needed
    temp_factor = 1.0 + max(0.0, (temperature - 25.0)) * 0.02

    # Soil type adjustment: sandy drains faster → needs more water
    soil_factors = {
        'Sandy': 1.25,
        'Loamy': 1.00,
        'Clay': 0.85,
        'Silt': 0.95,
        'Peaty': 0.80,
        'Chalky': 1.10,
    }
    soil_factor = soil_factors.get(soil_type, 1.0)

    requirement = base_litres * temp_factor * soil_factor
    return round(requirement, 2)


def _determine_risk_level(moisture_level: float) -> str:
    """
    Classify drought / irrigation risk from predicted moisture.

    Returns
    -------
    str
        ``'High'`` if < 30 %, ``'Medium'`` if 30–50 %, ``'Low'`` if > 50 %.
    """
    if moisture_level < 30.0:
        return 'High'
    elif moisture_level <= 50.0:
        return 'Medium'
    else:
        return 'Low'


def predict_moisture(features_dict: dict) -> dict:
    """
    Predict soil moisture and derived agronomic metrics.

    Parameters
    ----------
    features_dict : dict
        Dictionary with keys: ``temperature``, ``humidity``, ``rainfall``,
        ``wind_speed``, ``soil_type``.

    Returns
    -------
    dict
        On success::

            {
                "success": True,
                "moisture_level": 52.3,         # percentage
                "evaporation_rate": 4.1,         # mm/day
                "water_requirement": 637.5,      # litres/acre
                "risk_level": "Low",
            }

        On failure::

            {
                "success": False,
                "error": "Human-readable error message",
            }
    """
    try:
        # ------------------------------------------------------------------
        # 1. Validate inputs
        # ------------------------------------------------------------------
        from ai.moisture_model.preprocess import validate_inputs, preprocess_features

        is_valid, error_msg = validate_inputs(features_dict)
        if not is_valid:
            return {"success": False, "error": error_msg}

        # ------------------------------------------------------------------
        # 2. Preprocess features
        # ------------------------------------------------------------------
        X = preprocess_features(features_dict)

        # ------------------------------------------------------------------
        # 3. Load / retrieve cached model and predict
        # ------------------------------------------------------------------
        pipeline = _get_pipeline()
        raw_prediction = pipeline.predict(X)[0]

        # Clamp moisture to [0, 100]
        moisture_level = round(float(np.clip(raw_prediction, 0.0, 100.0)), 2)

        # ------------------------------------------------------------------
        # 4. Derive secondary metrics
        # ------------------------------------------------------------------
        temperature = float(features_dict['temperature'])
        humidity = float(features_dict['humidity'])
        rainfall = float(features_dict['rainfall'])
        wind_speed = float(features_dict['wind_speed'])
        soil_type = features_dict['soil_type']

        evaporation_rate = _calculate_evaporation_rate(
            temperature, humidity, wind_speed, rainfall,
        )
        water_requirement = _calculate_water_requirement(
            moisture_level, temperature, soil_type,
        )
        risk_level = _determine_risk_level(moisture_level)

        logger.info(
            "Moisture prediction: %.2f%% | Risk: %s | Water: %.0f L/acre",
            moisture_level, risk_level, water_requirement,
        )

        return {
            "success": True,
            "moisture_level": moisture_level,
            "evaporation_rate": evaporation_rate,
            "water_requirement": water_requirement,
            "risk_level": risk_level,
        }

    except Exception as exc:  # noqa: BLE001
        logger.error(
            "Moisture prediction failed: %s\n%s", exc, traceback.format_exc(),
        )
        return {"success": False, "error": f"Prediction failed: {exc}"}
