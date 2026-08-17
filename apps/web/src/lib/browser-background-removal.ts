"use client";

export type BrowserBackgroundModel = "isnet_quint8" | "isnet_fp16";

export type BrowserBackgroundResult = {
  blob: Blob;
  model: BrowserBackgroundModel;
  modelLabel: "quantized" | "FP16";
};

type ProgressHandler = (message: string) => void;

/**
 * Runs IMG.LY background removal entirely in the visitor's browser.
 *
 * The source File is passed directly to the browser package. FlytheBG does not
 * send it to the FlytheBG inference API for this result. The package may fetch
 * model/runtime assets from its configured distribution endpoints.
 */
export async function removeBackgroundInBrowser(
  file: File,
  model: BrowserBackgroundModel,
  onProgress?: ProgressHandler,
): Promise<BrowserBackgroundResult> {
  if (typeof window === "undefined") {
    throw new Error("Browser AI is only available in the browser.");
  }

  const { removeBackground } = await import("@imgly/background-removal");
  const modelLabel = model === "isnet_fp16" ? "FP16" : "quantized";

  onProgress?.(`Loading ${modelLabel} browser AI…`);
  const blob = await removeBackground(file, {
    debug: false,
    device: "cpu",
    model,
    rescale: true,
    output: { format: "image/png", quality: 1 },
    progress: (key: string, current: number, total: number) => {
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
      if (key.startsWith("fetch:")) onProgress?.(`Downloading ${modelLabel} browser AI ${percentage}%`);
      else onProgress?.(`${modelLabel} browser AI ${percentage}%`);
    },
  });

  return { blob, model, modelLabel };
}
