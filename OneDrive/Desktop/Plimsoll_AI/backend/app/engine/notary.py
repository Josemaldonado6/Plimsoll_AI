import hashlib
import json
import time
import secrets

class BlockchainNotary:
    """
    Simulates a connection to a Private Blockchain (e.g., Hyperledger Fabric / Ethereum Private).
    Generates SHA-256 hashes of survey data to ensure immutability.
    """

    def __init__(self, node_id: str = "NODE_SINGAPORE_01"):
        self.node_id = node_id
        self.private_key = secrets.token_hex(32) # Simulated Private Key

    def generate_hash(self, data: dict) -> str:
        """
        Creates a SHA-256 hash of the data payload.
        Ensures that even a 1mm change in draft results in a completely different hash.
        """
        # Sort keys to ensure deterministic ordering
        serialized_data = json.dumps(data, sort_keys=True).encode('utf-8')
        return hashlib.sha256(serialized_data).hexdigest()

    def notarize_survey(self, survey_result: dict) -> dict:
        """
        'Mints' the survey result onto the blockchain.
        Returns the Transaction ID (TxID) and Block Number.
        """
        # 1. Generate Content Hash
        content_hash = self.generate_hash(survey_result)
        
        # 2. Simulate Blockchain Transaction
        # In a real system, this would await web3.eth.sendSignedTransaction()
        timestamp = int(time.time())
        signature = f"{self.node_id}:{timestamp}:{content_hash[:8]}"
        
        # 3. Generate a mocked Transaction ID (TxID)
        tx_payload = f"{signature}{self.private_key}"
        tx_id = "0x" + hashlib.sha3_256(tx_payload.encode('utf-8')).hexdigest()

        return {
            "tx_id": tx_id,
            "block_timestamp": timestamp,
            "block_number": 1402394, # Mock Block
            "node_validator": self.node_id,
            "content_hash": content_hash,
            "status": "CONFIRMED"
        }
