/**
 * Client-side helper for FlyTheBG's private server-side background removal.
 *
 * The browser only ever calls FlyTheBG's own /api/remove-background route.
 * The Hugging Face token (HF_TOKEN) lives in server-only environment variables
 * and is never exposed to the client. The server route connects to the private
 * Gradio Space (HF_SPACE_ID) running rembg, downloads the result, and streams
 * it back to the requesting browser.
 */

export type ServerRemovalResult = {
  blob: Blob;
  modelLabel: string;
};

export type ProgressReporter = (message: string) => void;

export async function removeBackgroundViaServer(
  file: File,
  onProgress?: ProgressReporter,
): Promise<ServerRemovalResult> {
  onProgress?.("Uploading securely to the private FlyTheBG processing service…");

  const form = new FormData();
  form.append("image", file, file.name);

  const response = await fetch("/api/remove-background", {
    method: "POST",
    body: form,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || "Background removal failed. Please try again.");
  }

  onProgress?.("rembg (Hugging Face) processing complete. Preparing your cutout…");

  const blob = await response.blob();
  if (!blob.type.startsWith("image/") || blob.size < 32) {
    throw new Error("The background-removal service returned an invalid image.");
  }

  return {
    blob,
    modelLabel: "rembg · Hugging Face private Space",
  };
}
