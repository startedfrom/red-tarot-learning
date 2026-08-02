export const CONSENT_STORAGE_KEY = "red-tarot-consent-v1";

export type ConsentChoice = "essential" | "denied" | "granted";

export type StoredConsent = {
  version: number;
  choice: ConsentChoice;
  updatedAt: string;
};

const PUBLISHER_ID = /^ca-pub-(\d{16})$/;
const SLOT_ID = /^\d{6,20}$/;
const GA4_ID = /^G-[A-Z0-9]{6,20}$/;

export function adsenseAccountMeta(publisherId?: string): string | null {
  return PUBLISHER_ID.test(publisherId ?? "") ? publisherId! : null;
}

function defaultConsent(version: number): StoredConsent {
  return { version, choice: "essential", updatedAt: "" };
}

export function parseConsent(raw: string | null, version: number): StoredConsent {
  if (!raw) return defaultConsent(version);
  try {
    const value = JSON.parse(raw) as Partial<StoredConsent>;
    if (
      value.version !== version ||
      !["denied", "granted"].includes(value.choice ?? "") ||
      typeof value.updatedAt !== "string" ||
      Number.isNaN(Date.parse(value.updatedAt))
    ) {
      return defaultConsent(version);
    }
    return value as StoredConsent;
  } catch {
    return defaultConsent(version);
  }
}

export function serializeConsent(
  choice: Exclude<ConsentChoice, "essential">,
  version: number,
  updatedAt = new Date().toISOString(),
) {
  return JSON.stringify({ version, choice, updatedAt } satisfies StoredConsent);
}

export function canShowAds({
  consent,
  publisherId,
  slotId,
  approved,
}: {
  consent: ConsentChoice;
  publisherId?: string;
  slotId?: string;
  approved: boolean;
}) {
  return (
    canLoadAds({ consent, publisherId, approved }) &&
    SLOT_ID.test(slotId ?? "")
  );
}

export function canLoadAds({
  consent,
  publisherId,
  approved,
}: {
  consent: ConsentChoice;
  publisherId?: string;
  approved: boolean;
}) {
  return (
    consent === "granted" &&
    approved &&
    PUBLISHER_ID.test(publisherId ?? "")
  );
}

export function adsTxtLine(publisherId?: string): string | null {
  const match = PUBLISHER_ID.exec(publisherId ?? "");
  return match
    ? `google.com, pub-${match[1]}, DIRECT, f08c47fec0942fa0\n`
    : null;
}

export function canLoadAnalytics(
  consent: ConsentChoice,
  measurementId?: string,
) {
  return consent === "granted" && GA4_ID.test(measurementId ?? "");
}
