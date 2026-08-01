"use client";

import { ArrowRight, BookOpenText, Layers3, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { searchContent } from "../lib/search";

const labels = { card: "카드", guide: "가이드", reading: "조합" } as const;
const icons = { card: Search, guide: BookOpenText, reading: Layers3 } as const;

export function SiteSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchContent(query), [query]);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="site-search">
      <label className="site-search-input" htmlFor="site-search-query">
        <Search aria-hidden="true" />
        <span className="sr-only">카드와 타로 가이드 검색</span>
        <input
          id="site-search-query"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="카드 이름·키워드·궁금한 해석 검색"
          autoComplete="off"
        />
      </label>

      {hasQuery ? (
        <div className="site-search-results" aria-live="polite">
          {results.length ? (
            results.map((result) => {
              const Icon = icons[result.kind];
              return (
                <Link href={result.href} key={`${result.kind}-${result.id}`}>
                  <span className="search-result-icon"><Icon aria-hidden="true" /></span>
                  <span>
                    <small>{labels[result.kind]}</small>
                    <strong>{result.label}</strong>
                    <span>{result.description}</span>
                  </span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              );
            })
          ) : (
            <div className="site-search-empty" role="status">
              <strong>일치하는 내용을 찾지 못했어요.</strong>
              <span>카드 이름을 짧게 쓰거나 ‘역방향’, ‘3장 배열’처럼 검색해 보세요.</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
