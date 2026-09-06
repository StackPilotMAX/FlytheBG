import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  CanvasSource,
  Conversion,
  ConversionCanceledError,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
} from "mediabunny";
import {
  buildOutputName,
  calculateOutputDimensions,
  calculateTargetVideoBitrate,
  targetBytes,
} from "./settings";
import type {
  CompressionCallbacks,
  CompressionResult,
  CompressionSettings,
  VideoMetadata,
} from "./types";

const MAX_INPUT_BYTES = 1.5 * 1024 * 1024 * 1024;
const MAX_DURATION_SECONDS = 4 * 60 * 60;
const TARGET_TOLERANCE_LOW = 0.72;
const TARGET_TOLERANCE_HIGH = 1.05;
const MAX_TARGET_PASSES = 3;

export class CompressionCancelledError extends Error {
  constructor() {
    super("Compression was canceled.");
    this.name = "CompressionCancelledError";
  }
}

export async function compressVideo(
  file: File,
  metadata: VideoMetadata,
  settings: CompressionSettings,
  signal: AbortSignal,
  callbacks: CompressionCallbacks = {},
): Promise<CompressionResult> {
  if (file.size > MAX_INPUT_BYTES) throw new Error("This file is too large for a safe in-browser compression job. Try a smaller video.");
  if (metadata.duration > MAX_DURATION_SECONDS) throw new Error("This video is longer than the current four-hour browser safety limit.");

  const dimensions = calculateOutputDimensions(metadata.width, metadata.height, settings.resolution);
  const target = targetBytes(settings);
  let bitrate = target ? calculateTargetVideoBitrate(target, metadata.duration, dimensions.width, dimensions.height) : null;
  let lastResult: CompressionResult | null = null;

  for (let pass = 1; pass <= (target ? MAX_TARGET_PASSES : 1); pass += 1) {
    throwIfAborted(signal);
    callbacks.onProgress?.({ progress: 0, stage: "preparing", processedTime: 0, pass, totalPasses: target ? MAX_TARGET_PASSES : 1 });

    let result: CompressionResult;
    try {
      result = await runConversion({ file, metadata, dimensions, settings, bitrate, signal, pass, totalPasses: target ? MAX_TARGET_PASSES : 1, callbacks });
    } catch (error) {
      if (isDecoderFailure(error)) {
        result = await runCanvasFallback({ file, metadata, dimensions, settings, bitrate, signal, pass, totalPasses: target ? MAX_TARGET_PASSES : 1, callbacks });
      } else {
        throw error;
      }
    }

    lastResult = result;
    if (!target) break;
    const ratio = result.output.size / target;
    if (ratio >= TARGET_TOLERANCE_LOW && ratio <= TARGET_TOLERANCE_HIGH) break;
    if (pass === MAX_TARGET_PASSES) break;
    const currentBitrate = bitrate ?? 0;
    if (currentBitrate <= 0) break;
    bitrate = Math.round(currentBitrate * Math.min(1.5, Math.max(0.55, 1 / ratio)));
  }

  if (!lastResult) throw new Error("Compression did not produce an output file.");
  return lastResult;
}

interface ConversionRunOptions {
  file: File;
  metadata: VideoMetadata;
  dimensions: { width: number; height: number };
  settings: CompressionSettings;
  bitrate: number | null;
  signal: AbortSignal;
  pass: number;
  totalPasses: number;
  callbacks: CompressionCallbacks;
}

async function runConversion(options: ConversionRunOptions): Promise<CompressionResult> {
  const { file, metadata, dimensions, settings, bitrate, signal, pass, totalPasses, callbacks } = options;
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
  let conversion: Conversion | null = null;
  let removeAbortListener: (() => void) | null = null;

  try {
    callbacks.onProgress?.({ progress: 0.01, stage: "decoding", processedTime: 0, pass, totalPasses });
    const audioTrack = await input.getPrimaryAudioTrack();
    const conversionOptions = {
      codec: "avc" as const,
      width: dimensions.width,
      height: dimensions.height,
      fit: "contain" as const,
      forceTranscode: true,
      hardwareAcceleration: "no-preference" as const,
      ...(bitrate ? { quality: new Quality({ bitrate }) } : { quality: new Quality(settings.quality) }),
    };

    conversion = await Conversion.init({
      input,
      output,
      tracks: "primary",
      video: conversionOptions,
      ...(audioTrack ? {} : { audio: { discard: true } }),
      tags: {},
      showWarnings: false,
    });

    if (!conversion.isValid) throw new Error("This browser cannot decode the source video with WebCodecs.");
    removeAbortListener = attachAbort(signal, () => void conversion?.cancel());
    conversion.onProgress = (progress, processedTime) => callbacks.onProgress?.({ progress: Math.min(0.98, Math.max(0, progress)), stage: progress < 0.1 ? "decoding" : "encoding", processedTime, pass, totalPasses });
    await conversion.execute();
    throwIfAborted(signal);

    const buffer = output.target.buffer;
    if (!buffer || buffer.byteLength === 0) throw new Error("The browser finished encoding but produced an empty MP4 file.");
    const audioIncluded = !conversion.discardedTracks.some((item) => item.track.type === "audio");
    return makeResult(buffer, dimensions, audioIncluded, pass, metadata.duration, callbacks, pass, totalPasses);
  } catch (error) {
    if (error instanceof ConversionCanceledError || signal.aborted) throw new CompressionCancelledError();
    throw error instanceof Error ? error : new Error("Video compression failed.");
  } finally {
    removeAbortListener?.();
    input.dispose();
  }
}

async function runCanvasFallback({ file, metadata, dimensions, settings, bitrate, signal, pass, totalPasses, callbacks }: ConversionRunOptions): Promise<CompressionResult> {
  if (typeof document === "undefined") throw new Error("Browser video decoding is unavailable in this environment.");

  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = url;

  try {
    callbacks.onProgress?.({ progress: 0.02, stage: "decoding", processedTime: 0, pass, totalPasses });
    await waitForVideoMetadata(video);
    await waitForVideoReady(video);
    throwIfAborted(signal);

    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("This browser cannot create a video canvas for fallback compression.");

    const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
    const source = new CanvasSource(canvas, {
      codec: "avc",
      quality: bitrate ? new Quality({ bitrate }) : new Quality(settings.quality),
      hardwareAcceleration: "no-preference",
      sizeChangeBehavior: "deny",
    });
    output.addVideoTrack(source, { frameRate: metadata.fps && metadata.fps > 1 ? metadata.fps : 30 });
    await output.start();

    const fps = metadata.fps && metadata.fps > 1 && metadata.fps <= 120 ? metadata.fps : 30;
    const frameDuration = 1 / fps;
    const duration = Math.min(metadata.duration, video.duration);

    for (let timestamp = 0; timestamp < duration; timestamp += frameDuration) {
      throwIfAborted(signal);
      await seekVideo(video, timestamp);
      context.drawImage(video, 0, 0, dimensions.width, dimensions.height);
      await source.add(timestamp, Math.min(frameDuration, duration - timestamp));
      callbacks.onProgress?.({
        progress: Math.min(0.98, timestamp / duration),
        stage: timestamp < duration * 0.1 ? "decoding" : "encoding",
        processedTime: timestamp,
        pass,
        totalPasses,
      });
    }

    source.close();
    await output.finalize();
    throwIfAborted(signal);
    const buffer = output.target.buffer;
    if (!buffer || buffer.byteLength === 0) throw new Error("The browser fallback decoder produced an empty MP4 file.");

    return makeResult(buffer, dimensions, false, pass, duration, callbacks, pass, totalPasses);
  } catch (error) {
    if (signal.aborted) throw new CompressionCancelledError();
    throw error instanceof Error ? error : new Error("The browser could not decode this video for compression.");
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}

function makeResult(buffer: ArrayBuffer | Uint8Array, dimensions: { width: number; height: number }, audioIncluded: boolean, pass: number, duration: number, callbacks: CompressionCallbacks, currentPass: number, totalPasses: number): CompressionResult {
  callbacks.onProgress?.({ progress: 0.99, stage: "finalizing", processedTime: duration, pass: currentPass, totalPasses });
  const blobBuffer = buffer instanceof ArrayBuffer
    ? buffer
    : buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  const blob = new Blob([blobBuffer], { type: "video/mp4" });
  callbacks.onProgress?.({ progress: 1, stage: "finalizing", processedTime: duration, pass: currentPass, totalPasses });
  return { blob, output: { size: blob.size, mimeType: "video/mp4", width: dimensions.width, height: dimensions.height, audioIncluded, passes: pass } };
}

function isDecoderFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("decode") || message.includes("webcodecs") || message.includes("codec") || message.includes("decoder") || message.includes("not supported") || message.includes("conversion is invalid");
}

function waitForVideoMetadata(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const onLoaded = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error("This browser cannot decode this video. Try Chrome or Edge, or convert the source to H.264 MP4 first.")); };
    const cleanup = () => { video.removeEventListener("loadedmetadata", onLoaded); video.removeEventListener("error", onError); };
    video.addEventListener("loadedmetadata", onLoaded, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.load();
  });
}

function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const onReady = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error("The browser can read the video container but cannot decode its frames.")); };
    const cleanup = () => { video.removeEventListener("loadeddata", onReady); video.removeEventListener("error", onError); };
    video.addEventListener("loadeddata", onReady, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}

function seekVideo(video: HTMLVideoElement, timestamp: number): Promise<void> {
  if (Math.abs(video.currentTime - timestamp) < 0.001 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const onSeeked = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error("The browser could not decode a video frame.")); };
    const cleanup = () => { video.removeEventListener("seeked", onSeeked); video.removeEventListener("error", onError); };
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.currentTime = Math.max(0, timestamp);
  });
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new CompressionCancelledError();
}

function attachAbort(signal: AbortSignal, callback: () => void): () => void {
  signal.addEventListener("abort", callback, { once: true });
  return () => signal.removeEventListener("abort", callback);
}

export function outputFilename(originalName: string): string {
  return buildOutputName(originalName);
}
