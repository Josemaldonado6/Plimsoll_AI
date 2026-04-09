
import sys
import os
# Add backend to sys.path
sys.path.append(os.path.abspath("backend"))

from app.engine.reporter import PDFGenerator
import datetime

def test_gen():
    gen = PDFGenerator(output_dir="backend/data")
    # Simulation based on endpoints.py survey_data construction
    mock_data = {
        "id": 8,
        "timestamp": "2026-04-09 15:05",
        "draft_mean": 8.52,
        "confidence": 0.98,
        "sea_state": "MODERATE"
    }
    try:
        # Test without evidence to trigger the fallback grid
        path = gen.generate_report(mock_data, None)
        print(f"SUCCESS: {path}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_gen()
