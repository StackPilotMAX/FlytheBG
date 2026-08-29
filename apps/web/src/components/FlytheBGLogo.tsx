import Link from "next/link";

export const FLYTHEBG_REAL_LOGO = "/brand/flythebg-mark.svg";

type FlytheBGLogoProps = {
  className?: string;
  imageClassName?: string;
  size?: number;
  priority?: boolean;
};

/**
 * The production brand component intentionally renders the original logo
 * artwork asset. Do not replace this with inline SVG paths, CSS shapes, emoji,
 * initials, or a generated wordmark.
 *
 * Header instances can opt into eager loading; secondary/footer instances
 * remain lazy so below-the-fold imagery does not compete with the first paint.
 */
export function FlytheBGLogo({
  className = "brand",
  imageClassName = "realBrandMark",
  size = 36,
  priority = false,
}: FlytheBGLogoProps) {
  return (
    <Link className={className} href="/" aria-label="FlytheBG home">
      <img
        className={imageClassName}
        src={FLYTHEBG_REAL_LOGO}
        alt="FlytheBG"
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: "contain" }}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </Link>
  );
}
