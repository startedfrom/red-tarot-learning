import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { handleAuthCallback } from "../app/lib/auth-callback";
import { handleAuthSignout } from "../app/lib/auth-signout";
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
  assert.equal(
    safeReturnPath(
      "/카드/별?q=https%3A%2F%2Fevil.example%2F..%2Fauth%2Fcallback#정방향",
    ),
    "/%EC%B9%B4%EB%93%9C/%EB%B3%84?q=https%3A%2F%2Fevil.example%2F..%2Fauth%2Fcallback#%EC%A0%95%EB%B0%A9%ED%96%A5",
  );
});

test("rejects protocol URLs, slash tricks, backslashes, and encoded controls", () => {
  const rejectedPaths = [
    "https://evil.example/me",
    "javascript:alert(1)",
    "//evil.example/me",
    "/https://evil.example/me",
    "/http:/evil.example/me",
    "\\\\evil.example\\me",
    "/\\evil.example/me",
    "/%5cevil.example/me",
    "/./me",
    "/foo/../me",
    "/foo/%2e%2e/me",
    "/foo/%252e%252e/auth/callback",
    "/%2561uth/callback",
    "/%25252561uth/callback",
    "/%2568ttps%253a%252f%252fevil.example/me",
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

  for (const code of [
    "config",
    "missing_code",
    "callback",
    "csrf",
    "signout",
  ] as const) {
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

test("callback route delegates to the shared handler", () => {
  const route = readFileSync("app/auth/callback/route.ts", "utf8");

  assert.match(route, /export\s+async\s+function\s+GET\s*\(/);
  assert.match(route, /handleAuthCallback\s*\(/);
  assert.match(route, /createServerSupabaseClient/);
  assert.doesNotMatch(route, /exchangeCodeForSession/);
});

test("callback reports missing configuration without exchanging a code", async () => {
  const response = await handleAuthCallback(
    new Request("https://red-tarot.example/auth/callback?code=oauth-code"),
    async () => null,
  );

  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get("location"),
    "https://red-tarot.example/login?error=config",
  );
});

test("callback reports a missing code before attempting an exchange", async () => {
  let exchangeCalls = 0;
  const response = await handleAuthCallback(
    new Request("https://red-tarot.example/auth/callback?next=/cards"),
    async () => ({
      auth: {
        async exchangeCodeForSession() {
          exchangeCalls += 1;
          return { error: null };
        },
      },
    }),
  );

  assert.equal(exchangeCalls, 0);
  assert.equal(
    response.headers.get("location"),
    "https://red-tarot.example/login?error=missing_code",
  );
});

test("callback maps a returned provider error to its stable code", async () => {
  const rawProviderError = "invalid_grant: do not expose this";
  const response = await handleAuthCallback(
    new Request("https://red-tarot.example/auth/callback?code=oauth-code"),
    async () => ({
      auth: {
        async exchangeCodeForSession() {
          return { error: new Error(rawProviderError) };
        },
      },
    }),
  );
  const location = response.headers.get("location");

  assert.equal(location, "https://red-tarot.example/login?error=callback");
  assert.doesNotMatch(location ?? "", /invalid_grant|do%20not%20expose/i);
});

test("callback maps a thrown provider error to its stable code", async () => {
  const rawProviderError = "provider_transport_secret";
  const response = await handleAuthCallback(
    new Request("https://red-tarot.example/auth/callback?code=oauth-code"),
    async () => ({
      auth: {
        async exchangeCodeForSession() {
          throw new Error(rawProviderError);
        },
      },
    }),
  );
  const location = response.headers.get("location");

  assert.equal(location, "https://red-tarot.example/login?error=callback");
  assert.doesNotMatch(location ?? "", /provider_transport_secret/i);
});

test("callback redirects a successful exchange to the safe next path", async () => {
  let exchangedCode: string | null = null;
  const response = await handleAuthCallback(
    new Request(
      "https://red-tarot.example/auth/callback?code=oauth-code&next=%2Fcards%2Fthe-star%3Ftab%3Dlove%23meaning",
    ),
    async () => ({
      auth: {
        async exchangeCodeForSession(code: string) {
          exchangedCode = code;
          return { error: null };
        },
      },
    }),
  );

  assert.equal(exchangedCode, "oauth-code");
  assert.equal(
    response.headers.get("location"),
    "https://red-tarot.example/cards/the-star?tab=love#meaning",
  );
});

test("callback never redirects a successful exchange to an external-like path", async () => {
  const response = await handleAuthCallback(
    new Request(
      "https://red-tarot.example/auth/callback?code=oauth-code&next=%2Fhttps%3A%2F%2Fevil.example",
    ),
    async () => ({
      auth: {
        async exchangeCodeForSession() {
          return { error: null };
        },
      },
    }),
  );

  assert.equal(response.headers.get("location"), "https://red-tarot.example/me");
});

test("signout route is POST-only and delegates to the shared handler", () => {
  const route = readFileSync("app/auth/signout/route.ts", "utf8");

  assert.match(route, /export\s+async\s+function\s+POST\s*\(/);
  assert.doesNotMatch(route, /export\s+(?:async\s+)?function\s+GET\s*\(/);
  assert.match(route, /handleAuthSignout\s*\(/);
  assert.match(route, /createServerSupabaseClient/);
  assert.doesNotMatch(route, /auth\.signOut\s*\(/);
});

test("signout accepts a matching Origin and uses local scope", async () => {
  let receivedOptions: unknown = null;
  const response = await handleAuthSignout(
    new Request(
      "https://red-tarot.example/auth/signout?next=%2Fcards%2Fthe-star%3Ftab%3Dlove",
      {
        method: "POST",
        headers: { Origin: "https://red-tarot.example" },
      },
    ),
    async () => ({
      auth: {
        async signOut(options: unknown) {
          receivedOptions = options;
          return { error: null };
        },
      },
    }),
  );

  assert.deepEqual(receivedOptions, { scope: "local" });
  assert.equal(response.status, 303);
  assert.equal(
    response.headers.get("location"),
    "https://red-tarot.example/cards/the-star?tab=love",
  );
});

test("signout permits an absent Origin for same-site form and server submissions", async () => {
  let signOutCalls = 0;
  const response = await handleAuthSignout(
    new Request("https://red-tarot.example/auth/signout?next=/cards", {
      method: "POST",
    }),
    async () => ({
      auth: {
        async signOut() {
          signOutCalls += 1;
          return { error: null };
        },
      },
    }),
  );

  assert.equal(signOutCalls, 1);
  assert.equal(
    response.headers.get("location"),
    "https://red-tarot.example/cards",
  );
});

test("signout rejects a mismatched Origin before creating a client", async () => {
  let clientFactoryCalls = 0;
  const response = await handleAuthSignout(
    new Request("https://red-tarot.example/auth/signout?next=/cards", {
      method: "POST",
      headers: { Origin: "https://evil.example" },
    }),
    async () => {
      clientFactoryCalls += 1;
      return null;
    },
  );

  assert.equal(clientFactoryCalls, 0);
  assert.equal(
    response.headers.get("location"),
    "https://red-tarot.example/login?error=csrf",
  );
});

test("signout safely redirects when optional Supabase config is absent", async () => {
  const response = await handleAuthSignout(
    new Request("https://red-tarot.example/auth/signout?next=//evil.example", {
      method: "POST",
    }),
    async () => null,
  );

  assert.equal(response.headers.get("location"), "https://red-tarot.example/me");
});

test("signout maps a returned error to a stable user-safe code", async () => {
  const response = await handleAuthSignout(
    new Request("https://red-tarot.example/auth/signout", { method: "POST" }),
    async () => ({
      auth: {
        async signOut() {
          return { error: new Error("provider returned a secret error") };
        },
      },
    }),
  );
  const location = response.headers.get("location");

  assert.equal(location, "https://red-tarot.example/login?error=signout");
  assert.doesNotMatch(location ?? "", /provider|secret/i);
});

test("signout maps a thrown error to a stable user-safe code", async () => {
  const response = await handleAuthSignout(
    new Request("https://red-tarot.example/auth/signout", { method: "POST" }),
    async () => ({
      auth: {
        async signOut() {
          throw new Error("transport_secret");
        },
      },
    }),
  );
  const location = response.headers.get("location");

  assert.equal(location, "https://red-tarot.example/login?error=signout");
  assert.doesNotMatch(location ?? "", /transport_secret/i);
});
