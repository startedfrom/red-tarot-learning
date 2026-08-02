import type { Metadata } from "next";
import { InfoPage } from "../../components/InfoPage";
export const metadata: Metadata = { title: "타로 해석의 한계", alternates: { canonical: "/disclaimer" } };
export default function DisclaimerPage() { return <InfoPage title="타로 해석의 한계" lead="타로는 상황을 다른 관점에서 살피는 학습 도구이며 사실 확인, 진단, 예측 보장 수단이 아닙니다." sections={[{ heading: "건강", paragraphs: ["카드 내용은 질병이나 임신을 진단하지 않으며 치료 효과를 판단하지 않습니다. 지속되거나 심한 증상, 위급한 상황은 의료 전문가나 응급 서비스의 평가가 우선입니다."] }, { heading: "재물과 법률", paragraphs: ["투자, 대출, 계약, 법적 대응은 카드 해석만으로 결정하지 말고 자격을 갖춘 전문가와 실제 자료를 확인해야 합니다."] }, { heading: "관계와 안전", paragraphs: ["통제, 위협, 폭력처럼 안전이 관련된 상황에서는 관계의 운세보다 안전 확보와 신뢰할 수 있는 기관의 도움을 우선합니다."] }]} />; }
