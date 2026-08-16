"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AskFlytheBG } from "@/components/AskFlytheBG";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
type GalaxyState = "loading" | "ready" | "error";

export function GalaxyWorld() {
  const rootRef = useRef<HTMLElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [galaxyState, setGalaxyState] = useState<GalaxyState>("loading");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const scrollable = Math.max(1, root.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / scrollable);
      progressRef.current = progress;
      root.style.setProperty("--galaxy-p", progress.toFixed(4));
      root.style.setProperty("--galaxy-enter", clamp(progress / 0.16).toFixed(4));
      root.style.setProperty("--galaxy-exit", clamp((progress - 0.84) / 0.16).toFixed(4));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;
    let disposed = false;
    let animationFrame = 0;
    let sceneCleanup = () => {};
    let isVisible = true;
    const pointerTarget = { x: 0, y: 0 };
    const visibilityObserver = new IntersectionObserver(([entry]) => { isVisible = entry?.isIntersecting ?? true; }, { rootMargin: "220px" });
    visibilityObserver.observe(host);
    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerTarget.x = clamp((event.clientX - rect.left) / rect.width, 0, 1) * 2 - 1;
      pointerTarget.y = clamp((event.clientY - rect.top) / rect.height, 0, 1) * 2 - 1;
    };
    const onPointerLeave = () => { pointerTarget.x = 0; pointerTarget.y = 0; };
    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerleave", onPointerLeave, { passive: true });

    const boot = async () => {
      try {
        const THREE = await import("three");
        if (disposed) return;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.domElement.className = "galaxyCanvas";
        renderer.domElement.setAttribute("role", "img");
        renderer.domElement.setAttribute("aria-label", "Animated three-dimensional spiral galaxy made from live WebGL particles, inspired by the galaxy animation supplied for the FlytheBG landing page.");
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x02040a, 0.026);
        const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 80);
        camera.position.set(0, 3.45, 9.4);
        camera.lookAt(0, 0, 0);

        const pointCanvas = document.createElement("canvas");
        pointCanvas.width = 64; pointCanvas.height = 64;
        const pointContext = pointCanvas.getContext("2d");
        if (!pointContext) throw new Error("Canvas 2D context unavailable");
        const pointGradient = pointContext.createRadialGradient(32, 32, 0, 32, 32, 32);
        pointGradient.addColorStop(0, "rgba(255,255,255,1)"); pointGradient.addColorStop(0.2, "rgba(255,245,240,.98)"); pointGradient.addColorStop(0.48, "rgba(255,145,190,.5)"); pointGradient.addColorStop(1, "rgba(255,80,175,0)");
        pointContext.fillStyle = pointGradient; pointContext.fillRect(0, 0, 64, 64);
        const pointTexture = new THREE.CanvasTexture(pointCanvas); pointTexture.colorSpace = THREE.SRGBColorSpace;
        let seed = 731944;
        const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
        const randomSpread = (scale: number, power: number) => Math.pow(random(), power) * (random() < 0.5 ? -1 : 1) * scale;
        const isCompact = window.matchMedia("(max-width: 760px)").matches;
        const count = isCompact ? 26000 : 52000;
        const radiusMax = 6.2, branches = 5;
        const positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
        const coreColor = new THREE.Color("#ffb34f"), warmColor = new THREE.Color("#ff647f"), pinkColor = new THREE.Color("#ed4fa7"), violetColor = new THREE.Color("#8e62ff"), color = new THREE.Color();
        for (let i = 0; i < count; i += 1) {
          const i3 = i * 3, radius = Math.pow(random(), 0.62) * radiusMax, branchAngle = ((i % branches) / branches) * Math.PI * 2, spinAngle = radius * 1.18, spread = 0.16 + (radius / radiusMax) * 0.78;
          positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomSpread(spread, 2.8); positions[i3 + 1] = randomSpread(spread * 0.34, 3.2); positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomSpread(spread, 2.8);
          const t = radius / radiusMax;
          if (t < 0.24) color.copy(coreColor).lerp(warmColor, t / 0.24); else if (t < 0.7) color.copy(warmColor).lerp(pinkColor, (t - 0.24) / 0.46); else color.copy(pinkColor).lerp(violetColor, (t - 0.7) / 0.3);
          color.multiplyScalar(0.78 + random() * 0.36); colors[i3] = color.r; colors[i3 + 1] = color.g; colors[i3 + 2] = color.b;
        }
        const galaxyGeometry = new THREE.BufferGeometry(); galaxyGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3)); galaxyGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        const galaxyMaterial = new THREE.PointsMaterial({ size: isCompact ? 0.058 : 0.046, sizeAttenuation: true, depthWrite: false, transparent: true, opacity: 0.97, blending: THREE.AdditiveBlending, vertexColors: true, map: pointTexture, alphaTest: 0.012 });
        const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial), galaxyGroup = new THREE.Group(); galaxyGroup.rotation.x = -0.08; galaxyGroup.rotation.z = -0.09; galaxyGroup.add(galaxy); scene.add(galaxyGroup);
        const coreMaterial = new THREE.SpriteMaterial({ map: pointTexture, color: 0xffa545, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false });
        const core = new THREE.Sprite(coreMaterial); core.scale.set(1.65, 1.65, 1); core.position.set(0, 0.02, 0); galaxyGroup.add(core);
        const coreHaloMaterial = new THREE.SpriteMaterial({ map: pointTexture, color: 0xff5f97, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false });
        const coreHalo = new THREE.Sprite(coreHaloMaterial); coreHalo.scale.set(4.2, 4.2, 1); coreHalo.position.set(0, -0.04, 0); galaxyGroup.add(coreHalo);
        const starCount = isCompact ? 850 : 1800, starPositions = new Float32Array(starCount * 3), starColors = new Float32Array(starCount * 3), starColor = new THREE.Color();
        for (let i = 0; i < starCount; i += 1) {
          const i3 = i * 3, radius = 12 + random() * 20, theta = random() * Math.PI * 2, phi = Math.acos(2 * random() - 1);
          starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta); starPositions[i3 + 1] = radius * Math.cos(phi); starPositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
          starColor.set(random() > 0.82 ? "#d8c9ff" : "#ffffff").multiplyScalar(0.45 + random() * 0.55); starColors[i3] = starColor.r; starColors[i3 + 1] = starColor.g; starColors[i3 + 2] = starColor.b;
        }
        const starGeometry = new THREE.BufferGeometry(); starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3)); starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
        const starMaterial = new THREE.PointsMaterial({ size: isCompact ? 0.05 : 0.038, sizeAttenuation: true, depthWrite: false, transparent: true, opacity: 0.74, blending: THREE.AdditiveBlending, vertexColors: true, map: pointTexture, alphaTest: 0.02 });
        const stars = new THREE.Points(starGeometry, starMaterial); scene.add(stars);
        const resize = () => { const rect = host.getBoundingClientRect(), width = Math.max(1, Math.floor(rect.width)), height = Math.max(1, Math.floor(rect.height)); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); };
        const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host); resize();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches, clock = new THREE.Clock(); let elapsed = 0;
        const animate = () => {
          if (disposed) return; animationFrame = requestAnimationFrame(animate); const delta = Math.min(clock.getDelta(), 0.05); elapsed += delta; const progress = progressRef.current;
          if (!reduceMotion) { galaxyGroup.rotation.y += delta * 0.075; galaxyGroup.rotation.z = -0.09 + Math.sin(elapsed * 0.16) * 0.028; stars.rotation.y -= delta * 0.004; coreMaterial.opacity = 0.74 + Math.sin(elapsed * 1.2) * 0.08; coreHaloMaterial.opacity = 0.22 + Math.sin(elapsed * 0.82) * 0.05; }
          const desiredX = pointerTarget.x * 0.72, desiredY = 3.45 + pointerTarget.y * -0.48, desiredZ = 9.4 - progress * 0.9;
          camera.position.x += (desiredX - camera.position.x) * 0.028; camera.position.y += (desiredY - camera.position.y) * 0.028; camera.position.z += (desiredZ - camera.position.z) * 0.028; camera.lookAt(0, -0.08 + progress * 0.08, 0); if (isVisible) renderer.render(scene, camera);
        };
        renderer.render(scene, camera); setGalaxyState("ready"); animate();
        sceneCleanup = () => { resizeObserver.disconnect(); galaxyGeometry.dispose(); galaxyMaterial.dispose(); starGeometry.dispose(); starMaterial.dispose(); coreMaterial.dispose(); coreHaloMaterial.dispose(); pointTexture.dispose(); renderer.dispose(); renderer.domElement.remove(); };
      } catch (error) { console.error("FlytheBG galaxy renderer failed to initialize", error); if (!disposed) setGalaxyState("error"); }
    };
    void boot();
    return () => { disposed = true; visibilityObserver.disconnect(); host.removeEventListener("pointermove", onPointerMove); host.removeEventListener("pointerleave", onPointerLeave); if (animationFrame) cancelAnimationFrame(animationFrame); sceneCleanup(); };
  }, []);

  return (
    <section ref={rootRef} className="galaxyWorld" aria-label="Animated galaxy landing experience" style={{ "--galaxy-p": 0, "--galaxy-enter": 0, "--galaxy-exit": 0 } as CSSProperties}>
      <div className="galaxySticky">
        <div className="galaxySpace" aria-hidden="true" /><div className="galaxyBloom galaxyBloomA" aria-hidden="true" /><div className="galaxyBloom galaxyBloomB" aria-hidden="true" />
        <div className="shell galaxyGrid">
          <div className="galaxyCopy"><div className="galaxyChapter galaxyChapterOne"><span className="galaxyKicker"><i /> LIVE GALAXY · WEBGL PARTICLES</span><h1>Remove the noise.<br /><em>Keep what matters.</em></h1><p>A living spiral galaxy built from thousands of glowing particles now leads the FlytheBG experience — inspired directly by the animation you supplied.</p><div className="galaxyActions"><a className="galaxyPrimary" href="#remove">Remove a background <span>↗</span></a><a className="galaxySecondary" href="#galaxy-stage">Enter the galaxy <span>✦</span></a></div><div className="galaxyTrust"><span><b>01</b> Live particle field</span><span><b>02</b> Pointer depth</span><span><b>03</b> Responsive WebGL</span></div></div><div className="galaxyChapter galaxyChapterTwo"><span className="galaxyStep">01 / FORM</span><h2>Not a flat loop.<br />A live particle system.</h2><p>The galaxy is generated in the browser from tens of thousands of points, layered into five spiral arms with additive light, a warm core, and real depth.</p></div><div className="galaxyChapter galaxyChapterThree"><span className="galaxyStep">02 / DEPTH</span><h2>Move through it.<br />Let it breathe.</h2><p>Scroll changes the camera depth while pointer movement introduces restrained parallax. The galaxy keeps moving continuously without turning the landing page into a video player.</p></div><div className="galaxyChapter galaxyChapterFour"><span className="galaxyStep">03 / FOCUS</span><h2>Then cut through<br />the background.</h2><p>The spectacle stays up front. The actual product remains one action away: upload your image, run private inference, and export the transparent PNG.</p><a className="galaxyTextLink" href="#remove">Start removing a background <span>↓</span></a></div></div>
          <div className="galaxyVisual" id="galaxy-stage"><div className="galaxyLens" aria-hidden="true" /><div className="galaxyOrbit galaxyOrbitA" aria-hidden="true" /><div className="galaxyOrbit galaxyOrbitB" aria-hidden="true" /><div className="galaxyCanvasFrame"><div ref={mountRef} className="galaxyCanvasMount" /><div className={`galaxyLoadState galaxyLoadState-${galaxyState}`} aria-live="polite">{galaxyState === "loading" ? <><i /><span>Forming the galaxy…</span></> : null}{galaxyState === "error" ? <span>The galaxy could not start in this browser. The background-removal tool below still works normally.</span> : null}</div></div><div className="galaxyData galaxyDataTop"><span>RENDER</span><strong>LIVE WEBGL</strong></div><div className="galaxyData galaxyDataRight"><span>FIELD</span><strong>52K PARTICLES</strong></div><div className="galaxyControlHint"><i aria-hidden="true">✦</i><div><strong>MOVE THE CURSOR</strong><span>SCROLL TO TRAVEL</span></div></div></div>
        </div>
        <div className="galaxyProgress" aria-hidden="true"><i /></div><div className="galaxyScrollCue" aria-hidden="true"><span>SCROLL THROUGH SPACE</span><i /></div><AskFlytheBG lift={0} />
      </div>
    </section>
  );
}
