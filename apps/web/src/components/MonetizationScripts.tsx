const monetagScriptSrc = process.env.NEXT_PUBLIC_MONETAG_SCRIPT_SRC?.trim() || "";
const monetagMetaName = process.env.NEXT_PUBLIC_MONETAG_VERIFICATION_META_NAME?.trim() || "";
const monetagMetaContent = process.env.NEXT_PUBLIC_MONETAG_VERIFICATION_META_CONTENT?.trim() || "";

export function MonetizationHead() {
  return (
    <>
      {monetagMetaName && monetagMetaContent ? (
        <meta name={monetagMetaName} content={monetagMetaContent} />
      ) : null}
      {monetagScriptSrc ? (
        <script async src={monetagScriptSrc} data-cfasync="false" />
      ) : null}
    </>
  );
}

export function MonetizationScripts() {
  return null;
}
