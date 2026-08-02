import { handleAuthSignout } from "@/app/lib/auth-signout";
import { createServerSupabaseClient } from "@/app/lib/supabase/server";

export async function POST(request: Request) {
  return handleAuthSignout(request, createServerSupabaseClient);
}
