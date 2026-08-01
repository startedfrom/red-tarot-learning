"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { allCards, type TarotCard } from "../data/cards";
import { TarotCardVisual } from "./TarotCardVisual";

export type CardFilter = "all" | "major" | "wands" | "cups" | "swords" | "pentacles";

const filters: { id: CardFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "major", label: "메이저" },
  { id: "wands", label: "완드" },
  { id: "cups", label: "컵" },
  { id: "swords", label: "소드" },
  { id: "pentacles", label: "펜타클" },
];

const pageSize = 12;

function matchesFilter(card: TarotCard, filter: CardFilter) {
  if (filter === "all") return true;
  if (filter === "major") return card.arcana === "major";
  return card.id.endsWith(`of-${filter}`);
}

export function CardLibrary({ initialFilter = "all" }: { initialFilter?: CardFilter }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CardFilter>(initialFilter);
  const [page, setPage] = useState(0);

  const filteredCards = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("ko");

    return allCards.filter((card) => {
      if (!matchesFilter(card, filter)) return false;
      if (!keyword) return true;

      return [
        card.nameKo,
        card.nameEn,
        card.coreVerb,
        card.coreMeaning,
        ...card.keywords,
      ]
        .join(" ")
        .toLocaleLowerCase("ko")
        .includes(keyword);
    });
  }, [filter, query]);

  const pageCount = Math.max(1, Math.ceil(filteredCards.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleCards = filteredCards.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize,
  );

  return (
    <section className="card-library" aria-labelledby="library-title">
      <header className="library-heading">
        <div>
          <span className="eyebrow">ALL 78 CARDS</span>
          <h1 id="library-title">78장 카드 도감</h1>
          <p>이름이나 기억나는 뜻을 입력하면 바로 찾을 수 있어요.</p>
        </div>
        <span className="library-count">{filteredCards.length}<small>장</small></span>
      </header>

      <div className="library-tools">
        <label className="card-search">
          <Search aria-hidden="true" />
          <span className="sr-only">카드 검색</span>
          <input
            type="search"
            value={query}
            placeholder="카드 이름, 영문명, 키워드 검색"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
          />
        </label>
        <div className="card-filters" aria-label="카드 종류">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={filter === item.id ? "is-active" : ""}
              onClick={() => {
                setFilter(item.id);
                setPage(0);
              }}
              aria-pressed={filter === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {visibleCards.length ? (
        <div className="library-grid" aria-live="polite">
          {visibleCards.map((card) => (
            <Link className="library-card" href={`/cards/${card.id}`} key={card.id}>
              <TarotCardVisual card={card} size="small" />
              <span>
                <strong>{card.nameKo}</strong>
                <small>{card.coreVerb}</small>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="library-empty" role="status">
          <strong>찾는 카드가 없어요.</strong>
          <span>이름을 짧게 쓰거나 다른 종류를 골라보세요.</span>
        </div>
      )}

      <nav className="library-pagination" aria-label="카드 검색 결과 페이지">
        <button
          type="button"
          onClick={() => setPage((value) => Math.max(0, value - 1))}
          disabled={currentPage === 0}
          aria-label="이전 카드 목록"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <span>{currentPage + 1} / {pageCount}</span>
        <button
          type="button"
          onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
          disabled={currentPage >= pageCount - 1}
          aria-label="다음 카드 목록"
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </nav>
    </section>
  );
}
