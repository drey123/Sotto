import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function SpatialCard() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.15, 4.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    const geometry = new THREE.BoxGeometry(2.7, 1.65, 0.075);
    const material = new THREE.MeshStandardMaterial({ color: 0x15171b, metalness: 0.9, roughness: 0.27 });
    const card = new THREE.Mesh(geometry, material);
    group.add(card);

    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x7e8794, transparent: true, opacity: 0.38 }),
    );
    group.add(edge);

    scene.add(new THREE.HemisphereLight(0xdde5ef, 0x08090b, 1.35));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-2.5, 3.5, 4);
    scene.add(key);
    const cool = new THREE.PointLight(0x5d7ea6, 8, 7);
    cool.position.set(2.2, 0.8, 2.5);
    scene.add(cool);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let frame = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      group.rotation.y = Math.sin(t * 0.35) * 0.055;
      group.rotation.x = Math.sin(t * 0.22) * 0.018;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      edge.geometry.dispose();
      (edge.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <button className={`spatial-card ${selected ? 'is-selected' : ''}`} onClick={() => setSelected((value) => !value)} aria-pressed={selected}>
      <div ref={mountRef} className="card-canvas" aria-hidden="true" />
      <div className="card-copy">
        <span className="card-kicker">anonymous / 001</span>
        <p>I never told anyone what happened that night.</p>
        <span className="card-hint">{selected ? 'selected' : 'select'}</span>
      </div>
    </button>
  );
}

export default function App() {
  return (
    <main className="prototype">
      <div className="prototype-label">SOTTO / VISUAL LAB 001</div>
      <SpatialCard />
      <div className="prototype-note">One object. One interaction. No world committed yet.</div>
    </main>
  );
}
