import "katex/dist/katex.min.css";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Guide } from "@/lib/guides";
import { formatDate } from "@/lib/content";
import { site } from "@/lib/site";
import { ShareBar } from "./ShareBar";
import { ListExplorer } from "./ListExplorer";
import { GuideToc } from "./GuideToc";
import { CodeCopy } from "./CodeCopy";
import { IconLink, IconShield } from "./icons";
import { CourseView } from "./course/CourseView";

export function GuideView({ guide }: { guide: Guide }) {
  if (guide.layout === "course") return <CourseView guide={guide} />;
  const verifiedLabel = formatDate(guide.verified);
  const toc = guide.sections.map((s) => ({ id: s.id, number: s.number, title: s.title, count: s.formulas.length }));
  const extra = [
    ...(guide.resources.length ? [{ id: "resources", title: `Free references (${guide.resources.length})` }] : []),
    ...(guide.bodyHtml ? [{ id: "notes", title: "Notes & FAQ" }] : []),
  ];
  const shareText = guide.hook ?? `${guide.title} (${guide.count} ${guide.unit})`;

  return (
    <div className="accent-scope" style={{ "--accent": guide.accent } as CSSProperties}>
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="glow pointer-events-none absolute -top-64 right-[-10%] size-[700px]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
          <nav aria-label="Breadcrumb" className="text-sm text-faint">
            <Link href="/" className="hover:text-ink">{site.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-muted">{guide.slug}</span>
          </nav>

          <div className="mt-6 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="animate-rise">
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs text-muted backdrop-blur">
                <span className="font-mono text-accent-fg">{guide.icon}</span>
                Free guide · {guide.category}
                <span className="font-semibold text-accent-fg lg:hidden">· {guide.count} {guide.unit}</span>
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-6xl">{guide.title}</h1>
              {guide.lede && <p className="mt-5 max-w-2xl text-lg text-ink-2">{guide.lede}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <IconShield width={15} height={15} className="text-accent-fg" /> Checked {verifiedLabel}
                </span>
                <span>{guide.sections.length} sections</span>
                <span>Copy-paste Python</span>
              </div>
              <div className="mt-6">
                <ShareBar path={`/${guide.slug}`} text={shareText} />
              </div>
            </div>
            <div className="hidden animate-rise rounded-3xl border border-line bg-surface/70 p-6 text-center backdrop-blur lg:block lg:min-w-56">
              <p className="font-display text-7xl font-extrabold leading-none tracking-tight text-accent-fg tabular-nums sm:text-8xl">{guide.count}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-faint">{guide.unit}</p>
            </div>
          </div>

          {guide.stats.length > 0 && (
            <dl className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
              {guide.stats.map((s) => (
                <div key={s.label} className="min-w-0 rounded-2xl border border-line bg-surface/60 p-3 backdrop-blur sm:p-4">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-display text-xl font-extrabold tracking-tight sm:inline sm:text-3xl">{s.value}</span>
                    <span className="block text-xs leading-snug text-ink-2 sm:ml-2 sm:inline sm:text-sm">{s.label}</span>
                    {s.note && <span className="mt-1 hidden text-xs text-faint sm:block">{s.note}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {guide.disclaimer && (
            <p className="mt-4 rounded-2xl border border-dashed border-line-2 px-4 py-3 text-xs leading-relaxed text-muted sm:text-sm">
              <span className="font-semibold text-ink-2">Not financial advice.</span> {guide.disclaimer.replace(/^Education only, not financial advice\.\s*/, "Education only. ")}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="no-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8">
            <GuideToc items={toc} extra={extra} />
          </div>
        </aside>

        <div className="min-w-0">
          <details className="group mb-8 rounded-2xl border border-line bg-surface/70 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
              Contents · {guide.sections.length} sections
              <span className="text-faint transition group-open:rotate-180">⌄</span>
            </summary>
            <ol className="grid gap-0.5 border-t border-line px-2 py-2 sm:grid-cols-2">
              {toc.map((i) => (
                <li key={i.id}>
                  <a href={`#${i.id}`} className="flex items-baseline gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-ink">
                    <span className="font-mono text-[11px] text-accent-fg">{i.number}</span>
                    <span className="flex-1">{i.title}</span>
                    <span className="font-mono text-[11px] text-faint">{i.count}</span>
                  </a>
                </li>
              ))}
              {extra.map((i) => (
                <li key={i.id}>
                  <a href={`#${i.id}`} className="flex items-baseline gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-ink">
                    <span className="font-mono text-[11px] text-faint">→</span>
                    <span className="flex-1">{i.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <div className="space-y-16">
            {guide.sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-24">
                <header className="border-b border-line pb-5">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-fg">
                    {s.number}
                    {s.kicker ? <span className="text-faint"> · {s.kicker}</span> : null}
                  </p>
                  <h2 id={`${s.id}-title`} className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                    <a href={`#${s.id}`} className="hover:text-accent-fg">{s.title}</a>
                  </h2>
                  {s.introHtml && <p className="guide-inline mt-3 max-w-2xl text-ink-2" dangerouslySetInnerHTML={{ __html: s.introHtml }} />}
                </header>

                <div className="mt-6 space-y-5">
                  {s.formulas.map((f) => (
                    <article key={f.id} id={f.id} className="scroll-mt-24 rounded-2xl border border-line bg-surface p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-lg font-bold leading-snug tracking-tight sm:text-xl">
                          <span className="mr-2 font-mono text-sm font-semibold text-accent-fg tabular-nums">{f.number}</span>
                          {f.name}
                        </h3>
                        <a href={`#${f.id}`} aria-label={`Link to ${f.name}`} className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-faint transition hover:border-line-2 hover:text-ink">
                          <IconLink width={14} height={14} />
                        </a>
                      </div>

                      <div className="math-block mt-4 overflow-x-auto rounded-xl border border-line bg-bg/70 px-3 py-4 sm:px-6" dangerouslySetInnerHTML={{ __html: f.html }} />

                      <dl className="guide-inline mt-5 grid gap-4 text-[15px] leading-relaxed sm:grid-cols-2">
                        <div className="min-w-0">
                          <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">What it means</dt>
                          <dd className="mt-1 text-ink-2" dangerouslySetInnerHTML={{ __html: f.meansHtml }} />
                        </div>
                        {f.botHtml && (
                          <div className="min-w-0">
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-fg">When a bot uses it</dt>
                            <dd className="mt-1 text-ink-2" dangerouslySetInnerHTML={{ __html: f.botHtml }} />
                          </div>
                        )}
                        {f.exampleHtml && (
                          <div className="min-w-0 rounded-xl bg-accent/8 px-3.5 py-2.5 ring-1 ring-inset ring-accent/20 sm:col-span-2">
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-fg">Example</dt>
                            <dd className="mt-1 text-ink-2" dangerouslySetInnerHTML={{ __html: f.exampleHtml }} />
                          </div>
                        )}
                      </dl>

                      {f.code && (
                        <div className="mt-5 overflow-hidden rounded-xl border border-line bg-bg/80">
                          <div className="flex items-center justify-between border-b border-line py-1.5 pl-4 pr-1.5">
                            <span className="font-mono text-[11px] text-faint">{f.lang}</span>
                            <CodeCopy code={f.code} slug={guide.slug} id={f.id} />
                          </div>
                          <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-ink-2"><code>{f.code}</code></pre>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {guide.resources.length > 0 && (
            <section className="mt-20" aria-labelledby="refs-title">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-fg">Go deeper</p>
              <h2 id="refs-title" className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {guide.resources.length} free references
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted">Courses, the original papers and the docs for every library used above. Every link checked {verifiedLabel}.</p>
              <div className="mt-6">
                <ListExplorer slug={guide.slug} items={guide.resources} categories={guide.resourceCategories} tags={guide.resourceTags} verifiedLabel={verifiedLabel} />
              </div>
            </section>
          )}

          {guide.bodyHtml && (
            <section id="notes" className="mt-16 scroll-mt-24 rounded-3xl border border-line p-6 sm:p-10">
              <div className="prose-v" dangerouslySetInnerHTML={{ __html: guide.bodyHtml }} />
              {guide.disclaimer && <p className="mt-8 border-t border-line pt-6 text-sm text-muted">{guide.disclaimer}</p>}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
