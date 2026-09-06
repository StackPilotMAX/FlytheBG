import {
  getEncodableAudioCodecs,
  getEncodableVideoCodecs,
} from "mediabunny";
import type { CapabilityResult } from "./types";

export async function checkCompressorCapabilities(): Promise<CapabilityResult> {
  if (typeof window === "undefined") {
    return { supported: false, reason: "Video compression is available only in a browser." };
  }

  // The canvas fallback only needs VideoEncoder. Source decoding can come from
  // the browser's native <video> pipeline when WebCodecs cannot decode it.
  if (!("VideoEncoder" in window)) {
    return {
      supported: false,
      reason: "This browser does not expose the WebCodecs video encoder required for local compression. Try the latest Chrome or Edge.",
    };
  }

  try {
    const [videoCodecs, audioCodecs] = await Promise.all([
      getEncodableVideoCodecs(["avc"]),
      getEncodableAudioCodecs(["aac"]),
    ]);

    if (!videoCodecs.includes("avc")) {
      return {
        supported: false,
        reason: "This browser cannot encode H.264 video locally. Try the latest Chrome or Edge.",
      };
    }

    const hasWebCodecsDecoder = "VideoDecoder" in window && "VideoFrame" in window;
    if (!hasWebCodecsDecoder) {
      return {
        supported: true,
        reason: audioCodecs.includes("aac")
          ? "Native browser video decoding will be used when WebCodecs cannot decode the source."
          : "Native browser video decoding will be used when needed; this browser cannot encode AAC locally, so audio may be omitted.",
      };
    }

    return {
      supported: true,
      reason: audioCodecs.includes("aac")
        ? undefined
        : "Video compression is available, but this browser cannot encode AAC locally. Audio may be omitted from the result.",
    };
  } catch {
    return {
      supported: false,
      reason: "The browser could not initialize its local media encoders.",
    };
  }
}
