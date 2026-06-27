"""
Disease Detection Model Architecture (PyTorch)
==============================================

Defines the MobileNetV2-based model for crop disease classification using PyTorch.
Supports 5 disease classes: Healthy, Leaf Spot, Rust, Blight, Powdery Mildew.
"""

import os
import threading
import logging
import torch
import torch.nn as nn
import torchvision.models as models

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CLASS_NAMES = ['Healthy', 'Leaf Spot', 'Rust', 'Blight', 'Powdery Mildew']
IMG_SIZE = 224
NUM_CLASSES = len(CLASS_NAMES)

MODEL_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models'
)
MODEL_PATH = os.path.join(MODEL_DIR, 'disease_model.pt')

# Thread lock to prevent concurrent model creation / loading
_model_lock = threading.Lock()


class DiseaseMobileNetV2(nn.Module):
    """
    MobileNetV2-based classifier for crop disease detection in PyTorch.
    """
    def __init__(self, num_classes=5):
        super().__init__()
        try:
            self.base = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
        except Exception:
            try:
                self.base = models.mobilenet_v2(pretrained=True)
            except Exception:
                # Offline/no-download fallback
                logger.warning("Could not download pretrained weights, initializing untrained MobileNetV2")
                self.base = models.mobilenet_v2(weights=None)

        # Freeze the base model feature extractor
        for param in self.base.parameters():
            param.requires_grad = False

        # Replace classification head
        self.base.classifier = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(self.base.last_channel, 128),
            nn.ReLU(),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        return self.base(x)


def build_model():
    """Build and return the PyTorch model."""
    model = DiseaseMobileNetV2(num_classes=NUM_CLASSES)
    logger.info("Disease detection PyTorch model built successfully.")
    return model


def load_model():
    """
    Load the disease detection model from disk.
    If the saved model file does not exist, build and train on synthetic data.
    """
    model = build_model()
    with _model_lock:
        if os.path.exists(MODEL_PATH):
            logger.info("Loading disease model from %s", MODEL_PATH)
            model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
            model.eval()
            logger.info("Disease model loaded successfully.")
            return model

        logger.warning(
            "Disease model not found at %s. "
            "Building and training on synthetic data …",
            MODEL_PATH,
        )

        from ai.disease_model.train import train_pytorch_model
        model = train_pytorch_model(model)
        return model
