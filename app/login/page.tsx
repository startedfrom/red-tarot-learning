import type { Metadata } from "next";
import { AppShell } from "../components/AppShell";
import { AuthPanel } from "../components/AuthPanel";
import { authErrorMessage, safeReturnPath } from "../lib/auth-return";
import { readSupabaseConfig } from "../lib/supabase/config";

export const metadata: Metadata = {
  title: "로그인",
  description: "Google, Kakao 또는 이메일로 로그인하고 빨강타로 학습 기록을 여러 기기에서 이어보세요.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeReturnPath(params.next);
  const configured = Boolean(
    readSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }),
  );

  return (
    <AppShell active="me">
      <AuthPanel
        configured={configured}
        initialError={authErrorMessage(params.error)}
        next={next}
      />
    </AppShell>
  );
}
