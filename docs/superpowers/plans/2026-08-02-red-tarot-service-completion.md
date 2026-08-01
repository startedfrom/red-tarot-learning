# 빨강타로 서비스 완성 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공개 콘텐츠 기반에 14일 코스, Supabase 인증·동기화, 광고 동의·AdSense 준비, 운영 배포 설정을 더해 실제 서비스 형태를 완성한다.

**Architecture:** 공개 콘텐츠는 정적 데이터와 서버 렌더링을 유지하고 인증·광고 실패와 분리한다. 사용자 진도는 버전 2 로컬 스냅샷을 항상 기준 캐시로 사용하며, Supabase 세션이 있을 때 RLS가 적용된 사용자별 행과 합집합·최신시각 규칙으로 동기화한다. 광고와 분석은 명시적 동의, 환경 설정, 사이트 승인 플래그가 모두 참일 때만 로드한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Supabase Auth/Postgres/RLS, `@supabase/ssr`, Google AdSense/Consent Mode, Node test runner, vinext/Cloudflare-compatible build, Vercel production deploy.

---

## 파일 책임

- `app/lib/progress.ts`: 버전 2 로컬 진도 파싱·이전·수정.
- `app/lib/progress-merge.ts`: 로컬과 원격 스냅샷의 순수 병합 규칙.
- `app/lib/sync-queue.ts`: 오프라인 변경 큐의 중복 제거와 재시도 상태.
- `app/lib/supabase/config.ts`: 공개 Supabase 환경 설정 검증과 기능 플래그.
- `app/lib/supabase/client.ts`: 브라우저 Supabase 클라이언트 생성.
- `app/lib/supabase/server.ts`: 서버 쿠키 기반 Supabase 클라이언트 생성.
- `app/lib/supabase/progress.ts`: 사용자 행 조회·upsert와 스냅샷 변환.
- `app/auth/callback/route.ts`: OAuth/OTP 코드 교환과 안전한 내부 리디렉션.
- `app/auth/signout/route.ts`: 세션 종료와 내부 리디렉션.
- `app/login/page.tsx`, `app/components/AuthPanel.tsx`: Google·Kakao·이메일 OTP 로그인 UX.
- `app/components/AuthStatus.tsx`: 전역 로그인 상태와 진입/로그아웃 링크.
- `app/components/ProgressProvider.tsx`: 로컬 캐시, 세션, 원격 병합, 재시도 통합.
- `app/data/course.ts`: 14일 커리큘럼과 기존 학습 세트 매핑.
- `app/course/**`, `app/review/page.tsx`: 코스·복습 화면.
- `app/lib/consent.ts`: 동의 상태 파싱과 Google consent-mode 값.
- `app/components/ConsentManager.tsx`: 동의 허용·거부·철회 UI.
- `app/components/AdSlot.tsx`, `app/components/AdScripts.tsx`: 승인된 명시적 광고 슬롯.
- `app/ads.txt/route.ts`: 게시자 ID가 있을 때만 올바른 `ads.txt` 응답.
- `supabase/migrations/*.sql`: 사용자 데이터 테이블, 제약, RLS 정책.
- `.env.example`: 브라우저에 공개 가능한 설정 이름과 운영 플래그.

### Task 1: 버전 2 진도와 결정적 병합 규칙

**Files:**
- Modify: `app/lib/progress.ts`
- Create: `app/lib/progress-merge.ts`
- Create: `app/lib/sync-queue.ts`
- Modify: `tests/progress.test.ts`
- Create: `tests/progress-merge.test.ts`

- [ ] **Step 1: 실패하는 마이그레이션·병합 테스트 작성**

```ts
test("migrates v1 progress without losing favorites or lessons", () => {
  const migrated = parseProgress(JSON.stringify({
    favoriteCardIds: ["the-lovers"], completedLessonIds: ["love-three-001"],
    wrongLessonIds: ["love-three-002"], lastLessonId: "love-three-001",
    streak: 2, lastStudyDate: "2026-08-02",
  }));
  assert.equal(migrated.version, 2);
  assert.deepEqual(migrated.favoriteCardIds, ["the-lovers"]);
  assert.deepEqual(migrated.studyDays, ["2026-08-02"]);
});

test("merges set fields and keeps the newest quiz and last lesson", () => {
  const merged = mergeProgress(localProgress, remoteProgress);
  assert.deepEqual(merged.favoriteCardIds.sort(), ["the-lovers", "the-star"]);
  assert.equal(merged.quizAttempts["love-three-001"].correct, true);
  assert.equal(merged.lastLessonId, "love-three-002");
});
```

- [ ] **Step 2: RED 확인**

Run: `npx tsx --test tests/progress.test.ts tests/progress-merge.test.ts`

Expected: `version`, `studyDays`, `mergeProgress`가 없어서 실패.

- [ ] **Step 3: 최소 구현**

`LearningProgress`에 `version: 2`, `quizAttempts: Record<string, { correct: boolean; answeredAt: string }>`, `studyDays: string[]`, `lastLessonChangedAt: string | null`, `updatedAt: string`을 추가한다. 기존 v1 값은 보존하고 `lastStudyDate`를 `studyDays`에 넣는다. `mergeProgress`는 완료·즐겨찾기·학습일 합집합, 퀴즈와 마지막 위치의 최신 시각 우선, 시각 없는 기존 오답의 보존 규칙을 적용한다. `SyncQueue` 항목은 안정적인 `eventId`, `kind`, `entityId`, `changedAt`을 가지며 동일 ID를 한 번만 보관한다.

- [ ] **Step 4: GREEN 확인**

Run: `npx tsx --test tests/progress.test.ts tests/progress-merge.test.ts`

Expected: 모든 테스트 통과.

- [ ] **Step 5: 커밋**

```bash
git add app/lib/progress.ts app/lib/progress-merge.ts app/lib/sync-queue.ts tests/progress.test.ts tests/progress-merge.test.ts
git commit -m "feat: add mergeable progress model"
```

### Task 2: Supabase 데이터베이스와 RLS 계약

**Files:**
- Create: `supabase/migrations/202608020001_user_progress.sql`
- Create: `app/lib/supabase/database.types.ts`
- Create: `tests/supabase-schema.test.ts`
- Modify: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: 실패하는 SQL 계약 테스트 작성**

```ts
test("migration enables RLS and scopes every policy to auth.uid", () => {
  const sql = readFileSync("supabase/migrations/202608020001_user_progress.sql", "utf8");
  for (const table of ["profiles", "lesson_completions", "quiz_attempts", "favorite_cards", "study_days", "user_state"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }
  assert.equal((sql.match(/auth\.uid\(\)/g) ?? []).length >= 12, true);
});
```

- [ ] **Step 2: RED 확인**

Run: `npx tsx --test tests/supabase-schema.test.ts`

Expected: migration 파일이 없어 실패.

- [ ] **Step 3: 스키마와 정책 구현**

UUID 기본키는 `auth.users(id)`를 참조한다. 사용자별 복합 유일키는 완료 `(user_id, lesson_id)`, 퀴즈 `(user_id, lesson_id)`, 즐겨찾기 `(user_id, card_id)`, 학습일 `(user_id, study_date)`로 둔다. 모든 테이블에 `select/insert/update/delete` 정책을 만들고 `using (auth.uid() = user_id)`와 `with check (auth.uid() = user_id)`를 적용한다. `profiles`는 신규 사용자 트리거로 생성한다.

- [ ] **Step 4: GREEN 확인**

Run: `npx tsx --test tests/supabase-schema.test.ts`

Expected: 정책·제약·트리거 계약 통과.

- [ ] **Step 5: 커밋**

```bash
git add supabase/migrations app/lib/supabase/database.types.ts tests/supabase-schema.test.ts .env.example .gitignore
git commit -m "feat: define secure Supabase progress schema"
```

### Task 3: 선택적 Supabase 클라이언트와 인증 경로

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `app/lib/supabase/config.ts`
- Create: `app/lib/supabase/client.ts`
- Create: `app/lib/supabase/server.ts`
- Create: `app/lib/auth-return.ts`
- Create: `app/auth/callback/route.ts`
- Create: `app/auth/signout/route.ts`
- Create: `tests/auth.test.ts`

- [ ] **Step 1: 실패하는 설정·반환경로 테스트 작성**

```ts
test("auth is disabled unless URL and anon key both exist", () => {
  assert.equal(readSupabaseConfig({}), null);
  assert.equal(readSupabaseConfig({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co" }), null);
});

test("allows only same-origin relative return paths", () => {
  assert.equal(safeReturnPath("/me?tab=cards"), "/me?tab=cards");
  assert.equal(safeReturnPath("//evil.example"), "/me");
  assert.equal(safeReturnPath("https://evil.example"), "/me");
});
```

- [ ] **Step 2: RED 확인**

Run: `npx tsx --test tests/auth.test.ts`

Expected: 설정과 경로 함수가 없어 실패.

- [ ] **Step 3: 의존성과 클라이언트 구현**

Run: `npm install @supabase/supabase-js @supabase/ssr`

브라우저와 서버 클라이언트는 설정이 없으면 예외 대신 `null`을 반환한다. 콜백은 `code`를 세션으로 교환하고 성공 시 검증한 `next`로, 실패 시 `/login?error=callback`으로 보낸다. 로그아웃은 쿠키 세션을 종료한 뒤 검증된 내부 경로로 보낸다.

- [ ] **Step 4: GREEN 확인**

Run: `npx tsx --test tests/auth.test.ts`

Expected: 모든 경로·설정 분기 통과.

- [ ] **Step 5: 커밋**

```bash
git add package.json package-lock.json app/lib/supabase app/lib/auth-return.ts app/auth tests/auth.test.ts
git commit -m "feat: add optional Supabase auth foundation"
```

### Task 4: Google·Kakao·이메일 OTP 로그인 UX

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/components/AuthPanel.tsx`
- Create: `app/components/AuthStatus.tsx`
- Modify: `app/components/AppShell.tsx`
- Modify: `app/me/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: 실패하는 로그인 렌더링 테스트 작성**

```js
test("renders all agreed login methods and recovery copy", async () => {
  const html = await (await render("/login")).text();
  assert.match(html, /Google로 계속하기/);
  assert.match(html, /Kakao로 계속하기/);
  assert.match(html, /이메일로 코드 받기/);
  assert.match(html, /로그인하지 않아도 계속 학습/);
});
```

- [ ] **Step 2: RED 확인**

Run: `npm run build:sites && node --test tests/rendered-html.test.mjs`

Expected: `/login`이 404여서 실패.

- [ ] **Step 3: 로그인 UI 구현**

OAuth 버튼은 `signInWithOAuth({ provider: "google" | "kakao", options: { redirectTo } })`를 호출한다. 이메일 폼은 형식 검증 후 `signInWithOtp({ email, options: { emailRedirectTo } })`를 호출하고 전송·성공·실패 상태를 `role="status"`로 알린다. 설정이 없으면 로그인 버튼을 비활성화하지 않고 “운영 연결 준비 중”과 비로그인 이용 경로를 보여준다. 헤더는 세션이 있으면 표시 이름과 로그아웃, 없으면 로그인을 보여준다.

- [ ] **Step 4: GREEN 확인**

Run: `npm run build:sites && node --test tests/rendered-html.test.mjs`

Expected: 로그인 페이지와 비로그인 복구 경로 통과.

- [ ] **Step 5: 커밋**

```bash
git add app/login app/components/AuthPanel.tsx app/components/AuthStatus.tsx app/components/AppShell.tsx app/me/page.tsx app/globals.css tests/rendered-html.test.mjs
git commit -m "feat: add Google Kakao and email login UX"
```

### Task 5: 원격 진도 저장, 첫 로그인 병합, 오프라인 재시도

**Files:**
- Create: `app/lib/supabase/progress.ts`
- Create: `app/components/ProgressProvider.tsx`
- Create: `app/hooks/use-progress.ts`
- Modify: `app/layout.tsx`
- Modify: `app/components/FavoriteButton.tsx`
- Modify: `app/components/PracticeLesson.tsx`
- Modify: `app/components/HomeDashboard.tsx`
- Create: `tests/progress-sync.test.ts`

- [ ] **Step 1: 실패하는 어댑터 테스트 작성**

```ts
test("confirmed remote save keeps local data and clears only delivered events", async () => {
  const result = await syncProgress({ local, remote, queue, save: successfulSave });
  assert.deepEqual(result.progress.favoriteCardIds.sort(), ["the-lovers", "the-star"]);
  assert.deepEqual(result.queue, []);
});

test("failed remote save preserves local progress and queue", async () => {
  const result = await syncProgress({ local, remote: null, queue, save: failingSave });
  assert.deepEqual(result.progress, local);
  assert.deepEqual(result.queue, queue);
});
```

- [ ] **Step 2: RED 확인**

Run: `npx tsx --test tests/progress-sync.test.ts`

Expected: 원격 어댑터와 동기화 함수가 없어 실패.

- [ ] **Step 3: 동기화 구현**

조회는 여섯 테이블을 스냅샷으로 변환한다. 저장은 유일키 기반 upsert와 삭제 차집합을 사용해 멱등성을 지킨다. `ProgressProvider`는 로컬을 먼저 표시하고 세션 확인 뒤 원격을 병합하며, 저장 확인 전 로컬 값을 지우지 않는다. `online`, 탭 재활성화, 로그인 완료 시 큐를 재시도한다. 기존 즐겨찾기·학습 컴포넌트는 context API만 사용한다.

- [ ] **Step 4: GREEN 확인**

Run: `npx tsx --test tests/progress-sync.test.ts tests/progress.test.ts tests/progress-merge.test.ts`

Expected: 성공·실패·중복 이벤트 분기 통과.

- [ ] **Step 5: 커밋**

```bash
git add app/lib/supabase/progress.ts app/components/ProgressProvider.tsx app/hooks/use-progress.ts app/layout.tsx app/components/FavoriteButton.tsx app/components/PracticeLesson.tsx app/components/HomeDashboard.tsx tests/progress-sync.test.ts
git commit -m "feat: sync learning progress across sessions"
```

### Task 6: 14일 코스와 복습 화면

**Files:**
- Create: `app/data/course.ts`
- Create: `app/course/page.tsx`
- Create: `app/course/day/[day]/page.tsx`
- Create: `app/components/CourseProgress.tsx`
- Create: `app/review/page.tsx`
- Modify: `app/components/AppShell.tsx`
- Modify: `app/sitemap.ts`
- Modify: `tests/content.test.ts`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: 실패하는 커리큘럼·렌더링 테스트 작성**

```ts
test("course has fourteen ordered days with valid lessons", () => {
  assert.equal(courseDays.length, 14);
  assert.deepEqual(courseDays.map((day) => day.day), Array.from({ length: 14 }, (_, index) => index + 1));
  for (const day of courseDays) assert.ok(getLearningSet(day.lessonId));
});
```

렌더링 테스트는 `/course`, `/course/day/1`, `/review`의 제목, 순서, `noindex`를 확인한다.

- [ ] **Step 2: RED 확인**

Run: `npx tsx --test tests/content.test.ts && npm run build:sites && node --test tests/rendered-html.test.mjs`

Expected: 코스 데이터와 경로가 없어 실패.

- [ ] **Step 3: 코스 구현**

설계의 14개 주제를 순서대로 정의하고 각 날짜를 기존 학습 세트에 연결한다. 코스 소개는 index 가능, 날짜별 화면과 복습은 noindex로 둔다. 복습은 `wrongLessonIds`를 최신순으로 보여주고 해당 연습으로 복귀시킨다. 완료율과 다음 날짜는 `ProgressProvider`의 완료 ID로 계산한다.

- [ ] **Step 4: GREEN 확인**

Run: `npx tsx --test tests/content.test.ts && npm run build:sites && node --test tests/rendered-html.test.mjs`

Expected: 14일 데이터·경로·검색 정책 통과.

- [ ] **Step 5: 커밋**

```bash
git add app/data/course.ts app/course app/components/CourseProgress.tsx app/review app/components/AppShell.tsx app/sitemap.ts tests/content.test.ts tests/rendered-html.test.mjs
git commit -m "feat: add fourteen day beginner course"
```

### Task 7: 기초 가이드 12개 완성

**Files:**
- Modify: `app/data/guides.ts`
- Modify: `tests/content.test.ts`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: 실패하는 콘텐츠 품질 테스트 작성**

```ts
test("publishes twelve distinct beginner guides", () => {
  assert.equal(guides.length, 12);
  assert.equal(new Set(guides.map((guide) => guide.slug)).size, 12);
  for (const guide of guides) {
    assert.ok(guide.sections.length >= 3);
    assert.ok(guide.relatedCardIds.length >= 3);
  }
});
```

- [ ] **Step 2: RED 확인**

Run: `npx tsx --test tests/content.test.ts`

Expected: 현재 3개라 실패.

- [ ] **Step 3: 아홉 개 가이드 추가**

추가 주제는 `major-arcana-basics`, `four-suits`, `number-patterns`, `court-cards`, `one-card-reading`, `two-card-connection`, `spread-positions`, `reading-evidence`, `ethical-tarot-reading`으로 고정한다. 각 가이드는 고유 설명, 최소 세 섹션, 실제 관련 카드 세 장, 단정 회피와 분야별 안전 문구를 포함한다.

- [ ] **Step 4: GREEN 확인**

Run: `npx tsx --test tests/content.test.ts && npm run build:sites && node --test tests/rendered-html.test.mjs`

Expected: 12개 가이드와 모든 정적 경로 렌더링 통과.

- [ ] **Step 5: 커밋**

```bash
git add app/data/guides.ts tests/content.test.ts tests/rendered-html.test.mjs
git commit -m "feat: complete beginner guide library"
```

### Task 8: 동의 관리, AdSense 슬롯, GA4, ads.txt

**Files:**
- Create: `app/lib/consent.ts`
- Create: `app/components/ConsentManager.tsx`
- Create: `app/components/AdScripts.tsx`
- Create: `app/components/AdSlot.tsx`
- Create: `app/components/AnalyticsScripts.tsx`
- Create: `app/ads.txt/route.ts`
- Modify: `app/layout.tsx`
- Modify: `app/components/PublicHome.tsx`
- Modify: `app/components/CardDetail.tsx`
- Modify: `app/components/GuideArticle.tsx`
- Modify: `app/components/ReadingArticle.tsx`
- Modify: `app/components/PracticeLesson.tsx`
- Modify: `app/(info)/privacy/page.tsx`
- Modify: `app/globals.css`
- Create: `tests/consent.test.ts`
- Modify: `tests/rendered-html.test.mjs`

- [ ] **Step 1: 실패하는 활성화 매트릭스 테스트 작성**

```ts
test("ads require consent, publisher id, slot id, and approval", () => {
  assert.equal(canShowAds({ consent: "granted", publisherId: "ca-pub-123", slotId: "456", approved: true }), true);
  assert.equal(canShowAds({ consent: "denied", publisherId: "ca-pub-123", slotId: "456", approved: true }), false);
  assert.equal(canShowAds({ consent: "granted", publisherId: "ca-pub-123", slotId: "456", approved: false }), false);
});
```

- [ ] **Step 2: RED 확인**

Run: `npx tsx --test tests/consent.test.ts`

Expected: 동의와 광고 함수가 없어 실패.

- [ ] **Step 3: 동의·광고·분석 구현**

동의는 `essential | denied | granted` 세 상태와 버전을 로컬에 저장한다. 기본값은 필수 기능만 허용한다. AdSense 스크립트는 게시자 ID, 승인 플래그, 동의가 모두 있을 때 한 번만 로드한다. 슬롯은 홈 인기 카드 뒤, 카드 정·역방향 뒤, 가이드·조합 핵심 답 뒤, 연습 완료 화면에만 둔다. GA4도 측정 ID와 분석 동의가 있을 때만 로드한다. `ads.txt`는 게시자 ID가 `ca-pub-`와 16자리 숫자로 구성될 때 `google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0` 형식으로만 응답하고 미설정 시 404를 반환한다.

- [ ] **Step 4: GREEN 확인**

Run: `npx tsx --test tests/consent.test.ts && npm run build:sites && node --test tests/rendered-html.test.mjs`

Expected: 미설정 빌드에서 광고·분석 스크립트가 없고 공개 콘텐츠는 정상 렌더링.

- [ ] **Step 5: 커밋**

```bash
git add app/lib/consent.ts app/components/ConsentManager.tsx app/components/AdScripts.tsx app/components/AdSlot.tsx app/components/AnalyticsScripts.tsx app/ads.txt app/layout.tsx app/components/PublicHome.tsx app/components/CardDetail.tsx app/components/GuideArticle.tsx app/components/ReadingArticle.tsx app/components/PracticeLesson.tsx 'app/(info)/privacy/page.tsx' app/globals.css tests/consent.test.ts tests/rendered-html.test.mjs
git commit -m "feat: add consent gated ads and analytics"
```

### Task 9: 운영 설정, 보안 헤더, 배포 문서

**Files:**
- Modify: `next.config.ts`
- Modify: `vercel.json`
- Modify: `README.md`
- Create: `CLAUDE.md`
- Create: `.github/workflows/ci.yml`
- Create: `tests/deployment-config.test.ts`

- [ ] **Step 1: 실패하는 운영 계약 테스트 작성**

```ts
test("documents every required production environment variable", () => {
  const env = readFileSync(".env.example", "utf8");
  for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_ADSENSE_PUBLISHER_ID", "NEXT_PUBLIC_ADSENSE_APPROVED", "NEXT_PUBLIC_GA_MEASUREMENT_ID", "NEXT_PUBLIC_SITE_URL"]) {
    assert.match(env, new RegExp(`^${name}=`, "m"));
  }
});
```

- [ ] **Step 2: RED 확인**

Run: `npx tsx --test tests/deployment-config.test.ts`

Expected: 아직 모든 운영 설정이 없어 실패.

- [ ] **Step 3: 배포 설정 구현**

보안 헤더는 콘텐츠 타입 스니핑 차단, referrer 제한, 프레임 차단, 권한 정책을 설정한다. CI는 Node 24에서 `npm ci`, `npm run lint`, `npm test`를 실행한다. README는 Supabase migration 적용, Google/Kakao redirect URL, 이메일 OTP, Vercel 환경 변수, AdSense 승인 후 활성화 순서를 실제 명령과 URL 패턴으로 설명한다. `CLAUDE.md`에는 Vercel 자동 배포, 프로덕션 URL 확인 방법, pre-merge `npm test && npm run lint`를 기록한다.

- [ ] **Step 4: GREEN 확인**

Run: `npx tsx --test tests/deployment-config.test.ts && npm run lint && npm test`

Expected: 운영 계약, 린트, 전체 테스트 통과.

- [ ] **Step 5: 커밋**

```bash
git add next.config.ts vercel.json README.md CLAUDE.md .github/workflows/ci.yml tests/deployment-config.test.ts .env.example
git commit -m "chore: prepare secure production deployment"
```

### Task 10: 전체 브라우저 QA와 출시

**Files:**
- Modify only files required by defects reproduced during QA.

- [ ] **Step 1: 전체 자동 검증**

Run: `npm run lint && npm test && git diff --check`

Expected: exit 0, 실패 0.

- [ ] **Step 2: 브라우저 QA**

360×800, 768×1024, 1440×1000에서 `/`, `/login`, `/me`, `/course`, `/course/day/1`, `/review`, 카드·조합·가이드·연습·정책·404를 확인한다. 키보드만으로 로그인 폼, 동의 선택, 검색, 즐겨찾기, 연습 완료가 가능해야 한다. 브라우저 콘솔 오류와 가로 넘침이 없어야 한다.

- [ ] **Step 3: 외부 서비스 연결**

사용자 소유 Supabase 프로젝트가 제공되면 migration을 적용하고 Site URL 및 Google/Kakao redirect URL을 프로덕션 도메인으로 설정한다. Vercel 프로젝트에 `.env.example`의 실제 값을 등록한다. AdSense는 게시자 ID와 사이트 승인이 확인되기 전 `NEXT_PUBLIC_ADSENSE_APPROVED=false`로 유지한다.

- [ ] **Step 4: 브랜치와 PR 갱신**

```bash
git push origin codex/content-seo-foundation
gh pr edit 1 --repo startedfrom/red-tarot-learning --body '## Summary

- complete the 14-day course and review flow
- add Supabase Google, Kakao, and email OTP authentication with cross-device progress sync
- add consent-gated AdSense and GA4 foundations plus production deployment safeguards

## Validation

- npm test
- npm run lint
- git diff --check'
```

PR 본문에는 구현 범위, 데이터·광고 안전장치, 자동 검증 수치, 외부 계정에서 남은 운영 설정을 기록한다.

- [ ] **Step 5: 프로덕션 배포 검증**

Vercel 배포 URL의 `/`, `/login`, `/course`, `/ads.txt`, `/robots.txt`, `/sitemap.xml` 상태를 확인한다. 광고 미승인 상태에서 광고 DOM과 Google 스크립트가 없어야 하고 공개 콘텐츠는 200이어야 한다.
