import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type Whisper = {
  id: number;
  text: string;
  locked: boolean;
  votes: number;
  orbit: number;
  angle: number;
  radius: number;
  height: number;
  phase: number;
};

const SEEDS: Whisper[] = [
  { id: 1, text: 'I never told anyone what happened that night.', locked: true, votes: 38, orbit: 0, angle: 0.1, radius: 4.2, height: 0.2, phase: 0.1 },
  { id: 2, text: 'I still have the message. I never opened it.', locked: false, votes: 12, orbit: 0, angle: 0.9, radius: 4.4, height: -0.2, phase: 1.1 },
  { id: 3, text: 'Nobody knows why I actually left.', locked: true, votes: 51, orbit: 0, angle: 1.7, radius: 4.1, height: 0.5, phase: 2.0 },
  { id: 4, text: 'I lied about where I was that evening.', locked: false, votes: 8, orbit: 0, angle: 2.55, radius: 4.5, height: -0.35, phase: 2.7 },
  { id: 5, text: 'There is one thing I would never say aloud.', locked: true, votes: 73, orbit: 0, angle: 3.35, radius: 4.25, height: 0.25, phase: 3.4 },
  { id: 6, text: 'Sometimes I miss the person I was before they knew me.', locked: false, votes: 19, orbit: 0, angle: 4.2, radius: 4.35, height: -0.15, phase: 4.0 },
  { id: 7, text: 'I pretended not to recognize them.', locked: false, votes: 31, orbit: 0, angle: 5.05, radius: 4.3, height: 0.15, phase: 4.8 },
  { id: 8, text: 'I keep checking a place that does not exist anymore.', locked: true, votes: 64, orbit: 0, angle: 5.75, radius: 4.15, height: -0.25, phase: 5.5 },
  { id: 9, text: 'I knew the answer before I asked the question.', locked: false, votes: 16, orbit: 1, angle: 0.45, radius: 7.1, height: 1.15, phase: 0.8 },
  { id: 10, text: 'I have never told my family what I really do for money.', locked: true, votes: 44, orbit: 1, angle: 1.3, radius: 7.0, height: 0.8, phase: 1.8 },
  { id: 11, text: 'The happiest photograph of me was taken on the worst day.', locked: false, votes: 27, orbit: 1, angle: 2.1, radius: 7.2, height: 1.45, phase: 2.7 },
  { id: 12, text: 'I deleted the conversation, but I remember every word.', locked: true, votes: 82, orbit: 1, angle: 2.95, radius: 6.9, height: 0.65, phase: 3.3 },
  { id: 13, text: 'I wish they had asked me one more time.', locked: false, votes: 21, orbit: 1, angle: 3.8, radius: 7.1, height: 1.2, phase: 4.0 },
  { id: 14, text: 'I still know the exact sound of that door closing.', locked: true, votes: 55, orbit: 1, angle: 4.65, radius: 7.0, height: 0.85, phase: 4.8 },
  { id: 15, text: 'I was there, and I have never admitted it.', locked: false, votes: 33, orbit: 1, angle: 5.4, radius: 7.15, height: 1.35, phase: 5.6 },
  { id: 16, text: 'I told them I was fine because the truth would have changed everything.', locked: true, votes: 91, orbit: 1, angle: 6.05, radius: 6.95, height: 0.7, phase: 6.1 },
  { id: 17, text: 'I keep a tiny object because it proves the memory was real.', locked: false, votes: 14, orbit: 2, angle: 0.2, radius: 10.2, height: -0.1, phase: 0.2 },
  { id: 18, text: 'Nobody noticed that I was crying.', locked: true, votes: 47, orbit: 2, angle: 1.0, radius: 10.0, height: 0.45, phase: 1.0 },
  { id: 19, text: 'I never sent the apology.', locked: false, votes: 29, orbit: 2, angle: 1.85, radius: 10.25, height: 0.1, phase: 1.9 },
  { id: 20, text: 'I know exactly who would understand this.', locked: true, votes: 61, orbit: 2, angle: 2.65, radius: 10.1, height: 0.55, phase: 2.7 },
  { id: 21, text: 'I have a completely different name in one person's phone.', locked: false, votes: 23, orbit: 2, angle: 3.45, radius: 10.2, height: -0.05, phase: 3.5 },
  { id: 22, text: 'I remember their birthday even though we have not spoken in years.', locked: true, votes: 76, orbit: 2, angle: 4.25, radius: 10.0, height: 0.4, phase: 4.3 },
  { id: 23, text: 'I almost told the truth yesterday.', locked: false, votes: 11, orbit: 2, angle: 5.05, radius: 10.3, height: 0.0, phase: 5.1 },
  { id: 24, text: 'There is a version of the story I tell everyone. It is not the real one.', locked: true, votes: 105, orbit: 2, angle: 5.85, radius: 10.1, height: 0.5, phase: 5.9 },
];

const ORBIT_SPEED = [0.025, -0.016, 0.009];
const CARD_W = 2.55;
const CARD_H = 1.55;
const CARD_D = 0.14;

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 4) {
  const words = text.split(' ');
  let line = '';
  let lines = 0;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines += 1;
      line = word;
      if (lines === maxLines - 1) break;
    } else line = candidate;
  }
  if (lines < maxLines) ctx.fillText(line, x, y);
}

function makeWhisperTexture(whisper: Whisper, index: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 560;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#11151a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sheen = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  sheen.addColorStop(0, 'rgba(255,255,255,.055)');
  sheen.addColorStop(.42, 'rgba(255,255,255,.008)');
  sheen.addColorStop(1, 'rgba(86,126,166,.16)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '500 20px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(238,241,244,.46)';
  ctx.fillText(`WHISPER / ${String(index + 1).padStart(3, '0')}`, 54, 62);

  ctx.font = '400 46px Inter, Arial, sans-serif';
  ctx.fillStyle = '#eef1f4';
  const text = whisper.locked ? whisper.text.split(' ').slice(0, 7).join(' ') + ' …' : whisper.text;
  wrapText(ctx, text, 54, 190, 760, 60, 4);

  ctx.font = '500 17px Inter, Arial, sans-serif';
  ctx.fillStyle = whisper.locked ? 'rgba(112,157,198,.9)' : 'rgba(255,255,255,.30)';
  ctx.fillText(whisper.locked ? 'SEALED · SELECT TO REVEAL' : 'SELECT TO READ', 54, 500);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(118,170,218,.8)');
  g.addColorStop(.2, 'rgba(82,132,178,.28)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ whispers: SEEDS.map((x) => ({ ...x })), selected: null as number | null, unlocked: new Set<number>(), votes: {} as Record<number, number> });
  const [whispers, setWhispers] = useState(SEEDS);
  const [selected, setSelected] = useState<Whisper | null>(null);
  const [unlocked, setUnlocked] = useState<number[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [stats, setStats] = useState({ discovered: 0, liked: 0 });

  const unlockedSet = useMemo(() => new Set(unlocked), [unlocked]);

  useEffect(() => {
    stateRef.current.whispers = whispers.map((x) => ({ ...x }));
  }, [whispers]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11171d);
    scene.fog = new THREE.FogExp2(0x11171d, 0.025);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 90);
    camera.position.set(0, 3.8, 14.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 7;
    controls.maxDistance = 23;
    controls.minPolarAngle = Math.PI * 0.30;
    controls.maxPolarAngle = Math.PI * 0.67;
    controls.target.set(0, 0.3, -3.8);

    scene.add(new THREE.HemisphereLight(0xe8f0f5, 0x26313a, 1.7));
    const key = new THREE.DirectionalLight(0xf6f7f8, 3.3);
    key.position.set(-7, 10, 8);
    scene.add(key);
    const blue = new THREE.PointLight(0x5f91ba, 18, 18);
    blue.position.set(4, 2.2, 1);
    scene.add(blue);

    // Spatial base: a physical field, not a flat webpage backdrop.
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(24, 96),
      new THREE.MeshStandardMaterial({ color: 0x20282f, metalness: 0.42, roughness: 0.78 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.55;
    scene.add(floor);

    const grid = new THREE.GridHelper(42, 42, 0x3d4b57, 0x2b353e);
    grid.position.y = -1.50;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.22;
    scene.add(grid);

    const horizonRing = new THREE.Mesh(
      new THREE.RingGeometry(12.5, 12.58, 128),
      new THREE.MeshBasicMaterial({ color: 0x6b8da8, transparent: true, opacity: 0.16, side: THREE.DoubleSide }),
    );
    horizonRing.rotation.x = -Math.PI / 2;
    horizonRing.position.y = -1.48;
    scene.add(horizonRing);

    const glowTexture = makeGlowTexture();
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, transparent: true, depthWrite: false, opacity: 0.65 }));
    glow.scale.set(10, 10, 1);
    glow.position.set(0, 1.4, -8);
    scene.add(glow);

    // Lightweight ambient particles: one instanced mesh, not hundreds of objects.
    const particleGeometry = new THREE.SphereGeometry(0.025, 6, 6);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x8caec8, transparent: true, opacity: 0.38 });
    const particles = new THREE.InstancedMesh(particleGeometry, particleMaterial, 90);
    const particleMatrix = new THREE.Matrix4();
    for (let i = 0; i < 90; i += 1) {
      const a = i * 2.39996;
      const r = 4 + (i % 13) * 0.7;
      particleMatrix.makeTranslation(Math.cos(a) * r, -0.8 + (i % 9) * 0.35, -2 - (i % 17) * 0.7);
      particles.setMatrixAt(i, particleMatrix);
    }
    scene.add(particles);

    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    const meshes: THREE.Mesh[] = [];
    const textures: THREE.Texture[] = [];
    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    const buildCards = () => {
      const current = stateRef.current.whispers;
      current.forEach((whisper, index) => {
        const geometry = new THREE.BoxGeometry(CARD_W, CARD_H, CARD_D);
        const texture = makeWhisperTexture(whisper, index);
        const side = new THREE.MeshStandardMaterial({ color: 0x67727c, metalness: 0.96, roughness: 0.19 });
        const front = new THREE.MeshStandardMaterial({ map: texture, metalness: 0.62, roughness: 0.30 });
        const mesh = new THREE.Mesh(geometry, [side, side, side, side, front, side]);
        mesh.userData.whisperId = whisper.id;
        mesh.userData.index = index;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        cardGroup.add(mesh);
        meshes.push(mesh);
        textures.push(texture);
        materials.push(side, front);
        geometries.push(geometry);
      });
    };
    buildCards();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);
    const pointerWorld = new THREE.Vector3(999, 999, 999);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.2);
    let hovered: THREE.Mesh | null = null;
    let frame = 0;
    const clock = new THREE.Clock();

    const updatePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(plane, pointerWorld);
    };

    const onMove = (event: PointerEvent) => updatePointer(event);
    const onLeave = () => pointerWorld.set(999, 999, 999);
    const onDown = (event: PointerEvent) => {
      updatePointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0]?.object as THREE.Mesh | undefined;
      if (!hit) return;
      const id = hit.userData.whisperId as number;
      const whisper = stateRef.current.whispers.find((item) => item.id === id);
      if (!whisper) return;
      stateRef.current.selected = id;
      setSelected({ ...whisper });
      setStats((s) => ({ ...s, discovered: s.discovered + 1 }));
    };

    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerleave', onLeave);
    renderer.domElement.addEventListener('pointerdown', onDown);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const animate = () => {
      const t = clock.getElapsedTime();
      controls.update();

      const current = stateRef.current.whispers;
      meshes.forEach((mesh, index) => {
        const whisper = current[index];
        if (!whisper) return;
        const orbitSpeed = ORBIT_SPEED[whisper.orbit] ?? 0.01;
        const angle = whisper.angle + t * orbitSpeed;
        const radius = whisper.radius;
        const base = new THREE.Vector3(Math.cos(angle) * radius, whisper.height + Math.sin(t * 0.34 + whisper.phase) * 0.12, -4.5 + Math.sin(angle) * radius * 0.62);

        // Viscose-inspired local field: nearby objects yield and rotate around the pointer.
        const dx = base.x - pointerWorld.x;
        const dz = base.z - pointerWorld.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        const influence = Math.max(0, 1 - distance / 4.1);
        const push = influence * influence;
        if (distance > 0.001) {
          base.x += (dx / distance) * push * 1.25;
          base.z += (dz / distance) * push * 1.25;
        }

        const selected = stateRef.current.selected === whisper.id;
        if (selected) {
          base.lerp(new THREE.Vector3(0, 0.45, 1.2), 0.12);
          mesh.scale.lerp(new THREE.Vector3(1.22, 1.22, 1.22), 0.1);
          mesh.rotation.x += (0 - mesh.rotation.x) * 0.08;
          mesh.rotation.y += (0 - mesh.rotation.y) * 0.08;
          mesh.rotation.z += (0 - mesh.rotation.z) * 0.08;
        } else {
          mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08);
          mesh.rotation.x += (0.035 * Math.sin(t * 0.4 + whisper.phase) - mesh.rotation.x) * 0.04;
          mesh.rotation.y += ((-0.18 * Math.sin(angle) + (dx * 0.025 * push)) - mesh.rotation.y) * 0.045;
          mesh.rotation.z += ((0.045 * Math.cos(angle) + (dz * 0.018 * push)) - mesh.rotation.z) * 0.045;
        }
        mesh.position.lerp(base, 0.08);

        const mat = mesh.material as THREE.MeshStandardMaterial[];
        const front = mat[4];
        if (front) {
          front.emissive = new THREE.Color(selected ? 0x24415b : hovered === mesh ? 0x122333 : 0x000000);
          front.emissiveIntensity = selected ? 0.65 : hovered === mesh ? 0.25 : 0;
        }
      });

      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0]?.object as THREE.Mesh | undefined;
      if (hit !== hovered) {
        hovered = hit ?? null;
        renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
      }

      particles.rotation.y = t * 0.008;
      horizonRing.rotation.z = t * 0.012;
      glow.material.opacity = 0.52 + Math.sin(t * 0.25) * 0.08;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerleave', onLeave);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      geometries.forEach((geometry) => geometry.dispose());
      textures.forEach((texture) => texture.dispose());
      materials.forEach((material) => material.dispose());
      particleGeometry.dispose();
      particleMaterial.dispose();
      glowTexture.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      horizonRing.geometry.dispose();
      (horizonRing.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  const closeReading = () => {
    stateRef.current.selected = null;
    setSelected(null);
  };

  const vote = (direction: 1 | -1) => {
    if (!selected) return;
    setWhispers((items) => items.map((item) => item.id === selected.id ? { ...item, votes: Math.max(0, item.votes + direction) } : item));
    if (direction === 1) setStats((s) => ({ ...s, liked: s.liked + 1 }));
  };

  const reveal = () => {
    if (!selected) return;
    setUnlocked((items) => items.includes(selected.id) ? items : [...items, selected.id]);
  };

  const submitWhisper = () => {
    const text = newText.trim();
    if (!text) return;
    const nextId = Math.max(...whispers.map((item) => item.id), 0) + 1;
    const added: Whisper = {
      id: nextId,
      text,
      locked: false,
      votes: 0,
      orbit: 0,
      angle: Math.random() * Math.PI * 2,
      radius: 4.2,
      height: -0.4 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    };
    // The current renderer is intentionally rebuilt after submission; this is a prototype-level local persistence loop.
    setWhispers((items) => [...items, added]);
    setNewText('');
    setComposerOpen(false);
    window.setTimeout(() => window.location.reload(), 80);
  };

  return (
    <main className="world-lab">
      <div ref={mountRef} className="world-canvas" aria-label="Sotto spatial discovery world" />

      <header className="hud hud-top">
        <div className="brand">SOTTO</div>
        <div className="hud-caption">A FIELD OF WHISPERS</div>
      </header>

      <div className="hud hud-stats">
        <span>{stats.discovered} DISCOVERED</span>
        <span>{stats.liked} LIKED</span>
      </div>

      <div className="hud hud-bottom">
        <button type="button" onClick={() => setComposerOpen(true)}>LEAVE A WHISPER</button>
        <span>DRAG TO MOVE · MOVE CLOSER · SELECT</span>
      </div>

      {selected && (
        <section className="reading-layer" aria-label="Whisper reader">
          <div className="reading-scrim" onClick={closeReading} />
          <article className="reading-object">
            <div className="reading-topline">
              <span>WHISPER / {String(selected.id).padStart(3, '0')}</span>
              <button type="button" onClick={closeReading} aria-label="Close">CLOSE</button>
            </div>
            <div className="reading-content">
              <p className={selected.locked && !unlockedSet.has(selected.id) ? 'is-locked' : ''}>
                {selected.locked && !unlockedSet.has(selected.id)
                  ? `${selected.text.split(' ').slice(0, 10).join(' ')} …`
                  : selected.text}
              </p>
              {selected.locked && !unlockedSet.has(selected.id) && (
                <button className="reveal-button" type="button" onClick={reveal}>REVEAL WHISPER · $1 TEST GATE</button>
              )}
            </div>
            <footer className="reading-footer">
              <div className="vote-row">
                <button type="button" onClick={() => vote(1)}>↑ {selected.votes}</button>
                <button type="button" onClick={() => vote(-1)}>↓</button>
              </div>
              <span>ANONYMOUS · NO PROFILE</span>
            </footer>
          </article>
        </section>
      )}

      {composerOpen && (
        <section className="composer-layer" aria-label="Leave a whisper">
          <div className="reading-scrim" onClick={() => setComposerOpen(false)} />
          <form className="composer" onSubmit={(event) => { event.preventDefault(); submitWhisper(); }}>
            <div className="reading-topline"><span>NEW WHISPER</span><button type="button" onClick={() => setComposerOpen(false)}>CLOSE</button></div>
            <textarea autoFocus value={newText} onChange={(event) => setNewText(event.target.value)} placeholder="Leave something you have never said out loud…" maxLength={500} />
            <div className="composer-footer"><span>{newText.length}/500</span><button type="submit" disabled={!newText.trim()}>PLACE IN THE WORLD</button></div>
          </form>
        </section>
      )}
    </main>
  );
}
