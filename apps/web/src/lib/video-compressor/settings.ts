import type {
  CompressionSettings,
  QualityPreset,
  ResolutionPreset,
  TargetSizePreset,
} from "./types";

export const QUALITY_LABELS: Record<QualityPreset, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const RESOLUTION_LABELS: Record<ResolutionPreset, string> = {
  original: "Original",
  "1080p": "1080p",
  "720p": "720p",
  "480p": "480p",
  "360p": "360p",
};

export const TARGET_SIZE_BYTES: Record<Exclude<TargetSizePreset, "none" | "custom">, number> = {
  "10mb": 10 * 1024 * 1024,
  "25mb": 25 * 1024 * 1024,
  "50mb": 50 * 1024 * 1024,
  "100mb": 100 * 1024 * 1024,
};

export const DEFAULT_SETTINGS: CompressionSettings = {
  quality: "medium",
  resolution: "original",
  targetSize: "none",
};

export function targetBytes(settings: CompressionSettings): number | null {
  if (settings.targetSize === "none") return null;
  if (settings.targetSize === "custom") {
    const mb = Number(settings.customTargetMb);
    return Number.isFinite(mb) && mb > 0 ? mb * 1024 * 1024 : null;
  }
  return TARGET_SIZE_BYTES[settings.targetSize];
}

export function calculateOutputDimensions(
  sourceWidth: number,
  sourceHeight: number,
  preset: ResolutionPreset,
): { width: number; height: number } {
  if (preset === "original") {
    return { width: even(sourceWidth), height: even(sourceHeight) };
  }

  const limit = Number.parseInt(preset, 10);
  const longestSide = Math.max(sourceWidth, sourceHeight);
  if (!Number.isFinite(limit) || longestSide <= limit) {
    return { width: even(sourceWidth), height: even(sourceHeight) };
  }

  const scale = limit / longestSide;
  return {
    width: even(Math.round(sourceWidth * scale)),
    height: even(Math.round(sourceHeight * scale)),
  };
}

export function calculateTargetVideoBitrate(
  targetBytesValue: number,
  durationSeconds: number,
  outputWidth: number,
  outputHeight: number,
  audioBitrate = 96_000,
): number {
  if (!Number.isFinite(targetBytesValue) || targetBytesValue <= 0) {
    throw new Error("Target size must be greater than zero.");
  }
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error("A valid video duration is required for target-size mode.");
  }

  const totalBitrate = (targetBytesValue * 8 * 0.88) / durationSeconds;
  const estimatedVideoBitrate = Math.max(80_000, totalBitrate - audioBitrate);
  const pixels = outputWidth * outputHeight;
  const minimum = Math.max(80_000, Math.round(pixels * 0.035));
  const maximum = Math.min(40_000_000, Math.max(500_000, Math.round(pixels * 0.28)));

  return Math.round(Math.min(maximum, Math.max(minimum, estimatedVideoBitrate)));
}

export function even(value: number): number {
  const safe = Math.max(2, Math.round(value));
  return safe % 2 === 0 ? safe : safe - 1;
}

export function buildOutputName(originalName: string): string {
  const withoutExtension = originalName.replace(/\.[^/.]+$/, "");
  const sanitized = withoutExtension.replace(/[\\/:*?"<>|\u0000-\u001F]/g, "_").trim();
  return `${sanitized || "video"}-compressed.mp4`;
}
