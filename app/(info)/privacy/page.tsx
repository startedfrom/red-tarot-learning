import type { Metadata } from "next";
import { InfoPage } from "../../components/InfoPage";
export const metadata: Metadata = { title: "개인정보처리방침", alternates: { canonical: "/privacy" } };
export default function PrivacyPage() { return <InfoPage title="개인정보처리방침" lead="현재 공개 버전은 계정 정보를 수집하지 않으며 학습 기록을 사용자의 브라우저에 저장합니다." sections={[{ heading: "브라우저에 저장되는 정보", paragraphs: ["완료한 학습, 오답 학습, 즐겨찾기 카드, 마지막 학습 위치, 연속 학습일을 localStorage에 저장합니다. 이 정보는 현재 다른 기기와 공유되지 않습니다."] }, { heading: "서비스 운영 과정의 정보", paragraphs: ["호스팅 제공자는 보안과 안정적인 전송을 위해 일반적인 접속 로그를 처리할 수 있습니다. 빨강타로는 현재 광고나 별도 분석 쿠키를 활성화하지 않습니다."] }, { heading: "삭제 방법", paragraphs: ["브라우저의 사이트 데이터 또는 localStorage를 삭제하면 이 기기에 저장된 학습 기록이 삭제됩니다. 계정 동기화와 광고가 추가되기 전 이 방침을 실제 처리 구조에 맞춰 다시 고지합니다."] }]} />; }
