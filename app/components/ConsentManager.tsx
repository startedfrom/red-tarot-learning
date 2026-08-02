"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  CONSENT_STORAGE_KEY,
  parseConsent,
  serializeConsent,
  type ConsentChoice,
} from "../lib/consent";

type ConsentContextValue = {
  choice: ConsentChoice;
  choose: (choice: "denied" | "granted") => void;
  reopen: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function consentVersion() {
  const parsed = Number(process.env.NEXT_PUBLIC_CONSENT_VERSION ?? "1");
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function updateGoogleConsent(choice: ConsentChoice) {
  const trackingWindow = window as Window & {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  };
  trackingWindow.dataLayer ??= [];
  trackingWindow.gtag ??= (...args: unknown[]) => {
    trackingWindow.dataLayer?.push(args);
  };
  const granted = choice === "granted" ? "granted" : "denied";
  trackingWindow.gtag("consent", "update", {
    ad_storage: granted,
    analytics_storage: granted,
    ad_user_data: granted,
    ad_personalization: granted,
  });
}

export function useConsent() {
  const value = useContext(ConsentContext);
  if (!value) throw new Error("useConsent must be used inside ConsentManager");
  return value;
}

export function ConsentManager({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ConsentChoice>("essential");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let stored = null;
      try {
        stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      } catch {
        stored = null;
      }
      const parsed = parseConsent(stored, consentVersion());
      setChoice(parsed.choice);
      updateGoogleConsent(parsed.choice);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function choose(next: "denied" | "granted") {
    try {
      window.localStorage.setItem(
        CONSENT_STORAGE_KEY,
        serializeConsent(next, consentVersion()),
      );
    } catch {
      // Consent still applies to this page even when storage is unavailable.
    }
    setChoice(next);
    updateGoogleConsent(next);
  }

  function reopen() {
    setChoice("essential");
    updateGoogleConsent("essential");
  }

  const value = useMemo(() => ({ choice, choose, reopen }), [choice]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {choice === "essential" ? (
        <section className="consent-banner" role="dialog" aria-modal="false" aria-labelledby="consent-title">
          <div>
            <strong id="consent-title">쿠키와 광고 설정</strong>
            <p>필수 저장은 학습 기록에만 사용합니다. 동의하면 구글 광고와 방문 통계를 불러오며, 거부해도 모든 콘텐츠를 무료로 볼 수 있어요. <Link href="/privacy">자세히 보기</Link></p>
          </div>
          <div className="consent-actions">
            <button type="button" className="secondary-button" onClick={() => choose("denied")}>필수만 사용</button>
            <button type="button" className="primary-button" onClick={() => choose("granted")}>동의하고 계속</button>
          </div>
        </section>
      ) : (
        <button className="consent-settings-button" type="button" onClick={reopen}>쿠키 설정</button>
      )}
    </ConsentContext.Provider>
  );
}
