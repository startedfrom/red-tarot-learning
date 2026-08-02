"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Lightbulb,
  Link2,
  PenLine,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { TarotCard } from "../data/cards";
import { useProgress } from "../hooks/use-progress";
import {
  learningSets,
  type LearningSet,
} from "../data/learning-sets";
import {
  markLessonComplete,
  recordQuizAnswer,
  recordStudyDay,
} from "../lib/progress";
import { SafetyNote } from "./SafetyNote";
import { TarotCardVisual } from "./TarotCardVisual";
import { AdSlot } from "./AdSlot";

type LessonStage = 1 | 2 | 3 | 4 | 5;

const stageLabels = [
  "내 해석",
  "카드별 힌트",
  "위치 해석",
  "카드 연결",
  "종합 해설",
] as const;

const practiceCategoryLabels = { love: "연애", money: "재물", health: "건강" } as const;
const difficultyLabels = { intro: "입문", basic: "기본", advanced: "심화" } as const;

export function PracticeLesson({
  lesson,
  cards,
}: {
  lesson: LearningSet;
  cards: TarotCard[];
}) {
  const [stage, setStage] = useState<LessonStage>(1);
  const [interpretation, setInterpretation] = useState("");
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answerView, setAnswerView] = useState<"reading" | "quiz">("reading");
  const [saveMessage, setSaveMessage] = useState("");
  const { updateProgress, syncMessage, userId } = useProgress();
  const lessonIndex = learningSets.findIndex((item) => item.id === lesson.id);
  const previousLesson =
    learningSets[(lessonIndex - 1 + learningSets.length) % learningSets.length];
  const nextLesson = learningSets[(lessonIndex + 1) % learningSets.length];

  function moveTo(nextStage: number) {
    setStage(Math.min(5, Math.max(1, nextStage)) as LessonStage);
    window.requestAnimationFrame(() => {
      document.getElementById("lesson-stage")?.focus();
    });
  }

  function saveQuizResult() {
    if (quizChoice === null) {
      setSaveMessage("먼저 답을 하나 골라주세요.");
      return;
    }

    setSubmitted(true);
    const now = new Date();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, "0")}-${String(yesterdayDate.getDate()).padStart(2, "0")}`;
    const result = updateProgress((current) => {
      const withQuiz = recordQuizAnswer(
        current,
        lesson.id,
        quizChoice === lesson.quiz.answer,
        now.toISOString(),
      );
      const withCompletion = markLessonComplete(withQuiz, lesson.id, now.toISOString());
      return recordStudyDay(withCompletion, today, yesterday, now.toISOString());
    }, { kind: "lesson", entityId: lesson.id });
    setCompleted(true);
    setSaveMessage(
      result.savedLocally
        ? `오늘의 학습과 퀴즈 결과를 저장했어요! ${userId ? syncMessage : ""}`.trim()
        : "현재 화면에는 반영했지만 이 기기에 저장하지 못했어요.",
    );
  }

  const correct = quizChoice === lesson.quiz.answer;

  return (
    <article className="practice-page">
      <header className="practice-header">
        <div>
          <span className="eyebrow">
            {practiceCategoryLabels[lesson.category]} · {difficultyLabels[lesson.difficulty]} · {cards.length}장 배열
          </span>
          <h1>카드를 연결해 한 문장으로 읽어봐요.</h1>
          <p>{lesson.question}</p>
        </div>
        <span className="lesson-count">
          {lessonIndex + 1}<small>/150</small>
        </span>
      </header>

      {lesson.category === "health" ? <SafetyNote /> : null}

      <ol className="stage-track" aria-label="학습 단계">
        {stageLabels.map((label, index) => {
          const step = index + 1;
          return (
            <li
              key={label}
              className={stage === step ? "is-current" : stage > step ? "is-done" : ""}
              aria-current={stage === step ? "step" : undefined}
            >
              <span>{stage > step ? <Check aria-hidden="true" /> : step}</span>
              <small>{label}</small>
            </li>
          );
        })}
      </ol>

      <section className="spread-board" aria-label={`${cards.length}장 배열`}>
        <div className="spread-ribbon">
          {lesson.category === "love" ? "연애" : lesson.category === "money" ? "재물" : "건강"} {cards.length}장 배열
        </div>
        <div className={`spread-grid spread-${cards.length}`}>
          {cards.map((card, index) => (
            <div className="spread-item" key={`${card.id}-${index}`}>
              <span className="position-label">
                <small>{index + 1}</small>
                {lesson.spread.positions[index]}
              </span>
              <TarotCardVisual
                card={card}
                orientation={lesson.cards[index].orientation}
                size={cards.length === 5 ? "small" : "medium"}
              />
              <strong>{card.nameKo}</strong>
              <small>
                {lesson.cards[index].orientation === "upright" ? "정방향" : "역방향"}
              </small>
            </div>
          ))}
        </div>
      </section>

      <section
        className="lesson-stage-card"
        id="lesson-stage"
        tabIndex={-1}
        aria-labelledby="stage-title"
      >
        <div className="stage-card-heading">
          <span className="stage-icon" aria-hidden="true">
            {stage === 1 ? <PenLine /> : null}
            {stage === 2 ? <Lightbulb /> : null}
            {stage === 3 ? <CircleHelp /> : null}
            {stage === 4 ? <Link2 /> : null}
            {stage === 5 ? <BookOpenCheck /> : null}
          </span>
          <div>
            <span className="eyebrow">{stage}단계 · {stageLabels[stage - 1]}</span>
            <h2 id="stage-title">
              {stage === 1 ? "먼저 내 말로 읽어볼까요?" : null}
              {stage === 2 ? "카드의 중심 동사를 꺼내봐요." : null}
              {stage === 3 ? "같은 뜻도 위치에 맞춰 바꿔요." : null}
              {stage === 4 ? "세 장을 하나의 흐름으로 묶어요." : null}
              {stage === 5 ? "해석의 근거를 함께 확인해요." : null}
            </h2>
          </div>
        </div>

        {stage === 1 ? (
          <div className="interpretation-step">
            <p>
              정답을 맞히려 하지 않아도 괜찮아요. 카드의 동사와 위치를 보며 세
              장의 흐름을 한두 문장으로 써보세요.
            </p>
            <label htmlFor="interpretation">내 해석</label>
            <textarea
              id="interpretation"
              value={interpretation}
              onChange={(event) => setInterpretation(event.target.value)}
              placeholder="예: 관계는 중요하지만 상대가 결정을 미루고 있어서 앞으로 조금 멀어질 수 있다."
              rows={5}
            />
            <span className="writing-note">
              <Sparkles aria-hidden="true" /> 입력한 글은 힌트를 열어도 그대로 남아 있어요.
            </span>
          </div>
        ) : null}

        {stage === 2 ? (
          <div className="hint-list">
            {cards.map((card, index) => (
              <section key={card.id}>
                <span className="hint-number">{index + 1}</span>
                <div>
                  <h3>
                    {card.nameKo} · <strong>{card.coreVerb}</strong>
                  </h3>
                  <p>{lesson.cardAnalysis[index]}</p>
                  <div className="keyword-list compact-keywords">
                    {card.keywords.slice(0, 4).map((keyword) => (
                      <span key={keyword}>{keyword}</span>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : null}

        {stage === 3 ? (
          <div className="position-list">
            {lesson.positionAnalysis.map((analysis, index) => (
              <section key={lesson.spread.positions[index]}>
                <span>{lesson.spread.positions[index]}</span>
                <div>
                  <strong>{cards[index].nameKo}</strong>
                  <p>{analysis}</p>
                </div>
              </section>
            ))}
          </div>
        ) : null}

        {stage === 4 ? (
          <div className="connection-step">
            <span className="relationship-pill">{lesson.relationship}</span>
            <div className="connection-flow">
              {lesson.connection.split(" → ").map((part, index, parts) => (
                <div key={part}>
                  <strong>{part}</strong>
                  {index < parts.length - 1 ? <ArrowRight aria-hidden="true" /> : null}
                </div>
              ))}
            </div>
            <p>
              앞 카드가 상황을 만들고, 가운데 카드가 갈등을 보여주며, 마지막
              카드가 그 흐름의 방향을 제시해요.
            </p>
            {interpretation ? (
              <blockquote>
                <span>내가 처음 쓴 해석</span>
                {interpretation}
              </blockquote>
            ) : null}
          </div>
        ) : null}

        {stage === 5 ? (
          <div className="full-answer">
            <div className="answer-switch" aria-label="종합 해설 보기">
              <button
                type="button"
                className={answerView === "reading" ? "is-active" : ""}
                onClick={() => setAnswerView("reading")}
                aria-pressed={answerView === "reading"}
              >
                종합 해설
              </button>
              <button
                type="button"
                className={answerView === "quiz" ? "is-active" : ""}
                onClick={() => setAnswerView("quiz")}
                aria-pressed={answerView === "quiz"}
              >
                퀴즈
              </button>
            </div>

            {answerView === "reading" ? (
              <div className="answer-reading">
                <section className="answer-summary">
                  <span className="soft-pill">가장 일반적인 해석</span>
                  <h3>{lesson.headline}</h3>
                  <p>{lesson.fullInterpretation}</p>
                </section>
                <div className="answer-detail-grid">
                  <section>
                    <span>가능한 대안</span>
                    <p>{lesson.alternatives[0]}</p>
                  </section>
                  <section>
                    <span>달라지는 조건</span>
                    <p>{lesson.conditions[0]}</p>
                  </section>
                  <section className="mistake-card">
                    <span>흔한 오해</span>
                    <p>{lesson.commonMistakes[0]}</p>
                  </section>
                </div>
                {interpretation ? (
                  <section className="compare-answer">
                    <span>내 해석과 비교하기</span>
                    <p>{interpretation}</p>
                    <small>
                      카드 뜻 · 위치 · 분야 · 연결 · 단정하지 않는 표현이 들어갔는지 확인해보세요.
                    </small>
                  </section>
                ) : null}
              </div>
            ) : (
              <section className="quiz-card">
                <span className="eyebrow">확인 문제</span>
                <h3>{lesson.quiz.question}</h3>
                <div className="quiz-options">
                  {lesson.quiz.options.map((option, index) => {
                    const selected = quizChoice === index;
                    const isAnswer = submitted && index === lesson.quiz.answer;
                    const isWrong = submitted && selected && !isAnswer;
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`${selected ? "is-selected" : ""} ${isAnswer ? "is-answer" : ""} ${isWrong ? "is-wrong" : ""}`}
                        onClick={() => {
                          if (!submitted) setQuizChoice(index);
                        }}
                        aria-pressed={selected}
                      >
                        <span>{String.fromCharCode(65 + index)}</span>
                        {option}
                        {isAnswer ? <Check aria-label="정답" /> : null}
                        {isWrong ? <X aria-label="오답" /> : null}
                      </button>
                    );
                  })}
                </div>
                {submitted ? (
                  <div className={`quiz-result ${correct ? "is-correct" : ""}`}>
                    {correct ? <Check aria-hidden="true" /> : <RotateCcw aria-hidden="true" />}
                    <div>
                      <strong>{correct ? "좋아요, 근거가 정확해요!" : "한 번 더 연결해볼까요?"}</strong>
                      <p>{lesson.quiz.rationale}</p>
                    </div>
                  </div>
                ) : null}
                <button className="primary-button quiz-submit" type="button" onClick={saveQuizResult}>
                  답 확인하고 복습 저장
                </button>
                <p className="save-message" role="status" aria-live="polite">
                  {saveMessage}
                </p>
                {completed ? (
                  <><AdSlot placement="completion" /><Link className="next-lesson-link" href={`/practice/${nextLesson.id}`}>
                    다음 학습 이어가기 <ArrowRight aria-hidden="true" />
                  </Link></>
                ) : null}
              </section>
            )}
          </div>
        ) : null}

        <div className="lesson-actions">
          {stage > 1 ? (
            <button className="secondary-button" type="button" onClick={() => moveTo(stage - 1)}>
              <ChevronLeft aria-hidden="true" /> 이전
            </button>
          ) : (
            <Link className="secondary-button" href="/">
              <ArrowLeft aria-hidden="true" /> 홈으로
            </Link>
          )}
          {stage < 5 ? (
            <>
              <button className="text-button" type="button" onClick={() => moveTo(5)}>
                모범 해설 바로 보기
              </button>
              <button className="primary-button" type="button" onClick={() => moveTo(stage + 1)}>
                다음 단계 <ChevronRight aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      </section>

      <nav className="lesson-pagination" aria-label="학습 세트 이동">
        <Link href={`/practice/${previousLesson.id}`}>
          <ArrowLeft aria-hidden="true" /> 이전 세트
        </Link>
        <Link href="/cards/the-lovers">카드 다시 보기</Link>
        <Link href={`/practice/${nextLesson.id}`}>
          다음 세트 <ArrowRight aria-hidden="true" />
        </Link>
      </nav>
    </article>
  );
}
