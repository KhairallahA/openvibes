import Link from "next/link";
import type { CSSProperties } from "react";
import type { Guide } from "@/lib/guides";
import { IconArrowRight } from "./icons";

export function GuideCard({ guide }: { guide: Guide }) {
  const topics = guide.sections.slice(0, 8).map((s) => s.title);
  return (
    <Link
      href={`/${guide.slug}`}
      style={{ "--accent": guide.accent } as CSSProperties}
      className="accent-scope group relative grid overflow-hidden rounded-3xl border border-line bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--accent)_45%,transparent)] hover:shadow-[0_30px_80px_-40px_var(--accent)] sm:p-8 md:grid-cols-[1fr_auto] md:gap-10"
    >
      <div className="glow pointer-events-none absolute -right-16 -top-16 size-64 opacity-60 transition duration-500 group-hover:opacity-100" />
      <div className="relative min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-faint">
          <span className="mr-2 font-mono text-accent-fg">{guide.icon}</span>Guide · {guide.category}
        </p>
        <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{guide.title}</h3>
        <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-muted">{guide.description}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <span key={t} className="rounded-md bg-bg px-2 py-0.5 text-xs text-ink-2">{t}</span>
          ))}
          {guide.sections.length > topics.length && <span className="rounded-md px-2 py-0.5 text-xs text-faint">+{guide.sections.length - topics.length} more</span>}
        </div>
      </div>
      <div className="relative mt-6 flex items-end justify-between gap-6 md:mt-0 md:flex-col md:items-end">
        <span className="text-right">
          <span className="block font-display text-5xl font-extrabold leading-none tracking-tight text-accent-fg tabular-nums">{guide.count}</span>
          <span className="text-[11px] uppercase tracking-widest text-faint">{guide.unit}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          Read the guide <IconArrowRight width={15} height={15} className="transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
