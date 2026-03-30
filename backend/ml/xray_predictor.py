"""
Pneumonia X-Ray Classifier using ResNet-50

This module loads the trained ResNet-50 model from Project 2 and provides
pneumonia detection from chest X-ray images.

To activate: place resnet50_pneumonia.pth in this directory.
"""

import os

import numpy as np

MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, "resnet50_pneumonia.pth")

_model = None
_transform = None


def _load_model():
    global _model, _transform
    if _model is not None:
        return

    import torch
    import torchvision.transforms as transforms
    from torchvision import models

    model = models.resnet50(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, 2)
    model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
    model.eval()
    _model = model

    _transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])


def predict_xray(image_path: str) -> dict:
    """Run ResNet-50 inference on a chest X-ray image."""
    _load_model()

    import torch
    from PIL import Image

    image = Image.open(image_path).convert("RGB")
    tensor = _transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = _model(tensor)
        probabilities = torch.softmax(outputs, dim=1)
        pneumonia_prob = float(probabilities[0][1])
        confidence = float(torch.max(probabilities))

    return {
        "pneumonia_probability": round(pneumonia_prob, 4),
        "confidence": round(confidence, 4),
    }
