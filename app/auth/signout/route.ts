import { NextResponse } from "next/server";
import { safeReturnPath } from "@/app/lib/auth-return";
import { createServerSupabaseClient } from "@/app/lib/supabase/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const next = safeReturnPath(requestUrl.searchParams.get("next"));
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL(next, origin), { status: 303 });
}
