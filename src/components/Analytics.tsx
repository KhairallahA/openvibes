import { GoogleAnalytics } from "@next/third-parties/google";
import { analytics } from "@/lib/site";

/**
 * Production-only Google Analytics 4.
 * Measurement ID comes from NEXT_PUBLIC_ANALYTICS (e.g. G-XXXXXXXXXX).
 * Client-side navigations reach GA as page views through GA4 enhanced measurement.
 */
export function Analytics() {
  if (!analytics.enabled || !analytics.gaId) return null;
  return <GoogleAnalytics gaId={analytics.gaId} />;
}
