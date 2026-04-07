/**
 * PLIMSOLL AI - PHYSICS BRIDGE (MOBILE EDGE)
 * 
 * Offline implementation of the UN/ECE 5-step draft correction protocol.
 * Designed to mirror the backend NavalArchitect kernel for result parity.
 * All calculations run on-device with zero cloud dependency.
 */

export interface DraftReadings {
    fwd_port: number;
    fwd_stbd: number;
    mid_port: number;
    mid_stbd: number;
    aft_port: number;
    aft_stbd: number;
}

export interface HydrostaticPoint {
    draft: number;
    displacement: number;
    tpc: number;
    lcf: number;
    mtc: number;
}

export interface CorrectedDraftResult {
    // Step 1: Mean Drafts
    mean_fwd: number;
    mean_mid: number;
    mean_aft: number;
    // Step 2: Trim & Quarter Mean
    raw_trim: number;
    quarter_mean_draft: number;
    // Step 3: First Trim Correction (FTC)
    ftc: number;
    corrected_draft_step3: number;
    // Step 4: Second Trim Correction (STC / Nemoto)
    stc: number;
    corrected_draft_step4: number;
    // Step 5: Dock Water Allowance (DWA)
    dwa: number;
    final_displacement_mt: number;
    // Summary
    final_draft: number;
    confidence: number;
}

/**
 * Linear interpolation helper for hydrostatic table lookups.
 */
function interpolate(table: HydrostaticPoint[], draft: number, field: keyof HydrostaticPoint): number {
    if (draft <= table[0].draft) return table[0][field] as number;
    if (draft >= table[table.length - 1].draft) return table[table.length - 1][field] as number;

    for (let i = 0; i < table.length - 1; i++) {
        const lower = table[i];
        const upper = table[i + 1];
        if (draft >= lower.draft && draft <= upper.draft) {
            const ratio = (draft - lower.draft) / (upper.draft - lower.draft);
            return (lower[field] as number) + ratio * ((upper[field] as number) - (lower[field] as number));
        }
    }
    return 0;
}

/**
 * Main offline correction engine.
 * Runs all 5 UN/ECE correction steps on-device.
 */
export function calculateCorrectedDisplacement(
    readings: DraftReadings,
    hydrostatics: HydrostaticPoint[],
    waterDensity: number = 1.025,
    lbp: number = 200,         // Length Between Perpendiculars (meters)
): CorrectedDraftResult {

    // --- STEP 1: Mean Port/Starboard at each station ---
    const mean_fwd = (readings.fwd_port + readings.fwd_stbd) / 2;
    const mean_mid = (readings.mid_port + readings.mid_stbd) / 2;
    const mean_aft = (readings.aft_port + readings.aft_stbd) / 2;

    // --- STEP 2: Quarter Mean Draft (Moulded) ---
    const raw_trim = mean_aft - mean_fwd;
    const quarter_mean_draft = (mean_fwd + (6 * mean_mid) + mean_aft) / 8;

    // --- STEP 3: First Trim Correction (FTC) ---
    // FTC = trim × (LCF / LBP) × TPC × 100
    const tpc_qm = interpolate(hydrostatics, quarter_mean_draft, 'tpc');
    const lcf_qm = interpolate(hydrostatics, quarter_mean_draft, 'lcf');
    const ftc = raw_trim * (lcf_qm / lbp) * tpc_qm * 100;
    const corrected_draft_step3 = quarter_mean_draft + ftc / (tpc_qm * 100);

    // --- STEP 4: Second Trim Correction (Nemoto / STC) ---
    // STC = 50 × (trim² / LBP) × (dMTC/ddraft)
    // Approximate dMTC/ddraft numerically from table
    const mtc_at_qm = interpolate(hydrostatics, quarter_mean_draft, 'mtc');
    const mtc_above = interpolate(hydrostatics, quarter_mean_draft + 0.1, 'mtc');
    const d_mtc = (mtc_above - mtc_at_qm) / 0.1;
    const stc = 50 * (Math.pow(raw_trim, 2) / lbp) * d_mtc;
    const corrected_draft_step4 = corrected_draft_step3 + stc / (tpc_qm * 100);

    // --- STEP 5: Dock Water Allowance (DWA) ---
    // Displacement_SW = displacement at corrected draft (from table)
    const displacement_sw = interpolate(hydrostatics, corrected_draft_step4, 'displacement');
    // DWA = displacement_SW × (1.025 - actual_density) / (tpc_corrected × 100)
    const tpc_corrected = interpolate(hydrostatics, corrected_draft_step4, 'tpc');
    const dwa = displacement_sw * (1.025 - waterDensity) / (tpc_corrected * waterDensity * 100);
    const final_displacement_mt = displacement_sw * (waterDensity / 1.025);

    // Confidence: penalize for large trim and low density delta
    const trim_penalty = Math.min(Math.abs(raw_trim) * 5, 25);
    const confidence = Math.max(65, 100 - trim_penalty);

    return {
        mean_fwd,
        mean_mid,
        mean_aft,
        raw_trim,
        quarter_mean_draft,
        ftc,
        corrected_draft_step3,
        stc,
        corrected_draft_step4,
        dwa,
        final_displacement_mt,
        final_draft: corrected_draft_step4,
        confidence,
    };
}
