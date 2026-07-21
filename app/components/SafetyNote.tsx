import { HeartPulse } from "lucide-react";

export function SafetyNote() {
  return (
    <aside className="safety-note" aria-label="건강 카드 안내">
      <HeartPulse aria-hidden="true" />
      <p>
        건강 카드는 생활 습관을 돌아보기 위한 학습 정보예요. 지속되거나
        심한 증상이 있다면 카드 해석보다 의료 전문가의 평가를 먼저
        받아주세요.
      </p>
    </aside>
  );
}
