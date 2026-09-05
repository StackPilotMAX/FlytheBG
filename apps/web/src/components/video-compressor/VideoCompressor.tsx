"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileVideo,
  Gauge,
  HardDriveDownload,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { checkCompressorCapabilities } from "@/lib/video-compressor/capabilities";
import {
  compressVideo,
  CompressionCancelledError,
  outputFilename,
} from "@/lib/video-compressor/encoder";
import { DEFAULT_SETTINGS, QUALITY_LABELS, RESOLUTION_LABELS } from "@/lib/video-compressor/settings";
import type {
  CompressionProgress,
  CompressionResult,
  CompressionSettings,
  QualityPreset,
  ResolutionPreset,
  TargetSizePreset,
  VideoMetadata,
} from "@/lib/video-compressor/types";
import "./video-compressor.css";

const MAX_CUSTOM_TARGET_MB = 1024;

export default function VideoCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS);
  const [capabilityMessage, setCapabilityMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState<CompressionProgress | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void checkCompressorCapabilities().then((capability) => {
      if (!active) return;
      setIsReady(capability.supported);
      setCapabilityMessage(capability.reason ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      abortRef.current?.abort();
    };
  }, [previewUrl, resultUrl]);

  const resetResult = useCallback(() => {
    setResult(null);
    setProgress(null);
    setError(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
  }, [resultUrl]);

  const chooseFile = useCallback(async (nextFile: File | null) => {
    if (!nextFile) return;
    resetResult();
    setError(null);
    setMetadata(null);
    setFile(nextFile);
    setIsReading(true);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(nextFile));

    try {
      const { readVideoMetadata } = await import("@/lib/video-compressor/metadata");
      const nextMetadata = await readVideoMetadata(nextFile);
      setMetadata(nextMetadata);
    } catch (readError) {
      setFile(null);
      setError(readError instanceof Error ? readError.message : "Could not read this video.");
    } finally {
      setIsReading(false);
    }
  }, [previewUrl, resetResult]);

  const handleInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    void chooseFile(nextFile);
    event.target.value = "";
  }, [chooseFile]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void chooseFile(event.dataTransfer.files?.[0] ?? null);
  }, [chooseFile]);

  const updateSettings = useCallback(<K extends keyof CompressionSettings>(key: K, value: CompressionSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    resetResult();
  }, [resetResult]);

  const startCompression = useCallback(async () => {
    if (!file || !metadata || isCompressing) return;
    if (!isReady) {
      setError(capabilityMessage ?? "This browser cannot run local video compression.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsCompressing(true);
    setError(null);
    setResult(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }

    try {
      const compressed = await compressVideo(file, metadata, settings, controller.signal, {
        onProgress: setProgress,
      });
      if (controller.signal.aborted) throw new CompressionCancelledError();
      setResult(compressed);
      setResultUrl(URL.createObjectURL(compressed.blob));
    } catch (compressionError) {
      if (!(compressionError instanceof CompressionCancelledError)) {
        setError(compressionError instanceof Error ? compressionError.message : "Compression failed. Please try again.");
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsCompressing(false);
    }
  }, [capabilityMessage, file, isCompressing, isReady, metadata, resultUrl, settings]);

  const cancelCompression = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const removeFile = useCallback(() => {
    abortRef.current?.abort();
    setFile(null);
    setMetadata(null);
    setProgress(null);
    setError(null);
    setResult(null);
    setIsCompressing(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setPreviewUrl(null);
    setResultUrl(null);
  }, [previewUrl, resultUrl]);

  const savings = useMemo(() => {
    if (!result || !file) return null;
    const saved = file.size - result.output.size;
    return {
      bytes: saved,
      percent: (saved / file.size) * 100,
    };
  }, [file, result]);

  const outputName = file ? outputFilename(file.name) : "video-compressed.mp4";

  return (
    <div className="videoCompressor">
      <input
        ref={inputRef}
        className="videoCompressorInput"
        type="file"
        accept="video/*,.mkv,.webm,.mov,.mp4,.m4v,.ts"
        onChange={handleInput}
        aria-label="Choose a video to compress"
      />

      <section className="videoCompressorHero">
        <div className="videoCompressorHeroCopy">
          <span className="videoCompressorEyebrow"><Sparkles size={15} /> Browser-first media tool</span>
          <h1>Compress video without uploading it.</h1>
          <p>Choose how small or clear you want the result, process the video locally, inspect the real before/after size, then download the MP4.</p>
          <div className="videoPrivacyBadge"><ShieldCheck size={16} /> Your source stays in your browser during compression.</div>
        </div>
        <div className="videoCompressorHeroMark" aria-hidden="true"><FileVideo size={52} strokeWidth={1.5} /></div>
      </section>

      {!isReady && capabilityMessage && (
        <div className="videoNotice videoNoticeWarning" role="status">
          <AlertCircle size={18} />
          <div><strong>Local compression is not available here.</strong><span>{capabilityMessage}</span></div>
        </div>
      )}

      {error && (
        <div className="videoNotice videoNoticeError" role="alert">
          <AlertCircle size={18} />
          <div><strong>We could not complete that job.</strong><span>{error}</span></div>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss error"><X size={17} /></button>
        </div>
      )}

      {!file ? (
        <div
          className={`videoUploadZone ${isDragging ? "isDragging" : ""}`}
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragging(false); }}
          onDrop={handleDrop}
        >
          <div className="videoUploadIcon"><Upload size={25} /></div>
          <h2>Drop a video here</h2>
          <p>or choose a file from your device</p>
          <button type="button" className="videoPrimaryButton" onClick={() => inputRef.current?.click()}>
            Browse video
          </button>
          <span className="videoUploadHint">MP4, MOV, WebM and other browser-readable video formats</span>
        </div>
      ) : (
        <div className="videoWorkspace">
          <section className="videoCard videoSelectedCard">
            <div className="videoPreviewWrap">
              {previewUrl ? <video src={previewUrl} controls preload="metadata" /> : <div className="videoPreviewPlaceholder"><FileVideo size={32} /></div>}
            </div>
            <div className="videoMetadataBlock">
              <div className="videoFileHeading"><div><span className="videoCardLabel">Selected video</span><h2 title={file.name}>{file.name}</h2></div><button type="button" className="videoIconButton" onClick={removeFile} disabled={isCompressing} aria-label="Remove video"><X size={18} /></button></div>
              {isReading ? <div className="videoInlineLoading"><Loader2 className="spin" size={18} /> Reading local media metadata…</div> : metadata ? <div className="videoStatsGrid">
                <Stat label="File size" value={formatBytes(metadata.size)} />
                <Stat label="Duration" value={formatDuration(metadata.duration)} />
                <Stat label="Resolution" value={`${metadata.width} × ${metadata.height}`} />
                <Stat label="Frame rate" value={metadata.fps ? `${metadata.fps.toFixed(2)} FPS` : "Not available"} />
                <Stat label="Audio" value={metadata.hasAudio ? "Included" : "None"} />
                <Stat label="Type" value={metadata.mimeType.replace("video/", "").toUpperCase() || "Video"} />
              </div> : null}
            </div>
          </section>

          {metadata && !result && !isCompressing && (
            <section className="videoCard videoSettingsCard">
              <div className="videoSectionTitle"><div><span className="videoCardLabel">Compression settings</span><h2>Choose your trade-off.</h2></div><Gauge size={22} /></div>
              <div className="videoSettingGroup">
                <label>Quality</label>
                <div className="videoChoiceGrid videoChoiceGridThree">
                  {(["high", "medium", "low"] as QualityPreset[]).map((quality) => <ChoiceButton key={quality} active={settings.quality === quality} onClick={() => updateSettings("quality", quality)} title={QUALITY_LABELS[quality]} description={quality === "high" ? "More detail" : quality === "medium" ? "Balanced" : "Smallest output"} />)}
                </div>
              </div>
              <div className="videoSettingGroup">
                <label htmlFor="video-resolution">Output resolution</label>
                <select id="video-resolution" value={settings.resolution} onChange={(event) => updateSettings("resolution", event.target.value as ResolutionPreset)}>
                  {(Object.keys(RESOLUTION_LABELS) as ResolutionPreset[]).map((resolution) => <option key={resolution} value={resolution}>{RESOLUTION_LABELS[resolution]}</option>)}
                </select>
                <span className="videoFieldHint">The source is never upscaled. Aspect ratio is preserved.</span>
              </div>
              <div className="videoSettingGroup">
                <label htmlFor="video-target">Target file size</label>
                <select id="video-target" value={settings.targetSize} onChange={(event) => updateSettings("targetSize", event.target.value as TargetSizePreset)}>
                  <option value="none">No target — use quality</option>
                  <option value="10mb">10 MB</option>
                  <option value="25mb">25 MB</option>
                  <option value="50mb">50 MB</option>
                  <option value="100mb">100 MB</option>
                  <option value="custom">Custom</option>
                </select>
                {settings.targetSize === "custom" && <div className="videoCustomTarget"><input type="number" min="1" max={MAX_CUSTOM_TARGET_MB} step="1" value={settings.customTargetMb ?? 25} onChange={(event) => updateSettings("customTargetMb", Math.min(MAX_CUSTOM_TARGET_MB, Math.max(1, Number(event.target.value) || 1)))} /><span>MB</span></div>}
                <span className="videoFieldHint">Target size is best-effort; codec and container overhead can change the final size.</span>
              </div>
              <button type="button" className="videoPrimaryButton videoCompressButton" onClick={() => void startCompression()} disabled={!isReady || !metadata}>
                <Sparkles size={18} /> Compress video locally
              </button>
            </section>
          )}

          {isCompressing && progress && (
            <section className="videoCard videoProgressCard" aria-live="polite">
              <div className="videoProgressHeader"><div><span className="videoCardLabel">Pass {progress.pass} of {progress.totalPasses}</span><h2>{stageLabel(progress.stage)}</h2></div><strong>{Math.round(progress.progress * 100)}%</strong></div>
              <div className="videoProgressTrack"><div style={{ width: `${Math.max(2, progress.progress * 100)}%` }} /></div>
              <div className="videoProgressMeta"><span>{formatDuration(progress.processedTime)} processed</span><span>Local processing</span></div>
              <button type="button" className="videoSecondaryButton" onClick={cancelCompression}><X size={17} /> Cancel</button>
            </section>
          )}

          {result && resultUrl && !isCompressing && (
            <section className="videoCard videoResultCard">
              <div className="videoResultHeader"><div><span className="videoCardLabel">Compression complete</span><h2>Your MP4 is ready.</h2></div><CheckCircle2 size={28} /></div>
              <video className="videoResultPreview" src={resultUrl} controls preload="metadata" />
              <div className="videoStatsGrid videoResultStats">
                <Stat label="Original" value={formatBytes(file.size)} />
                <Stat label="Compressed" value={formatBytes(result.output.size)} />
                <Stat label={savings && savings.bytes >= 0 ? "Saved" : "Size change"} value={savings ? `${formatBytes(Math.abs(savings.bytes))} (${Math.abs(savings.percent).toFixed(1)}%)` : "—"} />
                <Stat label="Output" value={`${result.output.width} × ${result.output.height}`} />
                <Stat label="Format" value="MP4 / H.264" />
                <Stat label="Audio" value={result.output.audioIncluded ? "Included" : "Video only"} />
              </div>
              {savings && savings.bytes < 0 && <div className="videoResultWarning"><AlertCircle size={17} /> The selected settings produced a larger file. Try a lower quality or resolution if you need a smaller result.</div>}
              {!result.output.audioIncluded && metadata.hasAudio && <div className="videoResultWarning"><AlertCircle size={17} /> This browser could not encode the source audio locally, so the downloadable MVP result contains video only.</div>}
              <div className="videoResultActions">
                <a className="videoPrimaryButton" href={resultUrl} download={outputName}><Download size={18} /> Download {outputName}</a>
                <button type="button" className="videoSecondaryButton" onClick={resetResult}><RefreshCw size={17} /> Compress again</button>
              </div>
            </section>
          )}
        </div>
      )}

      <section className="videoExplainerGrid">
        <Info title="Local by design" text="The compressor reads your selected File directly in the browser. There is no FlyThe BG upload endpoint in this workflow." />
        <Info title="Honest target sizes" text="A target is a bitrate starting point, not a guarantee. Keyframes, audio and container overhead affect the final bytes." />
        <Info title="Browser dependent" text="Modern Chromium browsers are the primary target. Safari, iOS and Firefox are feature-detected rather than assumed." />
      </section>
    </div>
  );
}

function ChoiceButton({ active, onClick, title, description }: { active: boolean; onClick: () => void; title: string; description: string }) {
  return <button type="button" className={`videoChoice ${active ? "active" : ""}`} onClick={onClick} aria-pressed={active}><strong>{title}</strong><span>{description}</span></button>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="videoStat"><span>{label}</span><strong>{value}</strong></div>;
}

function Info({ title, text }: { title: string; text: string }) {
  return <article><ShieldCheck size={19} /><div><h3>{title}</h3><p>{text}</p></div></article>;
}

function stageLabel(stage: CompressionProgress["stage"]): string {
  return stage === "preparing" ? "Preparing" : stage === "decoding" ? "Decoding" : stage === "encoding" ? "Encoding" : "Finalizing";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[unit]}`;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return "—";
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${minutes}:${String(secs).padStart(2, "0")}`;
}
