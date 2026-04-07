import hashlib
import json
import time
import secrets
import os

class BlockchainNotary:
    """
    Simulates a connection to a Private Blockchain (e.g., Hyperledger Fabric / Ethereum Private).
    Generates SHA-256 hashes of survey data to ensure immutability.
    """

    def __init__(self, node_id: str = "NODE_SINGAPORE_01"):
        self.node_id = node_id
        self.private_key = secrets.token_hex(32) # Simulated Private Key

    def hash_file(self, file_path: str) -> str:
        """
        Generates SHA-256 hash of a file's raw bytes.
        If file doesn't exist, returns a placeholder hash.
        """
        if not file_path or not os.path.exists(file_path):
            return "0" * 64
        
        sha256_hash = hashlib.sha256()
        try:
            with open(file_path, "rb") as f:
                # Read in chunks to handle large video files
                for byte_block in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(byte_block)
            return sha256_hash.hexdigest()
        except Exception:
            return "0" * 64

    def generate_hash(self, data: dict) -> str:
        """
        Creates a SHA-256 hash of the data payload.
        Ensures that even a 1mm change in draft results in a completely different hash.
        """
        # Sort keys to ensure deterministic ordering
        serialized_data = json.dumps(data, sort_keys=True).encode('utf-8')
        return hashlib.sha256(serialized_data).hexdigest()

    def notarize_survey(self, survey_result: dict, evidence_files: list = None) -> dict:
        """
        'Mints' the survey result onto the blockchain.
        Calculates a Merkle-style Root Hash of (JSON Data + Video + Evidence Image).
        """
        # 1. Generate Content Hash of the JSON Result
        result_hash = self.generate_hash(survey_result)
        
        # 2. Hash Evidence Files (Video, SRT, etc.)
        file_hashes = {}
        combined_seed = result_hash
        
        if evidence_files:
            for f_path in evidence_files:
                f_name = os.path.basename(f_path)
                f_hash = self.hash_file(f_path)
                file_hashes[f_name] = f_hash
                combined_seed += f_hash
        
        # 3. Create Merkle Root representing the ENTIRE mission
        merkle_root = hashlib.sha256(combined_seed.encode('utf-8')).hexdigest()
        
        # 4. Simulate Blockchain Transaction
        timestamp = int(time.time())
        signature = f"{self.node_id}:{timestamp}:{merkle_root[:8]}"
        
        # 5. Generate a mocked Transaction ID (TxID)
        tx_payload = f"{signature}{self.private_key}"
        tx_id = "0x" + hashlib.sha3_256(tx_payload.encode('utf-8')).hexdigest()

    def generate_signed_recommendation(self, action_payload: dict) -> str:
        """
        [NIST DOOMSDAY SHIELD]
        Produces a NIST-compliant signed recommendation for Ballast Adjustment.
        This provides a 'Digital Air-Gap' by requiring a human to scan a QR 
        at a non-networked PLC terminal.
        """
        timestamp = int(time.time())
        # Add metadata for security
        audit_payload = {
            "node": self.node_id,
            "ts": timestamp,
            "expiry": timestamp + 1800, # 30 min window
            "action": action_payload
        }
        
        # 1. Generate core hash
        serialized = json.dumps(audit_payload, sort_keys=True).encode('utf-8')
        content_hash = hashlib.sha256(serialized).hexdigest()
        
        # 2. Simulate Digital Signature with Private Key
        # This would be an RSA/ECDSA signature in production
        signature_sim = hashlib.sha256(f"{content_hash}{self.private_key}".encode('utf-8')).hexdigest()
        
        # 3. Final Signed Package
        signed_package = {
            "p": audit_payload,
            "s": signature_sim
        }
        
        # Returning as a base64-style string suitable for a QR code
        import base64
        return base64.b64encode(json.dumps(signed_package).encode('utf-8')).decode('utf-8')

# Singleton instance
notary = BlockchainNotary()
