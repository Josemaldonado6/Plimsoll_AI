from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import time

router = APIRouter()

class QuoteRequest(BaseModel):
    dwt: float
    loa: float
    vessel_type: str = "BULK_CARRIER"
    email: Optional[str] = None

class QuoteResponse(BaseModel):
    quote_id: str
    annual_subscription: float
    per_survey_rate: float
    estimated_savings: float
    currency: str = "USD"

@router.post("/calculate", response_model=QuoteResponse)
async def calculate_quote(request: QuoteRequest):
    """
    Dynamic Pricing Engine (The "Smart" Calculator).
    Calculates pricing based on vessel size (DWT) and complexity.
    """
    
    # 1. Base Logic
    # Larger vessels = Higher value cargo = Higher risk = Higher premium
    base_rate = 500.0 # Per survey
    
    # DWT Multiplier (0.01 per ton is too high, let's say $100 per 10k tons)
    dwt_premium = (request.dwt / 10000.0) * 50.0
    
    final_per_survey = base_rate + dwt_premium
    
    # Cap the per-survey price reasonably
    if final_per_survey > 2500:
        final_per_survey = 2500

    # Annual Subscription (Assume 1 survey per month minimum for discount)
    annual_sub = final_per_survey * 10 # Get 12 for price of 10
    
    # ROI Calculation
    # Manual survey avg cost: $1,200 + Launch Hire ($500) + Delay ($2000/hr)
    # Plimsoll saves the Launch and Delay.
    manual_cost = 1200 + 500 + 1000 # Conservative delay estimte
    savings_per_survey = manual_cost - final_per_survey
    annual_savings = savings_per_survey * 12

    return {
        "quote_id": f"QT-{int(time.time())}",
        "annual_subscription": round(annual_sub, 2),
        "per_survey_rate": round(final_per_survey, 2),
        "estimated_savings": round(annual_savings, 2),
        "currency": "USD"
    }
