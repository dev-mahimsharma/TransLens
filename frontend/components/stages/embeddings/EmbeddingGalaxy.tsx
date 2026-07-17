"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Sparkles, Line, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { pca } from "@/lib/engine/Pca";
import { cosineSimilarity, topKNeighbors } from "@/lib/engine/similarity";

const SPREAD = 6;

// Instead of a fixed absolute similarity cutoff (the old approach --
// tuned for the curated word bank's decontextualized embeddings, which
// have a very different similarity range than real prompt tokens'
// combined token+position embeddings), connections are now chosen
// RELATIVE to this specific set of vectors: always draw the top
// fraction of the strongest pairs that exist, whatever their absolute
// value happens to be. This guarantees lines actually appear regardless
// of which kind of embedding is being shown.
const CONNECTION_FRACTION = 0.25;

export interface GalaxyWordData {
  word: string;
  color: string;
}

interface EmbeddingGalaxyProps {
  words: GalaxyWordData[];
  vectors: number[][];
  selectedIndex: number | null;
  hoveredIndex: number | null;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
  revealStagger?: number;
}

export function EmbeddingGalaxy({
  words,
  vectors,
  selectedIndex,
  hoveredIndex,
  onSelect,
  onHover,
  revealStagger = 0,
}: EmbeddingGalaxyProps) {
  const controlsRef = useRef<InstanceType<typeof CameraControls> | null>(null);

  const positions = useMemo(() => {
    if (vectors.length < 2) return [];
    const projection = pca(vectors, 3);
    return projection.points.map(([x, y, z]) => [x * SPREAD, y * SPREAD, (z ?? 0) * SPREAD] as [number, number, number]);
  }, [vectors]);

  const activeIndex = hoveredIndex ?? selectedIndex;
  const neighborIndices = useMemo(() => {
    if (activeIndex === null) return new Set<number>();
    return new Set(topKNeighbors(vectors, activeIndex, Math.min(4, vectors.length - 1)));
  }, [activeIndex, vectors]);

  const connections = useMemo(() => {
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
    return kept.map((c) => ({ ...c, normalizedStrength: (c.sim - minSim) / range }));
  }, [vectors]);

  function flyTo(position: [number, number, number]) {
    const [x, y, z] = position;
    controlsRef.current?.setLookAt(x + 2.5, y + 1.5, z + 4, x, y, z, true);
  }

  if (positions.length === 0) return null;

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-2xl border border-graphite-dim bg-[#050609]">
      <Canvas camera={{ position: [8, 6, 10], fov: 50 }}>
        <color attach="background" args={["#050609"]} />
        <fog attach="fog" args={["#050609", 12, 28]} />

        <ambientLight intensity={0.35} />
        <pointLight position={[10, 10, 10]} intensity={90} color="#4CE0D2" />
        <pointLight position={[-10, -6, -10]} intensity={40} color="#9B7FFF" />
        <Sparkles count={250} scale={22} size={1.8} speed={0.15} opacity={0.35} color="#4CE0D2" />

        {connections.map((c, i) => (
          <Line
            key={i}
            points={[positions[c.from], positions[c.to]]}
            color="#6FE8DC"
            transparent
            opacity={0.12 + c.normalizedStrength * 0.55}
            lineWidth={1 + c.normalizedStrength * 1.5}
          />
        ))}

        {words.map((w, i) => {
          const isHovered = hoveredIndex === i;
          const isSelected = selectedIndex === i;
          const isNeighbor = neighborIndices.has(i);
          const isDimmed = activeIndex !== null && !isHovered && !isSelected && !isNeighbor;
          return (
            <GalaxyPoint
              key={w.word}
              word={w.word}
              color={w.color}
              targetPosition={positions[i]}
              isHovered={isHovered}
              isSelected={isSelected}
              isNeighbor={isNeighbor}
              isDimmed={isDimmed}
              revealDelay={i * revealStagger}
              onPointerOver={() => onHover(i)}
              onPointerOut={() => onHover(null)}
              onClick={() => {
                onSelect(i);
                flyTo(positions[i]);
              }}
            />
          );
        })}

        <CameraControls ref={controlsRef} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={1.1} radius={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

function GalaxyPoint({
  word,
  color,
  targetPosition,
  isHovered,
  isSelected,
  isNeighbor,
  isDimmed,
  revealDelay = 0,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  word: string;
  color: string;
  targetPosition: [number, number, number];
  isHovered: boolean;
  isSelected: boolean;
  isNeighbor: boolean;
  isDimmed: boolean;
  revealDelay?: number;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(revealDelay > 0 ? 0 : 1);
  const [revealed, setRevealed] = useState(revealDelay === 0);

  useEffect(() => {
    if (revealDelay === 0) return;
    const timer = setTimeout(() => setRevealed(true), revealDelay);
    return () => clearTimeout(timer);
  }, [revealDelay]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.lerp(new THREE.Vector3(...targetPosition), 0.1);
    const target = revealed ? 1 : 0;
    scaleRef.current += (target - scaleRef.current) * 0.12;
    groupRef.current.scale.setScalar(scaleRef.current);
  });

  const isEmphasized = isHovered || isSelected || isNeighbor;

  return (
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
        <sphereGeometry args={[isSelected ? 0.26 : isHovered ? 0.22 : 0.15, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isEmphasized ? 1.8 : 0.7}
          transparent
          opacity={isDimmed ? 0.2 : 1}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {isSelected && (
        <mesh>
          <ringGeometry args={[0.34, 0.39, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* pointerEvents: "none" on the Html wrapper itself (not just the
          inner span) is the actual fix for clicks/hovers not registering:
          drei's Html renders a real DOM element positioned exactly over
          the point, and without this, THAT element -- not the mesh
          behind it -- was very likely eating the click/hover events. */}
      <Html distanceFactor={10} center style={{ pointerEvents: "none" }}>
        <span
          className="whitespace-nowrap font-mono text-xs transition-opacity"
          style={{ color: isDimmed ? "#4A4E5A" : "#EDEEF2", opacity: isDimmed ? 0.35 : 1 }}
        >
          {word}
        </span>
      </Html>
    </group>
  );
}