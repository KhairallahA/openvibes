"use client";

import Link from "next/link";
import { useSaved } from "@/lib/stores";
import { IconBookmark } from "./icons";

export function SavedLink() {
  const { saved } = useSaved();
  return (
    <Link
      href="/saved"
      aria-label={`Saved items (${saved.length})`}
      className="relative grid size-9 place-items-center rounded-full border border-line text-muted transition hover:border-line-2 hover:text-ink"
    >
      <IconBookmark filled={saved.length > 0} className={saved.length ? "text-brand" : ""} />
      {saved.length > 0 && (
        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 font-mono text-[10px] font-bold text-brand-ink">
          {saved.length}
        </span>
      )}
    </Link>
  );
}
