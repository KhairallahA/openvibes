"use client";

import { openPalette } from "@/lib/stores";
import { IconSearch } from "./icons";

export function HeroSearch() {
  return (
    <button
      type="button"
      onClick={() => openPalette()}
      className="group flex h-14 w-full items-center gap-3 rounded-2xl border border-line-2 bg-surface/80 px-5 text-left text-muted shadow-[0_20px_60px_-30px_var(--brand)] backdrop-blur transition cursor-pointer hover:border-brand/50"
    >
      <IconSearch width={18} height={18} className="text-faint group-hover:text-brand" />
      <span className="flex-1 truncate">Search models, credits, tools… try “uncensored” or “gpu”</span>
      <kbd className="hidden rounded-md border border-line px-2 py-1 font-mono text-xs text-faint sm:block">⌘K</kbd>
    </button>
  );
}
