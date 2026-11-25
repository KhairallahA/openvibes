"use client";

import { useSyncExternalStore } from "react";

/** Per-course progress in localStorage: completed chapters, quiz answers and where you left off. */
export type CourseProgress = {
  done: string[];
  quiz: Record<string, Record<number, number>>; // chapter → question index → chosen option
  last?: string;
};

const EMPTY: CourseProgress = { done: [], quiz: {} };
const key = (slug: string) => `vibes:course:${slug}`;
const cache = new Map<string, CourseProgress>();
const listeners = new Set<() => void>();

function read(slug: string): CourseProgress {
  const hit = cache.get(slug);
  if (hit) return hit;
  let v: CourseProgress = EMPTY;
  try {
    const raw = JSON.parse(localStorage.getItem(key(slug)) ?? "null");
    if (raw && typeof raw === "object") {
      v = {
        done: Array.isArray(raw.done) ? raw.done.filter((x: unknown) => typeof x === "string") : [],
        quiz: raw.quiz && typeof raw.quiz === "object" ? raw.quiz : {},
        last: typeof raw.last === "string" ? raw.last : undefined,
      };
    }
  } catch {}
  cache.set(slug, v);
  return v;
}

function write(slug: string, next: CourseProgress) {
  cache.set(slug, next);
  try {
    localStorage.setItem(key(slug), JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith("vibes:course:")) {
      cache.clear();
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCourse(slug: string) {
  const p = useSyncExternalStore(subscribe, () => read(slug), () => EMPTY);
  return {
    p,
    isDone: (id: string) => p.done.includes(id),
    setDone: (id: string, on: boolean) => {
      const cur = read(slug);
      const done = on ? [...new Set([...cur.done, id])] : cur.done.filter((x) => x !== id);
      write(slug, { ...cur, done });
    },
    answer: (ch: string, qi: number, opt: number) => {
      const cur = read(slug);
      write(slug, { ...cur, quiz: { ...cur.quiz, [ch]: { ...(cur.quiz[ch] ?? {}), [qi]: opt } } });
    },
    resetQuiz: (ch: string) => {
      const cur = read(slug);
      const quiz = { ...cur.quiz };
      delete quiz[ch];
      write(slug, { ...cur, quiz });
    },
    setLast: (id: string) => {
      const cur = read(slug);
      if (cur.last !== id) write(slug, { ...cur, last: id });
    },
    resetAll: () => write(slug, { done: [], quiz: {} }),
  };
}
