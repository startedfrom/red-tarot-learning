import type { Metadata } from "next";
import { AppShell } from "../components/AppShell";
import { HomeDashboard } from "../components/HomeDashboard";

export const metadata: Metadata = {
  title: "내 학습",
  robots: { index: false, follow: false },
};

export default function MyLearningPage() {
  return <AppShell active="me"><HomeDashboard /></AppShell>;
}
