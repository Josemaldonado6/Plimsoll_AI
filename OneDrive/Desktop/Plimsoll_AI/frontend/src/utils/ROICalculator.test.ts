import { describe, it, expect } from 'vitest';
import { calculateROI } from './ROICalculator';

describe('ROICalculator Engine', () => {
    it('should calculate standard price correctly for Handymax (45,000 DWT)', () => {
        const result = calculateROI(45000, 'standard');
        // base (450) + (4.5 * 65) = 450 + 292.5 = 742.5 -> 743
        expect(result.perSurvey).toBe(743);
    });

    it('should apply enterprise multiplier (1.4x)', () => {
        const standard = calculateROI(45000, 'standard');
        const enterprise = calculateROI(45000, 'enterprise');
        expect(enterprise.perSurvey).toBe(Math.round(standard.perSurvey * 1.4));
    });

    it('should cap the price at $4500 for massive vessels (ULCC)', () => {
        const result = calculateROI(500000, 'enterprise');
        expect(result.perSurvey).toBe(4500);
    });

    it('should calculate positive savings against industry averages', () => {
        const result = calculateROI(120000, 'enterprise');
        // manualCost = 4800. If price < 4800, savings should be positive.
        expect(result.savings).toBeGreaterThan(0);
        expect(result.timeSaved).toBe(68); // 15 * 4.5 = 67.5 -> 68
    });

    it('should calculate annual revenue with 15% discount (0.85 multiplier)', () => {
        const result = calculateROI(120000, 'enterprise');
        const surveys = 15;
        const rawAnnual = result.perSurvey * surveys * 0.85;
        expect(result.annual).toBe(Math.round(rawAnnual));
    });
});
