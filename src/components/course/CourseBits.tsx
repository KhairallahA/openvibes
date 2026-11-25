"use client";

import { useEffect, useState } from "react";
import { useMounted } from "@/lib/stores";
import { track } from "@/lib/track";
import { useCourse } from "./progress";

export type TocChapter = { id: string; number: string; title: string; phase: string; quiz: number; interactive?: string };
type Answers = Record<string, number[]>; // chapter → correct option per question

function score(p: ReturnType<typeof useCourse>["p"], answers: Answers) {
  let correct = 0, total = 0;
  for (const [ch, keys] of Object.entries(answers)) {
    total += keys.length;
    const a = p.quiz[ch] ?? {};
    keys.forEach((k, i) => (correct += a[i] === k ? 1 : 0));
  }
  return { correct, total };
}

/** Progress bar + numbers. `variant="hero"` shows a resume button; "bar" is the slim sticky mobile bar. */
export function CourseProgressBar({ slug, chapters, answers, variant }: { slug: string; chapters: TocChapter[]; answers: Answers; variant: "hero" | "bar" | "toc" }) {
  const { p, resetAll } = useCourse(slug);
  const mounted = useMounted();
  const done = mounted ? chapters.filter((c) => p.done.includes(c.id)).length : 0;
  const pct = Math.round((done / chapters.length) * 100);
  const q = mounted ? score(p, answers) : { correct: 0, total: Object.values(answers).reduce((n, a) => n + a.length, 0) };
  const resume = mounted ? chapters.find((c) => c.id === p.last) ?? chapters.find((c) => !p.done.includes(c.id)) : undefined;
  const started = mounted && (p.done.length > 0 || Object.keys(p.quiz).length > 0 || !!p.last);

  const bar = (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
      role="progressbar"
      aria-label="Course progress"
      aria-valuemin={0}
      aria-valuemax={chapters.length}
      aria-valuenow={done}
      aria-valuetext={`${done} of ${chapters.length} chapters complete`}
    >
      <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );

  if (variant === "bar")
    return (
      <div className="sticky top-[57px] z-30 -mx-4 mb-6 border-b border-line bg-bg/85 px-4 py-2 backdrop-blur-xl sm:top-[65px] sm:-mx-6 sm:px-6 lg:hidden">
        <div className="flex items-center justify-between gap-3 text-xs text-muted">
          <span>
            <span className="font-semibold text-ink tabular-nums">{done}</span>/{chapters.length} chapters · quiz <span className="tabular-nums">{q.correct}/{q.total}</span>
          </span>
          {resume && started && (
            <a href={`#${resume.id}`} className="shrink-0 font-semibold text-accent-fg">
              Resume {resume.number} →
            </a>
          )}
        </div>
        <div className="mt-1.5">{bar}</div>
      </div>
    );

  if (variant === "toc")
    return (
      <div className="mb-4 rounded-2xl border border-line bg-surface/70 p-3">
        <div className="flex items-baseline justify-between text-xs text-muted">
          <span>
            <span className="font-display text-lg font-extrabold text-ink tabular-nums">{pct}%</span> done
          </span>
          <span className="tabular-nums">quiz {q.correct}/{q.total}</span>
        </div>
        <div className="mt-2">{bar}</div>
      </div>
    );

  return (
    <div className="rounded-2xl border border-line bg-surface/70 p-4 backdrop-blur sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Your progress · saved in this browser</p>
          <p className="mt-1 text-sm text-ink-2">
            <span className="font-display text-2xl font-extrabold text-ink tabular-nums">{done}</span>
            <span className="text-muted">/{chapters.length} chapters</span>
            <span className="mx-2 text-faint">·</span>
            <span className="tabular-nums">
              {q.correct}/{q.total}
            </span>{" "}
            <span className="text-muted">quiz answers right</span>
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`#${resume?.id ?? chapters[0].id}`}
            onClick={() => track("course_resume", { list_slug: slug, item_id: resume?.id ?? chapters[0].id })}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-brand-ink transition hover:brightness-110"
          >
            {started && resume ? `Resume · ${resume.number} ${resume.title}` : "Start chapter 01 →"}
          </a>
          {started && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset all progress and quiz answers for this course?")) resetAll();
              }}
              className="cursor-pointer rounded-full border border-line px-3 py-2 text-xs text-muted transition hover:border-line-2 hover:text-ink"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      <div className="mt-3">{bar}</div>
    </div>
  );
}

/** Sticky desktop table of contents with scroll-spy, completion checks, and "resume where you left off" tracking. */
export function CourseToc({ slug, chapters, extra }: { slug: string; chapters: TocChapter[]; extra: { id: string; title: string }[] }) {
  const { p, setLast } = useCourse(slug);
  const mounted = useMounted();
  const [active, setActive] = useState(chapters[0]?.id ?? "");

  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) {
          setActive(vis[0].target.id);
          setLast(vis[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -75% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters]);

  return (
    <nav aria-label="Course chapters" className="text-sm">
      <ol className="space-y-0.5">
        {chapters.map((c, i) => {
          const done = mounted && p.done.includes(c.id);
          const on = active === c.id;
          const head = i === 0 || chapters[i - 1].phase !== c.phase ? c.phase : null;
          return (
            <li key={c.id}>
              {head && <p className="mb-1 mt-3 px-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-faint first:mt-0">{head}</p>}
              <a
                href={`#${c.id}`}
                aria-current={on ? "true" : undefined}
                className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] leading-snug transition ${on ? "bg-accent/12 text-ink" : "text-muted hover:bg-surface-2 hover:text-ink"}`}
              >
                <span
                  aria-hidden
                  className={`grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[9px] tabular-nums ${done ? "border-transparent bg-accent text-brand-ink" : on ? "border-accent text-accent-fg" : "border-line-2 text-faint"}`}
                >
                  {done ? "✓" : c.number}
                </span>
                <span className="flex-1">{c.title}</span>
                <span className="sr-only">{done ? "(complete)" : ""}</span>
              </a>
            </li>
          );
        })}
        {extra.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className="flex items-baseline gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-muted hover:bg-surface-2 hover:text-ink">
              <span className="font-mono text-[11px] text-faint">→</span>
              <span className="flex-1">{i.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Roadmap tile grid that reflects completion. */
export function CourseMapStatus({ slug, id }: { slug: string; id: string }) {
  const { isDone } = useCourse(slug);
  const mounted = useMounted();
  if (!mounted || !isDone(id)) return null;
  return (
    <span className="grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-brand-ink" aria-label="complete">
      ✓
    </span>
  );
}

export function MarkComplete({ slug, id, next }: { slug: string; id: string; next?: { id: string; title: string } }) {
  const { isDone, setDone } = useCourse(slug);
  const mounted = useMounted();
  const done = mounted && isDone(id);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        aria-pressed={done}
        onClick={() => {
          setDone(id, !done);
          if (!done) track("course_chapter_complete", { list_slug: slug, item_id: id });
        }}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${done ? "border border-accent/50 bg-accent/12 text-accent-fg" : "bg-accent text-brand-ink hover:brightness-110"}`}
      >
        {done ? "✓ Chapter complete" : "Mark chapter complete"}
      </button>
      {next && (
        <a href={`#${next.id}`} className="text-sm text-muted transition hover:text-ink">
          Next: {next.title} →
        </a>
      )}
    </div>
  );
}

export function Quiz({ slug, chapter, questions }: { slug: string; chapter: string; questions: { qHtml: string; options: string[]; answer: number; whyHtml: string }[] }) {
  const { p, answer, resetQuiz } = useCourse(slug);
  const mounted = useMounted();
  const chosen = mounted ? (p.quiz[chapter] ?? {}) : {};
  const answered = Object.keys(chosen).length;
  const right = questions.filter((q, i) => chosen[i] === q.answer).length;

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-display text-lg font-bold tracking-tight">Check yourself</h4>
        <p className="text-xs text-muted" aria-live="polite">
          {answered === questions.length ? (
            <>
              <span className="font-semibold text-ink">
                {right}/{questions.length}
              </span>{" "}
              correct ·{" "}
              <button type="button" onClick={() => resetQuiz(chapter)} className="cursor-pointer underline underline-offset-2 hover:text-ink">
                retry
              </button>
            </>
          ) : (
            `${answered}/${questions.length} answered`
          )}
        </p>
      </div>
      <ol className="mt-4 space-y-6">
        {questions.map((q, qi) => {
          const pick = chosen[qi];
          const locked = pick !== undefined;
          return (
            <li key={qi}>
              <fieldset>
                <legend className="guide-inline text-[15px] font-medium leading-relaxed text-ink">
                  <span className="mr-2 font-mono text-xs text-accent-fg">Q{qi + 1}</span>
                  <span dangerouslySetInnerHTML={{ __html: q.qHtml }} />
                </legend>
                <div className="mt-3 grid gap-2">
                  {q.options.map((o, oi) => {
                    const isRight = oi === q.answer;
                    const state = !locked ? "idle" : isRight ? "right" : oi === pick ? "wrong" : "dim";
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={locked}
                        onClick={() => {
                          answer(chapter, qi, oi);
                          track("course_quiz_answer", { list_slug: slug, item_id: `${chapter}-q${qi + 1}`, correct: isRight });
                        }}
                        className={`guide-inline flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm leading-relaxed transition ${
                          state === "idle"
                            ? "cursor-pointer border-line hover:border-line-2 hover:bg-surface-2"
                            : state === "right"
                              ? "border-emerald-500/60 bg-emerald-500/10"
                              : state === "wrong"
                                ? "border-rose-500/60 bg-rose-500/10"
                                : "border-line opacity-60"
                        }`}
                      >
                        <span aria-hidden className="mt-0.5 font-mono text-[11px] text-faint">
                          {state === "right" ? "✓" : state === "wrong" ? "✗" : String.fromCharCode(65 + oi)}
                        </span>
                        <span className="min-w-0 flex-1 text-ink-2" dangerouslySetInnerHTML={{ __html: o }} />
                        {state === "right" && <span className="sr-only">(correct answer)</span>}
                        {state === "wrong" && <span className="sr-only">(your answer, incorrect)</span>}
                      </button>
                    );
                  })}
                </div>
                {locked && (
                  <p role="status" className={`guide-inline mt-3 rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${pick === q.answer ? "bg-emerald-500/10 text-ink-2" : "bg-rose-500/10 text-ink-2"}`}>
                    <strong className="mr-1">{pick === q.answer ? "Correct." : "Not quite."}</strong>
                    <span dangerouslySetInnerHTML={{ __html: q.whyHtml }} />
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
