export const dynamic = "force-dynamic";

export async function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
  const publisher = client.replace(/^ca-/, "");
  const body = /^pub-\d{16}$/.test(publisher)
    ? `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`
    : "# Google AdSense is not configured for this deployment.\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
