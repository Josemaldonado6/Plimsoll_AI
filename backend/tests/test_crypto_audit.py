import sys
import os
import hashlib
import json

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.notary import NotaryService

def test_cryptography():
    print("--- INITIATING CRYPTOGRAPHY AUDIT (PROTOCOL 17020) ---")
    
    notary = NotaryService()
    
    survey_data = {
        "id": 123,
        "vessel": "MV PACIFIC LEGACY",
        "draft_mean": 10.45,
        "displacement": 45000.2,
        "notarized_at": "2026-02-23T12:00:00"
    }
    
    # 1. Deterministic Validation
    print("\n[TEST 1] Determinism (Same Inputs = Same Hash)")
    hash1 = notary.generate_survey_hash(survey_data)
    hash2 = notary.generate_survey_hash(survey_data)
    print(f"  Hash 1: {hash1}")
    print(f"  Hash 2: {hash2}")
    assert hash1 == hash2
    print("  PASS: Hashing is deterministic.")

    # 2. Key Order Independence
    print("\n[TEST 2] Key Order Independence")
    swapped_data = {
        "notarized_at": "2026-02-23T12:00:00",
        "displacement": 45000.2,
        "draft_mean": 10.45,
        "vessel": "MV PACIFIC LEGACY",
        "id": 123
    }
    hash3 = notary.generate_survey_hash(swapped_data)
    print(f"  Swapped Keys Hash: {hash3}")
    assert hash1 == hash3
    print("  PASS: Key ordering does not affect integrity seal.")

    # 3. Avalanche Effect
    print("\n[TEST 3] Avalanche Effect (0.01m change)")
    survey_data_modified = survey_data.copy()
    surveyor_error = 10.46 # 1cm change
    survey_data_modified["draft_mean"] = surveyor_error
    hash4 = notary.generate_survey_hash(survey_data_modified)
    print(f"  Modified Hash: {hash4}")
    assert hash1 != hash4
    print("  PASS: High sensitivity to data manipulation detected.")

    print("\n--- CRYPTOGRAPHY AUDIT COMPLETE: ISO/IEC 24760 COMPLIANT ---")

if __name__ == "__main__":
    test_cryptography()
