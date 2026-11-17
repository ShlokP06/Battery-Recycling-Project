/* eslint-disable react-hooks/refs, react-hooks/immutability -- react-three-fiber mutates refs inside useFrame by design */
"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export type Story = { lift: number; unroll: number; fade: number; q: number };
type StoryRef = { current: Story };

// ---------- spiral electrode ribbons (jelly roll) that unwind into flat sheets ----------
const TURNS = 5;
const R0 = 0.22;
const PITCH = 0.13;
const HGT = 2.8;
const SEG = 240;
const SHEET_W = 7.4;

type Ribbon = { spiral: Float32Array; flat: Float32Array; init: Float32Array; index: Uint32Array };

function buildRibbon(layer: number): Ribbon {
  const spiral = new Float32Array((SEG + 1) * 2 * 3);
  const flat = new Float32Array((SEG + 1) * 2 * 3);
  const arc: number[] = [0];
  const pts: [number, number][] = [];
  for (let k = 0; k <= SEG; k++) {
    const s = k / SEG;
    const th = s * TURNS * 2 * Math.PI;
    const r = R0 + (PITCH * th) / (2 * Math.PI) + (layer * PITCH) / 4;
    pts.push([r * Math.cos(th), r * Math.sin(th)]);
    if (k > 0) arc.push(arc[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  }
  const L = arc[SEG];
  for (let k = 0; k <= SEG; k++) {
    for (let side = 0; side < 2; side++) {
      const y = side === 0 ? -HGT / 2 : HGT / 2;
      const i = (k * 2 + side) * 3;
      spiral[i] = pts[k][0];
      spiral[i + 1] = y;
      spiral[i + 2] = pts[k][1];
      flat[i] = (arc[k] / L - 0.5) * SHEET_W;
      flat[i + 1] = y + (layer - 1.5) * 0.16;
      flat[i + 2] = (layer - 1.5) * 0.55;
    }
  }
  const index = new Uint32Array(SEG * 6);
  for (let k = 0; k < SEG; k++) {
    const a = k * 2;
    index.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], k * 6);
  }
  return { spiral, flat, init: spiral.slice(), index };
}

const LAYERS = [
  { name: "cathode", color: "#1f3a2c", metal: 0.35, rough: 0.55 },
  { name: "separator", color: "#e9e0c9", metal: 0.0, rough: 0.85 },
  { name: "anode", color: "#b06a3b", metal: 0.85, rough: 0.38 },
  { name: "separator2", color: "#e9e0c9", metal: 0.0, rough: 0.85 },
] as const;

function JellyRoll({ st }: { st: StoryRef }) {
  const ribbons = useMemo(() => LAYERS.map((_, i) => buildRibbon(i)), []);
  const geos = useRef<THREE.BufferGeometry[]>([]);
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  const last = useRef(-1);
  const lastFade = useRef(-1);

  useFrame(() => {
    const { unroll, fade } = st.current;
    if (Math.abs(unroll - last.current) > 1e-4) {
      last.current = unroll;
      geos.current.forEach((g, li) => {
        if (!g) return;
        const pos = g.attributes.position as THREE.BufferAttribute;
        const { spiral, flat } = ribbons[li];
        const arr = pos.array as Float32Array;
        for (let i = 0; i < arr.length; i++) arr[i] = mix(spiral[i], flat[i], unroll);
        pos.needsUpdate = true;
        g.computeVertexNormals();
      });
    }
    if (Math.abs(fade + unroll * 2 - lastFade.current) > 1e-4) {
      lastFade.current = fade + unroll * 2;
      mats.current.forEach((m, li) => {
        if (!m) return;
        const isElectrode = li === 0 || li === 2;
        m.opacity = isElectrode ? mix(1, 0.18, fade) : mix(0.95, 0.28, unroll) * (1 - fade);
        m.visible = m.opacity > 0.01;
      });
    }
  });

  return (
    <group>
      {ribbons.map((r, li) => (
        <mesh key={li}>
          <bufferGeometry
            ref={(g) => {
              if (g) geos.current[li] = g as unknown as THREE.BufferGeometry;
            }}
          >
            <bufferAttribute attach="attributes-position" args={[r.init, 3]} />
            <bufferAttribute attach="index" args={[r.index, 1]} />
          </bufferGeometry>
          <meshStandardMaterial
            ref={(m) => {
              if (m) mats.current[li] = m;
            }}
            color={LAYERS[li].color}
            metalness={LAYERS[li].metal}
            roughness={LAYERS[li].rough}
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

// ---------- steel casing ----------
function Casing({ st }: { st: StoryRef }) {
  const ref = useRef<THREE.Group>(null);
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  useFrame(() => {
    if (!ref.current) return;
    const lift = st.current.lift;
    ref.current.position.y = lift * 5.2;
    ref.current.rotation.y = lift * 1.4;
    const o = 1 - smooth(0.55, 1, lift);
    mats.current.forEach((m) => {
      if (!m) return;
      m.opacity = o;
      m.visible = o > 0.01;
    });
  });
  const set = (i: number) => (m: THREE.MeshStandardMaterial | null) => {
    if (m) mats.current[i] = m;
  };
  const steel = { color: "#c3c5c0", metalness: 0.95, roughness: 0.28, transparent: true } as const;
  return (
    <group ref={ref}>
      <mesh>
        <cylinderGeometry args={[1.04, 1.04, 3.0, 96, 1, true]} />
        <meshStandardMaterial ref={set(0)} {...steel} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[1.04, 1.04, 0.07, 96]} />
        <meshStandardMaterial ref={set(1)} {...steel} />
      </mesh>
      <mesh position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.38, 0.4, 0.14, 48]} />
        <meshStandardMaterial ref={set(2)} {...steel} color="#d9dad5" />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[1.04, 1.04, 0.07, 96]} />
        <meshStandardMaterial ref={set(3)} {...steel} />
      </mesh>
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.045, 0.02, 12, 96]} />
        <meshStandardMaterial ref={set(4)} {...steel} color="#9fa19c" />
      </mesh>
      {/* green sleeve band */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[1.052, 1.052, 2.2, 96, 1, true]} />
        <meshStandardMaterial ref={set(5)} {...steel} color="#1c382b" metalness={0.15} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------- black-mass particles ----------
const N = 6000;
function Particles({ st, recovered }: { st: StoryRef; recovered: number }) {
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    let s = 1234567;
    const rnd = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
    const origin = new Float32Array(N * 3);
    const target = new Float32Array(N * 3);
    const delay = new Float32Array(N);
    const seed = new Float32Array(N);
    const col = new Float32Array(N * 3);
    const green = [new THREE.Color("#1c382b"), new THREE.Color("#2c5a42"), new THREE.Color("#4f8a69")];
    const grey = new THREE.Color("#a5a49b");
    const isRec = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const layer = rnd() < 0.5 ? 0 : 2;
      origin[i * 3] = (rnd() - 0.5) * SHEET_W;
      origin[i * 3 + 1] = (rnd() - 0.5) * HGT;
      origin[i * 3 + 2] = (layer - 1.5) * 0.55;
      const rec = rnd() < recovered / 100;
      isRec[i] = rec ? 1 : 0;
      if (rec) {
        const a = rnd() * Math.PI * 2;
        const rr = Math.sqrt(rnd()) * 1.35;
        const hgt = (1 - (rr / 1.35) ** 2) * 0.75 * rnd();
        target[i * 3] = Math.cos(a) * rr;
        target[i * 3 + 1] = -3.05 + hgt;
        target[i * 3 + 2] = Math.sin(a) * rr * 0.7;
        const c = green[Math.floor(rnd() * 3)];
        col.set([c.r, c.g, c.b], i * 3);
      } else {
        target[i * 3] = 3.3 + (rnd() - 0.5) * 1.4;
        target[i * 3 + 1] = -3.2 + rnd() * 0.35;
        target[i * 3 + 2] = (rnd() - 0.5) * 1.2;
        col.set([grey.r, grey.g, grey.b], i * 3);
      }
      delay[i] = rnd() * 0.45;
      seed[i] = rnd() * Math.PI * 2;
    }
    return { origin, target, delay, seed, col, pos: new Float32Array(N * 3) };
  }, [recovered]);

  useFrame(({ clock }) => {
    const pts = ref.current;
    if (!pts) return;
    const t = clock.elapsedTime;
    const q = st.current.q;
    const pos = data.pos;
    for (let i = 0; i < N; i++) {
      const p = smooth(0, 1, clamp((q * 1.45 - data.delay[i]) / 0.55));
      const sw = Math.sin(p * Math.PI) * 0.35;
      pos[i * 3] = mix(data.origin[i * 3], data.target[i * 3], p) + Math.sin(data.seed[i] + t * 0.8) * sw * 0.4;
      pos[i * 3 + 1] = mix(data.origin[i * 3 + 1], data.target[i * 3 + 1], p * p) + Math.cos(data.seed[i] * 1.7 + t) * sw * 0.15;
      pos[i * 3 + 2] = mix(data.origin[i * 3 + 2], data.target[i * 3 + 2], p) + Math.sin(data.seed[i] * 2.3 + t * 0.6) * sw * 0.4;
    }
    const attr = pts.geometry.attributes.position as THREE.BufferAttribute;
    (attr.array as Float32Array).set(pos);
    attr.needsUpdate = true;
    (pts.material as THREE.PointsMaterial).opacity = smooth(0.0, 0.08, q);
    pts.visible = q > 0.001;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.col, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} vertexColors transparent opacity={0} depthWrite={false} sizeAttenuation />
    </points>
  );
}

// ---------- scene ----------
function Rig({ progress, recovered, narrow }: { progress: { current: number }; recovered: number; narrow: boolean }) {
  const group = useRef<THREE.Group>(null);
  const smoothP = useRef(0);
  const st = useRef<Story>({ lift: 0, unroll: 0, fade: 0, q: 0 });
  const mouse = useRef({ x: 0, y: 0 });

  useFrame(({ clock, pointer }, dt) => {
    smoothP.current += (progress.current - smoothP.current) * Math.min(1, dt * 4);
    const p = smoothP.current;
    const s = st.current;
    s.lift = smooth(0.1, 0.3, p);
    s.unroll = smooth(0.3, 0.58, p);
    s.fade = smooth(0.62, 0.9, p);
    s.q = smooth(0.58, 0.92, p);
    mouse.current.x += (pointer.x - mouse.current.x) * 0.05;
    mouse.current.y += (pointer.y - mouse.current.y) * 0.05;
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.rotation.y = t * 0.45 * (1 - s.unroll) + mix(0, 0.3, s.unroll) + mouse.current.x * 0.25;
    g.rotation.x = mix(0.18, 0.05, s.unroll) - mouse.current.y * 0.12;
    g.rotation.z = mix(-0.22, 0, s.unroll);
    g.scale.setScalar(mix(narrow ? 0.8 : 1.15, narrow ? 0.34 : 0.62, s.unroll));
    g.position.x = narrow ? 0 : mix(1.9, 0.9, s.unroll);
    g.position.y = mix(0, 0.5, s.unroll) + Math.sin(t * 0.7) * 0.06 * (1 - s.unroll);
  });

  return (
    <group ref={group}>
      <Casing st={st} />
      <JellyRoll st={st} />
      <Particles st={st} recovered={recovered} />
    </group>
  );
}

function CellSceneImpl({
  progress,
  recovered,
  narrow,
}: {
  progress: { current: number };
  recovered: number;
  narrow: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.3, 11.5], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-5, -2, 3]} intensity={0.5} color="#d8e4da" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.2} position={[0, 5, 6]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[-7, 1, 2]} rotation-y={Math.PI / 2} scale={[9, 3, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[7, 0, -2]} rotation-y={-Math.PI / 2} scale={[9, 3, 1]} />
        <Lightformer form="ring" intensity={1.2} position={[0, -4, 3]} rotation-x={Math.PI / 2} scale={5} />
      </Environment>
      <Rig progress={progress} recovered={recovered} narrow={narrow} />
    </Canvas>
  );
}

import { memo } from "react";
const CellScene = memo(CellSceneImpl);
export default CellScene;
