/**
 * Fire-and-forget custom events to whichever analytics are loaded (GA4 gtag, Plausible).
 * Safe to call anywhere on the client: it does nothing when no analytics script is present.
 */
type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Params }) => void;
  }
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Params;
  try {
    window.gtag?.("event", event, clean);
    window.plausible?.(event, { props: clean });
  } catch {
    /* analytics must never break the UI */
  }
}
