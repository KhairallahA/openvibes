"use client";

import { useRef, useState } from "react";
import { IconCheck, IconCopy } from "./icons";

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function useCopy(timeout = 1400) {
  const [copied, setCopied] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copy = async (text: string) => {
    if (await copyText(text)) {
      setCopied(true);
      if (t.current) clearTimeout(t.current);
      t.current = setTimeout(() => setCopied(false), timeout);
    }
  };
  return { copied, copy };
}

export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition cursor-pointer ${copied ? "text-accent-fg" : "text-muted hover:text-ink"} ${className}`}
      aria-label={copied ? "Copied" : label}
    >
      {copied ? <IconCheck width={14} height={14} /> : <IconCopy width={14} height={14} />}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
