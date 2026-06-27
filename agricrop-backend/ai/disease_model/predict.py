"""
Disease Prediction Service (PyTorch)
=====================================

Provides a high-level API for predicting crop diseases from leaf images.
"""

import logging
import traceback
import numpy as np
import torch

from ai.disease_model.model import CLASS_NAMES, MODEL_PATH

logger = logging.getLogger(__name__)

# Global model cache
_cached_model = None


def _get_model():
    """Return the cached model, loading it on first call."""
    global _cached_model
    if _cached_model is None:
        from ai.disease_model.model import load_model
        logger.info("Lazy-loading disease detection model …")
        _cached_model = load_model()
    return _cached_model


def predict_disease(image_path: str) -> dict:
    """
    Predict the crop disease present in a leaf image.
    """
    try:
        model = _get_model()

        # Preprocess image (returns batch shape (1, 224, 224, 3))
        from ai.disease_model.preprocess import preprocess_image
        img_np = preprocess_image(image_path)

        # Convert to PyTorch tensor of shape (1, 3, 224, 224)
        img_tensor = torch.tensor(img_np).permute(0, 3, 1, 2)

        # Run inference
        model.eval()
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.softmax(outputs, dim=1)[0].numpy()

        all_predictions = {
            class_name: round(float(prob) * 100, 2)
            for class_name, prob in zip(CLASS_NAMES, probabilities)
        }

        top_index = int(np.argmax(probabilities))
        disease_name = CLASS_NAMES[top_index]
        confidence = round(float(probabilities[top_index]) * 100, 2)

        logger.info(
            "Prediction: %s (%.2f%% confidence)", disease_name, confidence,
        )

        return {
            "success": True,
            "disease_name": disease_name,
            "confidence": confidence,
            "all_predictions": all_predictions,
        }

    except FileNotFoundError as exc:
        logger.error("Image file not found: %s", exc)
        return {"success": False, "error": f"Image file not found: {exc}"}

    except ValueError as exc:
        logger.error("Image processing error: %s", exc)
        return {"success": False, "error": f"Image processing error: {exc}"}

    except Exception as exc:
        logger.error("Prediction failed: %s\n%s", exc, traceback.format_exc())
        return {"success": False, "error": f"Prediction failed: {exc}"}
