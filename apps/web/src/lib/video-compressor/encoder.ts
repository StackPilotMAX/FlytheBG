import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
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
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("This file is too large for a safe in-browser compression job. Try a smaller video.");
  }
  if (metadata.duration > MAX_DURATION_SECONDS) {
    throw new Error("This video is longer than the current four-hour browser safety limit.");
  }

  const dimensions = calculateOutputDimensions(metadata.width, metadata.height, settings.resolution);
  const target = targetBytes(settings);
  let bitrate = target
    ? calculateTargetVideoBitrate(target, metadata.duration, dimensions.width, dimensions.height)
    : null;
  let lastResult: CompressionResult | null = null;

  const totalPasses = target ? MAX_TARGET_PASSES : 1;

  for (let pass = 1; pass <= totalPasses; pass += 1) {
    throwIfAborted(signal);
    callbacks.onProgress?.({
      progress: 0,
      stage: "preparing",
      processedTime: 0,
      pass,
      totalPasses,
    });

    const result = await runConversion({
      file,
      metadata,
      dimensions,
      settings,
      bitrate,
      signal,
      pass,
      totalPasses,
      callbacks,
    });

    lastResult = result;

    if (!target) break;

    const ratio = result.output.size / target;
    if (ratio >= TARGET_TOLERANCE_LOW && ratio <= TARGET_TOLERANCE_HIGH) break;
    if (pass === totalPasses) break;

    const currentBitrate = bitrate ?? 0;
    if (currentBitrate <= 0) break;
    bitrate = Math.round(currentBitrate * Math.min(1.5, Math.max(0.55, 1 / ratio)));
  }

  if (!lastResult) {
    throw new Error("Compression did not produce an output file.");
  }

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

async function runConversion({
  file,
  metadata,
  dimensions,
  settings,
  bitrate,
  signal,
  pass,
  totalPasses,
  callbacks,
}: ConversionRunOptions): Promise<CompressionResult> {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  });
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target: new BufferTarget(),
  });

  let conversion: Conversion | null = null;
  let removeAbortListener: (() => void) | null = null;

  try {
    callbacks.onProgress?.({
      progress: 0.01,
      stage: "decoding",
      processedTime: 0,
      pass,
      totalPasses,
    });

    const audioTrack = await input.getPrimaryAudioTrack();
    const audioCanBeCopied = Boolean(audioTrack);

    const videoOptions = {
      codec: "avc" as const,
      width: dimensions.width,
      height: dimensions.height,
      fit: "contain" as const,
      forceTranscode: true,
      hardwareAcceleration: "prefer-hardware" as const,
      ...(bitrate
        ? { quality: new Quality({ bitrate }) }
        : { quality: new Quality(settings.quality) }),
    };

    conversion = await Conversion.init({
      input,
      output,
      tracks: "primary",
      video: videoOptions,
      ...(audioCanBeCopied ? {} : { audio: { discard: true } }),
      tags: {},
      showWarnings: false,
    });

    if (!conversion.isValid) {
      const hasAudioProblem = conversion.discardedTracks.some((item) => item.track.type === "audio");
      if (hasAudioProblem) {
        input.dispose();
        return runVideoOnlyConversion({
          file,
          metadata,
          dimensions,
          settings,
          bitrate,
          signal,
          pass,
          totalPasses,
          callbacks,
        });
      }

      throw new Error("This browser cannot decode the selected video and encode it as H.264 MP4 locally.");
    }

    removeAbortListener = attachAbort(signal, () => {
      void conversion?.cancel();
    });

    conversion.onProgress = (progress, processedTime) => {
      callbacks.onProgress?.({
        progress: Math.min(0.98, Math.max(0, progress)),
        stage: progress < 0.1 ? "decoding" : "encoding",
        processedTime,
        pass,
        totalPasses,
      });
    };

    await conversion.execute();
    throwIfAborted(signal);

    callbacks.onProgress?.({
      progress: 0.99,
      stage: "finalizing",
      processedTime: metadata.duration,
      pass,
      totalPasses,
    });

    const buffer = output.target.buffer;
    if (!buffer || buffer.byteLength === 0) {
      throw new Error("The browser finished encoding but produced an empty MP4 file.");
    }

    const audioIncluded = !conversion.discardedTracks.some((item) => item.track.type === "audio");
    const blob = new Blob([buffer], { type: "video/mp4" });

    callbacks.onProgress?.({
      progress: 1,
      stage: "finalizing",
      processedTime: metadata.duration,
      pass,
      totalPasses,
    });

    return {
      blob,
      output: {
        size: blob.size,
        mimeType: "video/mp4",
        width: dimensions.width,
        height: dimensions.height,
        audioIncluded,
        passes: pass,
      },
    };
  } catch (error) {
    if (error instanceof ConversionCanceledError || signal.aborted) {
      throw new CompressionCancelledError();
    }
    throw error instanceof Error ? error : new Error("Video compression failed.");
  } finally {
    removeAbortListener?.();
    input.dispose();
  }
}

async function runVideoOnlyConversion(options: ConversionRunOptions): Promise<CompressionResult> {
  const { file, metadata, dimensions, settings, bitrate, signal, pass, totalPasses, callbacks } = options;
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target: new BufferTarget(),
  });
  let conversion: Conversion | null = null;
  let removeAbortListener: (() => void) | null = null;

  try {
    conversion = await Conversion.init({
      input,
      output,
      tracks: "primary",
      video: {
        codec: "avc",
        width: dimensions.width,
        height: dimensions.height,
        fit: "contain",
        forceTranscode: true,
        hardwareAcceleration: "prefer-hardware",
        ...(bitrate
          ? { quality: new Quality({ bitrate }) }
          : { quality: new Quality(settings.quality) }),
      },
      audio: { discard: true },
      tags: {},
      showWarnings: false,
    });

    if (!conversion.isValid) {
      throw new Error("This browser cannot produce a compatible local H.264 MP4 from this video.");
    }

    removeAbortListener = attachAbort(signal, () => {
      void conversion?.cancel();
    });
    conversion.onProgress = (progress, processedTime) => {
      callbacks.onProgress?.({
        progress: Math.min(0.98, Math.max(0, progress)),
        stage: progress < 0.1 ? "decoding" : "encoding",
        processedTime,
        pass,
        totalPasses,
      });
    };
    await conversion.execute();
    throwIfAborted(signal);

    callbacks.onProgress?.({
      progress: 0.99,
      stage: "finalizing",
      processedTime: metadata.duration,
      pass,
      totalPasses,
    });

    const buffer = output.target.buffer;
    if (!buffer || buffer.byteLength === 0) throw new Error("The browser produced an empty MP4 file.");
    const blob = new Blob([buffer], { type: "video/mp4" });
    callbacks.onProgress?.({
      progress: 1,
      stage: "finalizing",
      processedTime: metadata.duration,
      pass,
      totalPasses,
    });

    return {
      blob,
      output: {
        size: blob.size,
        mimeType: "video/mp4",
        width: dimensions.width,
        height: dimensions.height,
        audioIncluded: false,
        passes: pass,
      },
    };
  } catch (error) {
    if (error instanceof ConversionCanceledError || signal.aborted) throw new CompressionCancelledError();
    throw error instanceof Error ? error : new Error("Video compression failed.");
  } finally {
    removeAbortListener?.();
    input.dispose();
  }
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
