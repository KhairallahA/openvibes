import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <p className="font-mono text-sm text-brand">404</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">This goldmine doesn&apos;t exist (yet).</h1>
      <p className="mt-3 text-muted">The list may have moved. Every live list is on the home page.</p>
      <Link href="/#lists" className="mt-8 inline-block rounded-full bg-brand px-6 py-3 font-bold text-brand-ink">See all lists</Link>
    </div>
  );
}
