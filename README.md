# 빨강타로

초보자가 카드를 외우기보다 근거로 읽도록 돕는 무료 타로 학습 서비스입니다. 78장 카드 사전, 검수된 조합 예제, 12개 입문 가이드, 14일 코스를 제공합니다. 비로그인 상태에서는 기기에 진도를 저장하고, Google·Kakao·이메일 OTP로 로그인하면 Supabase와 동기화합니다.

## 로컬 실행

필요 버전은 Node.js 24입니다.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

외부 계정 설정을 비워둔 상태에서도 공개 콘텐츠, 학습, 로컬 저장은 정상 작동합니다. 이 상태에서 인증·광고·분석 스크립트는 불러오지 않습니다.

## 검증

```bash
npm run lint
npm test
```

`npm test`는 vinext 프로덕션 빌드, 데이터·보안 계약 테스트, 서버 렌더링 테스트를 함께 실행합니다. Vercel 배포 빌드는 `npm run build`를 사용합니다.

## Supabase 연결

1. Supabase 프로젝트를 만든 뒤 Project URL과 publishable/anon key를 확인합니다.
2. 로컬 CLI를 링크하고 RLS migration을 적용합니다.

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

3. Supabase Authentication → URL Configuration에 Site URL을 `https://YOUR_DOMAIN`으로 설정합니다.
4. Redirect URLs에 `http://localhost:3000/auth/callback` 및 `https://YOUR_DOMAIN/auth/callback` 패턴을 추가합니다.
5. Authentication → Providers에서 Email OTP, Google, Kakao를 활성화합니다.

Google OAuth의 인증된 리디렉션 URI와 Kakao Developers의 Redirect URI에는 Supabase가 Provider 화면에 보여주는 콜백 URL(`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`)을 등록합니다. 앱 내 최종 복귀 경로는 `/auth/callback`입니다. 이메일 OTP를 운영하려면 Supabase Email Templates와 발신자 SMTP를 운영 도메인에 맞게 설정합니다.

## Vercel 배포

GitHub 저장소를 Vercel에 연결하고 Framework Preset을 Next.js로 유지합니다. Preview와 Production에 다음 환경 변수를 등록합니다.

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저용 publishable/anon key |
| `NEXT_PUBLIC_SITE_URL` | 최종 HTTPS origin, 마지막 `/` 없음 |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | `ca-pub-` + 16자리 게시자 ID |
| `NEXT_PUBLIC_ADSENSE_APPROVED` | 심사 전 `false`, 승인 확인 후만 `true` |
| `NEXT_PUBLIC_ADSENSE_*_SLOT_ID` | 승인된 명시적 광고 슬롯 ID |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 선택 사항, `G-...` 형식 |
| `NEXT_PUBLIC_CONSENT_VERSION` | 동의 문안 변경 시 올릴 양의 정수 |

배포 후 Supabase Site URL·Redirect URL을 최종 Vercel 도메인으로 맞추고 `/`, `/login`, `/course`, `/robots.txt`, `/sitemap.xml`, `/ads.txt`를 확인합니다.

## AdSense와 GA4

AdSense 심사 전에는 반드시 `NEXT_PUBLIC_ADSENSE_APPROVED=false`로 유지합니다. 구매한 도메인, 정책 페이지, 충분한 공개 콘텐츠, `ads.txt`를 검증한 뒤 AdSense에서 사이트 심사를 요청합니다. 게시자 ID와 슬롯 ID를 등록해도 승인 플래그가 `false`면 광고 DOM과 Google 광고 스크립트는 생성되지 않습니다.

게시자 ID를 등록하면 승인 전에도 쿠키를 만들지 않는 `google-adsense-account` 소유권 확인 메타 태그와 `/ads.txt`가 자동으로 생성됩니다. 애드센스에서 사이트 상태가 `준비됨`으로 바뀐 뒤에만 승인 플래그를 `true`로 전환합니다. 자동 광고를 사용할 때는 게시자 ID와 승인 플래그만 필요하며, 본문에 고정 광고 단위를 함께 둘 때만 위치별 슬롯 ID를 등록합니다.

사이트 심사를 요청할 때는 애드센스의 **개인정보 보호 및 메시지**에서 Google CMP를 선택해 유럽 경제 지역·영국·스위스용 규정 메시지를 활성화합니다. 자체 동의창만으로는 해당 지역의 Google 인증 CMP 요구사항을 대신하지 않습니다.

GA4도 측정 ID와 사용자의 명시적 동의가 모두 있을 때만 로드됩니다. 현재 구현은 Google만으로 광고·분석을 제한하며, 지역별 Google CMP 요구사항은 실제 서비스 국가를 확정한 후 별도로 검토해야 합니다.

## 운영 안전 원칙

- `.env.local`과 실제 계정 ID를 저장소에 커밋하지 않습니다.
- 광고 승인 전 또는 동의 거부 상태에서는 콘텐츠만 표시합니다.
- 외부 OAuth 확인·RLS 상호 사용자 테스트·AdSense 승인은 실제 소유 계정에서 최종 검증합니다.
