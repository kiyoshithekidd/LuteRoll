import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

type DiceTray3DProps = {
  rollTrigger: number;
  onSettled: (value: number) => void;
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

function buildD20GeometryAndPhysics(radius = 0.85) {
  const geom = new THREE.IcosahedronGeometry(radius, 0);
  const posAttr = geom.getAttribute('position');
  const uvArray = new Float32Array(posAttr.count * 2);

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

  // Pair opposite faces so opposite numbers sum to 21
  const faceValues = new Array<number>(20).fill(0);
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
    }
    lowVal++;
  }

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
    const idx0 = getVertIndex(posAttr.getX(i0), posAttr.getY(i0), posAttr.getZ(i0));
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

  return { geom, shape, faceNormals, faceValues };
}

export function DiceTray3D({ rollTrigger, onSettled }: DiceTray3DProps) {
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

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffe8c2, 0.75);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff1cc, 1.55);
    keyLight.position.set(3.5, 8.5, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(512, 512);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xd4af37, 0.9, 18);
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
    const wallConfigs = [
      { pos: [0, 0.45, -2.5], size: [7.2, 0.9, 0.35] },
      { pos: [0, 0.45, 2.5], size: [7.2, 0.9, 0.35] },
      { pos: [-3.4, 0.45, 0], size: [0.35, 0.9, 5.4] },
      { pos: [3.4, 0.45, 0], size: [0.35, 0.9, 5.4] },
    ] as const;
    const wallMeshes: THREE.Mesh[] = [];
    for (const wc of wallConfigs) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(wc.size[0], wc.size[1], wc.size[2]),
        wallMat
      );
      m.position.set(wc.pos[0], wc.pos[1], wc.pos[2]);
      m.receiveShadow = true;
      scene.add(m);
      wallMeshes.push(m);
    }

    // Physics world
    const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -24, 0),
    });
    world.allowSleep = true;

    const feltBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
    });
    feltBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(feltBody);

    for (const wc of wallConfigs) {
      const wb = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(
          new CANNON.Vec3(wc.size[0] / 2, wc.size[1] / 2, wc.size[2] / 2)
        ),
        position: new CANNON.Vec3(wc.pos[0], wc.pos[1], wc.pos[2]),
      });
      world.addBody(wb);
    }

    // Gold d20 die
    const atlasTex = createD20AtlasTexture();
    const { geom: dieGeo, shape: dieShape, faceNormals, faceValues } =
      buildD20GeometryAndPhysics(0.85);
    const dieMat = new THREE.MeshStandardMaterial({
      map: atlasTex,
      roughness: 0.32,
      metalness: 0.45,
    });
    const dieMesh = new THREE.Mesh(dieGeo, dieMat);
    dieMesh.castShadow = true;
    scene.add(dieMesh);

    const dieBody = new CANNON.Body({
      mass: 1.4,
      shape: dieShape,
      linearDamping: 0.28,
      angularDamping: 0.25,
    });
    dieBody.position.set(
      (Math.random() - 0.5) * 1.4,
      3.4,
      (Math.random() - 0.5) * 0.8
    );
    dieBody.quaternion.setFromEuler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    dieBody.velocity.set(
      (Math.random() - 0.5) * 5.5,
      -2.0,
      (Math.random() - 0.5) * 4.0
    );
    dieBody.angularVelocity.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 16
    );
    world.addBody(dieBody);

    let settled = false;
    let disposed = false;
    let rafId: number | null = null;
    let quietFrames = 0;
    let elapsedSec = 0;
    let lastFrameMs = performance.now();

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

    const readTopFaceValue = (): number => {
      const up = new THREE.Vector3(0, 1, 0);
      let bestDot = -Infinity;
      let bestFace = 0;
      for (let f = 0; f < 20; f++) {
        const worldNormal = faceNormals[f]!
          .clone()
          .applyQuaternion(dieMesh.quaternion);
        const dot = worldNormal.dot(up);
        if (dot > bestDot) {
          bestDot = dot;
          bestFace = f;
        }
      }
      return faceValues[bestFace] ?? 10;
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
      const val = readTopFaceValue();
      onSettledRef.current(val);
    };

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      let steps = 0;
      let stillCount = 0;
      while (steps < 360) {
        world.step(1 / 60);
        steps++;
        if (
          dieBody.velocity.length() < 0.08 &&
          dieBody.angularVelocity.length() < 0.12
        ) {
          stillCount++;
          if (stillCount >= 10) break;
        } else {
          stillCount = 0;
        }
      }
      finishSettle();
    } else {
      const tick = (nowMs: number) => {
        if (disposed || settled) return;
        const dt = Math.min(0.05, Math.max(0.001, (nowMs - lastFrameMs) / 1000));
        lastFrameMs = nowMs;
        elapsedSec += dt;

        world.step(1 / 60, dt, 3);
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

        if (quietFrames >= 12 || elapsedSec >= 3.6) {
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
  }, [rollTrigger]);

  return (
    <div
      ref={containerRef}
      className="w-full h-52 sm:h-60 rounded-xl overflow-hidden border-2 border-[#5a3a1e] shadow-inner bg-[#0a2317]"
    />
  );
}
