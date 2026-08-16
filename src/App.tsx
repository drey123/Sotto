import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type CardData = {
  id: number;
  text: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

const CARDS: CardData[] = [
  { id: 1, text: 'I never told anyone what happened that night.', position: [-1.9, 0.55, 0.2], rotation: [0.02, 0.22, -0.03], scale: 1 },
  { id: 2, text: 'I still have the message. I never opened it.', position: [1.7, 0.15, -1.2], rotation: [-0.04, -0.3, 0.02], scale: 0.82 },
  { id: 3, text: 'Nobody knows why I actually left.', position: [0.2, 1.45, -2.8], rotation: [0.06, 0.12, 0.01], scale: 0.68 },
  { id: 4, text: 'I lied about where I was that evening.', position: [-2.9, -0.65, -2.4], rotation: [-0.03, 0.36, -0.02], scale: 0.62 },
  { id: 5, text: 'There is one thing I would never say aloud.', position: [3.05, 0.9, -3.5], rotation: [0.02, -0.42, 0.04], scale: 0.56 },
];

function makeCardTexture(text: string, index: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 620;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#090b0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(255,255,255,0.045)');
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.012)');
  gradient.addColorStop(1, 'rgba(82,116,154,0.14)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '500 25px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.letterSpacing = '4px';
  ctx.fillText(`ANONYMOUS / ${String(index + 1).padStart(3, '0')}`, 62, 72);

  ctx.font = '400 58px Inter, Arial, sans-serif';
  ctx.fillStyle = '#f0f2f5';
  ctx.letterSpacing = '0px';
  wrapText(ctx, text, 62, 220, 850, 72);

  ctx.font = '500 21px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillText('SELECT TO READ', 62, 552);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState<CardData | null>(null);
  const openedRef = useRef<CardData | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e12);
    scene.fog = new THREE.FogExp2(0x0b0e12, 0.045);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 0.3, 7.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.minDistance = 4.8;
    controls.maxDistance = 11;
    controls.minPolarAngle = Math.PI * 0.34;
    controls.maxPolarAngle = Math.PI * 0.66;
    controls.target.set(0, 0.25, -1.1);

    const ambient = new THREE.HemisphereLight(0xe5ebf3, 0x11151a, 1.7);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 3.0);
    key.position.set(-4, 6, 5);
    scene.add(key);

    const cool = new THREE.PointLight(0x547ba5, 14, 10);
    cool.position.set(4, 1.8, 1);
    scene.add(cool);

    // Neutral spatial test rig — deliberately not the final Sotto world.
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x12161b, metalness: 0.25, roughness: 0.72 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.35;
    scene.add(floor);

    const cards = new THREE.Group();
    scene.add(cards);

    const meshes: THREE.Object3D[] = [];
    const textures: THREE.Texture[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    CARDS.forEach((data, index) => {
      const geometry = new THREE.BoxGeometry(2.65 * data.scale, 1.6 * data.scale, 0.12 * data.scale);
      geometries.push(geometry);
      const texture = makeCardTexture(data.text, index);
      textures.push(texture);

      const side = new THREE.MeshStandardMaterial({ color: 0x3b4149, metalness: 0.92, roughness: 0.24 });
      const front = new THREE.MeshStandardMaterial({ map: texture, metalness: 0.58, roughness: 0.3 });
      materials.push(side, front);
      const mesh = new THREE.Mesh(geometry, [side, side, side, side, front, side]);
      mesh.position.set(...data.position);
      mesh.rotation.set(...data.rotation);
      mesh.userData.cardId = data.id;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      cards.add(mesh);
      meshes.push(mesh);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered: THREE.Object3D | null = null;

    const setPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (event: PointerEvent) => setPointer(event);
    const onPointerDown = (event: PointerEvent) => {
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0];
      if (!hit) return;
      const data = CARDS.find((card) => card.id === hit.object.userData.cardId);
      if (!data) return;
      if (openedRef.current?.id === data.id) {
        openedRef.current = null;
        setOpened(null);
      } else {
        openedRef.current = data;
        setOpened(data);
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      const t = clock.getElapsedTime();
      controls.update();
      meshes.forEach((mesh, index) => {
        const data = CARDS[index];
        const selected = openedRef.current?.id === data.id;
        const targetScale = selected ? data.scale * 1.07 : data.scale;
        const pulse = selected ? 1 + Math.sin(t * 2.2) * 0.006 : 1;
        mesh.scale.lerp(new THREE.Vector3(targetScale * pulse, targetScale * pulse, targetScale * pulse), 0.08);
        mesh.position.y += Math.sin(t * 0.45 + index) * 0.0008;
      });
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0]?.object ?? null;
      if (hit !== hovered) {
        if (hovered) hovered.scale.multiplyScalar(0.98);
        hovered = hit;
        if (hovered) hovered.scale.multiplyScalar(1.02);
        renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      geometries.forEach((geometry) => geometry.dispose());
      textures.forEach((texture) => texture.dispose());
      materials.forEach((material) => material.dispose());
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <main className="world-lab">
      <div ref={mountRef} className="world-canvas" aria-label="Sotto spatial confession world" />
      <header className="world-label">SOTTO / SPATIAL LAB 002</header>
      <div className="world-help">DRAG TO MOVE · TAP A WHISPER TO OPEN</div>
      {opened && (
        <section className="reading-panel" aria-label="Opened confession">
          <div className="reading-meta">ANONYMOUS / {String(opened.id).padStart(3, '0')}</div>
          <p>{opened.text}</p>
          <div className="reading-actions">
            <button type="button" onClick={() => { openedRef.current = null; setOpened(null); }}>RETURN TO WORLD</button>
            <button type="button">UPVOTE</button>
            <button type="button">DOWNVOTE</button>
          </div>
        </section>
      )}
    </main>
  );
}
