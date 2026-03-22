import hashlib
import json
from datetime import datetime
from typing import Dict, Any

class NotaryService:
    """
    Electronic Notarization System for Plimsoll AI.
    Ensures the 'Waterline of Truth' is cryptographically immutable.
    """
    
    @staticmethod
    def generate_survey_hash(survey_data: Dict[str, Any]) -> str:
        """
        Creates a deterministic SHA-256 hash of the survey data.
        Any change in the input data will produce a completely different hash (Avalanche Effect).
        """
        # Ensure deterministic ordering of keys
        serialized_data = json.dumps(survey_data, sort_keys=True, default=str)
        return hashlib.sha256(serialized_data.encode('utf-8')).hexdigest()

    @staticmethod
    def sign_survey(survey_id: int, hash_seal: str) -> Dict[str, Any]:
        """
        Simulates the commitment of a hash to a Distributed Ledger (Blockchain).
        In a production environment, this would call a Smart Contract.
        """
        timestamp = datetime.utcnow().isoformat()
        receipt = {
            "survey_id": survey_id,
            "hash_seal": hash_seal,
            "notarized_at": timestamp,
            "ledger_provider": "Plimsoll Institutional Ledger (v1)",
            "transaction_id": f"0x{hashlib.sha1(f'{survey_id}{timestamp}'.encode()).hexdigest()}"
        }
        return receipt

# Singleton Instance
notary = NotaryService()
