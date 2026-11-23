import Link from "next/link";
import { site } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";
import { SearchButton } from "./SearchButton";
import { SavedLink } from "./SavedLink";
import { IconXLogo } from "./icons";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/75 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2 rounded-lg font-display text-lg font-extrabold tracking-tight" aria-label={`${site.name} home`}>
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-brand-ink shadow-[0_0_24px_-4px_var(--brand)] transition group-hover:rotate-6">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7l8 12 8-12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            {site.name}
            <span className="text-brand">.</span>
          </span>
        </Link>
        <nav className="ml-2 hidden items-center gap-1 text-sm text-muted md:flex" aria-label="Main">
          <Link href="/#lists" className="rounded-lg px-3 py-1.5 transition hover:bg-surface-2 hover:text-ink">All lists</Link>
          <Link href="/saved" className="rounded-lg px-3 py-1.5 transition hover:bg-surface-2 hover:text-ink">Saved</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchButton />
          <SavedLink />
          <ThemeToggle />
          <a
            href={`https://x.com/${site.x}`}
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-sm font-semibold text-bg transition hover:opacity-90 sm:inline-flex"
          >
            <IconXLogo width={14} height={14} />
            Follow
          </a>
        </div>
      </div>
    </header>
  );
}
