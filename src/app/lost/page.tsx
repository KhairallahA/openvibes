import type { Metadata } from "next";
import NotFound from "../not-found";

export const metadata: Metadata = { title: "Not found", robots: { index: false, follow: true } };

// Target of the proxy rewrite for unknown slugs (served with HTTP 404).
export default function Lost() {
  return <NotFound />;
}
