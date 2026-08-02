import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("documents every required production environment variable", () => {
  const env = read(".env.example");
  for (const name of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_ADSENSE_PUBLISHER_ID",
    "NEXT_PUBLIC_ADSENSE_APPROVED",
    "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    "NEXT_PUBLIC_CONSENT_VERSION",
  ]) {
    assert.match(env, new RegExp(`^${name}=`, "m"));
  }
});

test("sets baseline response security headers", () => {
  const config = read("next.config.ts");
  for (const value of [
    "X-Content-Type-Options",
    "nosniff",
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
    "X-Frame-Options",
    "DENY",
    "Permissions-Policy",
  ]) {
    assert.match(config, new RegExp(value));
  }
});

test("long pages release the desktop root and main scrolling locks", () => {
  const styles = read("app/globals.css");

  assert.match(
    styles,
    /html:has\(\.public-home\),[\s\S]*?\{[\s\S]*?height:\s*auto;[\s\S]*?overflow-y:\s*auto;/,
  );

  for (const pageClass of [
    "public-home",
    "auth-panel",
    "course-hero",
    "course-day-page",
    "review-page",
  ]) {
    assert.match(styles, new RegExp(`html:has\\(\\.${pageClass}\\)`));
    assert.match(styles, new RegExp(`\\.app-shell:has\\(\\.${pageClass}\\)`));
    assert.match(
      styles,
      new RegExp(`\\.app-shell:has\\(\\.${pageClass}\\) #main-content`),
    );
  }
});

test("CI installs from the lockfile and runs all release checks on Node 24", () => {
  const workflow = read(".github/workflows/ci.yml");
  assert.match(workflow, /node-version:\s*["']?24/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run lint/);
  assert.match(workflow, /npm test/);
});

test("deployment runbook covers Supabase OAuth email and AdSense approval", () => {
  const readme = read("README.md");
  assert.match(readme, /supabase db push/i);
  assert.match(readme, /Google/i);
  assert.match(readme, /Kakao/i);
  assert.match(readme, /auth\/callback/);
  assert.match(readme, /NEXT_PUBLIC_ADSENSE_APPROVED=false/);
  assert.match(readme, /Vercel/i);

  const agentGuide = read("CLAUDE.md");
  assert.match(agentGuide, /npm test && npm run lint/);
  assert.match(agentGuide, /Vercel/i);
});

test("Vercel uses the production Next.js build", () => {
  const vercel = JSON.parse(read("vercel.json")) as {
    framework?: string;
    buildCommand?: string;
  };
  assert.equal(vercel.framework, "nextjs");
  assert.equal(vercel.buildCommand, "npm run build");
});
