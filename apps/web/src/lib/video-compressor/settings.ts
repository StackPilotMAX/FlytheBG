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
  quality: "high",
  resolution: "original",
  targetSize: "none",
};

export function targetBytes(settings: CompressionSettings, sourceBytes?: number): number | null {
  if (settings.targetSize === "none") return null;

  let requested: number;
  if (settings.targetSize === "custom") {
    const mb = Number(settings.customTargetMb);
    requested = Number.isFinite(mb) && mb > 0 ? mb * 1024 * 1024 : 0;
  } else {
    requested = TARGET_SIZE_BYTES[settings.targetSize];
  }

  if (!requested) return null;
  // Never deliberately turn a smaller source into a larger file in target mode.
  return Number.isFinite(sourceBytes) && sourceBytes! > 0
    ? Math.min(requested, Math.floor(sourceBytes! * 0.98))
    : requested;
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

  const totalBitrate = (targetBytesValue * 8 * 0.90) / durationSeconds;
  const estimatedVideoBitrate = Math.max(80_000, totalBitrate - audioBitrate);
  const pixels = outputWidth * outputHeight;
  const minimum = Math.max(80_000, Math.round(pixels * 0.018));
  const maximum = Math.min(40_000_000, Math.max(500_000, Math.round(pixels * 0.28)));

  return Math.round(Math.min(maximum, Math.max(minimum, estimatedVideoBitrate)));
}

/**
 * Quality presets are bitrate presets, not cosmetic labels. They are derived
 * from the source's estimated bitrate so High/Medium/Low produce materially
 * different outputs and High does not normally inflate a compressed file.
 */
export function calculateQualityVideoBitrate(
  sourceBytes: number,
  durationSeconds: number,
  outputWidth: number,
  outputHeight: number,
  quality: QualityPreset,
  audioBitrate = 96_000,
): number {
  if (!Number.isFinite(sourceBytes) || sourceBytes <= 0 || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error("A valid source size and duration are required for quality mode.");
  }

  const sourceTotalBitrate = (sourceBytes * 8) / durationSeconds;
  const sourceVideoBitrate = Math.max(160_000, sourceTotalBitrate - audioBitrate);
  const factor = quality === "high" ? 0.82 : quality === "medium" ? 0.58 : 0.38;
  const pixels = outputWidth * outputHeight;
  const minimum = Math.max(80_000, Math.round(pixels * 0.018));
  const maximum = Math.min(24_000_000, Math.max(500_000, Math.round(pixels * 0.22)));

  return Math.round(Math.min(maximum, Math.max(minimum, sourceVideoBitrate * factor)));
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
