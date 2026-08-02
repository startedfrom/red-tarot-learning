import type { Metadata } from "next";
import { InfoPage } from "../../components/InfoPage";
export const metadata: Metadata = { title: "이용약관", alternates: { canonical: "/terms" } };
export default function TermsPage() { return <InfoPage title="이용약관" lead="빨강타로의 무료 학습 콘텐츠를 이용할 때 적용되는 기본 조건입니다." sections={[{ heading: "서비스 이용", paragraphs: ["사용자는 개인적인 학습 목적으로 서비스를 이용할 수 있습니다. 서비스의 콘텐츠나 구조를 무단으로 대량 수집하거나 재배포해서는 안 됩니다."] }, { heading: "서비스 변경", paragraphs: ["콘텐츠의 정확성과 안정성을 높이기 위해 기능과 설명을 수정할 수 있습니다. 중요한 개인정보 처리 변경은 적용 전에 정책 페이지에서 알립니다."] }, { heading: "책임의 범위", paragraphs: ["타로 설명은 교육과 자기성찰을 위한 참고 자료이며 사용자의 의료, 법률, 재무 또는 관계 결정 결과를 보장하지 않습니다."] }]} />; }
