"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import {
  safeReadProgress,
  safeWriteProgress,
  toggleFavorite,
} from "../lib/progress";

export function FavoriteButton({ cardId }: { cardId: string }) {
  const [favorite, setFavorite] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setFavorite(safeReadProgress(window.localStorage).favoriteCardIds.includes(cardId));
      } catch {
        setMessage("이 브라우저에서는 즐겨찾기를 저장할 수 없어요.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [cardId]);

  function toggle() {
    try {
      const next = toggleFavorite(safeReadProgress(window.localStorage), cardId);
      const saved = safeWriteProgress(window.localStorage, next);
      setFavorite(next.favoriteCardIds.includes(cardId));
      setMessage(saved ? "즐겨찾기를 업데이트했어요." : "즐겨찾기를 저장하지 못했어요.");
    } catch {
      setMessage("이 브라우저에서는 즐겨찾기를 저장할 수 없어요.");
    }
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
