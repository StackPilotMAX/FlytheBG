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
    if (await input.canRead()) {
      const videoTrack = await input.getPrimaryVideoTrack();
      if (videoTrack) {
        const [width, height, duration, frameRateMetrics, audioTrack] = await Promise.all([
          videoTrack.getDisplayWidth(),
          videoTrack.getDisplayHeight(),
          videoTrack.getDurationFromMetadata(),
          videoTrack.computeFrameRateMetrics({ targetPacketCount: 120 }),
          input.getPrimaryAudioTrack(),
        ]);

        if (duration && Number.isFinite(duration) && duration > 0) {
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
        }
      }
    }
  } finally {
    input.dispose();
  }

  // Some browsers can play codecs through the HTML media pipeline that are
  // not exposed through WebCodecs/Mediabunny (notably some HEVC phone videos).
  // Use that decoder for metadata so those files can reach the canvas fallback.
  return readMetadataWithVideoElement(file);
}

function readMetadataWithVideoElement(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    let settled = false;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(message));
    };

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0 || !video.videoWidth || !video.videoHeight) {
        fail("The video duration or dimensions could not be determined.");
        return;
      }
      if (settled) return;
      settled = true;
      const fps = Number.isFinite(video.getVideoPlaybackQuality?.().totalVideoFrames ?? NaN)
        ? null
        : null;
      cleanup();
      resolve({
        name: file.name,
        size: file.size,
        mimeType: file.type || "video/*",
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        fps,
        hasAudio: true,
      });
    };
    video.onerror = () => fail("This browser cannot decode this video. Try Chrome or Edge, or convert the source to H.264 MP4 first.");
    video.src = url;
  });
}
