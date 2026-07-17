"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CameraControls, Sparkles, Line, QuadraticBezierLine, Html, Grid } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { pca } from "@/lib/engine/Pca";
import { cosineSimilarity, topKNeighbors } from "@/lib/engine/similarity";

// Scoped to THIS component only, per the conversation decision -- does
// NOT touch globals.css or tailwind.config.ts, so nothing else in the
// app is affected by this palette.
const PALETTE = {
  background: "#05070D",
  primary: "#4F7CFF",
  secondary: "#6EE7FF",
  accent: "#8B5CF6",
  highlight: "#00F5D4",
  selected: "#FFD166",
  danger: "#FF5E7A",
  text: "#F8FAFC",
  muted: "#94A3B8",
  glass: "rgba(20,25,35,.55)",
  border: "rgba(255,255,255,.08)",
} as const;

const SPREAD = 6;
const CONNECTION_FRACTION = 0.25;
const LABEL_VISIBLE_DISTANCE = 9; // labels only render once the camera is this close or closer

export interface PremiumTokenData {
  text: string;
  id: number;
}

interface PremiumEmbeddingGraphProps {
  tokens: PremiumTokenData[];
  vectors: number[][]; // full-dimensional, source of truth
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  revealStagger?: number;
  showLabels?: boolean;
  showSimilarityLinks?: boolean;
  showParticles?: boolean;
}

function magnitudeOf(vector: number[]): number {
  return Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
}

export function PremiumEmbeddingGraph({
  tokens,
  vectors,
  selectedIndex,
  onSelect,
  revealStagger = 0,
  showLabels = true,
  showSimilarityLinks = true,
  showParticles = true,
}: PremiumEmbeddingGraphProps) {
  const controlsRef = useRef<InstanceType<typeof CameraControls> | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const positions = useMemo(() => {
    if (vectors.length < 2) return [];
    const projection = pca(vectors, 3);
    return projection.points.map(
      ([x, y, z]) => [x * SPREAD, y * SPREAD, (z ?? 0) * SPREAD] as [number, number, number]
    );
  }, [vectors]);

  // In-prompt frequency -- how many tokens in THIS prompt share the exact
  // same text. Real, computable data; not a fabricated corpus statistic.
  const frequencies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tokens) counts.set(t.text, (counts.get(t.text) ?? 0) + 1);
    return tokens.map((t) => counts.get(t.text) ?? 1);
  }, [tokens]);

  const magnitudes = useMemo(() => vectors.map(magnitudeOf), [vectors]);

  const activeIndex = hoveredIndex ?? selectedIndex;
  const neighborIndices = useMemo(() => {
    if (activeIndex === null) return new Set<number>();
    return new Set(topKNeighbors(vectors, activeIndex, Math.min(4, vectors.length - 1)));
  }, [activeIndex, vectors]);

  const connections = useMemo(() => {
    if (!showSimilarityLinks) return [];
    const all: { from: number; to: number; sim: number }[] = [];
    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        all.push({ from: i, to: j, sim: cosineSimilarity(vectors[i], vectors[j]) });
      }
    }
    if (all.length === 0) return [];
    all.sort((a, b) => b.sim - a.sim);
    const keepCount = Math.max(1, Math.ceil(all.length * CONNECTION_FRACTION));
    const kept = all.slice(0, keepCount);
    const maxSim = kept[0].sim;
    const minSim = kept[kept.length - 1].sim;
    const range = maxSim - minSim || 1;
    return kept.map((c) => ({ ...c, strength: (c.sim - minSim) / range }));
  }, [vectors, showSimilarityLinks]);

  function flyTo(position: [number, number, number]) {
    const [x, y, z] = position;
    controlsRef.current?.setLookAt(x + 2.5, y + 1.8, z + 4.2, x, y, z, true);
  }

  function resetCamera() {
    controlsRef.current?.setLookAt(8, 6, 10, 0, 0, 0, true);
  }

  if (positions.length === 0) return null;

  return (
    <div
      className="relative h-[600px] w-full overflow-hidden rounded-2xl border"
      style={{ borderColor: PALETTE.border, background: PALETTE.background }}
    >
      <Canvas camera={{ position: [8, 6, 10], fov: 50 }} gl={{ antialias: true }}>
        <color attach="background" args={[PALETTE.background]} />
        <fog attach="fog" args={[PALETTE.background, 12, 30]} />

        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={100} color={PALETTE.primary} />
        <pointLight position={[-10, -6, -10]} intensity={50} color={PALETTE.accent} />
        <pointLight position={[0, 12, 0]} intensity={30} color={PALETTE.secondary} />

        {showParticles && (
          <Sparkles count={300} scale={24} size={1.6} speed={0.12} opacity={0.3} color={PALETTE.secondary} />
        )}

        <Grid
          position={[0, -4, 0]}
          args={[30, 30]}
          cellSize={1}
          cellThickness={0.5}
          cellColor={PALETTE.border}
          sectionSize={5}
          sectionThickness={1}
          sectionColor={PALETTE.primary}
          fadeDistance={22}
          fadeStrength={1}
          infiniteGrid
        />

        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color={PALETTE.muted} transparent opacity={0.6} />
        </mesh>

        {connections.map((c, i) => {
          const midpoint = new THREE.Vector3(
            (positions[c.from][0] + positions[c.to][0]) / 2,
            (positions[c.from][1] + positions[c.to][1]) / 2 + 0.6,
            (positions[c.from][2] + positions[c.to][2]) / 2
          );
          return (
            <QuadraticBezierLine
              key={i}
              start={positions[c.from]}
              end={positions[c.to]}
              mid={midpoint}
              color={PALETTE.secondary}
              transparent
              opacity={0.08 + c.strength * 0.4}
              lineWidth={0.8 + c.strength * 1.2}
            />
          );
        })}

        {tokens.map((t, i) => {
          const isHovered = hoveredIndex === i;
          const isSelected = selectedIndex === i;
          const isNeighbor = neighborIndices.has(i);
          const isDimmed = activeIndex !== null && !isHovered && !isSelected && !isNeighbor;
          return (
            <VectorNode
              key={`${t.text}-${i}`}
              token={t.text}
              tokenId={t.id}
              targetPosition={positions[i]}
              magnitude={magnitudes[i]}
              frequency={frequencies[i]}
              totalTokens={tokens.length}
              similarityToSelected={
                selectedIndex !== null && selectedIndex !== i
                  ? cosineSimilarity(vectors[i], vectors[selectedIndex])
                  : null
              }
              isHovered={isHovered}
              isSelected={isSelected}
              isNeighbor={isNeighbor}
              isDimmed={isDimmed}
              revealDelay={i * revealStagger}
              showLabels={showLabels}
              onPointerOver={() => setHoveredIndex(i)}
              onPointerOut={() => setHoveredIndex(null)}
              onClick={() => {
                onSelect(isSelected ? null : i);
                flyTo(positions[i]);
              }}
            />
          );
        })}

        <CameraControls ref={controlsRef} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.12} luminanceSmoothing={0.9} intensity={1.2} radius={0.65} />
        </EffectComposer>
      </Canvas>

      <button
        onClick={resetCamera}
        className="absolute right-4 top-4 rounded-lg border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-opacity hover:opacity-80"
        style={{ background: PALETTE.glass, borderColor: PALETTE.border, color: PALETTE.text }}
      >
        Reset Camera
      </button>
    </div>
  );
}

function VectorNode({
  token,
  targetPosition,
  magnitude,
  frequency,
  totalTokens,
  similarityToSelected,
  isHovered,
  isSelected,
  isNeighbor,
  isDimmed,
  revealDelay = 0,
  showLabels,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  token: string;
  tokenId: number;
  targetPosition: [number, number, number];
  magnitude: number;
  frequency: number;
  totalTokens: number;
  similarityToSelected: number | null;
  isHovered: boolean;
  isSelected: boolean;
  isNeighbor: boolean;
  isDimmed: boolean;
  revealDelay?: number;
  showLabels: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(revealDelay > 0 ? 0 : 1);
  const [revealed, setRevealed] = useState(revealDelay === 0);
  const [closeEnoughForLabel, setCloseEnoughForLabel] = useState(false);
  const labelVisibleRef = useRef(false);

  useEffect(() => {
    if (revealDelay === 0) return;
    const timer = setTimeout(() => setRevealed(true), revealDelay);
    return () => clearTimeout(timer);
  }, [revealDelay]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.lerp(new THREE.Vector3(...targetPosition), 0.1);

    const target = revealed ? 1 : 0;
    scaleRef.current += (target - scaleRef.current) * 0.12;

    const pulse = isHovered ? 1 + Math.sin(state.clock.elapsedTime * 6) * 0.08 : 1;
    groupRef.current.scale.setScalar(scaleRef.current * pulse);

    if (ringRef.current && isSelected) {
      ringRef.current.rotation.z += 0.015;
      const ringPulse = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.06;
      ringRef.current.scale.setScalar(ringPulse);
    }

    const dist = state.camera.position.distanceTo(groupRef.current.position);
    const shouldShow = dist < LABEL_VISIBLE_DISTANCE;
    if (shouldShow !== labelVisibleRef.current) {
      labelVisibleRef.current = shouldShow;
      setCloseEnoughForLabel(shouldShow);
    }
  });

  const isEmphasized = isHovered || isSelected || isNeighbor;
  const color = isSelected ? PALETTE.selected : isNeighbor ? PALETTE.highlight : PALETTE.primary;

  return (
    <group>
      <Line
        points={[[0, 0, 0], targetPosition]}
        vertexColors={[
          [0.15, 0.15, 0.2],
          new THREE.Color(color).toArray() as [number, number, number],
        ]}
        transparent
        opacity={isDimmed ? 0.15 : 0.55}
        lineWidth={1.2}
      />

      <group ref={groupRef}>
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            onPointerOver();
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onPointerOut();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <sphereGeometry args={[isSelected ? 0.28 : isHovered ? 0.24 : 0.16, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isEmphasized ? 2 : 0.7}
            transparent
            opacity={isDimmed ? 0.2 : 1}
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>

        {isSelected && (
          <mesh ref={ringRef}>
            <ringGeometry args={[0.38, 0.44, 32]} />
            <meshBasicMaterial color={PALETTE.selected} transparent opacity={0.75} side={THREE.DoubleSide} />
          </mesh>
        )}

        {showLabels && closeEnoughForLabel && (
          <Html distanceFactor={10} center style={{ pointerEvents: "none" }}>
            <span
              className="whitespace-nowrap font-mono text-xs"
              style={{ color: isDimmed ? PALETTE.muted : PALETTE.text, opacity: isDimmed ? 0.35 : 1 }}
            >
              {token}
            </span>
          </Html>
        )}

        {isHovered && (
          <Html distanceFactor={8} position={[0, 0.5, 0]} style={{ pointerEvents: "none" }}>
            <div
              className="w-48 rounded-lg border p-3 text-xs backdrop-blur-md"
              style={{ background: PALETTE.glass, borderColor: PALETTE.border, color: PALETTE.text }}
            >
              <p className="font-mono font-medium" style={{ color: PALETTE.highlight }}>
                &ldquo;{token}&rdquo;
              </p>
              <div className="mt-1.5 space-y-0.5 font-mono" style={{ color: PALETTE.muted }}>
                <p>pos [{targetPosition.map((v) => v.toFixed(1)).join(", ")}]</p>
                <p>magnitude {magnitude.toFixed(2)}</p>
                {similarityToSelected !== null && <p>similarity {(similarityToSelected * 100).toFixed(1)}%</p>}
                <p>
                  frequency {frequency}/{totalTokens} in prompt
                </p>
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}