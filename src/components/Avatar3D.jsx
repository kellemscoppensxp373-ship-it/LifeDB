import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Focus, RotateCcw, MousePointer2 } from 'lucide-react';
import { useStore } from '../store/Store.js';

/**
 * Avatar3D — React Three Fiber muscle avatar.
 *
 * PERFORMANCE: frameloop="demand" — nothing renders while idle.
 * Every interactive element manually calls invalidate().
 * VISUAL: crystal sharp — NO depth of field, NO blur postprocessing.
 * Supports a generic humanoid .glb via VITE_AVATAR_URL, otherwise the
 * built-in procedural muscle model is used.
 */

const AVATAR_URL = (import.meta.env.VITE_AVATAR_URL || '').trim();

export const MUSCLE_CAM = {
  default: { pos: [2.9, 1.9, 3.7], tgt: [0, 1.0, 0], fov: 42 },
  lats: { pos: [0.5, 1.7, -2.9], tgt: [0, 1.42, 0], fov: 29 },
  chest: { pos: [0, 1.55, 2.9], tgt: [0, 1.4, 0], fov: 29 },
  shoulders: { pos: [2.3, 2.05, 1.7], tgt: [0, 1.68, 0], fov: 29 },
  biceps: { pos: [2.05, 1.45, 1.5], tgt: [0.58, 1.32, 0], fov: 27 },
  quads: { pos: [1.15, 0.75, 2.5], tgt: [0, 0.62, 0], fov: 29 },
  glutes: { pos: [-1.3, 1.2, -2.5], tgt: [0, 0.95, 0], fov: 29 },
};

const MUSCLE_LABEL = {
  default: 'FULL BODY // ORBIT READY',
  lats: 'BACK / LATS — TARGET LOCKED',
  chest: 'CHEST — TARGET LOCKED',
  shoulders: 'DELTS / TRAPS — TARGET LOCKED',
  biceps: 'BICEPS — TARGET LOCKED',
  quads: 'QUADS — TARGET LOCKED',
  glutes: 'GLUTES / HAMS — TARGET LOCKED',
};

// Keywords for matching .glb mesh names to a muscle group.
const MUSCLE_KEYWORDS = {
  lats: ['lat', 'back', 'dorsal', 'trapezius_low'],
  chest: ['chest', 'pec', 'thorax'],
  shoulders: ['shoulder', 'delt', 'trap'],
  biceps: ['bicep', 'biceps', 'arm_upper', 'upperarm'],
  quads: ['quad', 'thigh', 'femur', 'leg_upper'],
  glutes: ['glut', 'butt', 'hip', 'ham'],
};

const NEON = '#00ff66';
const DARK_MATTER = '#16191d';

/* ------------------------------------------------------------------ */
/* CameraRig — fast but smooth dolly zoom onto the targeted muscle.    */
/* ------------------------------------------------------------------ */
function CameraRig({ muscle }) {
  const dest = useMemo(() => {
    const t = MUSCLE_CAM[muscle] || MUSCLE_CAM.default;
    return { pos: new THREE.Vector3(...t.pos), tgt: new THREE.Vector3(...t.tgt), fov: t.fov };
  }, [muscle]);

  const { invalidate } = useThree((s) => ({ invalidate: s.invalidate }));

  // Kick the demand loop when the target changes.
  useEffect(() => {
    invalidate();
  }, [muscle, invalidate]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const k = 1 - Math.exp(-5.2 * dt); // fast attack, smooth settle
    const cam = state.camera;
    cam.position.lerp(dest.pos, k);

    const ctl = state.controls;
    if (ctl) {
      ctl.target.lerp(dest.tgt, k);
      ctl.update();
    } else {
      cam.lookAt(dest.tgt);
    }
    if (Math.abs(cam.fov - dest.fov) > 0.05) {
      cam.fov += (dest.fov - cam.fov) * k;
      cam.updateProjectionMatrix();
    }
    // Keep demanding frames until the dolly settles, then sleep.
    if (cam.position.distanceTo(dest.pos) > 0.004) invalidate();
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* PointerTracker — feeds hover parallax + wakes the demand loop.      */
/* ------------------------------------------------------------------ */
function PointerTracker({ pointerRef }) {
  const { invalidate, gl } = useThree((s) => ({ invalidate: s.invalidate, gl: s.gl }));
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointerRef.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      invalidate();
    };
    const onLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
      invalidate();
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [gl, invalidate, pointerRef]);
  return null;
}

/* ------------------------------------------------------------------ */
/* ParallaxGroup — model tracks the mouse slightly on hover.           */
/* ------------------------------------------------------------------ */
function ParallaxGroup({ pointerRef, children }) {
  const ref = useRef();
  const { invalidate } = useThree((s) => ({ invalidate: s.invalidate }));
  useFrame((_, rawDt) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(rawDt, 0.05);
    const k = 1 - Math.exp(-4 * dt);
    const ty = pointerRef.current.x * 0.3;
    const tx = pointerRef.current.y * 0.08;
    const dy = Math.abs(g.rotation.y - ty) + Math.abs(g.rotation.x - tx);
    g.rotation.y += (ty - g.rotation.y) * k;
    g.rotation.x += (tx - g.rotation.x) * k;
    if (dy > 0.0004) invalidate();
  });
  return <group ref={ref}>{children}</group>;
}

/* ------------------------------------------------------------------ */
/* ProceduralAvatar — built-in humanoid; target mesh goes emissive.     */
/* ------------------------------------------------------------------ */
function MuscleMesh({ active, ...props }) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: active ? '#04120a' : DARK_MATTER,
        emissive: active ? NEON : '#000000',
        emissiveIntensity: active ? 2.4 : 0,
        metalness: 0.55,
        roughness: 0.35,
      }),
    [active],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return <mesh material={mat} {...props} />;
}

function ProceduralAvatar({ muscle }) {
  const is = (m) => muscle === m;
  return (
    <group position={[0, -0.55, 0]}>
      {/* platform ring */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.85, 0.92, 48]} />
        <meshBasicMaterial color={NEON} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 48]} />
        <meshBasicMaterial color="#020403" transparent opacity={0.85} />
      </mesh>

      {/* legs */}
      <MuscleMesh active={is('quads')} position={[-0.19, 0.72, 0]}>
        <cylinderGeometry args={[0.13, 0.1, 0.72, 20]} />
      </MuscleMesh>
      <MuscleMesh active={is('quads')} position={[0.19, 0.72, 0]}>
        <cylinderGeometry args={[0.13, 0.1, 0.72, 20]} />
      </MuscleMesh>
      <MuscleMesh active={false} position={[-0.19, 0.2, 0]}>
        <cylinderGeometry args={[0.085, 0.065, 0.42, 16]} />
      </MuscleMesh>
      <MuscleMesh active={false} position={[0.19, 0.2, 0]}>
        <cylinderGeometry args={[0.085, 0.065, 0.42, 16]} />
      </MuscleMesh>

      {/* pelvis + glutes */}
      <MuscleMesh active={false} position={[0, 1.1, 0]}>
        <boxGeometry args={[0.44, 0.22, 0.26]} />
      </MuscleMesh>
      <MuscleMesh active={is('glutes')} position={[0, 1.06, -0.17]} scale={[1, 0.72, 0.5]}>
        <sphereGeometry args={[0.2, 20, 16]} />
      </MuscleMesh>

      {/* torso: abs + chest */}
      <MuscleMesh active={false} position={[0, 1.32, 0]}>
        <boxGeometry args={[0.4, 0.24, 0.24]} />
      </MuscleMesh>
      <MuscleMesh active={is('chest')} position={[0, 1.58, 0.02]}>
        <boxGeometry args={[0.52, 0.3, 0.28]} />
      </MuscleMesh>

      {/* lats: two angled wings on the back */}
      <MuscleMesh active={is('lats')} position={[-0.2, 1.5, -0.14]} rotation={[0.15, 0.35, 0.35]}>
        <boxGeometry args={[0.2, 0.4, 0.08]} />
      </MuscleMesh>
      <MuscleMesh active={is('lats')} position={[0.2, 1.5, -0.14]} rotation={[0.15, -0.35, -0.35]}>
        <boxGeometry args={[0.2, 0.4, 0.08]} />
      </MuscleMesh>

      {/* shoulders */}
      <MuscleMesh active={is('shoulders')} position={[-0.34, 1.68, 0]}>
        <sphereGeometry args={[0.13, 20, 16]} />
      </MuscleMesh>
      <MuscleMesh active={is('shoulders')} position={[0.34, 1.68, 0]}>
        <sphereGeometry args={[0.13, 20, 16]} />
      </MuscleMesh>

      {/* arms: upper + biceps + forearm */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <MuscleMesh active={false} position={[s * 0.4, 1.5, 0]} rotation={[0, 0, s * 0.12]}>
            <cylinderGeometry args={[0.075, 0.065, 0.34, 14]} />
          </MuscleMesh>
          <MuscleMesh active={is('biceps')} position={[s * 0.43, 1.42, 0.05]} scale={[1, 1.25, 1]}>
            <sphereGeometry args={[0.085, 16, 14]} />
          </MuscleMesh>
          <MuscleMesh active={false} position={[s * 0.44, 1.14, 0]} rotation={[0, 0, s * 0.06]}>
            <cylinderGeometry args={[0.06, 0.05, 0.3, 14]} />
          </MuscleMesh>
        </group>
      ))}

      {/* neck + head */}
      <MuscleMesh active={false} position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.12, 14]} />
      </MuscleMesh>
      <MuscleMesh active={false} position={[0, 1.98, 0]}>
        <sphereGeometry args={[0.14, 24, 20]} />
      </MuscleMesh>
      {/* visor slit */}
      <mesh position={[0, 1.99, 0.115]}>
        <boxGeometry args={[0.16, 0.03, 0.02]} />
        <meshBasicMaterial color={NEON} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* GlbAvatar — generic humanoid .glb; target meshes go emissive.       */
/* ------------------------------------------------------------------ */
function GlbAvatar({ url, muscle }) {
  const { scene } = useGLTF(url);
  const { invalidate } = useThree((s) => ({ invalidate: s.invalidate }));

  useEffect(() => {
    const keys = MUSCLE_KEYWORDS[muscle] || [];
    scene.traverse((o) => {
      if (o.isMesh) {
        if (!o.userData._baseMat) o.userData._baseMat = o.material;
        const mat = o.userData._baseMat.clone();
        const name = (o.name || '').toLowerCase();
        const hit = muscle !== 'default' && keys.some((k) => name.includes(k));
        if ('emissive' in mat) {
          mat.emissive = new THREE.Color(hit ? NEON : '#000000');
          mat.emissiveIntensity = hit ? 2.6 : 0;
        }
        o.material = mat;
      }
    });
    invalidate();
    return () => {
      scene.traverse((o) => {
        if (o.isMesh && o.material?.dispose) o.material.dispose();
      });
    };
  }, [scene, muscle, invalidate]);

  return <primitive object={scene} position={[0, -0.55, 0]} />;
}
if (AVATAR_URL) useGLTF.preload(AVATAR_URL);

/* ------------------------------------------------------------------ */
/* InteractInvalidator — orbit gestures wake the demand loop.          */
/* ------------------------------------------------------------------ */
function InteractInvalidator() {
  const { invalidate, gl } = useThree((s) => ({ invalidate: s.invalidate, gl: s.gl }));
  useEffect(() => {
    const el = gl.domElement;
    const wake = () => invalidate();
    el.addEventListener('pointerdown', wake);
    el.addEventListener('wheel', wake, { passive: true });
    return () => {
      el.removeEventListener('pointerdown', wake);
      el.removeEventListener('wheel', wake);
    };
  }, [gl, invalidate]);
  return null;
}

/* ------------------------------------------------------------------ */
/* Avatar3D — panel body.                                              */
/* ------------------------------------------------------------------ */
export default function Avatar3D() {
  const muscle = useStore((s) => s.avatarTarget);
  const resetAvatarTarget = useStore((s) => s.resetAvatarTarget);
  const pointerRef = useRef({ x: 0, y: 0 });

  return (
    <div className="relative h-[380px] w-full">
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: MUSCLE_CAM.default.pos, fov: MUSCLE_CAM.default.fov, near: 0.1, far: 60 }}
      >
        {/* Lighting: cold key + toxic rim + blood rim. No postprocessing. */}
        <ambientLight intensity={0.55} />
        <spotLight position={[4, 6, 5]} angle={0.5} intensity={1.4} color="#ffffff" />
        <pointLight position={[-4, 2, 1]} intensity={12} color={NEON} distance={12} />
        <pointLight position={[4, 1.5, -2]} intensity={10} color="#ff2d55" distance={12} />

        <gridHelper args={[14, 28, '#123322', '#0a0e0d']} position={[0, -0.58, 0]} />

        <Suspense fallback={null}>
          <ParallaxGroup pointerRef={pointerRef}>
            {AVATAR_URL ? (
              <GlbAvatar url={AVATAR_URL} muscle={muscle} />
            ) : (
              <ProceduralAvatar muscle={muscle} />
            )}
          </ParallaxGroup>
        </Suspense>

        <CameraRig muscle={muscle} />
        <PointerTracker pointerRef={pointerRef} />
        <InteractInvalidator />
        <OrbitControls
          makeDefault
          enableDamping={false}
          enablePan={false}
          minDistance={1.1}
          maxDistance={9}
          maxPolarAngle={Math.PI * 0.62}
        />
      </Canvas>

      {/* HUD overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <motion.div
          key={muscle}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="clip-tag-sm flex items-center gap-2 border border-toxic/50 bg-black/70 px-2.5 py-1.5 text-[10px] font-bold tracking-[0.22em] text-toxic backdrop-blur-xl"
        >
          <Focus size={12} />
          {MUSCLE_LABEL[muscle] || MUSCLE_LABEL.default}
        </motion.div>
        <div className="pointer-events-auto flex gap-1.5">
          <button
            onClick={resetAvatarTarget}
            className="clip-tag-sm flex items-center gap-1.5 border border-white/20 bg-black/70 px-2 py-1.5 text-[9px] tracking-[0.2em] text-chrome-dim backdrop-blur-xl transition-colors hover:border-white/40 hover:text-bone"
            title="Reset camera"
          >
            <RotateCcw size={11} /> RESET
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-3 text-[9px] tracking-[0.25em] text-chrome-faint">
        <span className="flex items-center gap-1.5">
          <MousePointer2 size={11} /> HOVER:PARALLAX /// DRAG:ORBIT
        </span>
        <span>{AVATAR_URL ? 'MODEL:GLB' : 'MODEL:PROCEDURAL'}</span>
      </div>
    </div>
  );
}
