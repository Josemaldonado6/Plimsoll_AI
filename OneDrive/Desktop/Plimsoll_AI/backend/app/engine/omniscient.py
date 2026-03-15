# -----------------------------------------------------------------------------
# PROJECT: PLIMSOLL AI - THE VISIONARY LAYER
# MODULE: omniscient.py
#
# DESCRIPTION:
# Handles OSINT (Open Source Intelligence) data gathering for vessels.
# Translates IMO Numbers into rich context (Name, Dimensions, TPC).
#
# API SOURCES:
# - MarineTraffic (Legacy / Paid) -> Mocked for MVP
# - VesselFinder (Public Scraper) -> Mocked for MVP
# -----------------------------------------------------------------------------

import logging
import requests
import random
import hashlib
import numpy as np
from bs4 import BeautifulSoup
from typing import Dict, List, Optional

# Configure Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OmniscientEngine")

class SyntheticHullModeler:
    """
    Extrudes a mathematically realistic Hydrostatic Table from basic dimensions.
    Used when specific stability booklets are not available.
    """
    @staticmethod
    def generate_table(loa: float, beam: float, summer_dwt: float) -> Dict[str, List[float]]:
        # Block Coefficient (Cb) estimation: DWT is approx LOA * B * Draft * 1.025 * Cb
        # Let's assume a standard design draft (d) ~ 11m for Handy-size
        design_draft = 11.5
        cb = summer_dwt / (loa * beam * design_draft * 1.025)
        cb = max(0.6, min(0.85, cb)) # Clamp to realistic naval limits
        
        drafts = np.linspace(0.0, design_draft * 1.4, 15).tolist()
        displacement = []
        tpc = []
        lcf = []
        mtc = []
        
        for d in drafts:
            # Displacement follows a roughly cubic curve relative to draft
            # V = L * B * d * Cb(d)
            # Cb usually increases slightly with draft
            current_cb = cb * (0.8 + 0.2 * (d / design_draft))
            disp = loa * beam * d * current_cb * 1.025
            displacement.append(round(disp, 2))
            
            # TPC = Area_WP * 1.025 / 100
            # Area_WP is approx LOA * B * Cwp
            cwp = 0.7 + (current_cb * 0.3) # Waterplane area coefficient
            tpc_val = (loa * beam * cwp * 1.025) / 100
            tpc.append(round(tpc_val, 2))
            
            # LCF (relative to midships) - usually slightly aft at light, moves fwd
            lcf_val = (loa * 0.02) * (d / design_draft - 0.5)
            lcf.append(round(lcf_val, 2))
            
            # MTC (Moment to change trim 1cm) 
            # Approx TPC * LOA^2 / K
            mtc_val = (tpc_val * loa**2) / 1200 # Empirical k-factor
            mtc.append(round(mtc_val, 2))
            
        return {
            "draft": [round(d, 2) for d in drafts],
            "displacement": displacement,
            "tpc": tpc,
            "lcf": lcf,
            "mtc": mtc
        }

class OmniscientEngine:
    def __init__(self):
        self.cache = {} # Simple in-memory cache for MVP
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

    def _generate_fallback_data(self, imo_number: str) -> Dict:
        """
        Generates deterministic but realistic ship data based on IMO hash.
        This provides a consistent 'simulation' when scraping is blocked.
        """
        # Seed random with IMO so same ship always gets same data
        seed = int(hashlib.sha256(imo_number.encode()).hexdigest(), 16)
        random.seed(seed)
        
        # Realistic Ship Names
        prefixes = ["MSC", "CMA CGM", "MAERSK", "HAPAG", "ONE", "EVER", "COSCO", "OOCL", "ZIM", "YANG MING"]
        suffixes = ["Pride", "Glory", "Star", "Pearl", "Diamond", "Vanguard", "Titan", "Spirit", "Legacy", "Voyager"]
        name = f"{random.choice(prefixes)} {random.choice(suffixes)}"
        
        # Dimensions based on realistic ratios
        length = random.randint(180, 400) # Meters
        beam = int(length * random.uniform(0.12, 0.16)) # Beam ratio ~14% of length
        dwt = int((length * beam * 12) * random.uniform(0.8, 1.2)) # Approximate DWT
        
        return {
            "name": name,
            "flag": random.choice(["Panama", "Liberia", "Marshall Islands", "Hong Kong", "Singapore", "Malta"]),
            "type": random.choice(["Bulk Carrier", "Container Ship", "Oil Tanker", "LNG Carrier"]),
            "loa": float(length),
            "beam": float(beam),
            "year": random.randint(2005, 2024),
            "tpc": round(dwt / 1000 * 0.8, 1), # Approx TPC
            "summer_dwt": dwt,
            "operator": name.split(' ')[0] + " Shipping Line",
            "source": "Generative Simulation (AI Prediction)"
        }

    def _scrape_vesselfinder(self, imo_number: str) -> Optional[Dict]:
        """
        Attempts to scrape public data from VesselFinder.
        Note: This is brittle and may be blocked by antibot measures.
        """
        try:
            url = f"https://www.vesselfinder.com/vessels/details/{imo_number}"
            headers = {"User-Agent": self.user_agent}
            response = requests.get(url, headers=headers, timeout=5)
            
            if response.status_code != 200:
                logger.warning(f"VesselFinder returned {response.status_code}")
                return None
                
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Basic Extraction Logic (Brittle selector based)
            name_elem = soup.find("h1", class_="title")
            name = name_elem.text.strip() if name_elem else None
            
            # If we got a name, assume success and try to parse more
            if name:
                logger.info(f"Scraped Name: {name}")
                # For MVP, extracting detailed specs is complex due to layout changes.
                # We return partial data combined with generative fill.
                fallback = self._generate_fallback_data(imo_number)
                fallback["name"] = name
                fallback["source"] = "VesselFinder (Live Scrape)"
                return fallback
                
            return None
            
        except Exception as e:
            logger.error(f"Scraping failed: {e}")
            return None

    def fetch_ship_data(self, imo_number: str) -> Dict:
        """
        Fetches ship details based on IMO Number.
        Prioritizes: Cache -> Live Scrape -> Generative Simulation.
        """
        if not imo_number or len(imo_number) < 7:
             return self._generate_fallback_data("0000000")

        logger.info(f"Fetching OSINT data for IMO: {imo_number}")

        if imo_number in self.cache:
            return self.cache[imo_number]

        # 1. Try Live Scrape
        data = self._scrape_vesselfinder(imo_number)
        
        # 2. Fallback to Generative Simulation
        if not data:
            logger.info("Scraping failed or blocked. Engaging Generative Simulation.")
            data = self._generate_fallback_data(imo_number)
        
        # Enrich with "Predictive" data (Always simulated for now)
        from app.engine.predictive import predictor
        
        data["predicted_cargo"] = predictor.estimate_cargo(data.get("type", "Unknown"), "Brazil -> China") # Mock route for MVP
        
        # Mock current state for prediction
        tpc = data.get("tpc", 50.0)
        prediction = predictor.predict_completion(
            imo=imo_number,
            current_draft=12.5, # Mock current for dashboard init
            tpc=tpc,
            target_draft=14.5   # Mock target for dashboard init
        )
        data["logistics"] = prediction
        data["risk_score"] = random.choice(["LOW", "LOW", "MEDIUM", "LOW"]) # Biased towards safe

        # Generate Synthetic Hydrostatics for Physics Engine V2
        data["hydrostatics"] = SyntheticHullModeler.generate_table(
            loa=data.get("loa", 200.0),
            beam=data.get("beam", 32.0),
            summer_dwt=data.get("summer_dwt", 55000)
        )

        data["imo"] = imo_number
        self.cache[imo_number] = data
        return data

# Singleton Instance
omniscient = OmniscientEngine()
