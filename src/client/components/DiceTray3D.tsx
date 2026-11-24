import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { soundEngine } from '../audio/soundEngine';

type DiceTray3DProps = {
  rollTrigger: number;
  targetRoll: number | null;
  onSettled: (value: number) => void;
  onTrayTap?: () => void;
};

function createD20AtlasTexture(): THREE.CanvasTexture {
  const cols = 5;
  const rows = 4;
  const cellSize = 200;
  const canvas = document.createElement('canvas');
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    for (let i = 0; i < 20; i++) {
      const num = i + 1;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = col * cellSize + cellSize / 2;
      const cy = row * cellSize + cellSize / 2;

      const grad = ctx.createRadialGradient(
        cx,
        cy - 12,
        8,
        cx,
        cy,
        cellSize * 0.55
      );
      grad.addColorStop(0, '#ffe875');
      grad.addColorStop(0.55, '#d4af37');
      grad.addColorStop(1, '#8a6412');
      ctx.fillStyle = grad;
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

      ctx.strokeStyle = 'rgba(255, 245, 200, 0.35)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy + 8, cellSize * 0.28, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle =
        num === 20 ? '#1b0f00' : num === 1 ? '#5c0a0a' : '#1c1208';
      ctx.font = 'bold 56px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(num), cx, cy + 8);

      if (num === 6 || num === 9) {
        ctx.fillRect(cx - 16, cy + 36, 32, 4);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function applyFaceValuesToGeometry(
  geom: THREE.BufferGeometry,
  faceValues: number[]
): void {
  const posAttr = geom.getAttribute('position');
  const uvArray = new Float32Array(posAttr.count * 2);
  const cols = 5;
  const rows = 4;

  for (let f = 0; f < 20; f++) {
    const valIdx = (faceValues[f] ?? 1) - 1;
    const col = valIdx % cols;
    const row = Math.floor(valIdx / cols);
    const u0 = col / cols;
    const vTop = 1 - row / rows;
    const cellU = 1 / cols;
    const cellV = 1 / rows;

    const i0 = f * 3;
    uvArray[i0 * 2] = u0 + cellU * 0.5;
    uvArray[i0 * 2 + 1] = vTop - cellV * 0.14;
    uvArray[(i0 + 1) * 2] = u0 + cellU * 0.14;
    uvArray[(i0 + 1) * 2 + 1] = vTop - cellV * 0.82;
    uvArray[(i0 + 2) * 2] = u0 + cellU * 0.86;
    uvArray[(i0 + 2) * 2 + 1] = vTop - cellV * 0.82;
  }
  geom.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
}

function buildD20GeometryAndPhysics(radius = 0.85) {
  const geom = new THREE.IcosahedronGeometry(radius, 0);
  const posAttr = geom.getAttribute('position');

  const faceNormals: THREE.Vector3[] = [];
  for (let f = 0; f < 20; f++) {
    const i0 = f * 3;
    const v0 = new THREE.Vector3().fromBufferAttribute(posAttr, i0);
    const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, i0 + 1);
    const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, i0 + 2);
    const n = new THREE.Vector3()
      .subVectors(v1, v0)
      .cross(new THREE.Vector3().subVectors(v2, v0))
      .normalize();
    const c = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);
    if (n.dot(c) < 0) n.negate();
    faceNormals.push(n);
  }

  // Pair opposite faces so opposite numbers always sum to 21
  const faceValues = new Array<number>(20).fill(0);
  const oppositeFace = new Array<number>(20).fill(0);
  let lowVal = 1;
  for (let f = 0; f < 20; f++) {
    if (faceValues[f] !== 0) continue;
    let opp = -1;
    let minDot = 1;
    for (let j = 0; j < 20; j++) {
      if (j === f || faceValues[j] !== 0) continue;
      const d = faceNormals[f]!.dot(faceNormals[j]!);
      if (d < minDot) {
        minDot = d;
        opp = j;
      }
    }
    faceValues[f] = lowVal;
    if (opp !== -1) {
      faceValues[opp] = 21 - lowVal;
      oppositeFace[f] = opp;
      oppositeFace[opp] = f;
    }
    lowVal++;
  }

  applyFaceValuesToGeometry(geom, faceValues);

  // Build Cannon-es ConvexPolyhedron with deduplicated vertices
  const uniqueVerts: CANNON.Vec3[] = [];
  const vertMap = new Map<string, number>();
  const faces: number[][] = [];
  const eps = 1e-4;

  const getVertIndex = (vx: number, vy: number, vz: number) => {
    const key = `${Math.round(vx / eps)},${Math.round(vy / eps)},${Math.round(vz / eps)}`;
    const existing = vertMap.get(key);
    if (existing !== undefined) return existing;
    const idx = uniqueVerts.length;
    uniqueVerts.push(new CANNON.Vec3(vx, vy, vz));
    vertMap.set(key, idx);
    return idx;
  };

  for (let f = 0; f < 20; f++) {
    const i0 = f * 3;
    const idx0 = getVertIndex(
      posAttr.getX(i0),
      posAttr.getY(i0),
      posAttr.getZ(i0)
    );
    const idx1 = getVertIndex(
      posAttr.getX(i0 + 1),
      posAttr.getY(i0 + 1),
      posAttr.getZ(i0 + 1)
    );
    const idx2 = getVertIndex(
      posAttr.getX(i0 + 2),
      posAttr.getY(i0 + 2),
      posAttr.getZ(i0 + 2)
    );
    faces.push([idx0, idx1, idx2]);
  }

  const shape = new CANNON.ConvexPolyhedron({
    vertices: uniqueVerts,
    faces,
  });

  return { geom, shape, faceNormals, faceValues, oppositeFace };
}

function findTopFaceIndex(
  quaternion: THREE.Quaternion,
  faceNormals: THREE.Vector3[]
): number {
  const up = new THREE.Vector3(0, 1, 0);
  let bestDot = -Infinity;
  let bestFace = 0;
  for (let f = 0; f < 20; f++) {
    const worldNormal = faceNormals[f]!.clone().applyQuaternion(quaternion);
    const dot = worldNormal.dot(up);
    if (dot > bestDot) {
      bestDot = dot;
      bestFace = f;
    }
  }
  return bestFace;
}

const WALL_CONFIGS = [
  { pos: [0, 0.45, -2.5], size: [7.2, 0.9, 0.35] },
  { pos: [0, 0.45, 2.5], size: [7.2, 0.9, 0.35] },
  { pos: [-3.4, 0.45, 0], size: [0.35, 0.9, 5.4] },
  { pos: [3.4, 0.45, 0], size: [0.35, 0.9, 5.4] },
] as const;

type ThrowInit = {
  pos: [number, number, number];
  euler: [number, number, number];
  vel: [number, number, number];
  angVel: [number, number, number];
};

function createPhysicsWorld(
  dieShape: CANNON.ConvexPolyhedron,
  init: ThrowInit
) {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -24, 0),
  });
  world.allowSleep = true;

  const dieMat = new CANNON.Material('die');
  const feltMat = new CANNON.Material('felt');
  const wallMat = new CANNON.Material('wall');

  world.addContactMaterial(
    new CANNON.ContactMaterial(dieMat, feltMat, {
      restitution: 0.32,
      friction: 0.48,
    })
  );
  world.addContactMaterial(
    new CANNON.ContactMaterial(dieMat, wallMat, {
      restitution: 0.56,
      friction: 0.22,
    })
  );

  const feltBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
    material: feltMat,
  });
  feltBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(feltBody);

  for (const wc of WALL_CONFIGS) {
    const wb = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(
        new CANNON.Vec3(wc.size[0] / 2, wc.size[1] / 2, wc.size[2] / 2)
      ),
      position: new CANNON.Vec3(wc.pos[0], wc.pos[1], wc.pos[2]),
      material: wallMat,
    });
    world.addBody(wb);
  }

  const dieBody = new CANNON.Body({
    mass: 1.4,
    shape: dieShape,
    material: dieMat,
    linearDamping: 0.28,
    angularDamping: 0.25,
  });
  dieBody.position.set(init.pos[0], init.pos[1], init.pos[2]);
  dieBody.quaternion.setFromEuler(init.euler[0], init.euler[1], init.euler[2]);
  dieBody.velocity.set(init.vel[0], init.vel[1], init.vel[2]);
  dieBody.angularVelocity.set(init.angVel[0], init.angVel[1], init.angVel[2]);
  world.addBody(dieBody);

  return { world, dieBody, feltBody };
}

export function DiceTray3D({
  rollTrigger,
  targetRoll,
  onSettled,
  onTrayTap,
}: DiceTray3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onSettledRef = useRef(onSettled);
  useEffect(() => {
    onSettledRef.current = onSettled;
  }, [onSettled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = Math.max(260, container.clientWidth || 320);
    const height = Math.max(200, container.clientHeight || 220);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a2317');

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 7.2, 4.4);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffe8c2, 0.78);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff1cc, 1.6);
    keyLight.position.set(3.5, 8.5, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(512, 512);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xd4af37, 1.05, 18);
    rimLight.position.set(-3.5, 4.5, -3.5);
    scene.add(rimLight);

    // Dark green tavern felt floor
    const feltGeo = new THREE.PlaneGeometry(7.2, 5.4);
    const feltMat = new THREE.MeshStandardMaterial({
      color: 0x103524,
      roughness: 0.92,
      metalness: 0.04,
    });
    const feltMesh = new THREE.Mesh(feltGeo, feltMat);
    feltMesh.rotation.x = -Math.PI / 2;
    feltMesh.receiveShadow = true;
    scene.add(feltMesh);

    // Walnut tray walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x3a2312,
      roughness: 0.72,
      metalness: 0.1,
    });
    const wallMeshes: THREE.Mesh[] = [];
    for (const wc of WALL_CONFIGS) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(wc.size[0], wc.size[1], wc.size[2]),
        wallMat
      );
      m.position.set(wc.pos[0], wc.pos[1], wc.pos[2]);
      m.receiveShadow = true;
      scene.add(m);
      wallMeshes.push(m);
    }

    // Gold d20 die
    const atlasTex = createD20AtlasTexture();
    const {
      geom: dieGeo,
      shape: dieShape,
      faceNormals,
      faceValues,
      oppositeFace,
    } = buildD20GeometryAndPhysics(0.85);
    const dieMat = new THREE.MeshStandardMaterial({
      map: atlasTex,
      roughness: 0.3,
      metalness: 0.48,
    });
    const dieMesh = new THREE.Mesh(dieGeo, dieMat);
    dieMesh.castShadow = true;
    scene.add(dieMesh);

    let disposed = false;
    let rafId: number | null = null;

    // Idle mode before first roll: floating, slowly gleaming gold d20 ready to tap
    if (rollTrigger === 0) {
      const reducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const startMs = performance.now();

      const renderIdle = (nowMs: number) => {
        if (disposed) return;
        const t = (nowMs - startMs) / 1000;
        dieMesh.position.set(0, 1.35 + Math.sin(t * 2.1) * 0.12, 0);
        dieMesh.rotation.set(t * 0.45, t * 0.75, Math.sin(t * 0.6) * 0.2);
        renderer.render(scene, camera);
        if (!reducedMotion) {
          rafId = requestAnimationFrame(renderIdle);
        }
      };
      renderIdle(startMs);

      return () => {
        disposed = true;
        if (rafId !== null) cancelAnimationFrame(rafId);
        dieGeo.dispose();
        dieMat.dispose();
        atlasTex.dispose();
        feltGeo.dispose();
        feltMat.dispose();
        wallMat.dispose();
        for (const wm of wallMeshes) wm.geometry.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    }

    // Active roll: generate throw impulse
    const throwInit: ThrowInit = {
      pos: [(Math.random() - 0.5) * 1.4, 3.4, (Math.random() - 0.5) * 0.8],
      euler: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ],
      vel: [
        (Math.random() - 0.5) * 6.0,
        -2.2,
        (Math.random() - 0.5) * 4.5,
      ],
      angVel: [
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16,
      ],
    };

    // B3 server-authoritative face alignment:
    // Pre-simulate the exact deterministic 1/60s steps to find which face lands on top,
    // then swap faceValues so the landed face displays targetRoll (preserving opposite-sum=21).
    if (targetRoll !== null) {
      const sim = createPhysicsWorld(dieShape, throwInit);
      let still = 0;
      for (let step = 0; step < 220; step++) {
        sim.world.step(1 / 60);
        if (
          sim.dieBody.sleepState === CANNON.Body.SLEEPING ||
          (sim.dieBody.velocity.length() < 0.08 &&
            sim.dieBody.angularVelocity.length() < 0.12)
        ) {
          still++;
          if (still >= 12) break;
        } else {
          still = 0;
        }
      }
      const simQuat = new THREE.Quaternion(
        sim.dieBody.quaternion.x,
        sim.dieBody.quaternion.y,
        sim.dieBody.quaternion.z,
        sim.dieBody.quaternion.w
      );
      const landedFace = findTopFaceIndex(simQuat, faceNormals);
      const currentTargetFace = faceValues.indexOf(targetRoll);
      if (currentTargetFace !== -1 && currentTargetFace !== landedFace) {
        const oppLanded = oppositeFace[landedFace]!;
        const oppTarget = oppositeFace[currentTargetFace]!;
        const prevLandedVal = faceValues[landedFace]!;
        const prevOppLandedVal = faceValues[oppLanded]!;
        faceValues[landedFace] = targetRoll;
        faceValues[oppLanded] = 21 - targetRoll;
        if (oppTarget !== landedFace) {
          faceValues[currentTargetFace] = prevLandedVal;
          faceValues[oppTarget] = prevOppLandedVal;
        }
        applyFaceValuesToGeometry(dieGeo, faceValues);
      }
    }

    const { world, dieBody, feltBody } = createPhysicsWorld(dieShape, throwInit);

    // Realistic wood clack & felt thud audio on physics collisions
    dieBody.addEventListener(
      'collide',
      (event: { body: CANNON.Body; contact: CANNON.ContactEquation }) => {
        const impact = Math.abs(event.contact.getImpactVelocityAlongNormal());
        if (impact < 0.65) return;
        const intensity = Math.min(1, impact / 10);
        const surface = event.body === feltBody ? 'felt' : 'wood';
        soundEngine.playDiceHit(intensity, surface);
      }
    );

    let settled = false;
    let quietFrames = 0;
    let stepsRun = 0;

    const syncMeshToBody = () => {
      dieMesh.position.set(
        dieBody.position.x,
        dieBody.position.y,
        dieBody.position.z
      );
      dieMesh.quaternion.set(
        dieBody.quaternion.x,
        dieBody.quaternion.y,
        dieBody.quaternion.z,
        dieBody.quaternion.w
      );
    };

    const finishSettle = () => {
      if (settled || disposed) return;
      settled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      syncMeshToBody();
      renderer.render(scene, camera);
      const topIdx = findTopFaceIndex(dieMesh.quaternion, faceNormals);
      const val = targetRoll ?? faceValues[topIdx] ?? 10;
      onSettledRef.current(val);
    };

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      let stillCount = 0;
      while (stepsRun < 220) {
        world.step(1 / 60);
        stepsRun++;
        if (
          dieBody.sleepState === CANNON.Body.SLEEPING ||
          (dieBody.velocity.length() < 0.08 &&
            dieBody.angularVelocity.length() < 0.12)
        ) {
          stillCount++;
          if (stillCount >= 12) break;
        } else {
          stillCount = 0;
        }
      }
      finishSettle();
    } else {
      const tick = () => {
        if (disposed || settled) return;
        // Fixed 1/60 step matches pre-simulation deterministically
        world.step(1 / 60);
        stepsRun++;
        syncMeshToBody();
        renderer.render(scene, camera);

        const lin = dieBody.velocity.length();
        const ang = dieBody.angularVelocity.length();
        if (
          dieBody.sleepState === CANNON.Body.SLEEPING ||
          (lin < 0.08 && ang < 0.12)
        ) {
          quietFrames++;
        } else {
          quietFrames = 0;
        }

        if (quietFrames >= 12 || stepsRun >= 220) {
          finishSettle();
          return;
        }
        rafId = requestAnimationFrame(tick);
      };

      syncMeshToBody();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      dieGeo.dispose();
      dieMat.dispose();
      atlasTex.dispose();
      feltGeo.dispose();
      feltMat.dispose();
      wallMat.dispose();
      for (const wm of wallMeshes) wm.geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [rollTrigger, targetRoll]);

  return (
    <div
      ref={containerRef}
      onClick={rollTrigger === 0 ? onTrayTap : undefined}
      role={rollTrigger === 0 && onTrayTap ? 'button' : undefined}
      tabIndex={rollTrigger === 0 && onTrayTap ? 0 : undefined}
      onKeyDown={
        rollTrigger === 0 && onTrayTap
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTrayTap();
              }
            }
          : undefined
      }
      aria-label={rollTrigger === 0 ? 'Tap tray to toss the d20' : '3D d20 dice tray'}
      className={`w-full h-48 sm:h-56 rounded-xl overflow-hidden border-2 border-[#5a3a1e] shadow-inner bg-[#0a2317] ${
        rollTrigger === 0 && onTrayTap ? 'cursor-pointer' : ''
      }`}
    />
  );
}
