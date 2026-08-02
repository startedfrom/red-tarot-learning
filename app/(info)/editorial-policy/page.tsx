import type { Metadata } from "next";
import { InfoPage } from "../../components/InfoPage";
export const metadata: Metadata = { title: "콘텐츠 작성 기준", alternates: { canonical: "/editorial-policy" } };
export default function EditorialPolicyPage() { return <InfoPage title="콘텐츠 작성 기준" lead="모든 카드와 조합 설명은 초보자가 근거를 확인할 수 있도록 같은 해석 문법과 안전 기준으로 작성합니다." sections={[{ heading: "해석 문법", paragraphs: ["카드의 중심 동사, 배열 위치, 질문 분야, 카드 관계를 순서대로 연결합니다. 역방향은 차단·지연·내면화·과잉·결핍 중 맥락에 맞는 방식으로 설명합니다."] }, { heading: "검수 기준", paragraphs: ["카드 ID와 방향, 위치, 해설의 일치 여부를 자동 검사하고 문장 흐름과 고유성은 사람이 확인합니다."], bullets: ["결과를 반드시 일어난다고 단정하지 않음", "다른 페이지의 문장을 단어만 바꿔 반복하지 않음", "건강·재물 내용에 필요한 안전 안내를 제공함"] }]} />; }
