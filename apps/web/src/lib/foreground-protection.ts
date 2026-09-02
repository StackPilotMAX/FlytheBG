"use client";

/**
 * Conservative post-mask protection for browser background removal.
 * It only restores pixels that are almost certainly inside the foreground
 * because nearly every surrounding pixel is already strongly opaque.
 * This avoids bringing a white/background halo back around the silhouette.
 */
export async function protectForegroundDetails(source: File, cutout: Blob): Promise<{ blob: Blob; protected: boolean }> {
  const sourceUrl = URL.createObjectURL(source);
  const cutoutUrl = URL.createObjectURL(cutout);
  const sourceImage = new Image();
  const cutoutImage = new Image();
  sourceImage.decoding = "async";
  cutoutImage.decoding = "async";

  const load = (image: HTMLImageElement, url: string, label: string) => new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`${label} could not be decoded.`));
    image.src = url;
  });

  try {
    await Promise.all([load(sourceImage, sourceUrl, "Source image"), load(cutoutImage, cutoutUrl, "Cutout image")]);
    const width = cutoutImage.naturalWidth || cutoutImage.width;
    const height = cutoutImage.naturalHeight || cutoutImage.height;
    if (!width || !height) return { blob: cutout, protected: false };

    // Keep this pass bounded so phones do not allocate another huge full-size buffer.
    const scale = Math.min(1, 1800 / Math.max(width, height));
    const workWidth = Math.max(1, Math.round(width * scale));
    const workHeight = Math.max(1, Math.round(height * scale));
    const sourceCanvas = document.createElement("canvas");
    const maskCanvas = document.createElement("canvas");
    sourceCanvas.width = maskCanvas.width = workWidth;
    sourceCanvas.height = maskCanvas.height = workHeight;

    try {
      const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
      const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
      if (!sourceCtx || !maskCtx) return { blob: cutout, protected: false };
      sourceCtx.drawImage(sourceImage, 0, 0, workWidth, workHeight);
      maskCtx.drawImage(cutoutImage, 0, 0, workWidth, workHeight);

      const sourceData = sourceCtx.getImageData(0, 0, workWidth, workHeight).data;
      const maskData = maskCtx.getImageData(0, 0, workWidth, workHeight);
      const alpha = maskData.data;
      const pixels = workWidth * workHeight;
      const originalAlpha = new Uint8ClampedArray(pixels);
      for (let p = 0, i = 3; p < pixels; p += 1, i += 4) originalAlpha[p] = alpha[i];

      let changed = false;
      for (let y = 1; y < workHeight - 1; y += 1) {
        for (let x = 1; x < workWidth - 1; x += 1) {
          const p = y * workWidth + x;
          const current = originalAlpha[p];
          if (current >= 175) continue;

          const neighbors = [
            originalAlpha[p - workWidth - 1], originalAlpha[p - workWidth], originalAlpha[p - workWidth + 1],
            originalAlpha[p - 1], originalAlpha[p + 1],
            originalAlpha[p + workWidth - 1], originalAlpha[p + workWidth], originalAlpha[p + workWidth + 1],
          ];
          const strong = neighbors.filter((value) => value >= 190).length;
          if (strong < 7) continue;

          const i = p * 4;
          const r = sourceData[i];
          const g = sourceData[i + 1];
          const b = sourceData[i + 2];
          const neighborRgb = neighbors
            .map((value, index) => ({ value, index }))
            .filter(({ value }) => value >= 190)
            .map(({ index }) => {
              const nx = x + (index % 3) - 1;
              const ny = y + Math.floor(index / 3) - 1;
              const ni = (ny * workWidth + nx) * 4;
              return [sourceData[ni], sourceData[ni + 1], sourceData[ni + 2]] as const;
            });
          const average = neighborRgb.reduce((acc, rgb) => [acc[0] + rgb[0], acc[1] + rgb[1], acc[2] + rgb[2]] as const, [0, 0, 0] as const);
          const count = Math.max(1, neighborRgb.length);
          const ar = average[0] / count;
          const ag = average[1] / count;
          const ab = average[2] / count;
          const distance = Math.abs(r - ar) + Math.abs(g - ag) + Math.abs(b - ab);

          // Faces, shirts and other subject interiors should be kept when the
          // source colour is plausibly part of the already-detected foreground.
          // The colour check is deliberately permissive; the 7/8 opaque-neighbour
          // rule is the primary protection against restoring the background.
          if (distance <= 210 || current <= 24) {
            alpha[i + 3] = Math.max(current, Math.min(255, Math.round(205 + strong * 5)));
            changed = true;
          }
        }
      }

      if (!changed) return { blob: cutout, protected: false };

      if (scale === 1) {
        maskCtx.putImageData(maskData, 0, 0);
        const blob = await new Promise<Blob>((resolve, reject) => maskCanvas.toBlob((value) => value ? resolve(value) : reject(new Error("Foreground protection encoding failed.")), "image/png", 1));
        return { blob, protected: true };
      }

      // Apply the corrected low-resolution alpha to the original cutout size.
      const fullCanvas = document.createElement("canvas");
      fullCanvas.width = width;
      fullCanvas.height = height;
      const fullCtx = fullCanvas.getContext("2d", { alpha: true });
      if (!fullCtx) return { blob: cutout, protected: false };
      fullCtx.clearRect(0, 0, width, height);
      fullCtx.drawImage(cutoutImage, 0, 0);
      const fullData = fullCtx.getImageData(0, 0, width, height);
      const fullAlpha = fullData.data;
      const corrected = document.createElement("canvas");
      corrected.width = workWidth;
      corrected.height = workHeight;
      const correctedCtx = corrected.getContext("2d");
      if (!correctedCtx) return { blob: cutout, protected: false };
      correctedCtx.putImageData(maskData, 0, 0);
      fullCtx.globalCompositeOperation = "destination-in";
      fullCtx.globalAlpha = 1;
      fullCtx.drawImage(corrected, 0, 0, width, height);
      fullCtx.globalCompositeOperation = "source-over";
      // The destination-in pass uses the corrected alpha for all pixels; because
      // only protected pixels changed, the original colour pixels remain intact.
      const blob = await new Promise<Blob>((resolve, reject) => fullCanvas.toBlob((value) => value ? resolve(value) : reject(new Error("Foreground protection encoding failed.")), "image/png", 1));
      fullAlpha.fill(0);
      return { blob, protected: true };
    } finally {
      sourceCanvas.width = sourceCanvas.height = 1;
      maskCanvas.width = maskCanvas.height = 1;
    }
  } finally {
    sourceImage.src = "";
    cutoutImage.src = "";
    URL.revokeObjectURL(sourceUrl);
    URL.revokeObjectURL(cutoutUrl);
  }
}
