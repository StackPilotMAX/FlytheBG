export type AllowedImageType = "image/png" | "image/jpeg" | "image/webp";

const allowed = new Set<AllowedImageType>(["image/png", "image/jpeg", "image/webp"]);

export function detectedMime(bytes: Uint8Array): AllowedImageType | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return "image/png";

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) return "image/webp";

  return null;
}

export function validateUploadBasics(file: File, maxMb: number) {
  if (!allowed.has(file.type as AllowedImageType)) {
    return `Use a PNG, JPEG, or WebP image.`;
  }
  if (file.size <= 0) return "The selected file is empty.";
  if (file.size > maxMb * 1024 * 1024) return `Image must be ${maxMb} MB or smaller.`;
  return null;
}
