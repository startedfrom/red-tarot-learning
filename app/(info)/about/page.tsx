import type { Metadata } from "next";
import { InfoPage } from "../../components/InfoPage";
export const metadata: Metadata = { title: "빨강타로 소개", alternates: { canonical: "/about" } };
export default function AboutPage() { return <InfoPage title="빨강타로 소개" lead="빨강타로는 완성된 점괘를 소비하는 대신 카드와 배열의 근거를 연결해 스스로 읽는 법을 배우는 무료 웹 서비스입니다." sections={[{ heading: "서비스가 돕는 일", paragraphs: ["78장 카드의 핵심 동사, 정·역방향, 분야별 의미와 실제 조합 예제를 제공합니다. 초보자가 단어를 외우는 데서 멈추지 않고 자기 문장으로 해석하도록 돕습니다."] }, { heading: "운영 원칙", paragraphs: ["미래를 확정하거나 의료·법률·재무 판단을 대신하지 않습니다. 모든 해석은 현재 상황을 살피고 선택지를 정리하는 학습 자료로 제공합니다."] }]} />; }
