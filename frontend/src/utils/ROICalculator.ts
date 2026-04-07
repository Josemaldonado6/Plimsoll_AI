/**
 * PLIMSOLL AI - ROI Calculation Engine
 * Dedicated for Stakeholder/CFO precision.
 */

export interface ROIData {
    perSurvey: number;
    annual: number;
    savings: number;
    timeSaved: number;
}

export function calculateROI(dwt: number, tier: 'standard' | 'enterprise'): ROIData {
    const base = 450;
    const scaleFactor = (dwt / 10000) * 65;
    let price = base + scaleFactor;

    if (tier === 'enterprise') price *= 1.4; // Premium Features

    // Industrial Cap for competitive edge
    if (price > 4500) price = 4500;

    // Industry standard manual costs: Surveyor ($1.5k) + Launch ($800) + Demurrage/Delay ($2.5k avg)
    const manualCost = 1500 + 800 + 2500;
    const savingsPerSurvey = manualCost - price;
    const estimatedSurveysYearly = 15;

    return {
        perSurvey: Math.round(price),
        annual: Math.round(price * estimatedSurveysYearly * 0.85), // Bulk discount
        savings: Math.round(savingsPerSurvey * estimatedSurveysYearly),
        timeSaved: Math.round(estimatedSurveysYearly * 4.5) // 4.5 hours saved per deployment
    };
}
