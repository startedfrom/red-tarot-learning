"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useProgress } from "../hooks/use-progress";
import { toggleFavorite } from "../lib/progress";

export function FavoriteButton({ cardId }: { cardId: string }) {
  const { progress, updateProgress } = useProgress();
  const favorite = progress.favoriteCardIds.includes(cardId);
  const [message, setMessage] = useState("");

  function toggle() {
    const result = updateProgress(
      (current) => toggleFavorite(current, cardId),
      { kind: "favorite", entityId: cardId },
    );
    setMessage(result.savedLocally ? "즐겨찾기를 업데이트했어요." : "현재 화면에는 반영했지만 이 기기에 저장하지 못했어요.");
  }

  return (
    <div className="favorite-control">
      <button className={`favorite-button ${favorite ? "is-favorite" : ""}`} type="button" onClick={toggle} aria-pressed={favorite}>
        <Heart aria-hidden="true" /> {favorite ? "찜한 카드" : "카드 찜하기"}
      </button>
      <p className="save-message" role="status" aria-live="polite">{message}</p>
    </div>
  );
}
