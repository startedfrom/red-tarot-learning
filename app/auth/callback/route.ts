import { handleAuthCallback } from "@/app/lib/auth-callback";
import { createServerSupabaseClient } from "@/app/lib/supabase/server";

export async function GET(request: Request) {
  return handleAuthCallback(request, createServerSupabaseClient);
}
