"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "../lib/supabase/client";

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const client = createBrowserSupabaseClient();
    if (!client) return;

    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user ?? null);
    });
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (!user) {
    return (
      <Link className="header-login-link" href="/login?next=%2Fme">
        로그인
      </Link>
    );
  }

  const label =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    user.email ||
    "내 계정";

  return (
    <div className="header-account">
      <Link href="/me" title={label} aria-label={`${label}의 학습 기록`}>
        {label.slice(0, 1).toUpperCase()}
      </Link>
      <form action="/auth/signout?next=%2F" method="post">
        <button type="submit">로그아웃</button>
      </form>
    </div>
  );
}
