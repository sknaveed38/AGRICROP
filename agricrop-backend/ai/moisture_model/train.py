"""
Soil Moisture Model – Training Script
======================================

Can be executed standalone::

    python -m ai.moisture_model.train

The script will:

1. Generate realistic synthetic soil/weather data (or load from CSV).
2. Build the StandardScaler → RandomForestRegressor pipeline.
3. Fit the pipeline.
4. Evaluate on a hold-out split and print metrics.
5. Save the pipeline to ``ai/models/moisture_model.pkl``.
"""

import os
import sys
import logging

import numpy as np
import joblib

from ai.moisture_model.model import (
    SOIL_TYPES,
    FEATURE_NAMES,
    NUM_FEATURES,
    MODEL_DIR,
    MODEL_PATH,
    build_pipeline,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Soil-type moisture-retention modifiers
# ---------------------------------------------------------------------------
_SOIL_MODIFIERS = {
    'Sandy':  -8.0,   # drains quickly → lower moisture
    'Loamy':   3.0,   # balanced retention
    'Clay':   10.0,   # high water-holding capacity
    'Silt':    5.0,   # moderate retention
    'Peaty':  12.0,   # very high organic retention
    'Chalky': -4.0,   # moderately fast drainage
}


def generate_synthetic_data(
    num_samples: int = 500,
    seed: int = 42,
) -> tuple:
    """
    Generate realistic synthetic soil-moisture training data.

    Feature generation
    ------------------
    - ``temperature``: uniform 15–45 °C
    - ``humidity``: uniform 20–95 %
    - ``rainfall``: exponential-ish 0–50 mm (most days are dry-ish)
    - ``wind_speed``: uniform 0–30 km/h
    - ``soil_type``: random choice from :data:`SOIL_TYPES`

    Target formula
    --------------
    ::

        base = humidity × 0.4
             + rainfall × 1.5
             − temperature × 0.5
             − wind_speed × 0.3
             + soil_modifier
        moisture = clamp(base + noise, 5, 95)

    Parameters
    ----------
    num_samples : int
        Number of samples to generate.
    seed : int
        Random seed for reproducibility.

    Returns
    -------
    tuple[numpy.ndarray, numpy.ndarray, list[str]]
        - **X** – features, shape ``(num_samples, 10)``
        - **y** – target moisture (%), shape ``(num_samples,)``
        - **soil_labels** – raw soil-type strings (for bookkeeping)
    """
    rng = np.random.default_rng(seed)

    # ---- weather features ----
    temperature = rng.uniform(15, 45, num_samples)
    humidity = rng.uniform(20, 95, num_samples)
    # Rainfall: mixture of zeros and positive values (many dry days)
    rainfall = rng.exponential(scale=8.0, size=num_samples)
    rainfall = np.clip(rainfall, 0, 50)
    wind_speed = rng.uniform(0, 30, num_samples)

    # ---- soil type (categorical) ----
    soil_indices = rng.integers(0, len(SOIL_TYPES), num_samples)
    soil_labels = [SOIL_TYPES[i] for i in soil_indices]

    # One-hot encode soil types
    soil_onehot = np.zeros((num_samples, len(SOIL_TYPES)), dtype=np.float64)
    for i, idx in enumerate(soil_indices):
        soil_onehot[i, idx] = 1.0

    # ---- assemble feature matrix ----
    X = np.column_stack([temperature, humidity, rainfall, wind_speed, soil_onehot])

    # ---- compute target moisture ----
    soil_mod = np.array(
        [_SOIL_MODIFIERS[SOIL_TYPES[i]] for i in soil_indices],
        dtype=np.float64,
    )

    base_moisture = (
        humidity * 0.4
        + rainfall * 1.5
        - temperature * 0.5
        - wind_speed * 0.3
        + soil_mod
    )

    noise = rng.normal(0, 2.5, num_samples)
    moisture = np.clip(base_moisture + noise, 5.0, 95.0)

    logger.info(
        "Generated %d synthetic moisture samples "
        "(moisture range: %.1f–%.1f %%).",
        num_samples, moisture.min(), moisture.max(),
    )

    return X, moisture, soil_labels


def _load_csv_data(data_path: str) -> tuple:
    """
    Load training data from a CSV file.

    Expected columns::

        temperature,humidity,rainfall,wind_speed,soil_type,moisture_level

    Parameters
    ----------
    data_path : str
        Path to the CSV file.

    Returns
    -------
    tuple[numpy.ndarray, numpy.ndarray]
        ``(X, y)`` – feature matrix and target vector.
    """
    import csv

    rows = []
    with open(data_path, 'r', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)

    if not rows:
        raise ValueError(f"No data found in {data_path}")

    num = len(rows)
    X = np.zeros((num, NUM_FEATURES), dtype=np.float64)
    y = np.zeros(num, dtype=np.float64)

    for i, row in enumerate(rows):
        X[i, 0] = float(row['temperature'])
        X[i, 1] = float(row['humidity'])
        X[i, 2] = float(row['rainfall'])
        X[i, 3] = float(row['wind_speed'])

        soil = row['soil_type'].strip()
        if soil in SOIL_TYPES:
            soil_idx = SOIL_TYPES.index(soil)
            X[i, 4 + soil_idx] = 1.0
        else:
            logger.warning("Unknown soil type '%s' in row %d – skipping one-hot.", soil, i)

        y[i] = float(row['moisture_level'])

    logger.info("Loaded %d samples from %s.", num, data_path)
    return X, y


def train_model(data_path: str = None) -> object:
    """
    Train the soil moisture prediction pipeline and save it to disk.

    Parameters
    ----------
    data_path : str, optional
        Path to a CSV dataset.  If ``None``, synthetic data is generated.

    Returns
    -------
    sklearn.pipeline.Pipeline
        The fitted pipeline (also saved to disk).
    """
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

    # ---- Load data ----
    if data_path and os.path.isfile(data_path):
        X, y = _load_csv_data(data_path)
        data_source = data_path
    else:
        X, y, _ = generate_synthetic_data(num_samples=500)
        data_source = 'Synthetic'

    # ---- Train / test split ----
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42,
    )

    # ---- Build & fit ----
    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    # ---- Evaluate ----
    y_pred = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = r2_score(y_test, y_pred)

    # ---- Save ----
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    logger.info("Pipeline saved to %s", MODEL_PATH)

    # ---- Print summary ----
    print("\n" + "=" * 60)
    print("  SOIL MOISTURE MODEL – TRAINING SUMMARY")
    print("=" * 60)
    print(f"  Data source      : {data_source}")
    print(f"  Total samples    : {len(X)}")
    print(f"  Train / test     : {len(X_train)} / {len(X_test)}")
    print(f"  MAE              : {mae:.2f} %")
    print(f"  RMSE             : {rmse:.2f} %")
    print(f"  R²               : {r2:.4f}")
    print(f"  Pipeline saved   : {MODEL_PATH}")
    print("=" * 60 + "\n")

    return pipeline


# ---------------------------------------------------------------------------
# CLI entry-point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(name)s – %(message)s',
    )

    import argparse

    parser = argparse.ArgumentParser(
        description="Train the AgriCrop soil moisture prediction model.",
    )
    parser.add_argument(
        '--data-path', type=str, default=None,
        help='Path to a CSV dataset (optional).',
    )
    args = parser.parse_args()

    train_model(data_path=args.data_path)
