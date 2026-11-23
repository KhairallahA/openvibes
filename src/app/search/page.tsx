import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/SearchView";
import { pageMetadata } from "@/lib/seo";
import { totalItems } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Search every free AI goldmine",
  description: `Search ${totalItems()} verified free AI tools, models and credits across every OpenVibes list.`,
  path: "/search",
  noindex: true, // result pages stay out of the index; the page is the target of the WebSite SearchAction
});

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-faint">Every list · every pick</p>
      <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Search</h1>
      <Suspense fallback={<p className="mt-8 text-sm text-faint">Loading…</p>}>
        <SearchView />
      </Suspense>
    </div>
  );
}
