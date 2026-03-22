import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Theoretical shader code for a simple stylized ocean
const OceanMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uColorWater: { value: new THREE.Color('#006994') },
        uColorFoam: { value: new THREE.Color('#ffffff') },
        uWaveHeight: { value: 0.5 }, // Controls sea state
    },
    vertexShader: `
    uniform float uTime;
    uniform float uWaveHeight;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Simple sine wave simulation
      float elevation = sin(pos.x * 0.1 + uTime) * sin(pos.z * 0.1 + uTime * 0.5) * uWaveHeight;
      elevation += sin(pos.x * 0.3 + uTime * 2.0) * 0.1; // Detail
      
      pos.y += elevation;
      vElevation = elevation;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 uColorWater;
    uniform vec3 uColorFoam;
    varying float vElevation;

    void main() {
      float mixStrength = (vElevation + 1.0) * 0.5;
      vec3 color = mix(uColorWater, uColorFoam, smoothstep(0.4, 1.0, mixStrength)); 
      
      gl_FragColor = vec4(color, 0.9); // Slight transparency
    }
  `
};

export const OceanShader: React.FC<{ variance?: number }> = ({ variance = 0 }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Map variance (0-500) to wave height (0.2 - 2.0)
    const waveHeight = useMemo(() => {
        if (variance < 50) return 0.2; // Calm
        if (variance < 200) return 0.8; // Slight
        return 2.5; // Moderate/Rough
    }, [variance]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            materialRef.current.uniforms.uWaveHeight.value = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uWaveHeight.value,
                waveHeight,
                0.05
            );
        }
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[500, 500, 128, 128]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={OceanMaterial.uniforms}
                vertexShader={OceanMaterial.vertexShader}
                fragmentShader={OceanMaterial.fragmentShader}
                transparent={true}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};
