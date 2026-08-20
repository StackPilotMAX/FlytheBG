"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type DemoTheme = "product" | "portrait" | "automobile";
type ThreeController = { setTheme: (theme: DemoTheme) => void };

const themes: Array<{ id: DemoTheme; label: string; short: string }> = [
  { id: "product", label: "E-Commerce Product", short: "Product" },
  { id: "portrait", label: "Portrait / Passport", short: "Portrait" },
  { id: "automobile", label: "Automobile", short: "Car" },
];

export function LocalAISeparation3D() {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ThreeController | null>(null);
  const depthRef = useRef(1.45);
  const targetViewRef = useRef({ x: -0.08, y: -0.28 });
  const [theme, setTheme] = useState<DemoTheme>("product");
  const [depth, setDepth] = useState(1.45);
  const [ready, setReady] = useState(false);

  useEffect(() => { depthRef.current = depth; }, [depth]);
  useEffect(() => { controllerRef.current?.setTheme(theme); }, [theme]);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;
    let disposed = false;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let cleanupPointer = () => {};
    let disposeThree = () => {};

    void (async () => {
      const THREE = await import("three");
      if (disposed || !canvasHostRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0.15, 7.4);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-label", "Interactive 3D image layer separation simulation");
      renderer.domElement.setAttribute("role", "img");
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.touchAction = "none";
      host.replaceChildren(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xcfe4ff, 1.7));
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
      keyLight.position.set(3.5, 4.5, 6);
      scene.add(keyLight);
      const cyan = new THREE.PointLight(0x72dbff, 20, 20);
      cyan.position.set(-4, 1.5, 3.5);
      scene.add(cyan);
      const violet = new THREE.PointLight(0xa98cff, 16, 18);
      violet.position.set(4, -2, 1.5);
      scene.add(violet);

      const stage = new THREE.Group();
      const backgroundGroup = new THREE.Group();
      const foregroundGroup = new THREE.Group();
      stage.add(backgroundGroup, foregroundGroup);
      scene.add(stage);

      const backGeometry = new THREE.PlaneGeometry(5.25, 3.45);
      const edgeLines = new THREE.LineSegments(new THREE.EdgesGeometry(backGeometry), new THREE.LineBasicMaterial({ color: 0x7edfff, transparent: true, opacity: 0.28 }));
      edgeLines.position.z = -0.035;
      backgroundGroup.add(edgeLines);

      let backgroundPlane: import("three").Mesh | null = null;
      let activeTexture: import("three").CanvasTexture | null = null;
      const dynamicObjects: import("three").Object3D[] = [];

      function disposeObject(object: import("three").Object3D) {
        object.traverse((child) => {
          const mesh = child as import("three").Mesh;
          (mesh.geometry as import("three").BufferGeometry | undefined)?.dispose?.();
          const material = mesh.material as import("three").Material | import("three").Material[] | undefined;
          if (Array.isArray(material)) material.forEach((item) => item.dispose()); else material?.dispose?.();
        });
      }

      function clearDynamicObjects() {
        dynamicObjects.splice(0).forEach((object) => {
          foregroundGroup.remove(object);
          disposeObject(object);
        });
      }

      function makeBackgroundTexture(kind: DemoTheme) {
        const canvas = document.createElement("canvas");
        canvas.width = 1100;
        canvas.height = 720;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D is unavailable.");
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (kind === "product") { gradient.addColorStop(0, "#321b76"); gradient.addColorStop(.48, "#087d9d"); gradient.addColorStop(1, "#07131f"); }
        else if (kind === "portrait") { gradient.addColorStop(0, "#124a72"); gradient.addColorStop(.55, "#a25f97"); gradient.addColorStop(1, "#101b31"); }
        else { gradient.addColorStop(0, "#071629"); gradient.addColorStop(.52, "#24516c"); gradient.addColorStop(1, "#05070d"); }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = .72;
        for (let i = 0; i < 10; i += 1) {
          const x = (i * 147) % canvas.width;
          const y = 90 + ((i * 91) % 480);
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 150);
          glow.addColorStop(0, i % 2 ? "rgba(114,219,255,.24)" : "rgba(181,139,255,.20)");
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.fillRect(x - 150, y - 150, 300, 300);
        }
        ctx.globalAlpha = 1;
        if (kind === "product") {
          ctx.fillStyle = "rgba(255,255,255,.055)";
          ctx.fillRect(65, 95, 970, 510);
          ctx.strokeStyle = "rgba(207,241,255,.16)";
          ctx.lineWidth = 2;
          for (let y = 180; y < 640; y += 140) { ctx.beginPath(); ctx.moveTo(70, y); ctx.lineTo(1030, y); ctx.stroke(); }
        } else if (kind === "portrait") {
          ctx.fillStyle = "rgba(255,255,255,.055)";
          ctx.beginPath(); ctx.arc(850, 180, 145, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(20,30,50,.3)"; ctx.fillRect(0, 570, 1100, 150);
        } else {
          ctx.fillStyle = "rgba(4,9,17,.50)";
          ctx.beginPath(); ctx.moveTo(0, 720); ctx.lineTo(330, 410); ctx.lineTo(770, 410); ctx.lineTo(1100, 720); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,.42)"; ctx.lineWidth = 8; ctx.setLineDash([40, 30]); ctx.beginPath(); ctx.moveTo(550, 720); ctx.lineTo(550, 430); ctx.stroke(); ctx.setLineDash([]);
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        return texture;
      }

      const glossy = (color: number, metalness = .18) => new THREE.MeshPhysicalMaterial({ color, roughness: .25, metalness, clearcoat: .72, clearcoatRoughness: .2 });

      function addProduct() {
        const group = new THREE.Group();
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.85, .72), glossy(0x35c8ef, .08));
        box.rotation.y = -.12; box.position.y = -.05;
        const label = new THREE.Mesh(new THREE.PlaneGeometry(.82, .62), new THREE.MeshBasicMaterial({ color: 0xf0feff }));
        label.position.set(0, .1, .37);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(.33, .37, .22, 32), glossy(0x8f7dff, .28));
        cap.position.y = 1.06;
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.56, .055, 16, 64), new THREE.MeshStandardMaterial({ color: 0xc6f5ff, emissive: 0x2b7593, emissiveIntensity: .55 }));
        ring.rotation.x = Math.PI / 2; ring.position.z = -.28;
        group.add(box, label, cap, ring);
        foregroundGroup.add(group); dynamicObjects.push(group);
      }

      function addPortrait() {
        const group = new THREE.Group();
        const head = new THREE.Mesh(new THREE.SphereGeometry(.58, 40, 28), glossy(0xd7a284, .02));
        head.position.y = .77; head.scale.z = .9;
        const hair = new THREE.Mesh(new THREE.SphereGeometry(.61, 40, 22, 0, Math.PI * 2, 0, Math.PI * .5), glossy(0x152342, .05));
        hair.position.set(0, .93, -.04);
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.72, 1.15, 10, 24), glossy(0x4ba9e6, .04));
        torso.position.y = -.65; torso.scale.set(1.18, 1, .45);
        const shoulders = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), glossy(0x4ba9e6, .04));
        shoulders.scale.set(1.08, .37, .38); shoulders.position.y = -.78;
        group.add(head, hair, torso, shoulders);
        foregroundGroup.add(group); dynamicObjects.push(group);
      }

      function addAutomobile() {
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.65, .62, 1.18), glossy(0x246fe5, .56));
        body.position.y = -.28;
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.45, .58, 1.02), new THREE.MeshPhysicalMaterial({ color: 0x89ddff, transparent: true, opacity: .72, roughness: .08, metalness: .1, transmission: .18 }));
        cabin.position.set(.05, .27, 0); cabin.rotation.z = -.03;
        const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: .72 });
        const hubMaterial = new THREE.MeshStandardMaterial({ color: 0xb9d5e8, metalness: .75, roughness: .25 });
        [-.88, .88].forEach((x) => [-.6, .6].forEach((z) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .22, 28), wheelMaterial);
          wheel.rotation.x = Math.PI / 2; wheel.position.set(x, -.62, z);
          const hub = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .235, 20), hubMaterial);
          hub.rotation.x = Math.PI / 2; hub.position.copy(wheel.position);
          group.add(wheel, hub);
        }));
        group.add(body, cabin);
        foregroundGroup.add(group); dynamicObjects.push(group);
      }

      function setTheme3D(kind: DemoTheme) {
        clearDynamicObjects();
        activeTexture?.dispose();
        if (backgroundPlane) { backgroundGroup.remove(backgroundPlane); disposeObject(backgroundPlane); }
        activeTexture = makeBackgroundTexture(kind);
        backgroundPlane = new THREE.Mesh(backGeometry.clone(), new THREE.MeshBasicMaterial({ map: activeTexture, side: THREE.DoubleSide }));
        backgroundPlane.position.z = -.08;
        backgroundGroup.add(backgroundPlane);
        if (kind === "product") addProduct(); else if (kind === "portrait") addPortrait(); else addAutomobile();
      }

      controllerRef.current = { setTheme: setTheme3D };
      setTheme3D(theme);

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let rotationX = targetViewRef.current.x;
      let rotationY = targetViewRef.current.y;
      let dragging = false;
      let pointerId = -1;
      let lastX = 0;
      let lastY = 0;
      let manualUntil = 0;

      const pointerDown = (event: PointerEvent) => {
        dragging = true; pointerId = event.pointerId; lastX = event.clientX; lastY = event.clientY;
        renderer.domElement.setPointerCapture(event.pointerId);
        manualUntil = performance.now() + 6000;
      };
      const pointerMove = (event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        const dx = event.clientX - lastX; const dy = event.clientY - lastY;
        lastX = event.clientX; lastY = event.clientY;
        targetViewRef.current.y += dx * .0075;
        targetViewRef.current.x = Math.max(-.62, Math.min(.62, targetViewRef.current.x + dy * .006));
        manualUntil = performance.now() + 6000;
      };
      const pointerUp = (event: PointerEvent) => {
        if (event.pointerId !== pointerId) return;
        dragging = false;
        if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
      };
      renderer.domElement.addEventListener("pointerdown", pointerDown);
      renderer.domElement.addEventListener("pointermove", pointerMove);
      renderer.domElement.addEventListener("pointerup", pointerUp);
      renderer.domElement.addEventListener("pointercancel", pointerUp);
      cleanupPointer = () => {
        renderer.domElement.removeEventListener("pointerdown", pointerDown);
        renderer.domElement.removeEventListener("pointermove", pointerMove);
        renderer.domElement.removeEventListener("pointerup", pointerUp);
        renderer.domElement.removeEventListener("pointercancel", pointerUp);
      };

      const resize = () => {
        const rect = host.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();

      disposeThree = () => {
        activeTexture?.dispose();
        scene.traverse((object) => {
          const mesh = object as import("three").Mesh;
          (mesh.geometry as import("three").BufferGeometry | undefined)?.dispose?.();
          const material = mesh.material as import("three").Material | import("three").Material[] | undefined;
          if (Array.isArray(material)) material.forEach((item) => item.dispose()); else material?.dispose?.();
        });
        renderer.dispose();
      };

      const clock = new THREE.Clock();
      const animate = () => {
        if (disposed) return;
        const delta = Math.min(.05, clock.getDelta());
        const now = performance.now();
        if (!reducedMotion && !dragging && now > manualUntil) targetViewRef.current.y += delta * .12;
        rotationX += (targetViewRef.current.x - rotationX) * .075;
        rotationY += (targetViewRef.current.y - rotationY) * .075;
        stage.rotation.x = rotationX;
        stage.rotation.y = rotationY;
        foregroundGroup.position.z += (depthRef.current - foregroundGroup.position.z) * .085;
        foregroundGroup.position.y = Math.sin(now * .0011) * (reducedMotion ? 0 : .025);
        backgroundGroup.position.z = -Math.min(.65, depthRef.current * .18);
        renderer.render(scene, camera);
        animationFrame = window.requestAnimationFrame(animate);
      };
      setReady(true);
      animate();
    })().catch((error) => {
      console.error("FlytheBG Three.js simulator could not initialize", error);
      setReady(false);
    });

    return () => {
      disposed = true;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      cleanupPointer();
      controllerRef.current = null;
      disposeThree();
      host.replaceChildren();
    };
  }, []);

  function setFrontView() { targetViewRef.current = { x: 0, y: 0 }; setDepth(.32); }
  function setExplodedView() { targetViewRef.current = { x: -.16, y: -.58 }; setDepth(2.55); }

  return (
    <section className="localAiHero relative overflow-hidden" aria-labelledby="local-ai-hero-title">
      <div className="shell localAiHeroGrid relative z-10">
        <div className="localAiIntro min-w-0">
          <span className="eyebrow"><i/> 100% local background remover</span>
          <h1 id="local-ai-hero-title">Your photo. Your device. <em>Background gone.</em></h1>
          <p>FlytheBG keeps the selected image on your device while local AI separates the foreground. Portrait, product, landscape, vertical, square, and panoramic frames keep their original aspect ratio.</p>
          <div className="heroActions"><Link className="buttonPrimary" href="/remove-background">Remove a background <span>↗</span></Link><Link className="buttonSecondary" href="/features/passport-photo">Make passport photos</Link></div>
          <div className="heroProof"><span><strong>100% local image processing</strong><small>No FlytheBG image upload API</small></span><span><strong>Low-memory aware</strong><small>Adaptive model input on phones</small></span><span><strong>Source pixels preserved</strong><small>AI estimates the alpha mask</small></span></div>
        </div>

        <div className="separationSimulator min-w-0" aria-label="Interactive 3D background separation simulator">
          <div className="simulatorTopline"><div><span className="kicker">Interactive local-AI visualizer</span><h2>See How Local AI Separates Your Images</h2></div><span className={`gpuBadge ${ready ? "ready" : ""}`}>⚡ Rendered via WebGL using your local GPU</span></div>
          <div className="simulatorBody min-w-0">
            <div className="simulatorCanvasShell relative min-w-0 overflow-hidden"><div ref={canvasHostRef} className="simulatorCanvas"/><div className="canvasHint"><span>Drag / swipe to orbit</span><span>Foreground ↗ Z depth</span></div></div>
            <aside className="simulatorControls min-w-0">
              <div className="controlBlock"><span className="controlEyebrow">Demo subject</span><div className="themeButtons">{themes.map((item) => <button key={item.id} type="button" className={theme === item.id ? "active" : ""} onClick={() => setTheme(item.id)} aria-pressed={theme === item.id}><strong>{item.short}</strong><small>{item.label}</small></button>)}</div></div>
              <label className="depthControl"><span><strong>Separation Depth</strong><b>{depth.toFixed(1)}×</b></span><input type="range" min="0.2" max="3.2" step="0.05" value={depth} onChange={(event) => setDepth(Number(event.target.value))}/><small>Move the foreground along the Z-axis to visualize the extraction layer.</small></label>
              <div className="controlBlock"><span className="controlEyebrow">Camera presets</span><div className="viewButtons"><button type="button" onClick={setFrontView}>Front View (Flat Image)</button><button type="button" onClick={setExplodedView}>3D Exploded View</button></div></div>
              <Link className="buttonPrimary simulatorCta" href="/remove-background">Try Your Own Photo Now <span>↗</span></Link>
              <p className="simulatorPrivacy">The 3D scene is illustrative. Actual background removal uses the local IMG.LY model in your browser.</p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
