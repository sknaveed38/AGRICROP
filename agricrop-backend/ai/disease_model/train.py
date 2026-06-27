"""
Disease Detection Model – Training Script (PyTorch)
===================================================

Trains the PyTorch MobileNetV2 classifier on synthetic or real crop leaf images.
"""

import os
import sys
import logging
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from ai.disease_model.model import (
    IMG_SIZE,
    NUM_CLASSES,
    CLASS_NAMES,
    MODEL_DIR,
    MODEL_PATH,
    build_model,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Colour palettes used when generating synthetic leaf images.
# ---------------------------------------------------------------------------
_DISEASE_COLOURS = {
    'Healthy':       (34, 139, 34),     # forest-green
    'Leaf Spot':     (101, 67, 33),     # dark-brown circular spots
    'Rust':          (210, 105, 30),    # orange-brown pustules
    'Blight':        (85, 55, 25),      # dark brown / black patches
    'Powdery Mildew': (230, 230, 230),  # white / light-grey powder
}


def _draw_leaf_background(rng: np.random.Generator) -> np.ndarray:
    """Create a synthetic green leaf image."""
    img = np.zeros((IMG_SIZE, IMG_SIZE, 3), dtype=np.float32)
    base_g = rng.uniform(0.35, 0.65)
    base_r = rng.uniform(0.10, 0.30)
    base_b = rng.uniform(0.05, 0.20)
    img[:, :, 0] = base_r
    img[:, :, 1] = base_g
    img[:, :, 2] = base_b

    gradient = np.linspace(0.9, 1.1, IMG_SIZE).reshape(-1, 1)
    img *= gradient[:, :, np.newaxis]

    for y in range(0, IMG_SIZE, rng.integers(18, 30)):
        thickness = rng.integers(1, 3)
        vein_brightness = rng.uniform(-0.06, -0.02)
        y_end = min(y + thickness, IMG_SIZE)
        img[y:y_end, :, 1] += vein_brightness

    noise = rng.normal(0, 0.02, img.shape).astype(np.float32)
    img += noise
    return np.clip(img, 0.0, 1.0)


def _draw_disease_patches(
    img: np.ndarray,
    class_idx: int,
    rng: np.random.Generator,
) -> np.ndarray:
    """Overlay disease symptoms onto the leaf."""
    class_name = CLASS_NAMES[class_idx]
    if class_name == 'Healthy':
        return img

    colour = np.array(_DISEASE_COLOURS[class_name], dtype=np.float32) / 255.0
    num_patches = rng.integers(3, 12)

    for _ in range(num_patches):
        cx = rng.integers(20, IMG_SIZE - 20)
        cy = rng.integers(20, IMG_SIZE - 20)
        radius = rng.integers(6, 28)

        yy, xx = np.ogrid[:IMG_SIZE, :IMG_SIZE]
        dist = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
        mask = dist <= radius

        alpha = rng.uniform(0.4, 0.8)
        for c in range(3):
            img[:, :, c] = np.where(
                mask,
                img[:, :, c] * (1 - alpha) + colour[c] * alpha,
                img[:, :, c],
            )

    if class_name == 'Powdery Mildew':
        haze = rng.uniform(0.03, 0.10)
        img += haze
        img = np.clip(img, 0.0, 1.0)

    return img


def generate_synthetic_data(
    num_samples: int = 100,
    seed: int = 42,
) -> tuple:
    """Generate synthetic leaf-disease dataset."""
    rng = np.random.default_rng(seed)
    X = np.empty((num_samples, IMG_SIZE, IMG_SIZE, 3), dtype=np.float32)
    y = np.zeros((num_samples, NUM_CLASSES), dtype=np.float32)

    samples_per_class = num_samples // NUM_CLASSES
    extra = num_samples - samples_per_class * NUM_CLASSES

    idx = 0
    for cls_idx in range(NUM_CLASSES):
        count = samples_per_class + (1 if cls_idx < extra else 0)
        for _ in range(count):
            leaf = _draw_leaf_background(rng)
            leaf = _draw_disease_patches(leaf, cls_idx, rng)
            X[idx] = leaf
            y[idx, cls_idx] = 1.0
            idx += 1

    perm = rng.permutation(num_samples)
    X = X[perm]
    y = y[perm]

    logger.info(
        "Generated %d synthetic disease images (%d per class).",
        num_samples, samples_per_class,
    )
    return X, y


def _load_real_data(data_dir: str) -> tuple:
    """Load real images from a directory structure."""
    import cv2
    images, labels = [], []

    for cls_idx, cls_name in enumerate(CLASS_NAMES):
        cls_dir = os.path.join(data_dir, cls_name)
        if not os.path.isdir(cls_dir):
            logger.warning("Class directory missing: %s – skipping.", cls_dir)
            continue

        for fname in os.listdir(cls_dir):
            fpath = os.path.join(cls_dir, fname)
            if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
            img = cv2.imread(fpath)
            if img is None:
                logger.warning("Cannot read image: %s", fpath)
                continue
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = img.astype(np.float32) / 255.0
            images.append(img)

            label = np.zeros(NUM_CLASSES, dtype=np.float32)
            label[cls_idx] = 1.0
            labels.append(label)

    if not images:
        raise ValueError(
            f"No valid images found under {data_dir}. "
            "Ensure sub-folders are named: " + ", ".join(CLASS_NAMES)
        )

    X = np.array(images, dtype=np.float32)
    y = np.array(labels, dtype=np.float32)
    return X, y


def train_pytorch_model(model, data_dir: str = None, epochs: int = None, batch_size: int = 16):
    """Business logic to train PyTorch model."""
    use_real = data_dir is not None and os.path.isdir(data_dir)

    if use_real:
        X, y = _load_real_data(data_dir)
        default_epochs = 20
    else:
        X, y = generate_synthetic_data(num_samples=100)
        default_epochs = 5

    if epochs is None:
        epochs = default_epochs

    # Convert to PyTorch Tensors
    # X shape: (N, 224, 224, 3) -> (N, 3, 224, 224)
    X_t = torch.tensor(X).permute(0, 3, 1, 2)
    y_t = torch.tensor(y.argmax(axis=1), dtype=torch.long)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.base.classifier.parameters(), lr=0.001)

    logger.info("Starting PyTorch training for %d epochs...", epochs)

    model.train()
    final_loss = 0.0
    final_acc = 0.0

    for epoch in range(epochs):
        permutation = torch.randperm(X_t.size()[0])
        epoch_loss = 0.0
        epoch_correct = 0

        for i in range(0, X_t.size()[0], batch_size):
            indices = permutation[i:i+batch_size]
            batch_x, batch_y = X_t[indices], y_t[indices]

            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item() * batch_x.size(0)
            _, predicted = torch.max(outputs, 1)
            epoch_correct += (predicted == batch_y).sum().item()

        final_loss = epoch_loss / X_t.size(0)
        final_acc = epoch_correct / X_t.size(0)
        logger.info("Epoch %d/%d - loss: %.4f - accuracy: %.4f", epoch + 1, epochs, final_loss, final_acc)

    # Save weights
    os.makedirs(MODEL_DIR, exist_ok=True)
    torch.save(model.state_dict(), MODEL_PATH)
    logger.info("Model saved to %s", MODEL_PATH)
    model.eval()

    # ---- Print summary ----
    print("\n" + "=" * 60)
    print("  DISEASE DETECTION MODEL – TRAINING SUMMARY")
    print("=" * 60)
    print(f"  Data source     : {'Real (' + data_dir + ')' if use_real else 'Synthetic'}")
    print(f"  Total samples   : {len(X)}")
    print(f"  Epochs trained  : {epochs}")
    print(f"  Final loss      : {final_loss:.4f}")
    print(f"  Final accuracy  : {final_acc:.4f}")
    print(f"  Model saved to  : {MODEL_PATH}")
    print("=" * 60 + "\n")

    return model


def train_model(data_dir: str = None, epochs: int = None, batch_size: int = 16):
    """Main CLI entry point for training."""
    model = build_model()
    return train_pytorch_model(model, data_dir, epochs, batch_size)


if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(name)s – %(message)s',
    )

    import argparse
    parser = argparse.ArgumentParser(description="Train the disease detection model.")
    parser.add_argument('--data-dir', type=str, default=None)
    parser.add_argument('--epochs', type=int, default=None)
    parser.add_argument('--batch-size', type=int, default=16)
    args = parser.parse_args()

    train_model(
        data_dir=args.data_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
    )
