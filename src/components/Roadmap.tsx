"use client";

import type { Step } from "@/lib/content";
import { IconArrowRight } from "./icons";

/** Ordered learning path. Each step can jump to its resources in the ListExplorer below. */
export function Roadmap({ steps, counts }: { steps: Step[]; counts: Record<string, number> }) {
  const phases: { name: string; steps: { s: Step; n: number }[] }[] = [];
  steps.forEach((s, i) => {
    const name = s.phase ?? "Steps";
    const last = phases[phases.length - 1];
    if (last && last.name === name) last.steps.push({ s, n: i + 1 });
    else phases.push({ name, steps: [{ s, n: i + 1 }] });
  });

  const jump = (category?: string) => {
    window.dispatchEvent(new CustomEvent("vibes:filter", { detail: { category } }));
    document.getElementById("resources")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="roadmap" aria-labelledby="roadmap-title" className="mb-14 scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-fg">The roadmap</p>
          <h2 id="roadmap-title" className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {steps.length} steps, in order
          </h2>
        </div>
        <p className="max-w-md text-sm text-muted">
          {phases.length} phases. Do them in order, finish each step by building its project, then tap a step to see its free resources.
        </p>
      </div>

      <ol className="no-scrollbar -mx-4 mt-6 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Phases">
        {phases.map((p, i) => (
          <li key={p.name} className="shrink-0 rounded-full border border-line px-3 py-1 text-xs text-muted">
            <span className="font-mono text-accent-fg">{i + 1}</span> {p.name}
            <span className="ml-1 font-mono opacity-60">
              {p.steps[0].n === p.steps[p.steps.length - 1].n ? String(p.steps[0].n).padStart(2, "0") : `${String(p.steps[0].n).padStart(2, "0")}–${String(p.steps[p.steps.length - 1].n).padStart(2, "0")}`}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 space-y-10">
        {phases.map((p, pi) => (
          <div key={p.name}>
            <h3 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-faint">
              <span>Phase {pi + 1} · {p.name}</span>
              <span className="h-px flex-1 bg-line" />
            </h3>
            <ol className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 lg:grid-cols-3">
              {p.steps.map(({ s, n }) => {
                const count = s.category ? (counts[s.category] ?? 0) : 0;
                return (
                  <li key={s.title} className="relative flex min-w-0 flex-col rounded-2xl border border-line bg-surface/70 p-5">
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-bg font-mono text-sm font-bold text-accent-fg tabular-nums">
                        {String(n).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-display text-lg font-bold leading-tight tracking-tight">{s.title}</h4>
                        {s.summary && <p className="mt-1.5 text-sm text-muted">{s.summary}</p>}
                      </div>
                    </div>
                    {s.topics.length > 0 && (
                      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Topics">
                        {s.topics.map((t) => (
                          <li key={t} className="rounded-md bg-bg px-2 py-0.5 text-xs text-ink-2">{t}</li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-auto pt-4">
                      {s.build && (
                        <p className="mb-3 text-sm">
                          <span className="font-semibold text-accent-fg">Build:</span> <span className="text-ink-2">{s.build}</span>
                        </p>
                      )}
                      {count > 0 && (
                        <button
                          type="button"
                          onClick={() => jump(s.category)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-accent-fg cursor-pointer"
                        >
                          {count} free resources <IconArrowRight width={14} height={14} />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
