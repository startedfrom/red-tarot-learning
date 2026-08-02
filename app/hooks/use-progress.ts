"use client";

import { useContext } from "react";
import { ProgressContext } from "../components/ProgressProvider";

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) {
    throw new Error("useProgress must be used inside ProgressProvider");
  }
  return value;
}
