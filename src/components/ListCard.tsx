import Link from "next/link";
import type { List } from "@/lib/content";
import { formatDate, hostOf } from "@/lib/content";
import { IconArrowRight } from "./icons";
import type { CSSProperties } from "react";

export function ListCard({ list, big = false }: { list: List; big?: boolean }) {
  const hosts = [...new Set(list.items.map((i) => hostOf(i.url)))].slice(0, 4);
  return (
    <Link
      href={`/${list.slug}`}
      style={{ "--accent": list.accent } as CSSProperties}
      className={`accent-scope group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--accent)_45%,transparent)] hover:shadow-[0_30px_80px_-40px_var(--accent)] ${big ? "sm:p-8" : ""}`}
    >
      <div className="glow pointer-events-none absolute -right-16 -top-16 size-56 opacity-60 transition duration-500 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <span className="grid size-11 place-items-center rounded-xl border border-line bg-bg font-mono text-lg font-bold text-accent-fg">{list.icon}</span>
        <span className="text-right">
          <span className="block font-display text-4xl font-extrabold leading-none tracking-tight text-accent-fg tabular-nums">{list.count}</span>
          <span className="text-[11px] uppercase tracking-widest text-faint">picks</span>
        </span>
      </div>
      <p className="relative mt-6 text-xs font-semibold uppercase tracking-widest text-faint">{list.category}</p>
      <h3 className={`relative mt-1 font-display font-bold leading-tight tracking-tight ${big ? "text-2xl sm:text-3xl" : "text-xl"}`}>{list.title}</h3>
      <p className="relative mt-2 line-clamp-2 text-sm text-muted">{list.description}</p>
      <div className="relative mt-auto pt-6">
        <div className="flex flex-wrap gap-1.5">
          {hosts.map((h) => (
            <span key={h} className="rounded-md bg-bg px-1.5 py-0.5 font-mono text-[10px] text-faint">{h}</span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-faint">
          <span>Verified {formatDate(list.verified)}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-ink transition group-hover:gap-2">
            Open list <IconArrowRight width={14} height={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
