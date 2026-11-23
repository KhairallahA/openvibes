import type { Metadata } from "next";
import { SavedView } from "@/components/SavedView";

export const metadata: Metadata = {
  title: "Saved",
  description: "Picks you bookmarked on this device.",
  robots: { index: false },
};

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-faint">Only on this device</p>
      <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Your saved picks</h1>
      <p className="mt-3 max-w-xl text-muted">Tap the bookmark on any card to keep it here. Saved in your browser, no account needed.</p>
      <SavedView />
    </div>
  );
}
