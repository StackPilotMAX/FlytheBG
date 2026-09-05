import {
  getEncodableAudioCodecs,
  getEncodableVideoCodecs,
} from "mediabunny";
import type { CapabilityResult } from "./types";

export async function checkCompressorCapabilities(): Promise<CapabilityResult> {
  if (typeof window === "undefined") {
    return { supported: false, reason: "Video compression is available only in a browser." };
  }

  if (!("VideoEncoder" in window) || !("VideoFrame" in window)) {
    return {
      supported: false,
      reason: "This browser does not expose the WebCodecs video APIs required for local compression.",
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
