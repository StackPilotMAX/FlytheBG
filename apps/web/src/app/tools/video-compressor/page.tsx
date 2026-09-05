import type { Metadata } from "next";
import VideoCompressor from "@/components/video-compressor/VideoCompressor";

export const metadata: Metadata = {
  title: "Free Video Compressor — Compress Videos in Your Browser | FlyThe BG",
  description: "Compress videos directly in your browser with FlyThe BG. Choose quality and resolution, reduce file size, and download your result without uploading your video for compression.",
  keywords: ["video compressor", "compress video", "free video compressor", "browser video compressor", "private video compressor", "MP4 compressor"],
  alternates: { canonical: "/tools/video-compressor" },
  openGraph: {
    title: "Free Video Compressor | FlyThe BG",
    description: "Compress videos locally in your browser and download the resulting MP4.",
    url: "/tools/video-compressor",
    type: "website",
  },
};

export default function VideoCompressorPage() {
  return (
    <main>
      <VideoCompressor />
      <section className="videoCompressorSeo">
        <div>
          <span>Free browser video compressor</span>
          <h2>Compress videos locally, with a clear privacy boundary.</h2>
          <p>FlyThe BG uses browser media APIs to decode and encode supported videos on your device. The compressor does not send the selected source video to a FlyThe BG compression endpoint.</p>
        </div>
        <div className="videoCompressorSeoColumns">
          <article><h3>How it works</h3><p>Select a video, choose quality and an optional output resolution or target size, then let the browser encode an H.264 MP4. The result is measured after encoding so the displayed savings are based on the actual output.</p></article>
          <article><h3>Supported browsers</h3><p>Modern Chromium browsers are the primary target because local encoding depends on WebCodecs and browser codec support. Safari, iOS and Firefox are feature-detected and may report a limitation instead of starting a job that cannot work.</p></article>
          <article><h3>Target size is best-effort</h3><p>A 25 MB target, for example, is used to calculate a starting video bitrate. Keyframes, audio, codec behavior and MP4 container overhead mean an exact final size cannot be guaranteed.</p></article>
          <article><h3>Device limits</h3><p>Video compression is compute- and memory-intensive. Very large files, long recordings and high resolutions can exceed a phone or browser's available resources, so the tool uses explicit safety limits and recoverable errors.</p></article>
        </div>
      </section>
    </main>
  );
}
