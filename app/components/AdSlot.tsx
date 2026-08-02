"use client";

import { useEffect } from "react";
import { canShowAds } from "../lib/consent";
import { useConsent } from "./ConsentManager";

type Placement = "home" | "card" | "article" | "completion";

const slotIds: Record<Placement, string | undefined> = {
  home: process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT_ID,
  card: process.env.NEXT_PUBLIC_ADSENSE_CARD_SLOT_ID,
  article: process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT_ID,
  completion: process.env.NEXT_PUBLIC_ADSENSE_COMPLETION_SLOT_ID,
};

export function AdSlot({ placement }: { placement: Placement }) {
  const { choice } = useConsent();
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const slotId = slotIds[placement];
  const enabled = canShowAds({
    consent: choice,
    publisherId,
    slotId,
    approved: process.env.NEXT_PUBLIC_ADSENSE_APPROVED === "true",
  });

  useEffect(() => {
    if (!enabled) return;
    try {
      const adsWindow = window as Window & { adsbygoogle?: unknown[] };
      adsWindow.adsbygoogle ??= [];
      adsWindow.adsbygoogle.push({});
    } catch {
      // Ad blockers and network failures must never block the content.
    }
  }, [enabled, placement]);

  if (!enabled || !publisherId || !slotId) return null;
  return (
    <aside className={`ad-slot ad-slot-${placement}`} aria-label="광고">
      <span>광고</span>
      <ins
        className="adsbygoogle"
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
