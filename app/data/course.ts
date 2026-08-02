export type CourseDay = {
  day: number;
  title: string;
  summary: string;
  goal: string;
  lessonId: string;
  checklist: string[];
};

export const courseDays: CourseDay[] = [
  { day: 1, title: "근거로 읽는 방법", summary: "느낌만 말하지 않고 카드의 동사와 질문에서 해석 근거를 찾습니다.", goal: "카드 한 장을 근거 한 문장으로 설명하기", lessonId: "love-one-001", checklist: ["질문의 주어를 확인했나요?", "카드의 중심 동사를 골랐나요?", "결과를 단정하지 않았나요?"] },
  { day: 2, title: "메이저 아르카나와 핵심 동사", summary: "메이저 카드를 긴 키워드 대신 삶의 큰 움직임을 나타내는 동사로 익힙니다.", goal: "메이저 카드의 핵심 움직임 구분하기", lessonId: "love-one-003", checklist: ["카드 이름보다 동사를 먼저 말했나요?", "상황의 큰 변화를 찾았나요?", "좋음과 나쁨으로만 나누지 않았나요?"] },
  { day: 3, title: "네 수트와 원소", summary: "완드·컵·소드·펜타클이 행동, 감정, 생각, 현실 중 무엇을 강조하는지 배웁니다.", goal: "수트가 가리키는 삶의 영역 찾기", lessonId: "money-one-001", checklist: ["수트를 확인했나요?", "감정과 현실을 구분했나요?", "질문 분야와 연결했나요?"] },
  { day: 4, title: "숫자 패턴", summary: "에이스의 시작부터 10의 완결까지 반복되는 숫자 흐름을 읽습니다.", goal: "숫자로 카드의 단계 설명하기", lessonId: "money-one-002", checklist: ["숫자의 단계를 찾았나요?", "수트와 숫자를 함께 봤나요?", "현재와 다음 단계를 구분했나요?"] },
  { day: 5, title: "코트 카드", summary: "페이지·나이트·퀸·킹을 특정 인물로 단정하지 않고 태도와 역할로 읽습니다.", goal: "코트 카드를 행동 방식으로 설명하기", lessonId: "health-one-001", checklist: ["인물로만 단정하지 않았나요?", "역할과 태도를 찾았나요?", "질문의 주어와 맞췄나요?"] },
  { day: 6, title: "정방향과 역방향", summary: "역방향을 나쁜 뜻이 아니라 차단, 지연, 내면화, 과잉, 결핍으로 나눕니다.", goal: "같은 동사의 다른 작동 방식 찾기", lessonId: "love-one-002", checklist: ["정방향 동사를 먼저 찾았나요?", "다섯 역방향 모드 중 하나를 골랐나요?", "문맥으로 최종 뜻을 좁혔나요?"] },
  { day: 7, title: "좋은 질문 만들기", summary: "예언을 요구하는 질문을 현재 조건과 선택을 살피는 질문으로 바꿉니다.", goal: "행동에 도움 되는 질문으로 다시 쓰기", lessonId: "love-three-001", checklist: ["한 가지 주어가 있나요?", "확인할 행동이 있나요?", "반드시라는 표현을 뺐나요?"] },
  { day: 8, title: "한 장 읽기", summary: "질문, 카드 동사, 분야를 연결해 짧고 분명한 답을 만듭니다.", goal: "한 장 해석을 두 문장 안에 정리하기", lessonId: "love-one-004", checklist: ["질문에 바로 답했나요?", "카드 근거가 남아 있나요?", "조건을 한 가지 덧붙였나요?"] },
  { day: 9, title: "배열 위치의 역할", summary: "같은 카드도 현재, 장애물, 조언 위치에서 주어와 역할이 달라짐을 익힙니다.", goal: "위치별로 카드 문장 바꾸기", lessonId: "money-three-001", checklist: ["각 위치의 주어를 적었나요?", "같은 문장을 반복하지 않았나요?", "위치가 묻는 것에 답했나요?"] },
  { day: 10, title: "두 카드 연결", summary: "두 카드가 강화, 충돌, 원인과 결과 중 어떤 관계인지 찾습니다.", goal: "접속사로 두 카드 연결하기", lessonId: "love-three-002", checklist: ["각 카드의 동사를 찾았나요?", "관계 유형을 골랐나요?", "접속사가 관계를 보여주나요?"] },
  { day: 11, title: "강화와 충돌 찾기", summary: "여러 카드의 방향이 같은지 다른지 보고 해석의 힘과 갈등을 구분합니다.", goal: "배열의 가장 강한 관계 한 가지 찾기", lessonId: "money-three-002", checklist: ["반복되는 원소나 동사가 있나요?", "서로 반대인 욕구가 있나요?", "어느 힘이 더 강한지 근거가 있나요?"] },
  { day: 12, title: "세 장을 흐름으로 읽기", summary: "세 카드의 뜻을 나열하지 않고 시작, 변화, 방향의 흐름으로 연결합니다.", goal: "세 장을 하나의 흐름 문장으로 쓰기", lessonId: "health-three-001", checklist: ["첫 카드가 만든 상황이 있나요?", "가운데 변화가 보이나요?", "마지막 방향까지 이어졌나요?"] },
  { day: 13, title: "대안과 조건 표현하기", summary: "한 가지 결론 대신 달라질 수 있는 조건과 가능한 대안을 함께 제시합니다.", goal: "단정하지 않는 해석 완성하기", lessonId: "health-three-002", checklist: ["다른 가능성을 하나 적었나요?", "흐름이 달라지는 조건이 있나요?", "건강·재물 결과를 보장하지 않았나요?"] },
  { day: 14, title: "최종 3장 해석", summary: "질문, 위치, 카드 동사, 관계, 대안과 조건을 모두 사용해 최종 해석을 완성합니다.", goal: "스스로 검토 가능한 3장 해석 쓰기", lessonId: "love-three-004", checklist: ["질문에 직접 답했나요?", "세 카드의 근거가 모두 있나요?", "관계·대안·조건을 포함했나요?"] },
];

export function getCourseDay(day: number) {
  return courseDays.find((item) => item.day === day);
}
