import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DraftDashboard from '../components/DraftDashboard';

// Mock Canvas and 3D components to avoid WebGL errors in JSDOM
vi.mock('@react-three/fiber', () => ({
    Canvas: ({ children }: any) => <div data-testid="mock-canvas">{children}</div>
}));

vi.mock('@react-three/drei', () => ({
    OrbitControls: () => null,
    Environment: () => null,
    ContactShadows: () => null,
    Sky: () => null
}));

// Mock the 3D models themselves
vi.mock('../components/3d/ShipModel', () => ({
    ShipModel: () => <div data-testid="mock-ship-model" />
}));

vi.mock('../components/3d/OceanShader', () => ({
    OceanShader: () => <div data-testid="mock-ocean-shader" />
}));

const mockData = {
    id: 1,
    draft_fwd_true: 10.0,
    draft_aft_true: 10.2,
    draft_mid_true: 10.1,
    calculated_displacement: 55000,
    sea_state: 'CALM',
    vessel_name: 'MV TESTER',
    vessel_imo: '9406087',
    vessel_flag: 'PANAMA',
    physics_audit_trail: [],
    corrections: {
        ftc: 1.2,
        stc: 0.5,
        density_factor: 1.025
    },
    logistics: {
        operation: 'Loading',
        velocity_tph: 2500,
        hours_remaining: 4.5,
        eta: '2026-02-22 15:30',
        percentage: 65.5,
        anomaly: null,
        confidence: 'HIGH'
    }
};

describe('DraftDashboard Component - Professional Validation', () => {
    it('renders the 3D visual layer foundation', () => {
        render(<DraftDashboard data={mockData} onConfirm={() => { }} onUpload={() => { }} onExport={() => { }} />);
        expect(screen.getByTestId('mock-canvas')).toBeInTheDocument();
    });

    it('displays the correct vessel metadata and auto-enrich status', () => {
        render(<DraftDashboard data={mockData} onConfirm={() => { }} onUpload={() => { }} onExport={() => { }} />);
        expect(screen.getByText('MV TESTER')).toBeInTheDocument();
        expect(screen.getByText(/IMO: 9406087/)).toBeInTheDocument();
        expect(screen.getByText(/FLAG: PANAMA/)).toBeInTheDocument();
        expect(screen.getByText('dashboard.auto_enrich')).toBeInTheDocument();
    });

    it('displays the AI Oracle insights when available', () => {
        render(<DraftDashboard data={mockData} onConfirm={() => { }} onUpload={() => { }} onExport={() => { }} />);
        expect(screen.getByText('dashboard.ai_oracle_sense')).toBeInTheDocument();
        expect(screen.getByText('dashboard.vessel_stable')).toBeInTheDocument();
        expect(screen.getByText('2500')).toBeInTheDocument(); // Velocity
        expect(screen.getByText('15:30')).toBeInTheDocument(); // ETA
        expect(screen.getByText('65.5%')).toBeInTheDocument(); // Progress
    });

    it('triggers the Critical Red UI state when an anomaly is detected', () => {
        const anomalyData = {
            ...mockData,
            logistics: {
                ...mockData.logistics,
                anomaly: 'CRANE_SLOWDOWN_DETECTED'
            }
        };
        render(<DraftDashboard data={anomalyData} onConfirm={() => { }} onUpload={() => { }} onExport={() => { }} />);

        expect(screen.getByText('dashboard.critical_anomaly')).toBeInTheDocument();
        expect(screen.getByText('CRANE SLOWDOWN DETECTED')).toBeInTheDocument();

        // Ensure the anomaly container has the appropriate styling class (red theme)
        const criticalHeader = screen.getByText('dashboard.critical_anomaly');
        const oraclePanel = criticalHeader.closest('.animate-fade-in');
        expect(oraclePanel).toHaveClass('bg-red-500/10');
    });

    it('renders Sentinel safety incidents and auto-calibration status', () => {
        const safetyData = {
            ...mockData,
            ai_metadata: {
                sentinel_alerts: 1,
                auto_calibrated: true,
                pixel_scale: 0.0025,
                safety_log: [{
                    type: 'PPE_NON_COMPLIANCE',
                    severity: 'HIGH',
                    location: [0, 0, 10, 10],
                    recommendation: 'Missing Hard Hat.'
                }]
            }
        };
        render(<DraftDashboard data={safetyData} onConfirm={() => { }} onUpload={() => { }} onExport={() => { }} />);

        expect(screen.getByText('dashboard.sentinel_mode')).toBeInTheDocument();
        expect(screen.getByText('PPE_NON_COMPLIANCE')).toBeInTheDocument();
        expect(screen.getByText('Missing Hard Hat.')).toBeInTheDocument();
        expect(screen.getByText('dashboard.auto_calibrated')).toBeInTheDocument();
    });

    it('calculates the displacement formatting correctly', () => {
        render(<DraftDashboard data={mockData} onConfirm={() => { }} onUpload={() => { }} onExport={() => { }} />);
        expect(screen.getByText('55,000')).toBeInTheDocument();
    });
});
