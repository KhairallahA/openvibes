import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { analytics } from "@/lib/site";

/**
 * Analytics are OFF by default. Turn on with env vars:
 *   NEXT_PUBLIC_ANALYTICS=vercel      → Vercel Web Analytics (enable it in the Vercel dashboard too)
 *   NEXT_PUBLIC_ANALYTICS=plausible   → Plausible (+ NEXT_PUBLIC_PLAUSIBLE_DOMAIN, optional NEXT_PUBLIC_PLAUSIBLE_SRC)
 *   NEXT_PUBLIC_ANALYTICS=both
 */
export function Analytics() {
  const p = analytics.provider;
  if (!p) return null;
  return (
    <>
      {(p === "vercel" || p === "both") && <VercelAnalytics />}
      {(p === "plausible" || p === "both") && (
        <Script defer data-domain={analytics.plausibleDomain} src={analytics.plausibleSrc} strategy="afterInteractive" />
      )}
    </>
  );
}
