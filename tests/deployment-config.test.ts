import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

function desktopAppStyles(styles: string) {
  const end = styles.indexOf("@media (prefers-reduced-motion: reduce)");
  const start = styles.lastIndexOf("@media (min-width: 640px)", end);
  return styles.slice(start, end);
}

function flowingDesktopStyles(styles: string) {
  return styles.slice(styles.lastIndexOf("@media (min-width: 640px)"));
}

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
    "practice-page",
  ]) {
    assert.match(styles, new RegExp(`html:has\\(\\.${pageClass}\\)`));
    assert.match(styles, new RegExp(`\\.app-shell:has\\(\\.${pageClass}\\)`));
    assert.match(
      styles,
      new RegExp(`\\.app-shell:has\\(\\.${pageClass}\\) #main-content`),
    );
  }
});

test("desktop practice board does not clip its ribbon", () => {
  const styles = desktopAppStyles(read("app/globals.css"));
  assert.match(styles, /\.spread-board\s*\{[\s\S]*?overflow:\s*visible;/);
});

test("desktop practice expands in the document flow instead of clipping stages", () => {
  const styles = flowingDesktopStyles(read("app/globals.css"));
  assert.match(
    styles,
    /\.practice-page\s*\{[\s\S]*?height:\s*auto;[\s\S]*?grid-template-rows:\s*auto 48px auto 42px;[\s\S]*?overflow:\s*visible;/,
  );
  assert.match(
    styles,
    /\.app-shell:has\(\.practice-page\) \.lesson-stage-card,[\s\S]*?overflow:\s*visible;/,
  );
});

test("single-card practice fits the desktop board at short heights", () => {
  const styles = desktopAppStyles(read("app/globals.css"));
  assert.match(
    styles,
    /\.spread-grid\.spread-1 \.tarot-visual\s*\{\s*width:\s*min\(160px, 17vh\);/,
  );
});

test("home search hero uses an open reading flow without ornamental circles", () => {
  const styles = read("app/globals.css");
  assert.match(
    styles,
    /\.search-hero\s*\{[\s\S]*?display:\s*grid;/,
  );
  assert.match(
    styles,
    /@media \(min-width: 860px\)[\s\S]*?\.search-hero\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) minmax\(300px, 0\.48fr\);/,
  );
  assert.match(styles, /\.search-hero-example\s*\{/);
  assert.match(styles, /\.search-hero-flow\s*\{/);
  assert.doesNotMatch(styles, /\.search-hero::after\s*\{/);
});

test("home sections use editorial rows instead of repeated rounded cards", () => {
  const styles = read("app/globals.css");
  assert.match(
    styles,
    /\.home-guide-list\s*>\s*a\s*\{[\s\S]*?grid-template-columns:[\s\S]*?border-bottom:\s*1px solid var\(--public-line\);/,
  );
  assert.match(
    styles,
    /\.home-action-list\s*>\s*a\s*\{[\s\S]*?border-top:\s*1px solid var\(--public-ink\);/,
  );
  assert.match(
    styles,
    /body:has\(\.public-home\)\s*\{[\s\S]*?background:\s*var\(--public-paper\);/,
  );
});

test("header learning link stays a plain navigation item instead of a pill", () => {
  const styles = read("app/globals.css");
  assert.match(
    styles,
    /\.header-login-link\s*\{[\s\S]*?border-radius:\s*0;[\s\S]*?background:\s*transparent;/,
  );
});

test("user-facing section labels avoid decorative English", () => {
  const files = [
    "app/components/AuthPanel.tsx",
    "app/components/CardDetail.tsx",
    "app/components/CardLibrary.tsx",
    "app/components/CourseProgress.tsx",
    "app/components/GuideArticle.tsx",
    "app/components/HomeDashboard.tsx",
    "app/components/InfoPage.tsx",
    "app/components/PracticeLesson.tsx",
    "app/components/ReadingArticle.tsx",
    "app/course/page.tsx",
    "app/course/day/[day]/page.tsx",
    "app/guides/page.tsx",
    "app/readings/page.tsx",
    "app/review/page.tsx",
  ];
  const source = files.map(read).join("\n");

  assert.doesNotMatch(
    source,
    /ALL 78 CARDS|MAJOR ARCANA|MINOR ARCANA|CURATED READINGS|BEGINNER GUIDE|CARD BOOK|START HERE|FREE BEGINNER COURSE|YOUR 14 DAYS|DAY \{?|LEARNING GARDEN|REVIEW POCKET|MY CARD BOOK|SAVE YOUR PROGRESS|LOCAL LEARNING|STEP \{?|QUICK QUIZ|CARDS/,
  );
  assert.doesNotMatch(read("app/components/TarotCardVisual.tsx"), /card\.nameEn/);
  assert.match(read("app/components/CardDetail.tsx"), /className="english-name"/);
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

test("root metadata supports cookie-free AdSense ownership verification", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /google-adsense-account/);
  assert.match(layout, /adsenseAccountMeta/);
});

test("Vercel uses the production Next.js build", () => {
  const vercel = JSON.parse(read("vercel.json")) as {
    framework?: string;
    buildCommand?: string;
  };
  assert.equal(vercel.framework, "nextjs");
  assert.equal(vercel.buildCommand, "npm run build");
});
