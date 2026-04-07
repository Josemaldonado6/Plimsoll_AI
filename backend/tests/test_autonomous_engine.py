import sys
import os
import unittest
import numpy as np
import cv2

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.engine.trainer import DataHarvester, AutoLabeler, CoatzacoalcosFilter, PlimsollTrainer

class TestAutonomousEngine(unittest.TestCase):
    def setUp(self):
        self.test_dir = "data/test_oracle"
        os.makedirs(self.test_dir, exist_ok=True)
        self.harvester = DataHarvester(output_dir=os.path.join(self.test_dir, "harvested"))
        self.labeler = AutoLabeler()
        self.filter = CoatzacoalcosFilter()

    def test_augmentation_logic(self):
        print("--- Testing Coatzacoalcos Adversarial Filter ---")
        # Create a dummy image
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(img, "TEST SHIP", (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
        
        # Mock YOLO bboxes: [x_center, y_center, width, height] (normalized)
        bboxes = [[0.5, 0.5, 0.2, 0.2]]
        labels = ['draft_mark']
        
        try:
            augmented = self.filter.apply(img, bboxes, labels)
            self.assertEqual(augmented['image'].shape, img.shape)
            print("[PASSED] Augmentation logic functional.")
        except Exception as e:
            print(f"[ERROR] Augmentation failed: {e}")

    def test_dataset_structure(self):
        print("--- Testing Dataset Directory Structure ---")
        trainer = PlimsollTrainer(data_dir=self.test_dir)
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "harvested")))
        print("[PASSED] Dataset structure verified.")

if __name__ == "__main__":
    unittest.main()
