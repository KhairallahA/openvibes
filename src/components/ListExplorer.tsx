"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { Item } from "@/lib/content";
import { savedKey, useSaved } from "@/lib/stores";
import { ItemCard } from "./ItemCard";
import { IconGrid, IconRows, IconSearch, IconX, IconBookmark } from "./icons";

type Sort = "curated" | "az" | "saved";

export function ListExplorer({
  slug,
  items,
  categories,
  tags,
  verifiedLabel,
}: {
  slug: string;
  items: Item[];
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
  verifiedLabel: string;
}) {
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query);
  const [cat, setCat] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("curated");
  const [onlySaved, setOnlySaved] = useState(false);
  const [compact, setCompact] = useState(false);
  const { isSaved, saved } = useSaved();
  const inputRef = useRef<HTMLInputElement>(null);

  // Roadmap steps (and any other component) can pick a category: dispatch "vibes:filter" with { category }.
  useEffect(() => {
    const onFilter = (e: Event) => {
      const c = (e as CustomEvent<{ category?: string }>).detail?.category ?? null;
      setCat(c);
      setTag(null);
      setQuery("");
      setOnlySaved(false);
    };
    window.addEventListener("vibes:filter", onFilter);
    return () => window.removeEventListener("vibes:filter", onFilter);
  }, []);

  // "/" focuses the list search (like GitHub / X)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea|select/i.test(el.tagName) && !el.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const indexed = useMemo(
    () => items.map((it, i) => ({ it, i, hay: [it.name, it.description, it.category, it.badge ?? "", it.command ?? "", ...it.tags].join(" ").toLowerCase() })),
    [items],
  );

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const r = indexed.filter(({ it, hay }) => {
      if (cat && it.category !== cat) return false;
      if (tag && !it.tags.includes(tag)) return false;
      if (onlySaved && !isSaved(savedKey(slug, it.id))) return false;
      return terms.every((t) => hay.includes(t));
    });
    if (sort === "az") r.sort((a, b) => a.it.name.localeCompare(b.it.name));
    if (sort === "saved") r.sort((a, b) => Number(isSaved(savedKey(slug, b.it.id))) - Number(isSaved(savedKey(slug, a.it.id))) || a.i - b.i);
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexed, q, cat, tag, sort, onlySaved, saved, slug]);

  const savedHere = items.filter((it) => isSaved(savedKey(slug, it.id))).length;
  const filtered = Boolean(q || cat || tag || onlySaved);
  const reset = () => {
    setQuery("");
    setCat(null);
    setTag(null);
    setOnlySaved(false);
  };

  const chip = (active: boolean) =>
    `inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
      active ? "border-transparent bg-ink text-bg" : "border-line text-muted hover:border-line-2 hover:text-ink"
    }`;

  return (
    <section id="resources" aria-label="Explore the list" className="scroll-mt-20">
      <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-bg/80 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-3">
        <div className="flex gap-2">
          <label className="relative flex flex-1 items-center">
            <span className="sr-only">Search this list</span>
            <IconSearch className="pointer-events-none absolute left-3.5 text-faint" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${items.length} picks…`}
              className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-10 text-[15px] text-ink outline-none transition placeholder:text-faint focus:border-accent/60 focus:ring-4 focus:ring-accent/10"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 grid size-7 place-items-center rounded-lg text-faint cursor-pointer hover:text-ink">
                <IconX width={14} height={14} />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-3 hidden rounded-md border border-line px-1.5 font-mono text-[11px] text-faint sm:block">/</kbd>
            )}
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sort"
            className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink-2 outline-none focus:border-accent/60"
          >
            <option value="curated">Curated order</option>
            <option value="az">A → Z</option>
            <option value="saved">Saved first</option>
          </select>
          <div className="hidden overflow-hidden rounded-xl border border-line sm:flex" role="group" aria-label="Layout">
            <button type="button" onClick={() => setCompact(false)} aria-pressed={!compact} aria-label="Detailed cards" className={`grid w-10 place-items-center transition cursor-pointer ${!compact ? "bg-surface-2 text-ink" : "text-faint hover:text-ink"}`}>
              <IconGrid />
            </button>
            <button type="button" onClick={() => setCompact(true)} aria-pressed={compact} aria-label="Compact cards" className={`grid w-10 place-items-center transition cursor-pointer ${compact ? "bg-surface-2 text-ink" : "text-faint hover:text-ink"}`}>
              <IconRows />
            </button>
          </div>
        </div>

        <div className="no-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-0.5" role="group" aria-label="Filter by category">
          <button type="button" className={chip(!cat && !onlySaved)} onClick={() => { setCat(null); setOnlySaved(false); }}>
            All <span className="font-mono text-xs opacity-60">{items.length}</span>
          </button>
          {categories.map((c) => (
            <button key={c.name} type="button" className={chip(cat === c.name)} aria-pressed={cat === c.name} onClick={() => setCat(cat === c.name ? null : c.name)}>
              {c.name} <span className="font-mono text-xs opacity-60">{c.count}</span>
            </button>
          ))}
          <button type="button" className={chip(onlySaved)} aria-pressed={onlySaved} onClick={() => setOnlySaved(!onlySaved)}>
            <IconBookmark width={13} height={13} filled={onlySaved} /> Saved <span className="font-mono text-xs opacity-60">{savedHere}</span>
          </button>
        </div>

        {tags.length > 1 && (
          <div className="no-scrollbar -mx-1 mt-2 flex items-center gap-1.5 overflow-x-auto px-1" role="group" aria-label="Filter by tag">
            <span className="shrink-0 text-[11px] uppercase tracking-widest text-faint">tags</span>
            {tags.map((t) => (
              <button
                key={t.name}
                type="button"
                aria-pressed={tag === t.name}
                onClick={() => setTag(tag === t.name ? null : t.name)}
                className={`shrink-0 rounded-md border px-2 py-0.5 text-xs transition cursor-pointer ${tag === t.name ? "border-accent/50 bg-accent/15 text-accent-fg" : "border-line text-muted hover:text-ink"}`}
              >
                #{t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-muted" aria-live="polite">
        <p>
          Showing <span className="font-semibold text-ink">{results.length}</span> of {items.length}
        </p>
        {filtered && (
          <button type="button" onClick={reset} className="text-accent-fg cursor-pointer hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {results.length ? (
        <div className={`mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 ${compact ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {results.map(({ it, i }) => (
            <ItemCard key={it.id} item={it} index={i} slug={slug} q={q} compact={compact} verifiedLabel={verifiedLabel} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line-2 p-10 text-center">
          <p className="font-display text-xl font-bold">Nothing matches that.</p>
          <p className="mt-1 text-sm text-muted">{onlySaved ? "You haven't saved anything in this list yet." : "Try a shorter word, or search every list with ⌘K."}</p>
          <button type="button" onClick={reset} className="mt-4 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg cursor-pointer">
            Show everything
          </button>
        </div>
      )}
    </section>
  );
}
