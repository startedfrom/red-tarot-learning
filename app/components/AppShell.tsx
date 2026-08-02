import Link from "next/link";
import { BookOpen, CalendarDays, Home, UserRound } from "lucide-react";
import { AuthStatus } from "./AuthStatus";

type ActiveSection = "home" | "cards" | "readings" | "practice" | "course" | "review" | "me";

const navItems = [
  { id: "home", label: "홈", href: "/", Icon: Home },
  { id: "cards", label: "카드", href: "/cards", Icon: BookOpen },
  { id: "course", label: "코스", href: "/course", Icon: CalendarDays },
  { id: "me", label: "내 학습", href: "/me", Icon: UserRound },
] as const;

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: ActiveSection;
}) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        본문으로 바로가기
      </a>
      <div className="app-shell">
        <header className="site-header">
          <Link className="brand" href="/" aria-label="빨강타로 홈">
            <span className="brand-mark" aria-hidden="true">
              ♥
            </span>
            <span>빨강타로</span>
          </Link>
          <div className="header-links" aria-label="빠른 메뉴">
            <Link href="/cards">카드 사전</Link>
            <Link href="/readings">조합 예제</Link>
            <Link href="/guides">기초 가이드</Link>
            <Link href="/course">14일 코스</Link>
          </div>
          <AuthStatus />
        </header>

        <main id="main-content">{children}</main>

        <footer className="site-footer">
          <nav aria-label="서비스 정보">
            <Link href="/about">소개</Link>
            <Link href="/editorial-policy">콘텐츠 기준</Link>
            <Link href="/privacy">개인정보</Link>
            <Link href="/terms">이용약관</Link>
            <Link href="/disclaimer">해석의 한계</Link>
            <Link href="/contact">문의</Link>
          </nav>
          <p>타로 설명은 학습과 자기성찰을 위한 참고 자료이며 의료·법률·재무 판단을 대신하지 않습니다.</p>
        </footer>

        <nav className="bottom-nav" aria-label="주요 메뉴">
          {navItems.map(({ id, label, href, Icon }) => (
            <Link
              key={id}
              href={href}
              aria-current={active === id ? "page" : undefined}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
