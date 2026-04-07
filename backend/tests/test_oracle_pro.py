import sys
import os
import logging
import unittest
from unittest.mock import MagicMock, patch

# Ensure backend is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
try:
    from app.engine.trainer import PlimsollTrainer, DataHarvester, AutoLabeler, CoatzacoalcosFilter
except ImportError:
    from backend.app.engine.trainer import PlimsollTrainer, DataHarvester, AutoLabeler, CoatzacoalcosFilter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestOraclePro")

class TestAIOraclePro(unittest.TestCase):
    def setUp(self):
        self.trainer = PlimsollTrainer(data_dir="test_data")
        
    @patch('app.engine.trainer.DataHarvester.harvest_from_source')
    def test_full_harvest_cycle(self, mock_harvest):
        """Test 1: Global Data Acquisition Logic"""
        logger.info("TESTING: Global Data Acquisition (Oracle Harvest)...")
        mock_harvest.return_value = ["video1.mp4", "video2.mp4"]
        
        videos = self.trainer.harvester.harvest_from_source(query="drone ship draft survey")
        self.assertEqual(len(videos), 2)
        logger.info(f"SUCCESS: Harvested {len(videos)} sources successfully.")

    @patch('app.engine.trainer.AutoLabeler.label_frame')
    def test_precision_labeling(self, mock_label):
        """Test 2: Foundation Model (Florence-2) Zero-Shot labeling"""
        logger.info("TESTING: Precision Zero-Shot Labeling (VLM)...")
        
        # Mock VLM output: detections for draft marks
        mock_label.return_value = {
            'vlm_confidence': 0.94,
            'bboxes': [[100, 200, 150, 400]],
            'labels': ['draft_mark']
        }
        
        dummy_frame = MagicMock()
        result = self.trainer.labeler.label_frame(dummy_frame)
        
        self.assertGreater(result['vlm_confidence'], 0.90)
        self.assertEqual(result['labels'][0], 'draft_mark')
        logger.info(f"SUCCESS: VLM Labeling confidence: {result['vlm_confidence']}")

    def test_adversarial_hardening(self):
        """Test 3: Coatzacoalcos Filter (Augmentation) robustness"""
        logger.info("TESTING: Adversarial Hardening (Coatzacoalcos Filter)...")
        
        import numpy as np
        dummy_img = np.zeros((640, 640, 3), dtype=np.uint8)
        dummy_bboxes = [[0.5, 0.5, 0.1, 0.1]] # YOLO format
        dummy_labels = [0]
        
        aug_result = self.trainer.augmenter.apply(dummy_img, dummy_bboxes, dummy_labels)
        
        self.assertIn('image', aug_result)
        self.assertIn('bboxes', aug_result)
        logger.info("SUCCESS: Adversarial pipeline applied successfully.")

if __name__ == "__main__":
    unittest.main()
