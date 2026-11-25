"use client";

import { useEffect, useState } from "react";

type TocItem = { id: string; number: string; title: string; count: number };

/** Sticky table of contents with scroll-spy (desktop). */
export function GuideToc({ items, extra }: { items: TocItem[]; extra?: { id: string; title: string }[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const els = [...items, ...(extra ?? [])].map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items, extra]);

  const link = (id: string, on: boolean) =>
    `group flex items-baseline gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] leading-snug transition ${
      on ? "bg-accent/12 text-ink" : "text-muted hover:bg-surface-2 hover:text-ink"
    }`;

  return (
    <nav aria-label="Contents" className="text-sm">
      <p className="px-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">Contents</p>
      <ol className="mt-3 space-y-0.5">
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className={link(i.id, active === i.id)} aria-current={active === i.id ? "true" : undefined}>
              <span className={`font-mono text-[11px] tabular-nums ${active === i.id ? "text-accent-fg" : "text-faint"}`}>{i.number}</span>
              <span className="flex-1">{i.title}</span>
              <span className="font-mono text-[11px] text-faint">{i.count}</span>
            </a>
          </li>
        ))}
        {extra?.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className={link(i.id, active === i.id)}>
              <span className="font-mono text-[11px] text-faint">→</span>
              <span className="flex-1">{i.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
