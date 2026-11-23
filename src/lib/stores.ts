"use client";

import { useSyncExternalStore } from "react";

/* ---------- Saved items (localStorage) ---------- */
const SAVED_KEY = "vibes:saved";
const EMPTY: string[] = [];
let savedCache: string[] | null = null;
const savedListeners = new Set<() => void>();

function readSaved(): string[] {
  if (savedCache) return savedCache;
  try {
    const v = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
    savedCache = Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    savedCache = [];
  }
  return savedCache;
}

function writeSaved(next: string[]) {
  savedCache = next;
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  } catch {}
  savedListeners.forEach((l) => l());
}

function subscribeSaved(cb: () => void) {
  savedListeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SAVED_KEY) {
      savedCache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    savedListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const savedKey = (slug: string, id: string) => `${slug}#${id}`;

export function useSaved() {
  const saved = useSyncExternalStore(subscribeSaved, readSaved, () => EMPTY);
  return {
    saved,
    isSaved: (k: string) => saved.includes(k),
    toggle: (k: string) => {
      const cur = readSaved();
      writeSaved(cur.includes(k) ? cur.filter((x) => x !== k) : [k, ...cur]);
    },
    clear: () => writeSaved([]),
  };
}

/* ---------- Theme ---------- */
type Theme = "dark" | "light";
function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(
    subscribeTheme,
    () => (document.documentElement.dataset.theme === "light" ? "light" : "dark"),
    () => "dark",
  );
  const setTheme = (t: Theme) => {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("theme", t);
    } catch {}
  };
  return { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}

/* ---------- Mounted flag (avoid hydration mismatch for client-only UI) ---------- */
const noop = () => () => {};
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/* ---------- Command palette open event ---------- */
export const PALETTE_EVENT = "vibes:open-palette";
export function openPalette(query = "") {
  window.dispatchEvent(new CustomEvent(PALETTE_EVENT, { detail: query }));
}
