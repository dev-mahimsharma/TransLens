"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, Sparkles, Line, QuadraticBezierLine, Html, Grid, Billboard } from "@react-three/drei";
import { EffectComposer, Bloom, SMAA, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { pca } from "@/lib/engine/Pca";
import { cosineSimilarity, topKNeighbors } from "@/lib/engine/similarity";

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
const LABEL_VISIBLE_DISTANCE = 9;

export interface PremiumTokenData {
  text: string;
  id: number;
}

interface PremiumEmbeddingGraphProps {
  tokens: PremiumTokenData[];
  vectors: number[][];
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  revealStagger?: number;
}

function magnitudeOf(vector: number[]): number {
  return Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
}

/**
 * Bridges the Canvas's internal WebGL renderer/canvas element out to the
 * parent component -- needed because the toolbar's Screenshot button
 * lives OUTSIDE the <Canvas>, but only code running inside a Canvas has
 * access to `gl` via useThree(). This component renders nothing; it just
 * hands the canvas element up once on mount.
 */
function CanvasBridge({ onReady }: { onReady: (canvas: HTMLCanvasElement) => void }) {
  const { gl } = useThree();
  useEffect(() => {
    onReady(gl.domElement);
  }, [gl, onReady]);
  return null;
}

export function PremiumEmbeddingGraph({
  tokens,
  vectors,
  selectedIndex,
  onSelect,
  revealStagger = 0,
}: PremiumEmbeddingGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<InstanceType<typeof CameraControls> | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Toolbar state -- all owned here rather than lifted to the parent,
  // since these are purely display preferences for this visualization,
  // not something the rest of the page needs to know about.
  const [showLabels, setShowLabels] = useState(true);
  const [showSimilarityLinks, setShowSimilarityLinks] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const positions = useMemo(() => {
    if (vectors.length < 2) return [];
    const projection = pca(vectors, 3);
    return projection.points.map(
      ([x, y, z]) => [x * SPREAD, y * SPREAD, (z ?? 0) * SPREAD] as [number, number, number]
    );
  }, [vectors]);

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

  function handleSearch() {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;
    const index = tokens.findIndex((t) => t.text.toLowerCase().includes(query));
    if (index === -1) {
      setSearchError(`No token matching "${searchQuery}"`);
      return;
    }
    setSearchError(null);
    onSelect(index);
    flyTo(positions[index]);
  }

  function handleScreenshot() {
    const canvas = canvasElRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `embedding-graph-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }

  if (positions.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative h-[600px] w-full overflow-hidden rounded-2xl border"
      style={{ borderColor: PALETTE.border, background: PALETTE.background }}
    >
      <Canvas camera={{ position: [8, 6, 10], fov: 50 }} gl={{ antialias: true, preserveDrawingBuffer: true }} dpr={[1, 1.5]}>
        <CanvasBridge onReady={(canvas) => (canvasElRef.current = canvas)} />
        <color attach="background" args={[PALETTE.background]} />

        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={100} color={PALETTE.primary} />
        <pointLight position={[-10, -6, -10]} intensity={50} color={PALETTE.accent} />
        <pointLight position={[0, 12, 0]} intensity={30} color={PALETTE.secondary} />

        {showParticles && (
          <Sparkles count={150} scale={22} size={1.4} speed={0.1} opacity={0.25} color={PALETTE.secondary} />
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

        <CameraControls ref={controlsRef} makeDefault />
        <EffectComposer multisampling={0}>
          {/* SSAO and DepthOfField are removed -- they were the actual
              cause of both the lag and the unwanted haze/blur. Bloom
              intensity is also turned down since the primary "glow"
              language is now the ring boundary around each node, not a
              heavy bloom wash over the whole scene. */}
          <Bloom luminanceThreshold={0.25} luminanceSmoothing={0.85} intensity={0.5} radius={0.4} />
          <SMAA />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>

      {/* Consolidated glass toolbar -- bottom overlay, all controls in one place */}
      <div
        className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2 rounded-xl border p-2 backdrop-blur-md"
        style={{ background: PALETTE.glass, borderColor: PALETTE.border }}
      >
        <div className="flex min-w-[160px] flex-1 items-center gap-1.5">
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search token…"
            className="w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-xs outline-none"
            style={{ borderColor: PALETTE.border, color: PALETTE.text }}
          />
          <button
            onClick={handleSearch}
            className="shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ borderColor: PALETTE.border, color: PALETTE.secondary }}
          >
            Go
          </button>
        </div>

        <ToolbarToggle label="Labels" active={showLabels} onClick={() => setShowLabels((v) => !v)} />
        <ToolbarToggle label="Links" active={showSimilarityLinks} onClick={() => setShowSimilarityLinks((v) => !v)} />
        <ToolbarToggle label="Particles" active={showParticles} onClick={() => setShowParticles((v) => !v)} />

        <ToolbarButton label="Screenshot" onClick={handleScreenshot} />
        <ToolbarButton label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} onClick={toggleFullscreen} />
        <ToolbarButton label="Reset Camera" onClick={resetCamera} />
      </div>

      {searchError && (
        <div
          className="absolute bottom-16 left-3 rounded-lg border px-3 py-1.5 text-xs backdrop-blur-md"
          style={{ background: PALETTE.glass, borderColor: PALETTE.danger, color: PALETTE.danger }}
        >
          {searchError}
        </div>
      )}
    </div>
  );
}

function ToolbarToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
      style={{
        borderColor: active ? PALETTE.primary : PALETTE.border,
        color: active ? PALETTE.primary : PALETTE.muted,
        background: active ? "rgba(79,124,255,0.12)" : "transparent",
      }}
    >
      {label}
    </button>
  );
}

function ToolbarButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
      style={{ borderColor: "rgba(255,255,255,.08)", color: "#F8FAFC" }}
    >
      {label}
    </button>
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
  const scaleRef = useRef(revealDelay > 0 ? 0 : 1);
  const sizeScaleRef = useRef(1);
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

    const revealTarget = revealed ? 1 : 0;
    scaleRef.current += (revealTarget - scaleRef.current) * 0.12;

    // Click-only sizing: hover no longer changes size or pulses at all --
    // only selection does, and it smoothly eases toward the target scale
    // each frame (not an instant snap), then eases back down the moment
    // it's deselected. Sphere and ring share this same group, so they
    // grow and shrink together as one unit.
    const sizeTarget = isSelected ? 1.55 : 1;
    sizeScaleRef.current += (sizeTarget - sizeScaleRef.current) * 0.15;

    groupRef.current.scale.setScalar(scaleRef.current * sizeScaleRef.current);

    const dist = state.camera.position.distanceTo(groupRef.current.position);
    const shouldShow = dist < LABEL_VISIBLE_DISTANCE;
    if (shouldShow !== labelVisibleRef.current) {
      labelVisibleRef.current = shouldShow;
      setCloseEnoughForLabel(shouldShow);
    }
  });

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
          <sphereGeometry args={[0.17, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 1.6 : isHovered || isNeighbor ? 1.1 : 0.5}
            transparent
            opacity={isDimmed ? 0.2 : 1}
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>

        {/* Always-present transparent white boundary ring -- this is the
            primary "this is a vector node" visual language now, instead
            of a heavy bloom-driven glow. Billboard keeps it always facing
            the camera, since a flat ring would look like a thin line from
            most viewing angles otherwise. It brightens and grows (via the
            group's own scale above) only when selected. */}
        <Billboard>
          <mesh>
            <ringGeometry args={[0.26, 0.29, 40]} />
            <meshBasicMaterial
              color={isSelected ? PALETTE.selected : PALETTE.text}
              transparent
              opacity={isDimmed ? 0.1 : isSelected ? 0.85 : 0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Billboard>

        {showLabels && closeEnoughForLabel && (
          <Html distanceFactor={10} center style={{ pointerEvents: "none" }}>
            <span
              className="whitespace-nowrap font-mono text-xs"
              style={{ color: isSelected ? "#000000" : isDimmed ? PALETTE.muted : PALETTE.text, opacity: isDimmed ? 0.35 : 1 }}
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