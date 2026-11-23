"use client";

import { useState } from "react";
import { site } from "@/lib/site";

/**
 * Email capture UI. There is NO backend yet.
 * TODO: connect a provider (Buttondown, Beehiiv, ConvertKit, Resend audience…):
 *   1. Set NEXT_PUBLIC_NEWSLETTER_ACTION to the provider's form POST URL, or
 *   2. Replace `onSubmit` with a fetch() to your own /api/subscribe route.
 */
const ACTION = process.env.NEXT_PUBLIC_NEWSLETTER_ACTION;

export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<"idle" | "todo">("idle");
  return (
    <section className={`relative overflow-hidden rounded-3xl border border-line bg-surface ${compact ? "p-6" : "p-8 sm:p-10"}`}>
      <div className="glow pointer-events-none absolute -right-20 -top-24 size-72" />
      <p className="text-xs font-semibold uppercase tracking-widest text-accent-fg">One new goldmine a day</p>
      <h2 className="mt-2 max-w-lg font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Get the next list before it goes viral.</h2>
      <p className="mt-2 max-w-lg text-sm text-muted">Free. One email when a new list drops. No spam, unsubscribe in one click.</p>
      <form
        action={ACTION}
        method={ACTION ? "post" : undefined}
        target={ACTION ? "_blank" : undefined}
        onSubmit={(e) => {
          if (!ACTION) {
            e.preventDefault();
            setState("todo");
          }
        }}
        className="relative mt-5 flex max-w-md flex-col gap-2 sm:flex-row"
      >
        <label htmlFor={compact ? "nl-email-c" : "nl-email"} className="sr-only">Email address</label>
        <input
          id={compact ? "nl-email-c" : "nl-email"}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="h-12 flex-1 rounded-full border border-line bg-bg px-5 text-ink outline-none placeholder:text-faint focus:border-accent/60 focus:ring-4 focus:ring-accent/10"
        />
        <button type="submit" className="h-12 rounded-full bg-accent px-6 font-bold text-[#0b0b0d] transition hover:brightness-110">
          Notify me
        </button>
      </form>
      <p className="relative mt-3 text-xs text-faint" aria-live="polite">
        {state === "todo" ? (
          <>
            Email signup isn&apos;t live yet. For now,{" "}
            <a className="underline" href={`https://x.com/${site.x}`} target="_blank" rel="noopener">
              follow @{site.x}
            </a>{" "}
            for every new list.
          </>
        ) : (
          <>Or follow <a className="underline hover:text-ink" href={`https://x.com/${site.x}`} target="_blank" rel="noopener">@{site.x}</a> on X.</>
        )}
      </p>
    </section>
  );
}
