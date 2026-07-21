import type { Metadata } from "next";
import { AppShell } from "../components/AppShell";
import { CardLibrary } from "../components/CardLibrary";

export const metadata: Metadata = {
  title: "78장 카드 도감",
};

export default function CardsPage() {
  return (
    <AppShell active="cards">
      <CardLibrary />
    </AppShell>
  );
}
