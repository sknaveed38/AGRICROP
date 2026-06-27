"""
Image Preprocessing Pipeline
=============================

Provides utilities to read, resize, normalise and validate crop leaf
images before they are fed into the disease detection model.
"""

import os
import io
import logging

import numpy as np

from ai.disease_model.model import IMG_SIZE

logger = logging.getLogger(__name__)

# Allowed image extensions (lowercase)
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}

# Maximum upload size in bytes (10 MB)
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


def preprocess_image(image_path: str) -> np.ndarray:
    """
    Read an image from *image_path*, resize to ``IMG_SIZE × IMG_SIZE``,
    normalise pixel values to ``[0, 1]`` and return a batch-ready tensor.

    Parameters
    ----------
    image_path : str
        Absolute or relative path to the image file.

    Returns
    -------
    numpy.ndarray
        Array of shape ``(1, 224, 224, 3)`` with float32 values in ``[0, 1]``.

    Raises
    ------
    FileNotFoundError
        If *image_path* does not point to an existing file.
    ValueError
        If the file cannot be decoded as a valid image.
    """
    import cv2

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Unable to decode image: {image_path}")

    # Convert BGR (OpenCV default) → RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Resize to model input dimensions
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_AREA)

    # Normalise to [0, 1]
    img = img.astype(np.float32) / 255.0

    # Add batch dimension → (1, 224, 224, 3)
    img = np.expand_dims(img, axis=0)

    return img


def preprocess_uploaded_file(file_storage) -> np.ndarray:
    """
    Accept a Flask ``FileStorage`` object (from a multipart upload),
    decode it in-memory and return a preprocessed tensor.

    Parameters
    ----------
    file_storage : werkzeug.datastructures.FileStorage
        The uploaded file object from a Flask request.

    Returns
    -------
    numpy.ndarray
        Array of shape ``(1, 224, 224, 3)`` with float32 values in ``[0, 1]``.

    Raises
    ------
    ValueError
        If the uploaded file cannot be decoded as a valid image.
    """
    import cv2

    # Read raw bytes from the file storage object
    file_bytes = file_storage.read()
    file_storage.seek(0)  # reset pointer for potential re-reads

    # Decode bytes into a NumPy array via OpenCV
    np_arr = np.frombuffer(file_bytes, dtype=np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Uploaded file could not be decoded as an image.")

    # Convert BGR → RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Resize
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_AREA)

    # Normalise
    img = img.astype(np.float32) / 255.0

    # Batch dimension
    img = np.expand_dims(img, axis=0)

    return img


def validate_image(file) -> tuple:
    """
    Validate an uploaded image file for extension and size constraints.

    Parameters
    ----------
    file : werkzeug.datastructures.FileStorage
        The uploaded file object from a Flask request.

    Returns
    -------
    tuple[bool, str]
        A ``(is_valid, error_message)`` pair.
        If the file passes validation ``is_valid`` is ``True`` and
        ``error_message`` is an empty string.
    """
    # --- Check that a file was actually provided ---
    if file is None or getattr(file, 'filename', '') == '':
        return False, "No file provided."

    # --- Check extension ---
    filename = file.filename.lower()
    ext = filename.rsplit('.', 1)[-1] if '.' in filename else ''
    if ext not in ALLOWED_EXTENSIONS:
        return False, (
            f"Invalid file extension '.{ext}'. "
            f"Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # --- Check file size ---
    # Save current position, seek to end, read position, seek back
    current_pos = file.tell()
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(current_pos)

    if file_size > MAX_FILE_SIZE_BYTES:
        max_mb = MAX_FILE_SIZE_BYTES / (1024 * 1024)
        return False, (
            f"File size ({file_size / (1024*1024):.1f} MB) exceeds "
            f"the maximum allowed size of {max_mb:.0f} MB."
        )

    return True, ""
