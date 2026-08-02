const FALLBACK_SITE_URL = "https://red-tarot-learning.bqk2h.chatgpt.site";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return new URL(configured || FALLBACK_SITE_URL).origin;
}
