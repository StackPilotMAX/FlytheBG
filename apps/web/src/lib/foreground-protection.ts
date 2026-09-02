"use client";

/**
 * Conservative post-mask protection for browser background removal.
 * It restores only tiny holes that are surrounded by already-opaque subject
 * pixels. Because it never changes the outer silhouette, it does not restore
 * the white background around a person or product.
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
    const pixels = width * height;
    if (!width || !height || pixels > 4_000_000) return { blob: cutout, protected: false };

    const sourceCanvas = document.createElement("canvas");
    const maskCanvas = document.createElement("canvas");
    sourceCanvas.width = maskCanvas.width = width;
    sourceCanvas.height = maskCanvas.height = height;

    try {
      const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
      const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
      if (!sourceCtx || !maskCtx) return { blob: cutout, protected: false };
      sourceCtx.drawImage(sourceImage, 0, 0, width, height);
      maskCtx.drawImage(cutoutImage, 0, 0, width, height);

      const sourceData = sourceCtx.getImageData(0, 0, width, height).data;
      const maskData = maskCtx.getImageData(0, 0, width, height);
      const alpha = maskData.data;
      const originalAlpha = new Uint8ClampedArray(pixels);
      for (let p = 0, i = 3; p < pixels; p += 1, i += 4) originalAlpha[p] = alpha[i];

      let changed = false;
      for (let y = 1; y < height - 1; y += 1) {
        for (let x = 1; x < width - 1; x += 1) {
          const p = y * width + x;
          const current = originalAlpha[p];
          if (current >= 175) continue;

          const surrounding = [
            originalAlpha[p - width - 1], originalAlpha[p - width], originalAlpha[p - width + 1],
            originalAlpha[p - 1], originalAlpha[p + 1],
            originalAlpha[p + width - 1], originalAlpha[p + width], originalAlpha[p + width + 1],
          ];
          const strong = surrounding.filter((value) => value >= 190).length;
          if (strong < 7) continue;

          const i = p * 4;
          const r = sourceData[i];
          const g = sourceData[i + 1];
          const b = sourceData[i + 2];

          // Compare the source pixel with nearby opaque subject pixels. This
          // catches missing face/shirt pixels without painting the outside.
          let distanceTotal = 0;
          let samples = 0;
          for (let oy = -1; oy <= 1; oy += 1) {
            for (let ox = -1; ox <= 1; ox += 1) {
              if (ox === 0 && oy === 0) continue;
              const np = (y + oy) * width + (x + ox);
              if (originalAlpha[np] < 190) continue;
              const ni = np * 4;
              distanceTotal += Math.abs(r - sourceData[ni]) + Math.abs(g - sourceData[ni + 1]) + Math.abs(b - sourceData[ni + 2]);
              samples += 1;
            }
          }
          const meanDistance = samples ? distanceTotal / samples : 999;
          if (meanDistance <= 250 || current <= 24) {
            alpha[i + 3] = Math.max(current, Math.min(255, 220 + Math.round((strong - 7) * 10)));
            changed = true;
          }
        }
      }

      originalAlpha.fill(0);
      if (!changed) return { blob: cutout, protected: false };
      maskCtx.putImageData(maskData, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => maskCanvas.toBlob((value) => value ? resolve(value) : reject(new Error("Foreground protection encoding failed.")), "image/png", 1));
      maskData.data.fill(0);
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
