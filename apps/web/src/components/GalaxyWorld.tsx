"use client";

import { useEffect, useRef, useState } from "react";
import { AskFlytheBG } from "@/components/AskFlytheBG";

type GalaxyState = "loading" | "ready" | "error";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function GalaxyWorld() {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const [galaxyState, setGalaxyState] = useState<GalaxyState>("loading");

  useEffect(() => {
    const updateScroll = () => {
      const travel = Math.max(window.innerHeight * 4, 1);
      scrollRef.current = clamp(window.scrollY / travel);
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;

    let disposed = false;
    let animationFrame = 0;
    let sceneCleanup = () => {};
    const pointerTarget = { x: 0, y: 0 };

    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.x = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      pointerTarget.y = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    };
    const onPointerLeave = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave, { passive: true });

    const boot = async () => {
      try {
        const THREE = await import("three");
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;
        renderer.domElement.className = "galaxyCanvas";
        renderer.domElement.setAttribute("role", "img");
        renderer.domElement.setAttribute(
          "aria-label",
          "A permanent full-screen three-dimensional spiral galaxy rendered from live WebGL particles, dust lanes, nebula haze and background stars.",
        );
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x010208, 0.018);
        const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 90);
        camera.position.set(0, 3.9, 10.8);
        camera.lookAt(0, 0, 0);

        const spriteCanvas = document.createElement("canvas");
        spriteCanvas.width = 96;
        spriteCanvas.height = 96;
        const context = spriteCanvas.getContext("2d");
        if (!context) throw new Error("Canvas 2D context unavailable");
        const gradient = context.createRadialGradient(48, 48, 0, 48, 48, 48);
        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(0.12, "rgba(255,255,255,.98)");
        gradient.addColorStop(0.34, "rgba(255,220,235,.58)");
        gradient.addColorStop(0.7, "rgba(190,110,220,.13)");
        gradient.addColorStop(1, "rgba(130,70,190,0)");
        context.fillStyle = gradient;
        context.fillRect(0, 0, 96, 96);
        const pointTexture = new THREE.CanvasTexture(spriteCanvas);
        pointTexture.colorSpace = THREE.SRGBColorSpace;

        let seed = 944521;
        const random = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };
        const gaussian = () => {
          const u = Math.max(random(), 1e-7);
          const v = random();
          return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v);
        };

        const compact = window.matchMedia("(max-width: 760px)").matches;
        const mainCount = compact ? 38000 : 82000;
        const radiusMax = 7.25;
        const branches = 4;
        const positions = new Float32Array(mainCount * 3);
        const colors = new Float32Array(mainCount * 3);
        const core = new THREE.Color("#ffd8a8");
        const inner = new THREE.Color("#fff1d7");
        const blue = new THREE.Color("#b9d9ff");
        const violet = new THREE.Color("#a789ff");
        const rose = new THREE.Color("#ff79b4");
        const color = new THREE.Color();

        for (let i = 0; i < mainCount; i += 1) {
          const i3 = i * 3;
          const radius = Math.pow(random(), 0.58) * radiusMax;
          const t = radius / radiusMax;
          const branch = (i % branches) * (Math.PI * 2 / branches);
          const armWidth = 0.085 + t * 0.22;
          const angle = branch + radius * 0.94 + gaussian() * armWidth;
          const radialJitter = gaussian() * (0.055 + t * 0.18);
          const r = Math.max(0, radius + radialJitter);
          const diskHeight = gaussian() * (0.12 + (1 - t) * 0.08);

          positions[i3] = Math.cos(angle) * r;
          positions[i3 + 1] = diskHeight;
          positions[i3 + 2] = Math.sin(angle) * r;

          if (t < 0.12) color.copy(core).lerp(inner, t / 0.12);
          else if (t < 0.52) color.copy(inner).lerp(blue, (t - 0.12) / 0.4);
          else color.copy(blue).lerp(violet, (t - 0.52) / 0.48);
          if (random() < 0.075 + t * 0.04) color.lerp(rose, 0.46 + random() * 0.34);
          color.multiplyScalar(0.72 + random() * 0.55);
          colors[i3] = color.r;
          colors[i3 + 1] = color.g;
          colors[i3 + 2] = color.b;
        }

        const galaxyGeometry = new THREE.BufferGeometry();
        galaxyGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        galaxyGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        const galaxyMaterial = new THREE.PointsMaterial({
          size: compact ? 0.052 : 0.041,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.94,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexColors: true,
          map: pointTexture,
          alphaTest: 0.009,
        });
        const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);

        const dustCount = compact ? 6500 : 14000;
        const dustPositions = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount; i += 1) {
          const i3 = i * 3;
          const radius = 0.65 + Math.pow(random(), 0.72) * (radiusMax - 0.65);
          const branch = (i % branches) * (Math.PI * 2 / branches);
          const angle = branch + radius * 0.94 + 0.12 + gaussian() * (0.055 + radius / radiusMax * 0.11);
          dustPositions[i3] = Math.cos(angle) * radius;
          dustPositions[i3 + 1] = gaussian() * 0.065;
          dustPositions[i3 + 2] = Math.sin(angle) * radius;
        }
        const dustGeometry = new THREE.BufferGeometry();
        dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
        const dustMaterial = new THREE.PointsMaterial({
          size: compact ? 0.082 : 0.068,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.34,
          depthWrite: false,
          color: 0x160913,
          map: pointTexture,
          alphaTest: 0.02,
        });
        const dust = new THREE.Points(dustGeometry, dustMaterial);

        const galaxyGroup = new THREE.Group();
        galaxyGroup.rotation.x = -0.18;
        galaxyGroup.rotation.z = -0.16;
        galaxyGroup.add(galaxy, dust);
        scene.add(galaxyGroup);

        const coreMaterial = new THREE.SpriteMaterial({
          map: pointTexture,
          color: 0xffc875,
          transparent: true,
          opacity: 0.88,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const coreGlow = new THREE.Sprite(coreMaterial);
        coreGlow.scale.set(2.15, 2.15, 1);
        galaxyGroup.add(coreGlow);

        const haloMaterial = new THREE.SpriteMaterial({
          map: pointTexture,
          color: 0xff7aaa,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const halo = new THREE.Sprite(haloMaterial);
        halo.scale.set(6.1, 6.1, 1);
        galaxyGroup.add(halo);

        const nebulaMaterials: Array<InstanceType<typeof THREE.SpriteMaterial>> = [];
        for (let i = 0; i < (compact ? 9 : 16); i += 1) {
          const radius = 1.5 + random() * 5.2;
          const branch = (i % branches) * (Math.PI * 2 / branches);
          const angle = branch + radius * 0.94 + gaussian() * 0.16;
          const material = new THREE.SpriteMaterial({
            map: pointTexture,
            color: i % 3 === 0 ? 0xff5a9b : i % 3 === 1 ? 0x8f65ff : 0xffa15e,
            transparent: true,
            opacity: 0.045 + random() * 0.045,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          const sprite = new THREE.Sprite(material);
          const scale = 1.4 + random() * 1.8;
          sprite.scale.set(scale * 1.8, scale, 1);
          sprite.position.set(Math.cos(angle) * radius, gaussian() * 0.1, Math.sin(angle) * radius);
          galaxyGroup.add(sprite);
          nebulaMaterials.push(material);
        }

        const starCount = compact ? 1300 : 2800;
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        const starColor = new THREE.Color();
        for (let i = 0; i < starCount; i += 1) {
          const i3 = i * 3;
          const radius = 14 + random() * 28;
          const theta = random() * Math.PI * 2;
          const phi = Math.acos(2 * random() - 1);
          starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
          starPositions[i3 + 1] = radius * Math.cos(phi);
          starPositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
          starColor.set(random() > 0.78 ? "#c8d9ff" : random() > 0.88 ? "#ffd9bd" : "#ffffff");
          starColor.multiplyScalar(0.36 + random() * 0.72);
          starColors[i3] = starColor.r;
          starColors[i3 + 1] = starColor.g;
          starColors[i3 + 2] = starColor.b;
        }
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
        const starMaterial = new THREE.PointsMaterial({
          size: compact ? 0.05 : 0.036,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.78,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexColors: true,
          map: pointTexture,
          alphaTest: 0.018,
        });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        const resize = () => {
          const width = Math.max(1, window.innerWidth);
          const height = Math.max(1, window.innerHeight);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize, { passive: true });

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const clock = new THREE.Clock();
        let elapsed = 0;

        const animate = () => {
          if (disposed) return;
          animationFrame = requestAnimationFrame(animate);
          const delta = Math.min(clock.getDelta(), 0.05);
          elapsed += delta;

          if (!reduceMotion) {
            galaxyGroup.rotation.y += delta * 0.038;
            galaxyGroup.rotation.z = -0.16 + Math.sin(elapsed * 0.11) * 0.018;
            stars.rotation.y -= delta * 0.0025;
            coreMaterial.opacity = 0.84 + Math.sin(elapsed * 0.72) * 0.045;
            haloMaterial.opacity = 0.16 + Math.sin(elapsed * 0.49) * 0.025;
          }

          const travel = scrollRef.current;
          const desiredX = pointerTarget.x * 0.52 + travel * 0.22;
          const desiredY = 3.9 - pointerTarget.y * 0.34 - travel * 0.42;
          const desiredZ = 10.8 - travel * 1.15;
          camera.position.x += (desiredX - camera.position.x) * 0.024;
          camera.position.y += (desiredY - camera.position.y) * 0.024;
          camera.position.z += (desiredZ - camera.position.z) * 0.024;
          camera.lookAt(0, -0.08 + travel * 0.14, 0);
          renderer.render(scene, camera);
        };

        renderer.render(scene, camera);
        setGalaxyState("ready");
        animate();

        sceneCleanup = () => {
          window.removeEventListener("resize", resize);
          galaxyGeometry.dispose();
          galaxyMaterial.dispose();
          dustGeometry.dispose();
          dustMaterial.dispose();
          starGeometry.dispose();
          starMaterial.dispose();
          coreMaterial.dispose();
          haloMaterial.dispose();
          nebulaMaterials.forEach((material) => material.dispose());
          pointTexture.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch (error) {
        console.error("FlytheBG galaxy renderer failed to initialize", error);
        if (!disposed) setGalaxyState("error");
      }
    };

    void boot();

    return () => {
      disposed = true;
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      sceneCleanup();
    };
  }, []);

  return (
    <>
      <div className="galaxyBackdrop" aria-hidden="true">
        <div className="galaxyBackdropStars" />
        <div ref={mountRef} className="galaxyCanvasMount" />
        <div className="galaxyVignette" />
        <div className={`galaxyLoadState galaxyLoadState-${galaxyState}`} aria-live="polite">
          {galaxyState === "loading" ? <><i /><span>Forming the galaxy…</span></> : null}
          {galaxyState === "error" ? <span>WebGL could not start in this browser. The background-removal tool still works normally.</span> : null}
        </div>
      </div>

      <section className="galaxyHero" aria-label="FlytheBG galaxy landing experience">
        <div className="shell galaxyHeroGrid">
          <div className="galaxyHeroCopy">
            <span className="galaxyKicker"><i /> PERMANENT LIVE GALAXY · WEBGL</span>
            <h1>Remove the noise.<br /><em>Keep what matters.</em></h1>
            <p>A deeper, more natural spiral galaxy now stays alive behind the entire FlytheBG experience — stellar disk, dust lanes, nebula haze, luminous core and distant star field included.</p>
            <div className="galaxyActions">
              <a className="galaxyPrimary" href="#remove">Remove a background <span>↗</span></a>
              <a className="galaxySecondary" href="#story">Explore the experience <span>↓</span></a>
            </div>
            <div className="galaxyTrust">
              <span><b>01</b> 80K+ stellar points</span>
              <span><b>02</b> Dust + nebula depth</span>
              <span><b>03</b> Always full-screen</span>
            </div>
          </div>

          <aside className="galaxyTelemetry" aria-label="Galaxy rendering details">
            <span>LIVE SCENE</span>
            <strong>SPIRAL FIELD / 4 ARMS</strong>
            <div><i /> Stellar disk</div>
            <div><i /> Dust lanes</div>
            <div><i /> Nebula regions</div>
            <div><i /> Deep star field</div>
          </aside>
        </div>
        <div className="galaxyScrollCue" aria-hidden="true"><span>SCROLL — THE GALAXY STAYS</span><i /></div>
        <AskFlytheBG lift={0} />
      </section>
    </>
  );
}
