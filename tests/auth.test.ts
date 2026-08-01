import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  AUTH_ERROR_MESSAGES,
  authErrorMessage,
  buildAuthCallbackUrl,
  safeReturnPath,
} from "../app/lib/auth-return";
import { readSupabaseConfig } from "../app/lib/supabase/config";

test("auth is disabled unless a valid URL and nonblank anon key both exist", () => {
  assert.equal(readSupabaseConfig({}), null);
  assert.equal(
    readSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://project-ref.supabase.co",
    }),
    null,
  );
  assert.equal(
    readSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
    }),
    null,
  );
  assert.equal(
    readSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://project-ref.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "   ",
    }),
    null,
  );
});

test("accepts hosted HTTPS and local HTTP Supabase configurations", () => {
  assert.deepEqual(
    readSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://project-ref.supabase.co/",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "  public-anon-key  ",
    }),
    {
      url: "https://project-ref.supabase.co",
      anonKey: "public-anon-key",
    },
  );
  assert.deepEqual(
    readSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "local-anon-key",
    }),
    {
      url: "http://127.0.0.1:54321",
      anonKey: "local-anon-key",
    },
  );
  assert.deepEqual(
    readSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321/",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "local-anon-key",
    }),
    {
      url: "http://localhost:54321",
      anonKey: "local-anon-key",
    },
  );
});

test("rejects malformed, unsafe, and non-Supabase remote URLs", () => {
  const rejectedUrls = [
    "not a url",
    "javascript:alert(1)",
    "data:text/plain,hello",
    "file:///tmp/supabase",
    "http://project-ref.supabase.co",
    "https://supabase.co.evil.example",
    "https://example.com",
    "https://user:pass@project-ref.supabase.co",
    "https://project-ref.supabase.co/rest/v1",
  ];

  for (const url of rejectedUrls) {
    assert.equal(
      readSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
      }),
      null,
      `${url} must not enable Supabase`,
    );
  }
});

test("allows only same-site relative return paths including query and hash", () => {
  assert.equal(safeReturnPath("/"), "/");
  assert.equal(safeReturnPath("/me?tab=cards#saved"), "/me?tab=cards#saved");
  assert.equal(safeReturnPath("/cards/the-star?q=love"), "/cards/the-star?q=love");
});

test("rejects protocol URLs, slash tricks, backslashes, and encoded controls", () => {
  const rejectedPaths = [
    "https://evil.example/me",
    "javascript:alert(1)",
    "//evil.example/me",
    "\\\\evil.example\\me",
    "/\\evil.example/me",
    "/%5cevil.example/me",
    "/foo/..//evil.example/me",
    "/%2e%2e//evil.example/me",
    "/me%0aSet-Cookie:bad",
    "/me%0d%0aLocation:%20https://evil.example",
    "/me%00hidden",
    "/me%7fhidden",
    "/me%250ahidden",
  ];

  for (const path of rejectedPaths) {
    assert.equal(safeReturnPath(path), "/me", `${path} must be rejected`);
  }
});

test("rejects reserved auth return paths, including encoded variants", () => {
  const rejectedPaths = [
    "/auth/callback",
    "/auth/callback?next=/cards",
    "/auth/callback/",
    "/auth/callback/retry",
    "/auth/%63allback",
    "/auth/signout",
    "/auth/signout#again",
    "/auth/signout/",
    "/auth/signout/again",
  ];

  for (const path of rejectedPaths) {
    assert.equal(safeReturnPath(path), "/me", `${path} must be rejected`);
  }
  assert.equal(safeReturnPath(null), "/me");
  assert.equal(safeReturnPath(undefined), "/me");
});

test("builds an encoded callback URL with a validated return path", () => {
  assert.equal(
    buildAuthCallbackUrl(
      "https://red-tarot.example/some/page",
      "/me?tab=cards#saved",
    ),
    "https://red-tarot.example/auth/callback?next=%2Fme%3Ftab%3Dcards%23saved",
  );
  assert.equal(
    buildAuthCallbackUrl("https://red-tarot.example", "//evil.example"),
    "https://red-tarot.example/auth/callback?next=%2Fme",
  );
});

test("maps stable auth codes to Korean messages without leaking provider errors", () => {
  assert.equal(authErrorMessage(null), null);

  for (const code of ["config", "missing_code", "callback"] as const) {
    const message = authErrorMessage(code);
    assert.equal(message, AUTH_ERROR_MESSAGES[code]);
    assert.match(message, /[가-힣]/);
    assert.doesNotMatch(message, new RegExp(code, "i"));
  }

  const rawProviderError = "invalid_grant: provider secret was rejected";
  const fallback = authErrorMessage(rawProviderError);
  assert.match(fallback, /[가-힣]/);
  assert.doesNotMatch(fallback, /invalid_grant|provider|secret/i);
});

test("callback exchanges a code and exposes only stable redirect errors", () => {
  const route = readFileSync("app/auth/callback/route.ts", "utf8");

  assert.match(route, /export\s+async\s+function\s+GET\s*\(/);
  assert.match(route, /new\s+URL\s*\(\s*request\.url\s*\)\.origin/);
  assert.match(route, /searchParams\.get\s*\(\s*["']code["']\s*\)/);
  assert.match(route, /exchangeCodeForSession\s*\(\s*code\s*\)/);
  assert.match(route, /safeReturnPath\s*\(/);
  assert.match(route, /error=config/);
  assert.match(route, /error=missing_code/);
  assert.match(route, /error=callback/);
  assert.doesNotMatch(route, /error\.message|encodeURIComponent\s*\(\s*error/);
});

test("signout is POST-only, signs out when configured, and validates next", () => {
  const route = readFileSync("app/auth/signout/route.ts", "utf8");

  assert.match(route, /export\s+async\s+function\s+POST\s*\(/);
  assert.doesNotMatch(route, /export\s+(?:async\s+)?function\s+GET\s*\(/);
  assert.match(route, /auth\.signOut\s*\(/);
  assert.match(route, /safeReturnPath\s*\(/);
});
