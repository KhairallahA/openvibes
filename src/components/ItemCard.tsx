"use client";

import type { Item } from "@/lib/content";
import { savedKey, useSaved } from "@/lib/stores";
import { CopyButton, useCopy } from "./CopyButton";
import { IconArrowUpRight, IconBookmark, IconCheck, IconLink, IconShield } from "./icons";
import type { ReactNode } from "react";

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function Highlight({ text, q }: { text: string; q: string }): ReactNode {
  const term = q.trim();
  if (!term) return text;
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-accent/25 px-0.5 text-ink">{text.slice(i, i + term.length)}</mark>
      {text.slice(i + term.length)}
    </>
  );
}

export function ItemCard({
  item,
  index,
  slug,
  q,
  compact,
  verifiedLabel,
}: {
  item: Item;
  index: number;
  slug: string;
  q: string;
  compact: boolean;
  verifiedLabel: string;
}) {
  const { isSaved, toggle } = useSaved();
  const k = savedKey(slug, item.id);
  const saved = isSaved(k);
  const link = useCopy();
  const n = String(index + 1).padStart(2, "0");

  const copyDeepLink = () => {
    const url = `${window.location.origin}/${slug}#${item.id}`;
    history.replaceState(null, "", `#${item.id}`);
    link.copy(url);
  };

  return (
    <article
      id={item.id}
      className={`item-card group relative flex min-w-0 flex-col rounded-2xl border border-line bg-surface transition duration-200 hover:-translate-y-0.5 hover:border-line-2 hover:shadow-[0_20px_50px_-24px_var(--accent)] ${compact ? "p-4" : "p-5"}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 font-mono text-xs tabular-nums text-faint">{n}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.05rem] font-semibold leading-snug tracking-tight text-ink">
            <a href={item.url} target="_blank" rel="noopener" className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
              <Highlight text={item.name} q={q} />
            </a>
          </h3>
          <p className="mt-0.5 truncate font-mono text-[11px] text-faint">{host(item.url)}</p>
        </div>
        <button
          type="button"
          onClick={() => toggle(k)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${item.name} from saved` : `Save ${item.name}`}
          title={saved ? "Saved" : "Save for later"}
          className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border transition ${saved ? "border-accent/50 bg-accent/15 text-accent-fg" : "border-line text-faint hover:border-line-2 hover:text-ink"}`}
        >
          <IconBookmark filled={saved} width={15} height={15} />
        </button>
      </div>

      {item.badge && (
        <p className="mt-3">
          <span className="inline-flex items-center rounded-full bg-accent/12 px-2.5 py-1 text-xs font-semibold text-accent-fg ring-1 ring-inset ring-accent/25">
            {item.badge}
          </span>
        </p>
      )}

      {!compact && item.description && (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          <Highlight text={item.description} q={q} />
        </p>
      )}

      {item.command && (
        <div className="relative z-10 mt-4 flex items-center gap-2 rounded-xl border border-line bg-bg/70 py-1.5 pl-3 pr-1.5">
          <span className="select-none font-mono text-xs text-accent-fg">$</span>
          <code className="no-scrollbar min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-ink-2">{item.command}</code>
          <CopyButton text={item.command} className="shrink-0 bg-surface-2" />
        </div>
      )}

      <div className="mt-auto pt-4">
        {(item.tags.length > 0 || item.category) && !compact && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {[item.category, ...item.tags].filter(Boolean).map((t, i) => (
              <span key={`${t}-${i}`} className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-muted">
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="relative z-10 flex items-center gap-1 border-t border-line pt-3">
          <a
            href={item.url}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-[#0b0b0d] transition hover:brightness-110"
          >
            Open <IconArrowUpRight width={13} height={13} />
          </a>
          <button
            type="button"
            onClick={copyDeepLink}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs transition ${link.copied ? "text-accent-fg" : "text-muted hover:text-ink"}`}
          >
            {link.copied ? <IconCheck width={13} height={13} /> : <IconLink width={13} height={13} />}
            {link.copied ? "Link copied" : "Copy link"}
          </button>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-faint" title={`Last verified ${verifiedLabel}`}>
            <IconShield width={12} height={12} />
            {item.source ? (
              <a href={item.source} target="_blank" rel="noopener" className="underline decoration-dotted underline-offset-2 hover:text-ink">
                source
              </a>
            ) : (
              "verified"
            )}{" "}
            {verifiedLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
