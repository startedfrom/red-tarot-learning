"use client";

import { useEffect } from "react";
import { canLoadAds } from "../lib/consent";
import { useConsent } from "./ConsentManager";

export function AdScripts() {
  const { choice } = useConsent();
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const enabled = canLoadAds({
    consent: choice,
    publisherId,
    approved: process.env.NEXT_PUBLIC_ADSENSE_APPROVED === "true",
  });

  useEffect(() => {
    if (!enabled || !publisherId) return;
    const id = "red-tarot-adsense";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
    document.head.appendChild(script);
    return () => script.remove();
  }, [enabled, publisherId]);

  return null;
}
