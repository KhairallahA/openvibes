"use client";

import { site } from "@/lib/site";
import { useCopy } from "./CopyButton";
import { IconCheck, IconLink, IconXLogo } from "./icons";

export function ShareBar({ path, text }: { path: string; text: string }) {
  const { copied, copy } = useCopy();
  const url = `${site.url}${path}`;
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(`${text}\n\n${url}`)}`;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => copy(typeof window !== "undefined" ? `${window.location.origin}${path}` : url)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-ink-2 transition hover:border-line-2 hover:text-ink"
      >
        {copied ? <IconCheck className="text-accent-fg" /> : <IconLink />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={intent}
        target="_blank"
        rel="noopener"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-ink-2 transition hover:border-line-2 hover:text-ink"
      >
        <IconXLogo width={14} height={14} /> Share on X
      </a>
    </div>
  );
}
