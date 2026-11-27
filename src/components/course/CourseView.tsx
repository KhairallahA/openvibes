import "katex/dist/katex.min.css";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Guide } from "@/lib/guides";
import { formatDate, hostOf } from "@/lib/content";
import { site } from "@/lib/site";
import { ShareBar } from "../ShareBar";
import { ListExplorer } from "../ListExplorer";
import { CodeCopy } from "../CodeCopy";
import { IconLink, IconShield } from "../icons";
import { Interactive } from "./Interactive";
import { CourseMapStatus, CourseProgressBar, CourseToc, MarkComplete, Quiz, type TocChapter } from "./CourseBits";

/** Long-form interactive course layout for guides with `layout: course`. Server component; interactives hydrate lazily. */
export function CourseView({ guide }: { guide: Guide }) {
  const verifiedLabel = formatDate(guide.verified);
  const chapters = guide.chapters;
  const toc: TocChapter[] = chapters.map((c) => ({ id: c.id, number: c.number, title: c.short, phase: c.phase, quiz: c.quiz.length, interactive: c.interactive?.title }));
  const answers = Object.fromEntries(chapters.map((c) => [c.id, c.quiz.map((q) => q.answer)]));
  const hours = Math.round(chapters.reduce((n, c) => n + c.minutes, 0) / 60);
  const courses = guide.resources.filter((r) => r.tags.includes("course")).length;
  const phases = [...new Set(chapters.map((c) => c.phase))];
  const extra = [
    { id: "free-courses", title: `All ${guide.resources.length} free courses & books` },
    ...(guide.bodyHtml ? [{ id: "notes", title: "FAQ" }] : []),
  ];
  const shareText = guide.hook ?? `${guide.title} (${guide.countLabel})`;

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
          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="animate-rise">
              <p className="inline-flex flex-wrap items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs text-muted backdrop-blur">
                <span className="font-mono text-accent-fg">{guide.icon}</span>
                Free interactive course · {guide.category}
                <span className="font-semibold text-accent-fg lg:hidden">· {guide.interactiveCount} interactives</span>
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-6xl">{guide.title}</h1>
              {guide.lede && <p className="mt-5 max-w-2xl text-lg text-ink-2">{guide.lede}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <IconShield width={15} height={15} className="text-accent-fg" /> Checked {verifiedLabel}
                </span>
                <span>{chapters.length} chapters</span>
                <span>{guide.quizCount} quiz questions</span>
                <span>≈ {hours} h</span>
                <span>$0, no signup</span>
              </div>
              <div className="mt-6">
                <ShareBar path={`/${guide.slug}`} text={shareText} />
              </div>
            </div>
            <div className="hidden animate-rise rounded-3xl border border-line bg-surface/70 p-6 text-center backdrop-blur lg:block lg:min-w-56">
              <p className="font-display text-7xl font-extrabold leading-none tracking-tight text-accent-fg tabular-nums sm:text-8xl">{guide.interactiveCount}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-faint">live simulations</p>
            </div>
          </div>
          {guide.stats.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-4 sm:gap-3">
              {guide.stats.map((s) => (
                <div key={s.label} className="min-w-0 rounded-2xl border border-line bg-surface/60 p-3 backdrop-blur sm:p-4">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{s.value}</span>
                    <span className="block text-xs leading-snug text-ink-2 sm:text-sm">{s.label}</span>
                    {s.note && <span className="mt-1 hidden text-xs text-faint sm:block">{s.note}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-4">
            <CourseProgressBar slug={guide.slug} chapters={toc} answers={answers} variant="hero" />
          </div>
        </div>
      </section>

      {/* Roadmap: the 16 steps, in order */}
      <section aria-labelledby="map-title" className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-fg">The roadmap</p>
        <h2 id="map-title" className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {chapters.length} steps, in order
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">Each step: a plain-English lesson, the key equations, a live simulation you can poke, a worked example, runnable code, a quiz, and the best free course to go deeper.</p>
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-4">
          {phases.map((ph) => (
            <div key={ph}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">{ph}</p>
              <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {chapters
                  .filter((c) => c.phase === ph)
                  .map((c) => (
                    <li key={c.id}>
                      <a href={`#${c.id}`} className="group flex items-start gap-3 rounded-2xl border border-line bg-surface p-3 transition hover:-translate-y-0.5 hover:border-line-2">
                        <span className="font-mono text-xs text-accent-fg tabular-nums">{c.number}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-snug text-ink">{c.short}</span>
                          {c.interactive && <span className="mt-0.5 block truncate text-[11px] text-faint">▶ {c.interactive.title}</span>}
                        </span>
                        <CourseMapStatus slug={guide.slug} id={c.id} />
                      </a>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-4 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="no-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8">
            <CourseProgressBar slug={guide.slug} chapters={toc} answers={answers} variant="toc" />
            <CourseToc slug={guide.slug} chapters={toc} extra={extra} />
          </div>
        </aside>

        <div className="min-w-0">
          <CourseProgressBar slug={guide.slug} chapters={toc} answers={answers} variant="bar" />
          <details className="group mb-8 rounded-2xl border border-line bg-surface/70 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
              Contents · {chapters.length} chapters
              <span className="text-faint transition group-open:rotate-180">⌄</span>
            </summary>
            <div className="border-t border-line px-2 py-2">
              <CourseToc slug={guide.slug} chapters={toc} extra={extra} />
            </div>
          </details>

          <div className="space-y-24">
            {chapters.map((c, i) => (
              <section key={c.id} id={c.id} aria-labelledby={`${c.id}-title`} className="scroll-mt-28">
                <header className="border-b border-line pb-5">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-fg">
                    Chapter {c.number}
                    <span className="text-faint">
                      {" "}
                      · {c.phase} · {c.minutes} min
                    </span>
                  </p>
                  <h2 id={`${c.id}-title`} className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                    <a href={`#${c.id}`} className="hover:text-accent-fg">
                      {c.title}
                    </a>
                  </h2>
                  <p className="guide-inline mt-3 max-w-2xl text-lg text-ink-2" dangerouslySetInnerHTML={{ __html: c.summaryHtml }} />
                </header>

                <div className="prose-v course-prose mt-6 max-w-3xl" dangerouslySetInnerHTML={{ __html: c.bodyHtml }} />

                {c.equations.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Key equations</h3>
                    <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3">
                      {c.equations.map((f) => (
                        <article key={f.id} id={f.id} className="scroll-mt-28 rounded-2xl border border-line bg-surface p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-display text-base font-bold tracking-tight">
                              <span className="mr-2 font-mono text-xs text-accent-fg tabular-nums">{f.number}</span>
                              {f.name}
                            </h4>
                            <a href={`#${f.id}`} aria-label={`Link to ${f.name}`} className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-faint transition hover:border-line-2 hover:text-ink">
                              <IconLink width={12} height={12} />
                            </a>
                          </div>
                          <div className="math-block mt-3 overflow-x-auto rounded-xl border border-line bg-bg/70 px-3 py-3 sm:px-5" dangerouslySetInnerHTML={{ __html: f.html }} />
                          <p className="guide-inline mt-3 text-[15px] leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: f.meansHtml }} />
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {c.interactive && (
                  <figure className="mt-10" aria-labelledby={`${c.id}-try`}>
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                      <h3 id={`${c.id}-try`} className="font-display text-xl font-bold tracking-tight">
                        <span className="mr-2 rounded-full bg-accent px-2 py-0.5 align-middle text-[11px] font-semibold uppercase tracking-wider text-brand-ink">Try it</span>
                        {c.interactive.title}
                      </h3>
                    </div>
                    <Interactive name={c.interactive.name} />
                    {c.interactive.captionHtml && <figcaption className="guide-inline mt-3 text-sm leading-relaxed text-muted" dangerouslySetInnerHTML={{ __html: c.interactive.captionHtml }} />}
                  </figure>
                )}

                {c.example && (
                  <div className="mt-10 rounded-2xl bg-accent/8 p-4 ring-1 ring-inset ring-accent/20 sm:p-6">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-fg">Worked example · {c.example.title}</h3>
                    <div className="prose-v course-prose mt-2" dangerouslySetInnerHTML={{ __html: c.example.bodyHtml }} />
                  </div>
                )}

                {c.code && (
                  <div className="mt-10">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">{c.code.title}</h3>
                    <div className="mt-3 overflow-hidden rounded-xl border border-line bg-bg/80">
                      <div className="flex items-center justify-between border-b border-line py-1.5 pl-4 pr-1.5">
                        <span className="font-mono text-[11px] text-faint">{c.code.lang}</span>
                        <CodeCopy code={c.code.code} slug={guide.slug} id={`${c.id}-code`} />
                      </div>
                      <pre className="max-h-[28rem] overflow-auto px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-ink-2">
                        <code>{c.code.code}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {c.quiz.length > 0 && (
                  <div className="mt-10">
                    <Quiz slug={guide.slug} chapter={c.id} questions={c.quiz} />
                  </div>
                )}

                {(c.deeper.length > 0 || c.buildHtml) && (
                  <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
                    {c.deeper.length > 0 && (
                      <div>
                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Go deeper, free</h3>
                        <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2">
                          {c.deeper.map((r) => (
                            <li key={r.id}>
                              <a href={r.url} target="_blank" rel="noopener" className="group flex items-start gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 transition hover:border-line-2">
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-semibold text-ink group-hover:underline group-hover:decoration-accent group-hover:underline-offset-2">{r.name}</span>
                                  <span className="block truncate text-xs text-faint">
                                    {r.badge ? `${r.badge} · ` : ""}
                                    {hostOf(r.url)}
                                  </span>
                                </span>
                                <span aria-hidden className="text-faint transition group-hover:text-ink">
                                  ↗
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {c.buildHtml && (
                      <div className="rounded-2xl border border-dashed border-line-2 p-4">
                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-fg">Build</h3>
                        <p className="guide-inline mt-2 text-sm leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: c.buildHtml }} />
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 border-t border-line pt-6">
                  <MarkComplete slug={guide.slug} id={c.id} next={chapters[i + 1] ? { id: chapters[i + 1].id, title: chapters[i + 1].short } : undefined} />
                </div>
              </section>
            ))}
          </div>

          <section id="free-courses" className="mt-24 scroll-mt-24" aria-labelledby="refs-title">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-fg">$0 · go deeper</p>
            <h2 id="refs-title" className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {guide.resources.length} free courses, books & docs
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              {courses} full free courses (MIT, Stanford, ETH Zurich, Penn, Berkeley, Hugging Face, NVIDIA…) plus free textbooks and official docs, grouped by chapter. Every link checked {verifiedLabel}. “Free to audit” means the lectures are free; only certificates cost money.
            </p>
            <div className="mt-6">
              <ListExplorer slug={guide.slug} items={guide.resources} categories={guide.resourceCategories} tags={guide.resourceTags} verifiedLabel={verifiedLabel} />
            </div>
          </section>

          {guide.bodyHtml && (
            <section id="notes" className="mt-16 scroll-mt-24 rounded-3xl border border-line p-6 sm:p-10">
              <div className="prose-v" dangerouslySetInnerHTML={{ __html: guide.bodyHtml }} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
