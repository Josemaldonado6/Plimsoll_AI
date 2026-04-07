from ultralytics import SAM
import sys

try:
    print("Attempting to load SAM model...")
    model = SAM('sam_b.pt')
    print("SAM model loaded successfully!")
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    sys.exit(1)
