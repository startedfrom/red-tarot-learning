import type { Metadata } from "next";
import { InfoPage } from "../../components/InfoPage";
export const metadata: Metadata = { title: "문의하기", alternates: { canonical: "/contact" } };
export default function ContactPage() { return <InfoPage title="문의하기" lead="카드 설명의 오류, 접근성 문제, 개인정보 관련 요청을 확인합니다." sections={[{ heading: "문의에 포함할 내용", paragraphs: ["문제가 발생한 페이지 주소, 사용한 기기와 브라우저, 기대한 동작과 실제 동작을 함께 적으면 더 빠르게 확인할 수 있습니다."] }, { heading: "현재 문의 경로", paragraphs: ["공개 베타 운영 전에는 이 프로젝트를 공유한 작업 공간의 소유자에게 문의합니다. 운영 도메인과 공식 이메일이 확정되면 이 페이지의 연락처를 실제 정보로 교체한 뒤 출시합니다."] }]} />; }
