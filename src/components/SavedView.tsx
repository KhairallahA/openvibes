"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { SearchEntry } from "@/lib/content";
import { useMounted, useSaved } from "@/lib/stores";
import { loadIndex } from "./CommandPalette";
import { IconArrowUpRight, IconBookmark } from "./icons";

export function SavedView() {
  const { saved, toggle, clear } = useSaved();
  const mounted = useMounted();
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  useEffect(() => {
    loadIndex().then(setIndex);
  }, []);

  const entries = useMemo(() => {
    if (!index) return [];
    const map = new Map(index.filter((e) => e.t === "item").map((e) => [`${e.slug}#${e.id}`, e]));
    return saved.map((k) => ({ k, e: map.get(k) })).filter((x): x is { k: string; e: SearchEntry } => Boolean(x.e));
  }, [index, saved]);

  if (!mounted || !index) return <p className="mt-10 text-sm text-faint">Loading…</p>;

  if (!entries.length)
    return (
      <div className="mt-10 rounded-3xl border border-dashed border-line-2 p-12 text-center">
        <IconBookmark width={28} height={28} className="mx-auto text-faint" />
        <p className="mt-4 font-display text-2xl font-bold">Nothing saved yet</p>
        <p className="mt-1 text-sm text-muted">Open any list and hit the bookmark on a card.</p>
        <Link href="/#lists" className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-bg">Browse lists</Link>
      </div>
    );

  return (
    <>
      <div className="mt-8 flex items-center justify-between text-sm text-muted">
        <p>{entries.length} saved</p>
        <button type="button" onClick={() => confirm("Remove all saved picks?") && clear()} className="hover:text-ink">Clear all</button>
      </div>
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {entries.map(({ k, e }) => (
          <li key={k} className="flex items-center gap-4 p-4">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: e.accent }} />
            <div className="min-w-0 flex-1">
              <Link href={`/${e.slug}#${e.id}`} className="font-medium text-ink hover:underline">{e.name}</Link>
              <p className="truncate text-xs text-muted">{e.list}{e.badge ? ` · ${e.badge}` : ""}</p>
            </div>
            {e.url && (
              <a href={e.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs text-ink-2 hover:text-ink">
                Open <IconArrowUpRight width={12} height={12} />
              </a>
            )}
            <button type="button" onClick={() => toggle(k)} aria-label={`Remove ${e.name}`} className="grid size-8 place-items-center rounded-full text-brand hover:bg-surface-2">
              <IconBookmark filled width={15} height={15} />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
