"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { IconX, IconXLogo } from "./icons";

const KEY = "vibes:nudge-dismissed";

/** Small, dismissible "follow for daily lists" card that appears after the reader scrolls past half the page. */
export function FollowNudge() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {}
    const onScroll = () => {
      const h = document.documentElement;
      if (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) > 0.5) {
        setShow(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  const close = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  };
  return (
    <aside className="fixed inset-x-3 bottom-3 z-50 animate-rise rounded-2xl border border-line-2 bg-surface/95 p-4 shadow-2xl backdrop-blur sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-80" aria-label="Follow for daily lists">
      <button type="button" onClick={close} aria-label="Dismiss" className="absolute right-2 top-2 grid size-7 place-items-center rounded-lg text-faint hover:text-ink cursor-pointer">
        <IconX width={14} height={14} />
      </button>
      <p className="pr-6 font-display text-lg font-bold leading-tight">You found this list by luck.</p>
      <p className="mt-1 text-sm text-muted">One new free goldmine every day. Don&apos;t miss tomorrow&apos;s.</p>
      <a
        href={`https://x.com/intent/follow?screen_name=${site.x}`}
        target="_blank"
        rel="noopener"
        onClick={close}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-sm font-bold text-bg"
      >
        <IconXLogo width={14} height={14} /> Follow @{site.x}
      </a>
    </aside>
  );
}
