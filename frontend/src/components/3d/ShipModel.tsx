import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

interface ShipProps {
    draft: number;
    roll?: number; // List in degrees
    trim?: number; // Trim in meters (Aft - Fwd)
    name?: string;
    lbp?: number;  // Length between perpendiculars
    cargoPercentage?: number; // 0-100
}

export const ShipModel: React.FC<ShipProps> = ({ draft, roll = 0, trim = 0, lbp = 185, cargoPercentage = 0 }) => {
    const shipRef = useRef<THREE.Group>(null);

    // Procedural Hull Geometry (Simplistic Bulk Carrier Shape)
    // Length: 185m (scaled down), Beam: 32m, Depth: 18m
    // We scale 1 unit = 1 meter for simplicity in this view

    useFrame((state) => {
        if (shipRef.current) {
            // Smooth interpolation for physics-like movement
            shipRef.current.rotation.z = THREE.MathUtils.lerp(shipRef.current.rotation.z, roll * (Math.PI / 180), 0.1); // Roll (List)

            // Trim (Pitch) Calculation: Angle = Atan(Trim / LBP)
            const trimAngle = Math.atan(trim / lbp);
            shipRef.current.rotation.x = THREE.MathUtils.lerp(shipRef.current.rotation.x, trimAngle, 0.1);

            // Heave (Vertical movement based on draft)
            // Visual offset: If draft increases, ship goes DOWN (negative Y)
            const targetY = -draft;
            shipRef.current.position.y = THREE.MathUtils.lerp(shipRef.current.position.y, targetY, 0.05);

            // Gentle floating animation (Bobbing)
            shipRef.current.position.y += Math.sin(state.clock.elapsedTime) * 0.05;
        }
    });

    return (
        <group ref={shipRef}>
            <group position={[0, 9, 0]}>
                <Box args={[32, 18, 185]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#333" roughness={0.7} />
                </Box>
                <Box args={[32.1, 8, 185.1]} position={[0, -5, 0]}>
                    <meshStandardMaterial color="#8B0000" roughness={0.8} />
                </Box>
                <Box args={[28, 12, 15]} position={[0, 15, -75]}>
                    <meshStandardMaterial color="#FFF" />
                </Box>
                <group>
                    {[...Array(5)].map((_, i) => (
                        <group key={i}>
                            {/* Hatch Covers */}
                            <Box args={[24, 2, 20]} position={[0, 10, -40 + (i * 25)]}>
                                <meshStandardMaterial color="#550000" />
                            </Box>

                            {/* Internal Cargo Visualization */}
                            {cargoPercentage > 0 && (
                                <Box
                                    args={[22, (cargoPercentage / 100) * 16, 18]}
                                    position={[0, -8 + ((cargoPercentage / 100) * 16) / 2, -40 + (i * 25)]}
                                >
                                    <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.2} transparent opacity={0.8} />
                                </Box>
                            )}
                        </group>
                    ))}
                </group>
                {/* Text removed to prevent CDN issues */}
            </group>
        </group>
    );
};
