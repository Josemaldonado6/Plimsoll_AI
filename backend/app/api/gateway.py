from typing import Dict, Any, List
from app.db.models import Survey

class ERPGateway:
    """
    Industrial API Gateway for Enterprise Resource Planning (ERP) systems.
    Bridges Plimsoll AI data with global maritime terminal operating systems.
    """
    
    @staticmethod
    def export_to_navis_n4(survey: Survey) -> Dict[str, Any]:
        """
        Formats survey data for Navis N4 Terminal Operating System.
        """
        return {
            "header": {
                "source": "PlimsollAI-Visionary-Layer",
                "vessel_imo": "9406087", # Mocked for example
                "timestamp": survey.timestamp.isoformat()
            },
            "draft_survey": {
                "mean_draft": survey.draft_mean,
                "confidence_index": survey.confidence,
                "integrity_hash": survey.hash_seal
            },
            "physical_audit": {
                "sea_state": survey.sea_state,
                "verification_link": f"https://audit.plimsoll.ai/verify/{survey.hash_seal}"
            }
        }

    @staticmethod
    def export_to_sap(survey: Survey) -> Dict[str, Any]:
        """
        Standardizes survey data for SAP S/4HANA (Maritime Logistics Module).
        """
        return {
            "OBJECT_TYPE": "MARITIME_SURVEY",
            "DATA": {
                "ID": survey.id,
                "DRAFT_MM": int(survey.draft_mean * 1000),
                "NOTARIZED": "TRUE" if survey.hash_seal else "FALSE",
                "TIMESTAMP": survey.timestamp.strftime("%Y%m%d%H%M%S")
            },
            "SECURITY": {
                "HASH_MD5": survey.hash_seal[:32], # Sub-hash for legacy fields
                "SEAL_SHA256": survey.hash_seal
            }
        }

# Singleton Instance
erp_gateway = ERPGateway()
