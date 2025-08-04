import type { ViewProgress } from "../../domain/progress";

export async function getViewProgress(): Promise<ViewProgress> {
  return (await fetch("/api/view-progress")).json();
}
