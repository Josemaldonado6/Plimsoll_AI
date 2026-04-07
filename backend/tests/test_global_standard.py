import pytest
import hashlib
from app.services.notary import notary
from app.api.gateway import erp_gateway
from app.db.models import Survey
from datetime import datetime

class TestGlobalStandard:
    """
    Quality Assurance Suite for the Global Standard Layer.
    Ensures legal immutability and enterprise-grade synchronization.
    """

    def test_notary_hashing_consistency(self):
        """
        Verifies that the same survey data always produces the same hash.
        """
        survey_data = {
            "draft_mean": 10.512,
            "confidence": 0.98,
            "timestamp": "2026-02-23T17:00:00"
        }
        hash1 = notary.generate_survey_hash(survey_data)
        hash2 = notary.generate_survey_hash(survey_data)
        
        assert hash1 == hash2
        assert len(hash1) == 64 # SHA-256 length

    def test_notary_avalanche_effect(self):
        """
        Verifies that a tiny change in data produces a completely different hash.
        """
        data1 = {"val": 10.500}
        data2 = {"val": 10.501}
        
        hash1 = notary.generate_survey_hash(data1)
        hash2 = notary.generate_survey_hash(data2)
        
        assert hash1 != hash2

    def test_notary_signing_receipt(self):
        """
        Verifies that the signing receipt contains all institutional proof fields.
        """
        hash_seal = "abcdef1234567890"
        receipt = notary.sign_survey(survey_id=1, hash_seal=hash_seal)
        
        assert receipt["survey_id"] == 1
        assert receipt["hash_seal"] == hash_seal
        assert "transaction_id" in receipt
        assert receipt["ledger_provider"] == "Plimsoll Institutional Ledger (v1)"

    def test_erp_gateway_navis_export(self):
        """
        Verifies that the Navis N4 export matches the required schema.
        """
        mock_survey = Survey(
            id=123,
            timestamp=datetime.utcnow(),
            draft_mean=12.450,
            confidence=0.99,
            sea_state="CALM",
            hash_seal="fake_hash_seal_val"
        )
        
        navis_data = erp_gateway.export_to_navis_n4(mock_survey)
        
        assert navis_data["header"]["vessel_imo"] == "9406087"
        assert navis_data["draft_survey"]["mean_draft"] == 12.450
        assert navis_data["draft_survey"]["integrity_hash"] == "fake_hash_seal_val"

    def test_erp_gateway_sap_export(self):
        """
        Verifies that the SAP export matches the maritime logistics module schema.
        """
        mock_survey = Survey(
            id=456,
            timestamp=datetime.utcnow(),
            draft_mean=8.123,
            hash_seal="another_fake_hash"
        )
        
        sap_data = erp_gateway.export_to_sap(mock_survey)
        
        assert sap_data["OBJECT_TYPE"] == "MARITIME_SURVEY"
        assert sap_data["DATA"]["DRAFT_MM"] == 8123
        assert sap_data["SECURITY"]["SEAL_SHA256"] == "another_fake_hash"
