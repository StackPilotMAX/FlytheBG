"use client";

import { useEffect, useRef, useState } from "react";
import { detectGeminiWatermark, removeGeminiWatermark, type Detection } from "@/lib/isharaGeminiWatermarkRemover";

type Rect = { x: number; y: number; w: number; h: number };
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const canvasBlob = (c: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) => c.toBlob(b => b ? resolve(b) : reject(new Error("Could not encode the cleaned image.")), "image/png"));
const rectOf = (d: Detection): Rect => ({ x: d.x, y: d.y, w: d.width, h: d.height });

export function WatermarkRemoverAuto() {
  const [file, setFile] = useState<File | null>(null), [source, setSource] = useState(""), [clean, setClean] = useState("");
  const [kind, setKind] = useState<"image" | "video">("image"), [detection, setDetection] = useState<Detection | null>(null), [busy, setBusy] = useState(false), [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Upload a Gemini image or video. The browser detector will locate the visible sparkle automatically.");
  const imageRef = useRef<HTMLImageElement>(null), videoRef = useRef<HTMLVideoElement>(null), inputRef = useRef<HTMLInputElement>(null), urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);
  const keep = (u: string) => { urls.current.push(u); return u; };
  const selectFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) { setMessage("Please choose an image or video file."); return; }
    const k = f.type.startsWith("video/") ? "video" : "image";
    setFile(f); setKind(k); setSource(keep(URL.createObjectURL(f))); setClean(""); setDetection(null); setProgress(0);
    setMessage(k === "image" ? "Image loaded. Automatic visible-watermark detection is ready." : "Video loaded. The first usable frame will be checked automatically.");
  };
  const processImage = async () => {
    const image = imageRef.current; if (!image) return;
    setBusy(true); setMessage("Scanning for the visible Gemini sparkle with multi-scale template correlation…");
    try {
      if (!image.complete) await new Promise<void>((r, j) => { image.onload = () => r(); image.onerror = () => j(new Error("Image could not be decoded.")); });
      const c = document.createElement("canvas"); c.width = image.naturalWidth || image.width; c.height = image.naturalHeight || image.height;
      const ctx = c.getContext("2d", { willReadFrequently: true }); if (!ctx) throw new Error("Canvas processing is unavailable.");
      ctx.drawImage(image, 0, 0, c.width, c.height);
      const data = ctx.getImageData(0, 0, c.width, c.height), d = await detectGeminiWatermark(data, c.width, c.height, "image"); setDetection(d);
      if (!d.matchFound) { setMessage(`No verified Gemini visible watermark was detected (${Math.round(d.score * 100)}% match). Nothing was changed.`); return; }
      await removeGeminiWatermark(data, d); ctx.putImageData(data, 0, 0); setClean(keep(URL.createObjectURL(await canvasBlob(c))));
      setMessage(`The visible Gemini watermark region was detected and reconstructed (${Math.round(d.score * 100)}% match).`);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Gemini watermark removal failed."); } finally { setBusy(false); }
  };
  const processVideo = async () => {
    const video = videoRef.current; if (!video) return;
    setBusy(true); setProgress(0); setClean(""); setMessage("Scanning the first usable video frame for a visible Gemini watermark…");
    try {
      if (video.readyState < 2) await new Promise<void>((r, j) => { video.onloadeddata = () => r(); video.onerror = () => j(new Error("Video could not be decoded.")); });
      const w = video.videoWidth, h = video.videoHeight; if (!w || !h) throw new Error("The video has no usable dimensions.");
      video.currentTime = 0; await new Promise<void>(r => video.readyState >= 2 ? r() : video.addEventListener("seeked", () => r(), { once: true }));
      const probe = document.createElement("canvas"); probe.width = w; probe.height = h; const pctx = probe.getContext("2d", { willReadFrequently: true });
      if (!pctx) throw new Error("Canvas processing is unavailable.");
      pctx.drawImage(video, 0, 0, w, h); const d = await detectGeminiWatermark(pctx.getImageData(0, 0, w, h), w, h, "video"); setDetection(d);
      if (!d.matchFound) { setMessage(`No verified Gemini visible watermark was detected in the first frame (${Math.round(d.score * 100)}% match). No video frames were altered.`); return; }
      const c = document.createElement("canvas"); c.width = w; c.height = h; const ctx = c.getContext("2d", { willReadFrequently: true }); if (!ctx) throw new Error("Canvas processing is unavailable.");
      const stream = c.captureStream(30), mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12000000 }), chunks: Blob[] = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      const stopped = new Promise<void>((r, j) => { rec.onstop = () => r(); rec.onerror = () => j(new Error("Video recording failed.")); });
      const duration = video.duration || 1; rec.start(250); video.currentTime = 0; await video.play();
      let raf = 0;
      const draw = async () => {
        if (video.ended) return;
        ctx.drawImage(video, 0, 0, w, h);
        const frame = ctx.getImageData(0, 0, w, h);
        try { await removeGeminiWatermark(frame, d); ctx.putImageData(frame, 0, 0); } catch { /* keep processing subsequent frames */ }
        setProgress(clamp(video.currentTime / duration, 0, 1));
        if (!video.ended) raf = requestAnimationFrame(() => { void draw(); });
      };
      raf = requestAnimationFrame(() => { void draw(); });
      await new Promise<void>(r => video.addEventListener("ended", () => r(), { once: true })); cancelAnimationFrame(raf); rec.stop(); await stopped;
      stream.getTracks().forEach(t => t.stop()); const b = new Blob(chunks, { type: mime }); if (b.size < 1024) throw new Error("The cleaned video export was empty.");
      setClean(keep(URL.createObjectURL(b))); setProgress(1); setMessage("Visible Gemini watermark removal is complete. Export is ready as WebM.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Gemini video watermark removal failed."); } finally { setBusy(false); video.pause(); }
  };
  const process = () => kind === "image" ? void processImage() : void processVideo();
  const download = () => { if (!clean) return; const a = document.createElement("a"); a.href = clean; a.download = kind === "image" ? "flythebg-gemini-visible-watermark-clean.png" : "flythebg-gemini-visible-watermark-clean.webm"; document.body.appendChild(a); a.click(); a.remove(); };
  const dRect = detection ? rectOf(detection) : null;
  return <div style={{ maxWidth: 980, margin: "0 auto", borderRadius: 18, background: "#f7f7fb", border: "1px solid #e8e8ef", padding: 18, color: "#1f1f28", fontFamily: "Inter,system-ui,sans-serif" }}><style>{`@media(max-width:760px){.wm-grid{grid-template-columns:1fr!important}}`}</style>
    <div onClick={() => inputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); selectFile(e.dataTransfer.files?.[0] || null); }} style={{ border: "2px dashed #c9c9d8", borderRadius: 14, padding: "34px 24px", textAlign: "center", background: "white", cursor: "pointer" }}><input ref={inputRef} hidden type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime" onChange={e => selectFile(e.target.files?.[0] || null)} /><div style={{ fontSize: 16, fontWeight: 800 }}>Upload Gemini image or video</div><div style={{ marginTop: 7, color: "#747482", fontSize: 13 }}>Automatic visible-watermark detection and full-size browser processing.</div></div>
    {file && <><div style={{ marginTop: 16, textAlign: "center", fontSize: 13, fontWeight: 800, color: busy ? "#6756e8" : detection?.matchFound ? "#15966f" : "#777" }}>{busy ? (kind === "video" ? `Cleaning visible watermark… ${Math.round(progress * 100)}%` : "Detecting and reconstructing…") : message}</div><div className="wm-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 185px", gap: 16, marginTop: 12 }}><div style={{ background: "white", borderRadius: 10, padding: 10, overflow: "hidden", minHeight: 240 }}><div style={{ fontSize: 11, color: "#858592", marginBottom: 7, textAlign: "center", fontWeight: 800 }}>ORIGINAL</div>{kind === "image" ? <img ref={imageRef} src={source} alt="Original Gemini image" style={{ display: "block", maxWidth: "100%", maxHeight: 430, margin: "0 auto", borderRadius: 7 }} draggable={false} /> : <video ref={videoRef} src={source} controls playsInline preload="metadata" style={{ display: "block", maxWidth: "100%", maxHeight: 430, margin: "0 auto", borderRadius: 7 }} />}</div><div style={{ display: "grid", gap: 14, alignContent: "start" }}><div style={{ background: "white", borderRadius: 10, padding: 8, border: "1px solid #e5e5eb" }}><div style={{ fontSize: 10, fontWeight: 800, color: "#70707c", textAlign: "center", marginBottom: 7 }}>AUTO-DETECTION</div><div style={{ padding: 12, minHeight: 90, display: "grid", placeItems: "center", textAlign: "center", color: "#70707c", fontSize: 12 }}>{dRect ? `${Math.round(dRect.w)} × ${Math.round(dRect.h)} px • ${Math.round((detection?.score || 0) * 100)}% match` : "Waiting for verified Gemini candidate"}</div></div><div style={{ background: "white", borderRadius: 10, padding: 8, border: "1px solid #e5e5eb" }}><div style={{ fontSize: 10, fontWeight: 800, color: "#15966f", textAlign: "center", marginBottom: 7 }}>RESULT</div><div style={{ minHeight: 90, display: "grid", placeItems: "center", textAlign: "center", color: "#70707c", fontSize: 12 }}>{clean ? "Clean export ready" : busy ? "Reconstructing only the detected region…" : "Automatic result will appear here"}</div></div></div></div><div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>{!clean && <button type="button" onClick={process} disabled={busy} style={{ border: 0, background: "linear-gradient(90deg,#6255df,#493bd0)", color: "white", borderRadius: 9, padding: "10px 20px", cursor: busy ? "not-allowed" : "pointer", fontWeight: 800 }}>{busy ? "Processing…" : kind === "image" ? "Auto-Remove Visible Watermark" : "Auto-Remove Video Watermark"}</button>}{clean && <button type="button" onClick={download} style={{ border: 0, background: "#15966f", color: "white", borderRadius: 9, padding: "10px 20px", cursor: "pointer", fontWeight: 800 }}>Download Clean Result</button>}</div><div style={{ marginTop: 12, padding: 10, borderRadius: 9, background: "white", border: "1px solid #e5e5eb", fontSize: 11, color: "#6d6d78", textAlign: "center" }}>Visible Gemini mark only. No invisible provenance or SynthID is removed or falsified.</div></>}
  </div>;
}
