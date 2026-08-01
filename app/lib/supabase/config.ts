export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export type SupabaseEnvironment = Readonly<Record<string, string | undefined>> & {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

const LOCAL_SUPABASE_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function readSupabaseConfig(
  env: SupabaseEnvironment = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
): SupabaseConfig | null {
  const rawUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!rawUrl || !anonKey) return null;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (!isAllowedSupabaseUrl(url)) return null;

  return {
    url: url.origin,
    anonKey,
  };
}

function isAllowedSupabaseUrl(url: URL): boolean {
  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    return false;
  }

  if (LOCAL_SUPABASE_HOSTS.has(url.hostname)) {
    return url.protocol === "http:" || url.protocol === "https:";
  }

  return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
}
