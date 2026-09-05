import {
  ALL_FORMATS,
  BlobSource,
  Input,
} from "mediabunny";
import type { VideoMetadata } from "./types";

export async function readVideoMetadata(file: File): Promise<VideoMetadata> {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  });

  try {
    if (!(await input.canRead())) {
      throw new Error("This video format is not supported by the browser media reader.");
    }

    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) {
      throw new Error("No video track was found in this file.");
    }

    const [width, height, duration, frameRateMetrics, audioTrack] = await Promise.all([
      videoTrack.getDisplayWidth(),
      videoTrack.getDisplayHeight(),
      videoTrack.getDurationFromMetadata(),
      videoTrack.computeFrameRateMetrics({ targetFrameCount: 120 }),
      input.getPrimaryAudioTrack(),
    ]);

    if (!duration || !Number.isFinite(duration) || duration <= 0) {
      throw new Error("The video duration could not be determined.");
    }

    return {
      name: file.name,
      size: file.size,
      mimeType: file.type || (await input.getMimeType()),
      duration,
      width,
      height,
      fps: frameRateMetrics.bestGuessFrameRate ?? null,
      hasAudio: Boolean(audioTrack),
    };
  } finally {
    input.dispose();
  }
}
