import type { Metadata } from "next";
import { AppShell } from "./components/AppShell";
import { HomeDashboard } from "./components/HomeDashboard";

export const metadata: Metadata = {
  title: "오늘의 학습",
};

export default function HomePage() {
  return (
    <AppShell active="home">
      <HomeDashboard />
    </AppShell>
  );
}
