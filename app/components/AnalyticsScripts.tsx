"use client";

import { useEffect } from "react";
import { canLoadAnalytics } from "../lib/consent";
import { useConsent } from "./ConsentManager";

export function AnalyticsScripts() {
  const { choice } = useConsent();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const enabled = canLoadAnalytics(choice, measurementId);

  useEffect(() => {
    if (!enabled || !measurementId) return;
    const trackingWindow = window as Window & {
      dataLayer?: unknown[][];
      gtag?: (...args: unknown[]) => void;
    };
    trackingWindow.dataLayer ??= [];
    trackingWindow.gtag ??= (...args: unknown[]) => trackingWindow.dataLayer?.push(args);
    trackingWindow.gtag("js", new Date());
    trackingWindow.gtag("config", measurementId, { anonymize_ip: true });

    const id = "red-tarot-ga4";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
    return () => script.remove();
  }, [enabled, measurementId]);

  return null;
}
