import { majorArcana, type Orientation, type TarotCard } from "./cards";

export type LearningSet = {
  id: string;
  category: "love";
  difficulty: "basic";
  question: string;
  spread: {
    type: "three";
    positions: [string, string, string];
  };
  cards: [
    { cardId: string; orientation: Orientation },
    { cardId: string; orientation: Orientation },
    { cardId: string; orientation: Orientation },
  ];
  headline: string;
  cardAnalysis: [string, string, string];
  positionAnalysis: [string, string, string];
  connection: string;
  relationship: "강화" | "충돌" | "원인과 결과" | "문제와 해결" | "겉과 속";
  fullInterpretation: string;
  alternatives: string[];
  conditions: string[];
  commonMistakes: string[];
  quiz: {
    question: string;
    options: [string, string, string, string];
    answer: number;
    rationale: string;
  };
};

export const supportCards: TarotCard[] = [
  {
    id: "two-of-swords",
    number: 2,
    nameKo: "소드 2",
    nameEn: "Two of Swords",
    arcana: "minor",
    coreVerb: "결정을 미룬다",
    keywords: ["판단 유보", "방어", "균형", "회피", "침묵"],
    coreMeaning: "상반된 선택 사이에서 감정을 닫고 결정을 미루는 상태",
    upright: {
      summary: "판단을 보류하며 균형을 유지함",
      positive: ["신중함", "중립", "생각할 시간"],
      caution: ["결정 회피", "감정 차단", "정보 부족"],
    },
    reversed: {
      summary: "미뤄 온 갈등이 안에서 커지거나 결정이 드러남",
      positive: ["결정의 필요를 인정함"],
      caution: ["혼란", "압박", "자기기만"],
      mode: "내면화",
    },
    categories: {
      love: {
        upright: "감정은 있어도 관계에 대한 결정을 미룸",
        reversed: "숨겨 온 갈등이 드러나 선택을 피하기 어려움",
      },
      money: {
        upright: "재정 결정을 미루며 정보를 더 모음",
        reversed: "미뤄 온 계약이나 지출 결정을 급하게 처리함",
      },
      health: {
        upright: "몸의 신호를 판단하지 못하고 조금 더 관찰함",
        reversed: "불편함을 외면하기 어려워 점검 필요를 느낌",
      },
    },
    symbolism: [
      { symbol: "눈가리개", meaning: "사실을 바로 보지 않으려는 방어" },
      { symbol: "교차한 검", meaning: "팽팽하게 맞선 두 선택" },
    ],
    commonMistakes: ["감정이 전혀 없다고 단정하거나 판단 유보를 영구적인 거절로 보는 것"],
    visual: { glyph: "⚔", accent: "plum" },
  },
  {
    id: "eight-of-cups",
    number: 8,
    nameKo: "컵 8",
    nameEn: "Eight of Cups",
    arcana: "minor",
    coreVerb: "떠난다",
    keywords: ["거리두기", "감정 정리", "이동", "미련", "의미 탐색"],
    coreMeaning: "정서적 의미가 줄어든 상황에서 미련을 안고도 더 나은 방향을 찾는 상태",
    upright: {
      summary: "익숙한 감정에서 물러나 새 의미를 찾음",
      positive: ["감정 정리", "자기존중", "새 방향"],
      caution: ["회피", "미련", "성급한 단절"],
    },
    reversed: {
      summary: "떠나지 못하고 같은 감정으로 돌아오거나 결정을 미룸",
      positive: ["떠날 이유를 다시 확인함"],
      caution: ["미련", "반복", "두려움"],
      mode: "지연",
    },
    categories: {
      love: {
        upright: "관계에서 정서적으로 물러나 의미를 다시 찾음",
        reversed: "떠나지도 머물지도 못한 채 같은 감정을 반복함",
      },
      money: {
        upright: "수익이 있어도 의미 없는 일이나 계획을 정리함",
        reversed: "손실이 두려워 비효율적인 선택을 붙잡음",
      },
      health: {
        upright: "소진을 만든 환경이나 습관에서 거리를 둠",
        reversed: "바꿔야 할 생활 습관을 알면서도 되돌아감",
      },
    },
    symbolism: [
      { symbol: "쌓인 컵", meaning: "완전히 비어 있지는 않은 기존 감정" },
      { symbol: "먼 산", meaning: "익숙함을 떠나 찾는 더 깊은 의미" },
    ],
    commonMistakes: ["모든 경우를 영구적인 이별로 단정하는 것"],
    visual: { glyph: "☾", accent: "apricot" },
  },
];

const positions: [string, string, string] = [
  "현재 관계",
  "상대의 태도",
  "향후 흐름",
];

export const learningSets: LearningSet[] = [
  {
    id: "love-three-001",
    category: "love",
    difficulty: "basic",
    question: "이 관계의 현재 흐름은 어떻게 이어질까요?",
    spread: { type: "three", positions },
    cards: [
      { cardId: "the-lovers", orientation: "upright" },
      { cardId: "two-of-swords", orientation: "upright" },
      { cardId: "eight-of-cups", orientation: "upright" },
    ],
    headline: "감정이 있어도 결정을 미루면 관계가 멀어질 수 있어요",
    cardAnalysis: [
      "연인은 끌림과 함께 관계의 방향을 선택해야 하는 순간을 뜻해요.",
      "소드 2는 판단을 유보하고 마음을 쉽게 드러내지 않는 상태예요.",
      "컵 8은 현재 감정에서 한 걸음 물러나 더 나은 의미를 찾는 흐름이에요.",
    ],
    positionAnalysis: [
      "현재 관계가 중요하지만 방향을 정해야 해요.",
      "상대가 관계에 대한 판단을 미루고 있어요.",
      "회피가 이어지면 한쪽이 감정적으로 거리를 둘 수 있어요.",
    ],
    connection: "끌림과 선택 → 결정 유보 → 거리두기",
    relationship: "원인과 결과",
    fullInterpretation:
      "서로에 대한 감정이나 관계의 중요성은 있지만 상대가 명확한 결정을 피하고 있어요. 이 상태가 오래 지속되면 관계가 자연스럽게 멀어질 수 있습니다. 연인 카드는 무조건적인 성사가 아니라 선택해야 하는 관계라는 뜻이 더 강해요.",
    alternatives: ["한쪽이 기존 관계 방식을 정리한 뒤 새로운 선택을 할 수도 있어요."],
    conditions: ["솔직한 대화가 시작되면 컵 8은 이별보다 낡은 감정 패턴을 떠나는 뜻이 될 수 있어요."],
    commonMistakes: ["연인을 무조건 연애 성사로 보거나 컵 8을 반드시 이별로 단정하는 것"],
    quiz: {
      question: "이 배열의 핵심 갈등은 무엇일까요?",
      options: ["감정이 전혀 없음", "선택과 결정을 미루는 태도", "경제적 문제", "주변 사람의 방해"],
      answer: 1,
      rationale: "연인의 선택 문제와 소드 2의 판단 유보가 중심 갈등을 만들어요.",
    },
  },
  {
    id: "love-three-002",
    category: "love",
    difficulty: "basic",
    question: "새로운 만남이 관계로 발전할 수 있을까요?",
    spread: { type: "three", positions },
    cards: [
      { cardId: "the-fool", orientation: "upright" },
      { cardId: "the-magician", orientation: "upright" },
      { cardId: "the-chariot", orientation: "upright" },
    ],
    headline: "가벼운 시작이 적극적인 표현을 만나 빠르게 진전돼요",
    cardAnalysis: [
      "바보는 아직 정해지지 않은 가능성과 열린 마음을 보여줘요.",
      "마법사는 가진 매력과 표현력을 의도적으로 사용하는 카드예요.",
      "전차는 한 방향으로 힘을 모아 관계를 빠르게 움직여요.",
    ],
    positionAnalysis: [
      "현재 관계는 부담보다 호기심과 가능성이 커요.",
      "상대는 말이나 행동으로 관심을 보여줄 수 있어요.",
      "서로의 속도가 맞으면 관계가 빠르게 진전될 수 있어요.",
    ],
    connection: "열린 가능성 → 적극적 표현 → 빠른 진전",
    relationship: "강화",
    fullInterpretation:
      "처음에는 가볍고 자유로운 분위기지만 상대가 적극적으로 호감을 표현하면서 관계가 빠르게 움직일 수 있어요. 다만 세 카드 모두 시작과 추진 에너지가 강하므로, 빠른 속도를 좋은 결말과 같다고 생각하지 말고 서로 원하는 관계의 형태를 확인해야 해요.",
    alternatives: ["연애보다 함께 시작하는 활동이나 프로젝트에서 강한 호흡이 나타날 수도 있어요."],
    conditions: ["한쪽이 속도에 부담을 느끼면 전차의 추진력은 압박으로 바뀔 수 있어요."],
    commonMistakes: ["빠르게 진전된다는 이유만으로 안정적인 장기 관계라고 결론내리는 것"],
    quiz: {
      question: "이 배열에서 가장 필요한 점검은 무엇일까요?",
      options: ["상대의 경제력", "주변의 허락", "서로가 원하는 속도", "과거 연인의 연락"],
      answer: 2,
      rationale: "시작과 추진 카드가 이어져 속도 조절이 핵심 조건이에요.",
    },
  },
  {
    id: "love-three-003",
    category: "love",
    difficulty: "basic",
    question: "상대의 속마음을 어떻게 이해해야 할까요?",
    spread: { type: "three", positions },
    cards: [
      { cardId: "the-high-priestess", orientation: "upright" },
      { cardId: "the-moon", orientation: "upright" },
      { cardId: "the-sun", orientation: "upright" },
    ],
    headline: "숨긴 감정이 불안을 만들지만 결국 사실이 드러나요",
    cardAnalysis: [
      "여사제는 말보다 내면에 감정을 보관하고 관찰해요.",
      "달은 정보가 부족할 때 직감과 불안이 뒤섞이는 상태예요.",
      "태양은 감춰진 것을 밝게 드러내고 이해를 선명하게 해요.",
    ],
    positionAnalysis: [
      "현재 관계에는 말하지 않은 감정과 조심스러운 관찰이 있어요.",
      "상대도 확신보다 불안과 상상에 흔들릴 수 있어요.",
      "솔직한 확인을 거치면 관계의 실체가 분명해질 수 있어요.",
    ],
    connection: "감정 숨김 → 불확실성 → 솔직한 확인",
    relationship: "문제와 해결",
    fullInterpretation:
      "서로가 속마음을 충분히 말하지 않아 불안과 추측이 커질 수 있어요. 하지만 태양은 대화나 분명한 행동을 통해 상황이 드러날 가능성을 보여줘요. 직감을 무시할 필요는 없지만, 직감을 사실처럼 단정하기보다 확인하는 과정이 중요합니다.",
    alternatives: ["상대의 문제보다 내가 가진 불안이 관계를 더 모호하게 만들고 있을 수도 있어요."],
    conditions: ["대화를 피하면 태양의 명확함은 늦어지고 달의 오해가 오래갈 수 있어요."],
    commonMistakes: ["달을 배신의 증거로 보고 여사제의 침묵을 거짓말로 단정하는 것"],
    quiz: {
      question: "달 다음에 태양이 나온 핵심 의미는 무엇일까요?",
      options: ["불안이 영원히 계속됨", "사실 확인으로 혼란이 걷힐 수 있음", "반드시 재회함", "주변 사람이 방해함"],
      answer: 1,
      rationale: "달의 모호함 뒤에 태양의 명확함이 문제와 해결의 흐름을 만들어요.",
    },
  },
  {
    id: "love-three-004",
    category: "love",
    difficulty: "basic",
    question: "강한 끌림 속에서 무엇을 조심해야 할까요?",
    spread: { type: "three", positions },
    cards: [
      { cardId: "the-emperor", orientation: "upright" },
      { cardId: "the-devil", orientation: "upright" },
      { cardId: "temperance", orientation: "upright" },
    ],
    headline: "통제와 집착을 알아차리고 건강한 경계를 다시 맞춰야 해요",
    cardAnalysis: [
      "황제는 관계의 구조와 책임을 분명하게 만들어요.",
      "악마는 강한 욕망이 의존이나 권력 차이로 굳는 모습을 보여줘요.",
      "절제는 서로 다른 욕구를 지속 가능한 수준으로 조율해요.",
    ],
    positionAnalysis: [
      "현재 관계는 안정적이지만 한쪽의 기준이 강할 수 있어요.",
      "상대의 태도에는 강한 끌림과 함께 통제 욕구가 섞일 수 있어요.",
      "경계와 속도를 다시 맞추면 관계를 건강하게 조정할 수 있어요.",
    ],
    connection: "통제 → 집착 → 건강한 경계 조율",
    relationship: "문제와 해결",
    fullInterpretation:
      "책임과 안정이 있는 관계처럼 보여도 실제로는 한쪽이 기준을 정하고 다른 쪽이 맞추는 구조일 수 있어요. 강한 끌림을 사랑의 깊이와 동일하게 보지 말고, 거절과 선택이 존중되는지 확인해야 합니다. 절제는 완벽한 단절보다 경계와 속도를 조율하라는 방향이에요.",
    alternatives: ["두 사람이 공동 목표에 몰입하면서 관계 밖의 생활 균형을 잃고 있을 수도 있어요."],
    conditions: ["통제나 두려움이 반복되면 조율보다 외부 도움과 거리 확보가 먼저일 수 있어요."],
    commonMistakes: ["악마를 특정한 나쁜 사람으로만 보고 관계의 반복 패턴을 놓치는 것"],
    quiz: {
      question: "절제 카드가 제시하는 해결 방향은 무엇일까요?",
      options: ["더 강하게 통제하기", "무조건 헤어지기", "경계와 속도를 조율하기", "문제를 모른 척하기"],
      answer: 2,
      rationale: "절제는 서로 다른 욕구와 힘의 균형을 다시 맞추는 카드예요.",
    },
  },
  {
    id: "love-three-005",
    category: "love",
    difficulty: "basic",
    question: "잠시 멀어진 관계는 어떤 과정을 거칠까요?",
    spread: { type: "three", positions },
    cards: [
      { cardId: "the-hermit", orientation: "upright" },
      { cardId: "the-hanged-man", orientation: "upright" },
      { cardId: "the-star", orientation: "upright" },
    ],
    headline: "거리를 둔 뒤 관점을 바꾸면 신뢰가 천천히 회복될 수 있어요",
    cardAnalysis: [
      "은둔자는 외부 반응보다 자신의 진짜 욕구를 정리해요.",
      "매달린 사람은 억지로 진전시키지 않고 관점을 바꾸는 멈춤이에요.",
      "별은 상처 뒤에 희망과 신뢰를 조금씩 되찾아요.",
    ],
    positionAnalysis: [
      "현재 관계는 빠른 연락보다 각자의 성찰이 필요한 시기예요.",
      "상대도 결정을 내리기보다 상황을 다르게 보려 멈춰 있을 수 있어요.",
      "충분한 시간을 거치면 관계나 내 마음이 더 맑게 회복될 수 있어요.",
    ],
    connection: "거리두기 → 멈춤과 재평가 → 점진적 회복",
    relationship: "문제와 해결",
    fullInterpretation:
      "지금은 관계를 서둘러 정의하거나 답을 재촉하기보다 각자가 무엇을 원하는지 돌아볼 시간이 필요해요. 멈춤이 무조건 끝을 뜻하지는 않으며, 관점을 바꾸면 더 솔직한 신뢰가 생길 수 있습니다. 별의 회복은 천천히 진행되므로 작은 변화부터 보는 편이 좋아요.",
    alternatives: ["관계 회복보다 혼자서 마음을 정리하고 자기 신뢰를 되찾는 흐름일 수도 있어요."],
    conditions: ["아무 소통 없이 기다리기만 하면 매달린 사람의 멈춤이 장기 정체로 바뀔 수 있어요."],
    commonMistakes: ["은둔자를 잠수나 이별로만 보고 별을 무조건 재회로 보는 것"],
    quiz: {
      question: "이 배열의 회복은 어떤 방식에 가까울까요?",
      options: ["갑작스럽고 극적인 재회", "충분한 성찰 뒤의 점진적 회복", "주변의 강요", "경쟁을 통한 승리"],
      answer: 1,
      rationale: "은둔자와 매달린 사람의 느린 과정 뒤에 별이 이어져요.",
    },
  },
  {
    id: "love-three-006",
    category: "love",
    difficulty: "basic",
    question: "내가 많이 돌보는 관계의 균형은 어떨까요?",
    spread: { type: "three", positions },
    cards: [
      { cardId: "the-empress", orientation: "upright" },
      { cardId: "the-lovers", orientation: "reversed" },
      { cardId: "justice", orientation: "upright" },
    ],
    headline: "돌봄만으로는 부족해요. 서로의 선택과 책임을 확인해야 해요",
    cardAnalysis: [
      "여황제는 따뜻한 돌봄과 관계를 키우는 힘이에요.",
      "연인 역방향은 감정과 행동 또는 가치가 어긋난 상태예요.",
      "정의는 사실과 행동을 기준으로 균형을 판단해요.",
    ],
    positionAnalysis: [
      "현재 관계는 한쪽의 충분한 애정과 돌봄으로 유지되고 있어요.",
      "상대는 감정이 있어도 같은 선택과 책임을 보여주지 않을 수 있어요.",
      "앞으로는 마음뿐 아니라 실제 행동과 주고받음을 기준으로 봐야 해요.",
    ],
    connection: "돌봄 → 선택의 불균형 → 관계 기준 확인",
    relationship: "겉과 속",
    fullInterpretation:
      "겉으로는 따뜻하고 안정된 관계처럼 보여도 실제 선택과 책임은 한쪽으로 기울어 있을 수 있어요. 내가 더 많이 돌보면 해결된다고 생각하기보다, 상대도 관계를 선택하고 행동으로 보여주는지 확인해야 합니다. 정의는 차갑게 계산하라는 뜻이 아니라 서로에게 적용되는 기준이 공정한지 보라는 조언이에요.",
    alternatives: ["상대가 아니라 내가 돌보는 역할에 익숙해져 필요한 요구를 말하지 못하고 있을 수도 있어요."],
    conditions: ["서로 역할과 기대를 솔직히 조정하면 연인 역방향의 불균형은 회복될 수 있어요."],
    commonMistakes: ["여황제의 애정만 보고 관계 전체가 풍요롭다고 판단하는 것"],
    quiz: {
      question: "정의 카드가 확인하라고 하는 것은 무엇일까요?",
      options: ["감정의 크기만", "실제 행동과 책임의 균형", "외모와 조건", "주변의 평가"],
      answer: 1,
      rationale: "정의는 마음뿐 아니라 선택의 결과와 책임을 함께 봐요.",
    },
  },
  {
    id: "love-three-007",
    category: "love",
    difficulty: "basic",
    question: "오래된 관계가 다음 단계로 갈 수 있을까요?",
    spread: { type: "three", positions },
    cards: [
      { cardId: "wheel-of-fortune", orientation: "upright" },
      { cardId: "death", orientation: "upright" },
      { cardId: "the-world", orientation: "upright" },
    ],
    headline: "낡은 관계 방식을 끝내면 한 주기가 온전히 완성돼요",
    cardAnalysis: [
      "운명의 수레바퀴는 관계의 주기와 타이밍이 바뀌는 전환점이에요.",
      "죽음은 더 이어갈 수 없는 방식을 끝내 새 공간을 만들어요.",
      "세계는 경험을 통합하고 한 단계를 온전히 마무리해요.",
    ],
    positionAnalysis: [
      "현재 관계는 익숙한 방식만으로 유지하기 어려운 전환점에 있어요.",
      "상대도 기존 역할이나 갈등 방식을 끝내야 한다고 느낄 수 있어요.",
      "필요한 정리를 거치면 함께 다음 단계로 가거나 관계를 온전히 마칠 수 있어요.",
    ],
    connection: "전환점 → 낡은 관계 방식 종료 → 한 단계 완성",
    relationship: "원인과 결과",
    fullInterpretation:
      "관계가 큰 전환점에 들어섰고, 이전과 똑같은 방식으로는 다음 단계에 갈 수 없어요. 죽음은 반드시 이별을 뜻하지 않으며 낡은 역할과 반복 갈등을 끝내라는 의미일 수 있습니다. 세계는 결혼 같은 공식화일 수도, 미련 없이 관계를 완성하고 각자의 길로 가는 것일 수도 있어요.",
    alternatives: ["두 사람이 관계를 끝내기보다 오래된 생활 패턴을 바꾸며 새 단계로 갈 수도 있어요."],
    conditions: ["끝내야 할 문제를 외면하면 세계의 완성은 형식적인 마무리에 그칠 수 있어요."],
    commonMistakes: ["죽음을 무조건 이별, 세계를 무조건 결혼으로 연결하는 것"],
    quiz: {
      question: "이 배열에서 죽음 카드의 핵심 역할은 무엇일까요?",
      options: ["재난을 예고함", "낡은 관계 방식을 끝냄", "상대의 거짓말", "새 사람의 등장"],
      answer: 1,
      rationale: "전환점과 완성 사이에서 죽음은 필요한 정리와 변화를 담당해요.",
    },
  },
  {
    id: "love-three-008",
    category: "love",
    difficulty: "basic",
    question: "갈등 이후 이 관계를 다시 볼 수 있을까요?",
    spread: { type: "three", positions },
    cards: [
      { cardId: "strength", orientation: "reversed" },
      { cardId: "the-tower", orientation: "upright" },
      { cardId: "judgement", orientation: "upright" },
    ],
    headline: "억눌린 감정이 터진 뒤 관계를 솔직하게 재평가하게 돼요",
    cardAnalysis: [
      "힘 역방향은 자신감이 약해지거나 감정을 억누르다 지친 상태예요.",
      "탑은 버티던 구조에서 감춰진 문제가 갑자기 드러나는 카드예요.",
      "심판은 과거를 돌아보고 다시 선택할지 결정하게 해요.",
    ],
    positionAnalysis: [
      "현재 관계에는 참아 온 피로와 자기불신이 쌓여 있어요.",
      "상대의 말이나 행동이 눌러 둔 갈등을 한꺼번에 드러낼 수 있어요.",
      "갈등 뒤에는 자동적인 재회가 아니라 관계 전체를 다시 판단하는 과정이 와요.",
    ],
    connection: "자신감 결핍 → 감춰진 문제 폭발 → 솔직한 재평가",
    relationship: "원인과 결과",
    fullInterpretation:
      "한쪽 또는 두 사람 모두 감정을 참으며 버텨 왔고, 작은 계기로 문제의 구조가 크게 흔들릴 수 있어요. 탑의 충격 뒤 심판이 나온 것은 모든 일이 끝난다는 뜻보다 무엇이 잘못되었는지 솔직하게 돌아볼 기회가 생긴다는 의미예요. 재연결 여부는 과거 문제를 실제로 바꿀 수 있는지에 달려 있습니다.",
    alternatives: ["관계를 다시 시작하기보다 이번 경험을 통해 나의 경계와 선택을 새롭게 세울 수도 있어요."],
    conditions: ["폭언이나 위협처럼 안전을 해치는 상황이라면 재평가보다 거리 확보와 도움 요청이 먼저예요."],
    commonMistakes: ["탑을 무조건 파국, 심판을 반드시 재회라고 읽는 것"],
    quiz: {
      question: "심판 카드가 보장하지 않는 것은 무엇일까요?",
      options: ["과거의 재평가", "책임 있는 결정", "무조건적인 재회", "문제의 자각"],
      answer: 2,
      rationale: "심판은 다시 바라보고 결정하는 과정이지 특정 결말의 보장이 아니에요.",
    },
  },
  {
    id: "love-three-009",
    category: "love",
    difficulty: "basic",
    question: "결혼이나 장기 약속을 고민하는 관계의 흐름은요?",
    spread: { type: "three", positions },
    cards: [
      { cardId: "the-hierophant", orientation: "upright" },
      { cardId: "the-emperor", orientation: "upright" },
      { cardId: "the-fool", orientation: "reversed" },
    ],
    headline: "책임과 공식화는 중요하지만 새로운 단계가 두려울 수 있어요",
    cardAnalysis: [
      "교황은 공동체의 기준과 관계의 공식화를 생각하게 해요.",
      "황제는 책임과 규칙을 실제 구조로 만들려 해요.",
      "바보 역방향은 새 출발을 두려워하거나 준비 없이 뛰어드는 위험이에요.",
    ],
    positionAnalysis: [
      "현재 관계는 결혼이나 공식적인 약속을 의식하고 있어요.",
      "상대는 책임을 중요하게 여기지만 자신의 방식과 기준도 강할 수 있어요.",
      "준비되지 않은 불안이 크면 다음 단계가 지연될 수 있어요.",
    ],
    connection: "전통적 기대 → 책임과 규칙 → 새 단계에 대한 두려움",
    relationship: "충돌",
    fullInterpretation:
      "관계를 공식화하려는 분위기와 책임 의식은 분명하지만, 막상 새로운 삶으로 넘어가는 데 두려움이 있을 수 있어요. 주변의 기대나 정해진 순서 때문에 서두르기보다 두 사람이 원하는 약속과 준비 수준을 구체적으로 확인해야 합니다. 책임이 통제로 바뀌지 않는지도 중요한 점검이에요.",
    alternatives: ["상대가 관계를 싫어해서가 아니라 경제·가족·생활 준비를 현실적으로 걱정하고 있을 수도 있어요."],
    conditions: ["두 사람이 자기 기준을 말하지 않고 주변 관습만 따르면 바보 역방향의 불안이 커져요."],
    commonMistakes: ["교황과 황제가 있으니 반드시 결혼한다고 단정하는 것"],
    quiz: {
      question: "이 배열에서 다음 단계가 지연될 수 있는 이유는 무엇일까요?",
      options: ["감정이 전혀 없어서", "새 시작에 대한 두려움과 준비 부족", "새로운 사람이 있어서", "반드시 가족이 반대해서"],
      answer: 1,
      rationale: "바보 역방향은 시작 에너지의 차단과 준비 부족을 보여줘요.",
    },
  },
  {
    id: "love-three-010",
    category: "love",
    difficulty: "basic",
    question: "엇갈린 관계를 다시 맞출 방법은 무엇일까요?",
    spread: { type: "three", positions },
    cards: [
      { cardId: "temperance", orientation: "reversed" },
      { cardId: "the-chariot", orientation: "reversed" },
      { cardId: "the-sun", orientation: "upright" },
    ],
    headline: "불균형과 방향 상실을 솔직한 대화로 바로잡아야 해요",
    cardAnalysis: [
      "절제 역방향은 주고받음과 감정 조절이 한쪽으로 기운 상태예요.",
      "전차 역방향은 서로 다른 방향과 속도 때문에 움직이지 못하는 모습이에요.",
      "태양은 숨김없는 표현과 사실 확인으로 상황을 밝게 만들어요.",
    ],
    positionAnalysis: [
      "현재 관계는 연락, 시간, 감정 표현의 균형이 깨져 있어요.",
      "상대도 무엇을 원하는지 정하지 못하거나 통제감을 잃었을 수 있어요.",
      "솔직하고 구체적인 대화가 관계의 실제 가능성을 분명하게 해요.",
    ],
    connection: "조율 부족 → 방향 상실 → 명확한 대화",
    relationship: "문제와 해결",
    fullInterpretation:
      "서로의 속도와 기대가 맞지 않아 관계가 앞으로 가지 못하고 있어요. 더 세게 밀어붙이는 것보다 어떤 부분에서 균형이 무너졌는지 구체적으로 말하는 편이 필요합니다. 태양은 무조건 좋은 결말보다, 함께 갈 수 있는지 아닌지를 솔직하게 알게 되는 명확함을 뜻해요.",
    alternatives: ["대화 끝에 관계를 지속하지 않는 것이 서로에게 더 명확하고 건강한 선택임을 알 수도 있어요."],
    conditions: ["말을 밝게 포장하기보다 행동 가능한 약속까지 정해야 태양의 명확함이 유지돼요."],
    commonMistakes: ["마지막 태양만 보고 앞선 불균형과 방향 상실을 무시하는 것"],
    quiz: {
      question: "이 배열의 해결책에 가장 가까운 행동은 무엇일까요?",
      options: ["연락을 더 자주 재촉하기", "문제를 모른 척하기", "기대와 행동을 구체적으로 확인하기", "주변 사람의 판단만 따르기"],
      answer: 2,
      rationale: "태양은 감추지 않고 사실과 의도를 분명하게 드러내는 해결 카드예요.",
    },
  },
];

export function getLearningSet(setId: string) {
  return learningSets.find((set) => set.id === setId);
}

export function getLessonCard(cardId: string) {
  return [...majorArcana, ...supportCards].find((card) => card.id === cardId);
}
