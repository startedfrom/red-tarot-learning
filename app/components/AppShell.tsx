import Link from "next/link";
import { BookOpen, Heart, Home, Sparkles } from "lucide-react";

type ActiveSection = "home" | "cards" | "practice" | "review";

const navItems = [
  { id: "home", label: "홈", href: "/", Icon: Home },
  { id: "cards", label: "카드", href: "/cards/the-fool", Icon: BookOpen },
  {
    id: "practice",
    label: "연습",
    href: "/practice/love-three-001",
    Icon: Sparkles,
  },
  { id: "review", label: "복습", href: "/#review", Icon: Heart },
] as const;

export function AppShell({
  children,
  active = "home",
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
            <Link href="/cards/the-fool">78장 카드책</Link>
            <Link href="/practice/love-three-001">150세트 연습</Link>
          </div>
          <span className="profile-dot" aria-label="내 학습 기록">
            나
          </span>
        </header>

        <main id="main-content">{children}</main>

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
