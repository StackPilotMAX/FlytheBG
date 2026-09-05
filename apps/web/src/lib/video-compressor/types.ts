export type QualityPreset = "high" | "medium" | "low";

export type ResolutionPreset = "original" | "1080p" | "720p" | "480p" | "360p";

export type TargetSizePreset = "none" | "10mb" | "25mb" | "50mb" | "100mb" | "custom";

export interface VideoMetadata {
  name: string;
  size: number;
  mimeType: string;
  duration: number;
  width: number;
  height: number;
  fps: number | null;
  hasAudio: boolean;
}

export interface CompressionSettings {
  quality: QualityPreset;
  resolution: ResolutionPreset;
  targetSize: TargetSizePreset;
  customTargetMb?: number;
}

export interface OutputMetadata {
  size: number;
  mimeType: string;
  width: number;
  height: number;
  audioIncluded: boolean;
  passes: number;
}

export interface CompressionResult {
  blob: Blob;
  output: OutputMetadata;
}

export interface CompressionProgress {
  progress: number;
  stage: "preparing" | "decoding" | "encoding" | "finalizing";
  processedTime: number;
  pass: number;
  totalPasses: number;
}

export interface CapabilityResult {
  supported: boolean;
  reason?: string;
}

export interface CompressionCallbacks {
  onProgress?: (progress: CompressionProgress) => void;
}
