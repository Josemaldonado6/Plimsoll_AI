# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: vision.py
#
# DERECHOS DE AUTOR / COPYRIGHT:
# (c) 2026 José de Jesús Maldonado Ordaz. Todos los derechos reservados.
#
# PROPIEDAD INTELECTUAL:
# Este código fuente, algoritmos, lógica de negocio y diseño de interfaz
# son propiedad exclusiva de su autor. Queda prohibida su reproducción,
# distribución o uso sin una licencia otorgada por escrito.
#
# REGISTRO:
# Protegido bajo la Ley Federal del Derecho de Autor (México) y
# Tratados Internacionales de la OMPI.
#
# CONFIDENCIALIDAD:
# Este archivo contiene SECRETOS INDUSTRIALES. Su acceso no autorizado
# constituye un delito federal.
# -----------------------------------------------------------------------------
class DraftSurveyor:
    """
    Master Vessel Intelligence and Physics Engine.
    Handles ship identity (OSINT), hydrostatics, and environment parameters.
    """

    def __init__(self):
        self.imo = None
        self.ship_name = "SEARCHING_OSINT"
        self.vessel_data = {}
        self.hydrostatics = {}
        self.density = 1.025  # Standard Saltwater
        self.pixel_scale = 0.001
        self.known_height_m = 0.0
        self.draft_fwd = 0.0
        self.draft_aft = 0.0

    def initialize_vessel(self, imo_number: str) -> dict:
        """
        Simulates OSINT data retrieval for a vessel and initializes physics state.
        IMO 9406087: MSC PLIMSOLL (TEST VESSEL)
        """
        self.imo = imo_number
        
        # Hardcoded OSINT for Test Vessel
        if imo_number == "9406087":
            self.vessel_data = {
                "name": "MSC PLIMSOLL",
                "imo": "9406087",
                "mmsi": "352001000",
                "flag": "Panama",
                "type": "Container Ship",
                "built": 2009,
                "loa": 366.0,
                "beam": 51.0,
                "max_draft": 15.5,
                "deadweight": 140000,
                "status": "INITIALIZED"
            }
        else:
            self.vessel_data = {
                "name": f"SHIP_IMO_{imo_number}",
                "imo": imo_number,
                "status": "OSINT_PENDING",
                "loa": 0,
                "beam": 0
            }
            
        self.ship_name = self.vessel_data["name"]
        return self.vessel_data

    def set_vessel_hydrostatics(self, data: dict) -> dict:
        self.hydrostatics = data
        return {"status": "hydrostatics_ingested", "table_count": len(data.get("tables", {}))}

    def set_environment_params(self, density: float, draft_fwd: float = None, draft_aft: float = None) -> dict:
        self.density = density
        if draft_fwd is not None: self.draft_fwd = draft_fwd
        if draft_aft is not None: self.draft_aft = draft_aft
        return {
            "density": self.density,
            "trim_m": (self.draft_aft - self.draft_fwd) if (self.draft_aft and self.draft_fwd) else 0.0
        }

    def set_calibration(self, pixel_dist: int, known_height_m: float) -> dict:
        self.pixel_scale = known_height_m / pixel_dist if pixel_dist > 0 else 0.001
        self.known_height_m = known_height_m
        return {
            "scale_px_to_m": self.pixel_scale,
            "calibration_status": "LOCKED"
        }

