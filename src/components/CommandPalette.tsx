"use client";

import { outbound } from "@/lib/site";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchEntry } from "@/lib/content";
import { PALETTE_EVENT } from "@/lib/stores";
import { IconArrowRight, IconArrowUpRight, IconSearch } from "./icons";

let indexPromise: Promise<SearchEntry[]> | null = null;
export function loadIndex() {
  indexPromise ??= fetch("/search.json")
    .then((r) => r.json() as Promise<SearchEntry[]>)
    .catch(() => {
      indexPromise = null;
      return [];
    });
  return indexPromise;
}

function score(e: SearchEntry, terms: string[]) {
  let s = 0;
  const name = e.name.toLowerCase();
  for (const t of terms) {
    if (!e.k.includes(t)) return -1;
    if (name.startsWith(t)) s += 6;
    else if (name.includes(t)) s += 3;
    else s += 1;
  }
  return s + (e.t === "list" ? 2 : 0);
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<SearchEntry[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const show = useCallback((query = "") => {
    setQ(query);
    setActive(0);
    setOpen(true);
    loadIndex().then(setIndex);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) loadIndex().then(setIndex);
          return !o;
        });
      }
    };
    const onOpen = (e: Event) => show((e as CustomEvent<string>).detail ?? "");
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return index.filter((e) => e.t === "list").slice(0, 12);
    return index
      .map((e) => ({ e, s: score(e, terms) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 30)
      .map((x) => x.e);
  }, [q, index]);

  const go = (e: SearchEntry, external = false) => {
    setOpen(false);
    if (external && e.url) window.open(outbound(e.url), "_blank", "noopener");
    else router.push(e.t === "list" ? `/${e.slug}` : `/${e.slug}#${e.id}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-3 pt-[10vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search everything"
        className="w-full max-w-xl animate-rise overflow-hidden rounded-2xl border border-line-2 bg-surface shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <IconSearch className="text-faint" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && results[active]) {
                go(results[active], e.metaKey || e.ctrlKey);
              }
            }}
            placeholder="Search every list and every pick…"
            className="h-14 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-faint"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `pr-${active}` : undefined}
          />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint">esc</kbd>
        </div>
        <ul id="palette-results" ref={listRef} role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
          {!results.length && <li className="px-3 py-8 text-center text-sm text-muted">{index.length ? "No matches." : "Loading…"}</li>}
          {results.map((e, i) => (
            <li
              key={`${e.slug}-${e.id ?? "list"}`}
              id={`pr-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(e)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-surface-2" : ""}`}
            >
              <span className="size-2 shrink-0 rounded-full" style={{ background: e.accent }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{e.name}</p>
                <p className="truncate text-xs text-muted">
                  {e.t === "list" ? `List · ${e.count} picks` : `${e.list}${e.badge ? ` · ${e.badge}` : ""}`}
                </p>
              </div>
              {e.t === "item" && e.url ? (
                <button
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    go(e, true);
                  }}
                  aria-label={`Open ${e.name} in a new tab`}
                  className="grid size-7 place-items-center rounded-lg text-faint hover:bg-bg hover:text-ink cursor-pointer"
                >
                  <IconArrowUpRight width={14} height={14} />
                </button>
              ) : (
                <IconArrowRight width={14} height={14} className="text-faint" />
              )}
            </li>
          ))}
        </ul>
        <div className="flex gap-4 border-t border-line px-4 py-2 text-[11px] text-faint">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>⌘↵ open site</span>
        </div>
      </div>
    </div>
  );
}
