import Link from "next/link";
import { AppShell } from "./components/AppShell";

export default function NotFound() {
  return <AppShell><section className="empty-state"><span aria-hidden="true">?</span><h1>페이지를 찾지 못했어요</h1><p>주소가 바뀌었거나 공개되지 않은 내용이에요. 카드 사전에서 다시 찾아보세요.</p><div className="button-row"><Link className="primary-button" href="/cards">카드 검색하기</Link><Link className="secondary-button" href="/">홈으로</Link></div></section></AppShell>;
}
