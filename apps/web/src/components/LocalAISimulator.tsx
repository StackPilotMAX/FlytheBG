"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type DemoTheme = "product" | "portrait" | "car";

type ThemeCopy = {
  label: string;
  short: string;
  background: [string, string, string];
  accent: string;
};

const themes: Record<DemoTheme, ThemeCopy> = {
  product: {
    label: "E-Commerce Product",
    short: "Bottle + studio shelf",
    background: ["#9b7cff", "#18112b", "#ffb86b"],
    accent: "#bca6ff",
  },
  portrait: {
    label: "Portrait / Passport",
    short: "Person + soft city glow",
    background: ["#4cc9f0", "#07141e", "#ff7bbd"],
    accent: "#7ce7ff",
  },
  car: {
    label: "Automobile",
    short: "Car + neon roadway",
    background: ["#59f0bb", "#06130f", "#5c7cff"],
    accent: "#79ffd0",
  },
};

function paintBackground(theme: DemoTheme) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 760;
  const ctx = canvas.getContext("2d")!;
  const palette = themes[theme].background;
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(.48, palette[1]);
  gradient.addColorStop(1, palette[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 16; i += 1) {
    ctx.globalAlpha = .12 + (i % 4) * .035;
    ctx.fillStyle = i % 2 ? "#ffffff" : palette[0];
    ctx.beginPath();
    ctx.arc(80 + i * 92, 90 + ((i * 67) % 500), 24 + (i % 5) * 18, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (theme === "product") {
    ctx.fillStyle = "rgba(255,255,255,.13)";
    ctx.fillRect(100, 545, 1000, 105);
    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 545, 1000, 105);
  }
  if (theme === "portrait") {
    ctx.fillStyle = "rgba(255,255,255,.09)";
    for (let x = 90; x < 1160; x += 110) ctx.fillRect(x, 120 + (x % 180), 54, 480);
  }
  if (theme === "car") {
    ctx.fillStyle = "rgba(255,255,255,.12)";
    ctx.fillRect(0, 505, 1200, 255);
    ctx.strokeStyle = "rgba(255,255,255,.38)";
    ctx.lineWidth = 8;
    ctx.setLineDash([55, 45]);
    ctx.beginPath();
    ctx.moveTo(0, 650);
    ctx.lineTo(1200, 585);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  return new THREE.CanvasTexture(canvas);
}

function paintForeground(theme: DemoTheme) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 900;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.shadowColor = "rgba(0,0,0,.34)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 22;

  if (theme === "product") {
    const glow = ctx.createLinearGradient(300, 180, 620, 720);
    glow.addColorStop(0, "#ffffff");
    glow.addColorStop(.4, "#d9c8ff");
    glow.addColorStop(1, "#8367ff");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.roundRect(305, 235, 290, 480, 54);
    ctx.fill();
    ctx.fillStyle = "#f4f0ff";
    ctx.beginPath();
    ctx.roundRect(365, 155, 170, 120, 28);
    ctx.fill();
    ctx.fillStyle = "#14111c";
    ctx.beginPath();
    ctx.roundRect(362, 380, 176, 118, 18);
    ctx.fill();
    ctx.fillStyle = "#f7f2ff";
    ctx.font = "800 34px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("FLY", 450, 450);
  }

  if (theme === "portrait") {
    ctx.fillStyle = "#ffd2bf";
    ctx.beginPath();
    ctx.arc(450, 285, 122, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1c1831";
    ctx.beginPath();
    ctx.arc(450, 250, 132, Math.PI, Math.PI * 2);
    ctx.fill();
    const shirt = ctx.createLinearGradient(310, 420, 590, 760);
    shirt.addColorStop(0, "#7ce7ff");
    shirt.addColorStop(1, "#715cff");
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.moveTo(300, 760);
    ctx.quadraticCurveTo(315, 445, 450, 430);
    ctx.quadraticCurveTo(585, 445, 600, 760);
    ctx.closePath();
    ctx.fill();
  }

  if (theme === "car") {
    const body = ctx.createLinearGradient(245, 390, 670, 610);
    body.addColorStop(0, "#d8fff0");
    body.addColorStop(.5, "#4ff2b8");
    body.addColorStop(1, "#1b7e62");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.roundRect(180, 430, 540, 205, 66);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(300, 430);
    ctx.lineTo(395, 318);
    ctx.lineTo(565, 325);
    ctx.lineTo(650, 430);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0d1620";
    ctx.beginPath();
    ctx.arc(300, 625, 72, 0, Math.PI * 2);
    ctx.arc(610, 625, 72, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dff7ff";
    ctx.beginPath();
    ctx.arc(300, 625, 35, 0, Math.PI * 2);
    ctx.arc(610, 625, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(12,24,38,.88)";
    ctx.beginPath();
    ctx.moveTo(405, 340);
    ctx.lineTo(548, 345);
    ctx.lineTo(608, 425);
    ctx.lineTo(340, 425);
    ctx.closePath();
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

export function LocalAISimulator() {
  const hostRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<THREE.Mesh | null>(null);
  const backgroundRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [theme, setTheme] = useState<DemoTheme>("product");
  const [depth, setDepth] = useState(1.55);
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#070912");

    const camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
    camera.position.set(4.8, 2.1, 7.6);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      return;
    }

    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const lowMemory = memory <= 4 || window.innerWidth < 720;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowMemory ? 1.15 : 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.replaceChildren(renderer.domElement);
    renderer.domElement.className = "localAiCanvas";

    const group = new THREE.Group();
    scene.add(group);

    const backTexture = paintBackground(theme);
    backTexture.colorSpace = THREE.SRGBColorSpace;
    const frontTexture = paintForeground(theme);
    frontTexture.colorSpace = THREE.SRGBColorSpace;

    const background = new THREE.Mesh(
      new THREE.PlaneGeometry(5.7, 3.65),
      new THREE.MeshBasicMaterial({ map: backTexture, side: THREE.DoubleSide }),
    );
    background.position.z = -.45;
    backgroundRef.current = background;
    group.add(background);

    const foreground = new THREE.Mesh(
      new THREE.PlaneGeometry(3.7, 3.7),
      new THREE.MeshBasicMaterial({ map: frontTexture, transparent: true, side: THREE.DoubleSide, depthWrite: false }),
    );
    foreground.position.z = depth;
    foregroundRef.current = foreground;
    group.add(foreground);

    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(6.05, 4, .08)),
      new THREE.LineBasicMaterial({ color: new THREE.Color(themes[theme].accent), transparent: true, opacity: .28 }),
    );
    frame.position.z = -.5;
    group.add(frame);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .065;
    controls.enablePan = false;
    controls.minDistance = 5.1;
    controls.maxDistance = 11;
    controls.autoRotate = true;
    controls.autoRotateSpeed = .4;
    controls.target.set(0, 0, .5);
    controlsRef.current = controls;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(280, rect.width);
      const height = Math.max(340, rect.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    let raf = 0;
    const render = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(render);
    };
    render();
    setWebglReady(true);

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      backTexture.dispose();
      frontTexture.dispose();
      background.geometry.dispose();
      (background.material as THREE.Material).dispose();
      foreground.geometry.dispose();
      (foreground.material as THREE.Material).dispose();
      frame.geometry.dispose();
      (frame.material as THREE.Material).dispose();
      renderer.dispose();
      cameraRef.current = null;
      controlsRef.current = null;
      foregroundRef.current = null;
      backgroundRef.current = null;
      host.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const foreground = foregroundRef.current;
    if (foreground) foreground.position.z = depth;
  }, [depth]);

  useEffect(() => {
    const background = backgroundRef.current;
    const foreground = foregroundRef.current;
    if (!background || !foreground) return;

    const backTexture = paintBackground(theme);
    backTexture.colorSpace = THREE.SRGBColorSpace;
    const frontTexture = paintForeground(theme);
    frontTexture.colorSpace = THREE.SRGBColorSpace;

    const backMaterial = background.material as THREE.MeshBasicMaterial;
    const frontMaterial = foreground.material as THREE.MeshBasicMaterial;
    backMaterial.map?.dispose();
    frontMaterial.map?.dispose();
    backMaterial.map = backTexture;
    frontMaterial.map = frontTexture;
    backMaterial.needsUpdate = true;
    frontMaterial.needsUpdate = true;
  }, [theme]);

  function frontView() {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    setDepth(.18);
    camera.position.set(0, 0, 8.4);
    controls.target.set(0, 0, 0);
    controls.autoRotate = false;
    controls.update();
  }

  function explodedView() {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    setDepth(2.35);
    camera.position.set(5, 2.4, 7.2);
    controls.target.set(0, 0, .6);
    controls.autoRotate = true;
    controls.update();
  }

  return (
    <section className="localAiHero" aria-labelledby="local-ai-title">
      <div className="shell localAiHeroInner">
        <div className="localAiCopy">
          <span className="heroBadge"><i/> Private AI image editing · no account</span>
          <h1 id="local-ai-title">Remove the background.<br/><em>Keep everything that matters.</em></h1>
          <p>FlytheBG turns photos into clean transparent PNGs directly in your browser. No image-processing backend, no forced square crop, and a smarter local AI path for both powerful laptops and budget phones.</p>
          <div className="heroActions">
            <Link className="buttonPrimary heroPrimary" href="/remove-background">Remove a background <span>↗</span></Link>
            <Link className="buttonSecondary" href="/features/passport-photo">Make passport photos</Link>
          </div>
          <div className="heroMiniProof"><span>✓ No image upload</span><span>✓ Free to try</span><span>✓ Any aspect ratio</span><span>✓ Transparent PNG</span></div>
        </div>

        <div className="localAiStudio" aria-label="Interactive local AI background separation demo">
          <div className="studioChrome">
            <div className="studioDots"><i/><i/><i/></div>
            <div className="studioFile"><span>flythebg.local</span><strong>{themes[theme].short}</strong></div>
            <span className="studioPrivacy">● LOCAL ONLY</span>
          </div>

          <div className="studioBody">
            <div className="localAiViewport">
              <div ref={hostRef} className="localAiCanvasHost" aria-label="Interactive 3D image layer separation simulation" />
              {!webglReady && <div className="localAiFallback">WebGL preview loads here. Background removal can still use CPU/WASM if WebGPU is unavailable.</div>}
              <div className="localAiFloatingBadge">⚡ WebGL preview · drag to orbit</div>
              <div className="localAiLegend"><span><i className="bgDot"/> Background</span><span><i className="fgDot"/> Subject</span></div>
            </div>

            <div className="localAiControls">
              <div className="controlHeader"><div><span>Live separation demo</span><strong>{themes[theme].label}</strong></div><span className="liveChip">LIVE 3D</span></div>

              <div className="themeTabs" role="group" aria-label="Demo visual theme">
                {(Object.keys(themes) as DemoTheme[]).map((key) => (
                  <button key={key} type="button" className={theme === key ? "active" : ""} onClick={() => setTheme(key)}>
                    <span>{key === "product" ? "✦" : key === "portrait" ? "◉" : "◆"}</span>{themes[key].label}
                  </button>
                ))}
              </div>

              <label className="separationControl">
                <span><strong>Separation Depth</strong><b>{depth.toFixed(2)}×</b></span>
                <input type="range" min="0.12" max="2.8" step="0.01" value={depth} onChange={(event) => setDepth(Number(event.target.value))}/>
                <small>Pull the subject away from the background to see the extraction metaphor.</small>
              </label>

              <div className="presetAngles">
                <button type="button" onClick={frontView}>Front View <span>Flat image</span></button>
                <button type="button" onClick={explodedView}>3D Exploded <span>Show depth</span></button>
              </div>

              <div className="studioAccuracyCard"><span className="accuracyOrb">AI</span><div><strong>Smart local pipeline</strong><small>FP16 when capable · quantized fallback · refined alpha edges</small></div></div>
            </div>
          </div>

          <div className="studioStatus">
            <span><b>01</b> Detect device</span>
            <span><b>02</b> Segment subject</span>
            <span><b>03</b> Refine alpha</span>
            <span><b>04</b> Export PNG</span>
          </div>
        </div>
      </div>
    </section>
  );
}
