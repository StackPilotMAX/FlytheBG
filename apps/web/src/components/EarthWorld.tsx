"use client";

import { useEffect, useRef, useState } from "react";
import { AskFlytheBG } from "@/components/AskFlytheBG";

const NASA_EARTH_TEXTURE =
  "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg";
const ROTATION_SECONDS = 60 * 60;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

type GlobeState = "loading" | "ready" | "error";

export function EarthWorld() {
  const rootRef = useRef<HTMLElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [globeState, setGlobeState] = useState<GlobeState>("loading");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const scrollable = Math.max(1, root.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / scrollable);
      root.style.setProperty("--earth-p", progress.toFixed(4));
      root.style.setProperty("--earth-enter", clamp(progress / 0.16).toFixed(4));
      root.style.setProperty("--earth-exit", clamp((progress - 0.84) / 0.16).toFixed(4));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

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

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
      },
      { rootMargin: "180px" },
    );
    visibilityObserver.observe(host);

    const boot = async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.domElement.className = "earthCanvas";
        renderer.domElement.setAttribute("role", "img");
        renderer.domElement.setAttribute(
          "aria-label",
          "Interactive three-dimensional Earth using NASA Blue Marble surface imagery. Drag to orbit and use the wheel or pinch gesture to zoom.",
        );
        renderer.domElement.tabIndex = 0;
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(0, 0.05, 3.15);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.055;
        controls.enablePan = false;
        controls.enableZoom = true;
        controls.rotateSpeed = 0.58;
        controls.zoomSpeed = 0.72;
        controls.minDistance = 2.2;
        controls.maxDistance = 4.35;
        controls.minPolarAngle = Math.PI * 0.08;
        controls.maxPolarAngle = Math.PI * 0.92;
        controls.target.set(0, 0, 0);
        controls.update();

        const hemi = new THREE.HemisphereLight(0xbce8ff, 0x02070d, 1.22);
        scene.add(hemi);
        const key = new THREE.DirectionalLight(0xffffff, 3.25);
        key.position.set(4.5, 2.2, 5.8);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x438dff, 0.72);
        rim.position.set(-4, -1.5, -3.5);
        scene.add(rim);

        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin("anonymous");
        const texture = await textureLoader.loadAsync(NASA_EARTH_TEXTURE);
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

        const tiltGroup = new THREE.Group();
        tiltGroup.rotation.z = THREE.MathUtils.degToRad(-23.44);
        scene.add(tiltGroup);

        const earthGeometry = new THREE.SphereGeometry(1, 128, 96);
        const earthMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.82,
          metalness: 0,
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.rotation.y = THREE.MathUtils.degToRad(-118);
        tiltGroup.add(earth);

        const atmosphereGeometry = new THREE.SphereGeometry(1.055, 96, 72);
        const atmosphereMaterial = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          vertexShader: `
            varying float vGlow;
            void main() {
              vec3 transformedNormal = normalize(normalMatrix * normal);
              vec3 viewDirection = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);
              vGlow = pow(max(0.0, 0.92 - dot(transformedNormal, viewDirection)), 3.4);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying float vGlow;
            void main() {
              gl_FragColor = vec4(0.24, 0.68, 1.0, vGlow * 0.7);
            }
          `,
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);

        const resize = () => {
          const rect = host.getBoundingClientRect();
          const width = Math.max(1, Math.floor(rect.width));
          const height = Math.max(1, Math.floor(rect.height));
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        resize();

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const clock = new THREE.Clock();
        const rotationRate = (Math.PI * 2) / ROTATION_SECONDS;

        const animate = () => {
          if (disposed) return;
          animationFrame = requestAnimationFrame(animate);
          const delta = Math.min(clock.getDelta(), 0.05);
          if (!reduceMotion) earth.rotation.y += rotationRate * delta;
          controls.update(delta);
          if (isVisible) renderer.render(scene, camera);
        };

        renderer.render(scene, camera);
        setGlobeState("ready");
        animate();

        sceneCleanup = () => {
          resizeObserver.disconnect();
          controls.dispose();
          earthGeometry.dispose();
          earthMaterial.dispose();
          atmosphereGeometry.dispose();
          atmosphereMaterial.dispose();
          texture.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch (error) {
        console.error("FlytheBG Earth renderer failed to initialize", error);
        if (!disposed) setGlobeState("error");
      }
    };

    void boot();

    return () => {
      disposed = true;
      visibilityObserver.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
      sceneCleanup();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="earthWorld"
      aria-label="Interactive Earth landing experience"
      style={{ "--earth-p": 0, "--earth-enter": 0, "--earth-exit": 0 } as React.CSSProperties}
    >
      <div className="earthSticky">
        <div className="earthSpace" aria-hidden="true" />
        <div className="earthAurora earthAuroraA" aria-hidden="true" />
        <div className="earthAurora earthAuroraB" aria-hidden="true" />

        <div className="shell earthGrid">
          <div className="earthCopy">
            <div className="earthChapter earthChapterOne">
              <span className="earthKicker"><i /> REAL EARTH · REAL INTERACTION</span>
              <h1>Remove the world.<br /><em>Keep the subject.</em></h1>
              <p>Start with a real, movable Earth rendered from NASA Blue Marble surface imagery. Then drop your own image and make its background disappear.</p>
              <div className="earthActions">
                <a className="earthPrimary" href="#remove">Remove a background <span>↗</span></a>
                <a className="earthSecondary" href="#earth-controls">Move the Earth <span>◌</span></a>
              </div>
              <div className="earthTrust">
                <span><b>01</b> Drag + touch orbit</span>
                <span><b>02</b> Wheel + pinch zoom</span>
                <span><b>03</b> 60 min / full turn</span>
              </div>
            </div>

            <div className="earthChapter earthChapterTwo">
              <span className="earthStep">01 / SOURCE</span>
              <h2>Not a CSS ball.<br />Satellite surface data.</h2>
              <p>The globe uses NASA Visible Earth’s Blue Marble topography and bathymetry texture on an actual WebGL sphere, lit in 3D with a restrained atmospheric rim.</p>
            </div>

            <div className="earthChapter earthChapterThree">
              <span className="earthStep">02 / CONTROL</span>
              <h2>Grab the planet.<br />Move it yourself.</h2>
              <p>Drag with a mouse or one finger to orbit. Use the wheel or a pinch gesture to zoom. The camera has damping and bounded zoom so interaction stays smooth and intentional.</p>
            </div>

            <div className="earthChapter earthChapterFour">
              <span className="earthStep">03 / TIME</span>
              <h2>One full turn.<br />One real hour.</h2>
              <p>Auto-rotation is time-based at exactly one 360° turn every 3,600 seconds. Your manual orbit remains independent, so you can interrupt the view whenever you want.</p>
              <a className="earthTextLink" href="#remove">Now remove a background <span>↓</span></a>
            </div>
          </div>

          <div className="earthVisual" id="earth-controls">
            <div className="earthHalo" aria-hidden="true" />
            <div className="earthOrbitLine" aria-hidden="true" />
            <div className="earthCanvasFrame">
              <div ref={mountRef} className="earthCanvasMount" />
              <div className={`earthLoadState earthLoadState-${globeState}`} aria-live="polite">
                {globeState === "loading" ? <><i /><span>Loading NASA Earth texture…</span></> : null}
                {globeState === "error" ? <span>Interactive Earth could not start in this browser. The background-removal tool below still works normally.</span> : null}
              </div>
            </div>

            <div className="earthData earthDataTop">
              <span>SURFACE</span>
              <strong>NASA BLUE MARBLE</strong>
            </div>
            <div className="earthData earthDataRight">
              <span>MOTION</span>
              <strong>360° / 60 MIN</strong>
            </div>
            <div className="earthControlHint">
              <i aria-hidden="true">↔</i>
              <div><strong>DRAG TO ORBIT</strong><span>WHEEL / PINCH TO ZOOM</span></div>
            </div>
            <p className="earthCredit">Surface imagery: NASA Visible Earth / Blue Marble. NASA is the source; no endorsement is implied.</p>
          </div>
        </div>

        <div className="earthProgress" aria-hidden="true"><i /></div>
        <div className="earthScrollCue" aria-hidden="true"><span>SCROLL TO TRAVEL</span><i /></div>
        <AskFlytheBG lift={0} />
      </div>
    </section>
  );
}
