import { NextResponse } from "next/server";
import { safeReturnPath } from "@/app/lib/auth-return";
import { createServerSupabaseClient } from "@/app/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = new URL(request.url).origin;
  const next = safeReturnPath(requestUrl.searchParams.get("next"));
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/login?error=config", origin));
  }

  const code = requestUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=callback", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
