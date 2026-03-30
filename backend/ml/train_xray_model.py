"""
Create ResNet-50 Pneumonia X-Ray Classification Model

Creates a properly structured ResNet-50 model with:
  - ImageNet pretrained weights for the backbone
  - Modified final fully-connected layer (2048 -> 2 classes)
  - Saved as a state_dict for use by xray_predictor.py

The resulting model is architecturally correct and will load/run inference
properly. The backbone features are meaningful (ImageNet pretrained), though
the final classification layer is initialized randomly and would need
fine-tuning on actual chest X-ray data for clinical accuracy.

Usage:
    python train_xray_model.py
"""

import os
import sys

import torch
import torch.nn as nn
from torchvision import models

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "resnet50_pneumonia.pth")


def create_model():
    print("=" * 60)
    print("  ResNet-50 Pneumonia X-Ray Model Setup")
    print("=" * 60)

    # ---- 1. Load pretrained ResNet-50 ----
    print("\n[1/4] Loading ResNet-50 with ImageNet pretrained weights...")
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
    print(f"  Loaded ResNet-50: {sum(p.numel() for p in model.parameters()):,} parameters")

    # ---- 2. Modify final layer for binary classification ----
    print("\n[2/4] Modifying final FC layer for 2-class output...")
    in_features = model.fc.in_features
    print(f"  Original FC: {in_features} -> 1000 (ImageNet classes)")

    model.fc = nn.Linear(in_features, 2)
    print(f"  Modified FC: {in_features} -> 2 (Normal, Pneumonia)")

    # Initialize the new FC layer with reasonable weights using Kaiming init
    nn.init.kaiming_normal_(model.fc.weight, mode="fan_out", nonlinearity="relu")
    nn.init.zeros_(model.fc.bias)

    total_params = sum(p.numel() for p in model.parameters())
    fc_params = sum(p.numel() for p in model.fc.parameters())
    print(f"  Total parameters: {total_params:,}")
    print(f"  FC layer parameters: {fc_params:,}")

    # ---- 3. Validate the model works ----
    print("\n[3/4] Validating model with dummy input...")
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224)
    with torch.no_grad():
        output = model(dummy_input)
        probs = torch.softmax(output, dim=1)

    print(f"  Output shape: {output.shape}  (expected: [1, 2])")
    print(f"  Softmax probabilities: Normal={probs[0][0]:.4f}, Pneumonia={probs[0][1]:.4f}")

    # Verify compatibility with xray_predictor.py loading code
    print("\n  Verifying load compatibility...")
    # This replicates the exact loading logic from xray_predictor.py
    test_model = models.resnet50(weights=None)
    test_model.fc = nn.Linear(test_model.fc.in_features, 2)

    # Save temporarily and reload to verify round-trip works
    state_dict = model.state_dict()
    test_model.load_state_dict(state_dict)
    test_model.eval()

    with torch.no_grad():
        test_output = test_model(dummy_input)
        test_probs = torch.softmax(test_output, dim=1)

    assert torch.allclose(probs, test_probs, atol=1e-6), "Round-trip validation failed!"
    print("  Round-trip load/predict validation: PASSED")

    # ---- 4. Save state dict ----
    print(f"\n[4/4] Saving model state dict -> {MODEL_PATH}")
    torch.save(model.state_dict(), MODEL_PATH)

    file_size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
    print(f"  File size: {file_size_mb:.1f} MB")

    # Final verification: load from disk
    print("\n  Final verification: loading saved file from disk...")
    verify_model = models.resnet50(weights=None)
    verify_model.fc = nn.Linear(verify_model.fc.in_features, 2)
    verify_model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
    verify_model.eval()

    with torch.no_grad():
        verify_output = verify_model(dummy_input)
        verify_probs = torch.softmax(verify_output, dim=1)

    assert torch.allclose(probs, verify_probs, atol=1e-6), "Disk load validation failed!"
    print("  Disk load validation: PASSED")

    print(f"\nModel architecture summary:")
    print(f"  - Backbone: ResNet-50 (ImageNet pretrained)")
    print(f"  - Final layer: Linear({in_features}, 2)")
    print(f"  - Classes: [0] Normal, [1] Pneumonia")
    print(f"  - Input: 3x224x224 (ImageNet normalized)")
    print(f"  - Note: backbone has meaningful features from ImageNet;")
    print(f"    final layer needs fine-tuning on chest X-ray data")

    print("\nDone! Model file is ready for xray_predictor.py")
    print("=" * 60)


if __name__ == "__main__":
    create_model()
