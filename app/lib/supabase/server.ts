import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { readSupabaseConfig } from "./config";
import type { Database } from "./database.types";

export async function createServerSupabaseClient(): Promise<
  SupabaseClient<Database> | null
> {
  const config = readSupabaseConfig({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!config) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch (error) {
          if (!isReadOnlyServerComponentCookieError(error)) throw error;
        }
      },
    },
  });
}

function isReadOnlyServerComponentCookieError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  return /cookies can only be modified in a server action or route handler|readonlyrequestcookies cannot be modified/i.test(
    error.message,
  );
}
