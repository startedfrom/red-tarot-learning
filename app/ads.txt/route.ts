import { adsTxtLine } from "../lib/consent";

export function GET() {
  const body = adsTxtLine(process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID);
  if (!body) return new Response("Not configured\n", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  return new Response(body, { status: 200, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
