"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { SearchEntry } from "@/lib/content";
import { outbound } from "@/lib/site";
import { loadIndex } from "./CommandPalette";
import { IconArrowUpRight, IconSearch } from "./icons";

export function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [index, setIndex] = useState<SearchEntry[] | null>(null);

  useEffect(() => {
    loadIndex().then(setIndex);
  }, []);

  const results = useMemo(() => {
    if (!index) return [];
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return index.filter((e) => e.t === "list");
    return index.filter((e) => terms.every((t) => e.k.includes(t))).slice(0, 100);
  }, [q, index]);

  return (
    <>
      <form
        role="search"
        className="relative mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(`/search?q=${encodeURIComponent(q)}`);
        }}
      >
        <label htmlFor="search-q" className="sr-only">Search</label>
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
        <input
          id="search-q"
          type="search"
          name="q"
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
          placeholder="uncensored, gpu, credits, coding agent…"
          className="h-14 w-full rounded-2xl border border-line-2 bg-surface pl-11 pr-4 text-base text-ink outline-none placeholder:text-faint focus:border-brand/60"
        />
      </form>
      <p className="mt-4 text-sm text-muted" aria-live="polite">{index ? `${results.length} results` : "Loading…"}</p>
      <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {results.map((e) => (
          <li key={`${e.slug}-${e.id ?? "list"}`} className="flex items-center gap-3 p-4">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: e.accent }} />
            <div className="min-w-0 flex-1">
              <Link href={e.t === "list" ? `/${e.slug}` : `/${e.slug}#${e.id}`} className="font-medium text-ink hover:underline">{e.name}</Link>
              <p className="truncate text-xs text-muted">{e.t === "list" ? `${e.unit && e.unit !== "picks" ? "Guide" : "List"} · ${e.count} ${e.unit ?? "picks"}` : `${e.list}${e.badge ? ` · ${e.badge}` : ""}`}</p>
            </div>
            {e.url && (
              <a href={outbound(e.url)} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs text-ink-2 hover:text-ink">
                Open <IconArrowUpRight width={12} height={12} />
              </a>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
