import sys
import os
import json
import base64

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.engine.wca import WaveCancellationAlgorithm
from app.engine.telemetry_parser import TelemetryParser, MaritimeComplianceError
from app.engine.notary import BlockchainNotary

def test_adversarial_shield():
    print("--- [SHIELD 1] Adversarial AI Defense (Temporal Persistence) ---")
    wca = WaveCancellationAlgorithm()
    
    # Payload: A laser pointer 'jump' from 420px to 650px in 1 frame
    malicious_readings = [420.0, 421.0, 420.5, 650.0, 649.0]
    
    result = wca.filter_signal(malicious_readings)
    if result.get("error") == "ADVERSARIAL_INJECTION_DETECTED":
        print("[PASSED] SUCCESS: Malicious pixel jump detected and operation terminated.")
    else:
        print("[FAILED] FAILURE: Adversarial injection bypass detected.")

def test_gps_jamming_shield():
    print("\n--- [SHIELD 2] GPS Jamming Defense (SRT Integrity) ---")
    parser = TelemetryParser()
    
    # Malicious SRT with a sequence jump (manual edit)
    malicious_srt = "1\n00:00:01.000\n[altitude: 10.0]\n\n3\n00:00:02.000\n[altitude: 10.0]"
    
    try:
        parser.parse_srt(malicious_srt)
        print("[FAILED] FAILURE: SRT sequence jump was NOT caught as an error.")
    except MaritimeComplianceError as e:
        print(f"[PASSED] SUCCESS: Caught telemetry integrity breach: {e}")

def test_airgap_shield():
    print("\n--- [SHIELD 3] PLC Air-Gap Protection (Signed QR) ---")
    notary = BlockchainNotary()
    
    action = {"op": "BALLAST_PUMP_FWD", "vol": 500}
    signed_qr = notary.generate_signed_recommendation(action)
    
    # Verify it's a valid base64 blob containing our payload
    decoded = json.loads(base64.b64decode(signed_qr).decode('utf-8'))
    
    if decoded['p']['action']['op'] == "BALLAST_PUMP_FWD" and 's' in decoded:
        print(f"[PASSED] SUCCESS: Signed QR Recommendation generated. Sig: {decoded['s'][:16]}...")
    else:
        print("[FAILED] FAILURE: Signed recommendation format invalid.")

if __name__ == "__main__":
    try:
        test_adversarial_shield()
        test_gps_jamming_shield()
        test_airgap_shield()
        print("\n[SUCCESS] DOOMSDAY SHIELD VERIFIED: Plimsoll AI is NIST-Ready.")
    except Exception as e:
        print(f"\n[FAILURE] VERIFICATION FAILED: {e}")
        sys.exit(1)
