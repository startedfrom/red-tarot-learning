"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { buildAuthCallbackUrl } from "../lib/auth-return";
import { createBrowserSupabaseClient } from "../lib/supabase/client";

type Provider = "google" | "kakao";

export function AuthPanel({
  configured,
  initialError,
  next,
}: {
  configured: boolean;
  initialError: string | null;
  next: string;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<Provider | "email" | null>(null);
  const [message, setMessage] = useState(initialError ?? "");

  function clientOrExplain() {
    const client = createBrowserSupabaseClient();
    if (!client) {
      setMessage("운영 연결 준비 중이에요. 지금은 로그인 없이 학습할 수 있어요.");
    }
    return client;
  }

  async function signInWithProvider(provider: Provider) {
    const client = clientOrExplain();
    if (!client) return;

    setBusy(provider);
    setMessage("");
    try {
      const redirectTo = buildAuthCallbackUrl(window.location.origin, next);
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) {
        setMessage(`${provider === "google" ? "Google" : "Kakao"} 로그인을 시작하지 못했어요. 다시 시도해 주세요.`);
      }
    } catch {
      setMessage("로그인 연결을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(null);
    }
  }

  async function sendEmailCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setMessage("이메일 주소를 입력해 주세요.");
      return;
    }

    const client = clientOrExplain();
    if (!client) return;

    setBusy("email");
    setMessage("");
    try {
      const emailRedirectTo = buildAuthCallbackUrl(window.location.origin, next);
      const { error } = await client.auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo },
      });
      setMessage(
        error
          ? "인증 메일을 보내지 못했어요. 주소를 확인하고 다시 시도해 주세요."
          : "인증 메일을 보냈어요. 메일의 링크를 누르면 학습 기록이 연결돼요.",
      );
    } catch {
      setMessage("인증 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="auth-panel" aria-labelledby="login-title">
      <div className="auth-heading">
        <span className="eyebrow">SAVE YOUR PROGRESS</span>
        <h1 id="login-title">로그인하고 학습 기록 저장하기</h1>
        <p>완료한 학습, 최근 오답, 즐겨찾기를 다른 기기에서도 이어서 볼 수 있어요.</p>
      </div>

      {!configured ? (
        <div className="auth-config-note" role="status">
          <strong>운영 연결 준비 중</strong>
          <p>계정 연결 전에도 모든 카드와 학습 기능을 무료로 사용할 수 있어요.</p>
        </div>
      ) : null}

      <div className="auth-provider-list" aria-label="소셜 로그인">
        <button
          className="auth-provider auth-google"
          type="button"
          onClick={() => void signInWithProvider("google")}
          aria-busy={busy === "google"}
        >
          <span aria-hidden="true">G</span>
          {busy === "google" ? "Google 연결 중…" : "Google로 계속하기"}
        </button>
        <button
          className="auth-provider auth-kakao"
          type="button"
          onClick={() => void signInWithProvider("kakao")}
          aria-busy={busy === "kakao"}
        >
          <span aria-hidden="true">K</span>
          {busy === "kakao" ? "Kakao 연결 중…" : "Kakao로 계속하기"}
        </button>
      </div>

      <div className="auth-divider"><span>또는</span></div>

      <form className="auth-email-form" onSubmit={sendEmailCode}>
        <label htmlFor="login-email">이메일</label>
        <div>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button type="submit" disabled={busy !== null}>
            {busy === "email" ? "전송 중…" : "이메일로 코드 받기"}
          </button>
        </div>
      </form>

      <p className="auth-status" role="status" aria-live="polite">
        {message}
      </p>

      <Link className="auth-skip-link" href={next}>
        로그인하지 않고 계속 학습
      </Link>
      <p className="auth-terms-copy">
        로그인하면 <Link href="/terms">이용약관</Link>과 <Link href="/privacy">개인정보처리방침</Link>에 동의하게 됩니다.
      </p>
    </section>
  );
}
