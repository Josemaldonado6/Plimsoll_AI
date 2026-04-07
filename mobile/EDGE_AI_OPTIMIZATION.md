# Edge AI Optimization: Plimsoll Pilot v3.0

This guide outlines the high-standard optimization protocol for deploying YOLOv11 models to mobile hardware for real-time draft survey inference.

## 1. Export Protocol (YOLOv11 to TFLite)

To achieve sub-10ms inference on mobile edge devices, the model must be exported using the following parameters:

```python
from ultralytics import YOLO

# Load the certified maritime model
model = YOLO('plimsoll_v3_certified.pt')

# Export with 8-bit quantization for mobile NPU acceleration
model.export(
    format='tflite',
    int8=True,
    data='maritime_draft_marks.yaml',
    imgsz=640,
    optimize=True
)
```

## 2. Maritime-Specific Optimizations

### A. Glare & Surface Reflection Filtering
The Edge AI model includes a specialized "Glare-Aware" layer that reduces false positives from water surface reflections, critical for draft mark detection in high-noon conditions.

### B. Hull Texture Normalization
Mobile inference uses a custom normalization kernel optimized for industrial hull textures (rust, weld lines, and marine growth), ensuring the neural network focuses on the geometric center of the draft numbers.

## 3. Mobile Performance Targets
- **Inference Latency**: < 15ms (on Snapdragon 8 Gen 3 / Apple A17 Pro)
- **Model Size**: < 12MB (compressed TFLite flatbuffer)
- **Power Efficiency**: < 2% battery drain per 20-minute survey.

---
*Certified for Plimsoll AI Industrial Deployment*
