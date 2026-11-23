import type { Metadata } from "next";
import { SavedView } from "@/components/SavedView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Your saved picks",
  description: "The free AI tools, models and credits you bookmarked on OpenVibes. Saved on this device, no account needed.",
  path: "/saved",
  noindex: true,
});

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
