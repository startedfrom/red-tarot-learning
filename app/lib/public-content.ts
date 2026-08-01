import { getLearningSet } from "../data/learning-sets";

export const PUBLIC_READING_IDS = [
  "love-three-001",
  "love-three-002",
  "love-three-003",
  "love-three-004",
  "love-three-005",
  "love-three-006",
  "love-three-007",
  "love-three-008",
  "love-three-009",
  "love-three-010",
  "money-three-001",
  "money-three-002",
  "money-three-003",
  "money-three-004",
  "money-three-005",
  "money-three-006",
  "money-three-007",
  "money-three-008",
  "money-three-009",
  "money-three-010",
  "health-three-001",
  "health-three-002",
  "health-three-003",
  "health-three-004",
  "health-three-005",
  "health-three-006",
  "health-three-007",
  "health-three-008",
  "health-three-009",
  "health-three-010",
] as const;

const publicReadingIds = new Set<string>(PUBLIC_READING_IDS);

function requireReading(id: string) {
  const reading = getLearningSet(id);
  if (!reading) throw new Error(`Missing curated reading: ${id}`);
  return reading;
}

export const publicReadings = PUBLIC_READING_IDS.map(requireReading);

export function getPublicReading(id: string) {
  return publicReadingIds.has(id) ? getLearningSet(id) : undefined;
}
