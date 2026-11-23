"use client";

import { openPalette } from "@/lib/stores";
import { IconSearch } from "./icons";

export function SearchButton() {
  return (
    <button
      type="button"
      onClick={() => openPalette()}
      className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface/60 pl-3 pr-2 text-sm text-muted transition hover:border-line-2 hover:text-ink"
      aria-label="Search everything"
    >
      <IconSearch />
      <span className="hidden sm:inline">Search everything</span>
      <kbd className="hidden rounded-md border border-line bg-bg px-1.5 py-0.5 font-mono text-[10px] text-faint sm:inline">⌘K</kbd>
    </button>
  );
}
