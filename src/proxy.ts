import { NextResponse, type NextRequest } from "next/server";
import slugs from "@/generated/slugs.json";

const known = new Set<string>(slugs);
// Single-segment routes that are not lists.
const reserved = new Set(["", "saved", "search", "lost"]);

/**
 * List pages are prerendered for every slug in content/lists. Any other single-segment URL
 * (e.g. /typo) is rewritten to the not-found page with a real HTTP 404, so search engines never
 * see a "soft 404".
 */
export async function proxy(req: NextRequest) {
  const slug = req.nextUrl.pathname.slice(1).replace(/\/$/, "");
  if (known.has(slug) || reserved.has(slug) || slug.includes(".") || slug.startsWith("_")) return NextResponse.next();
  // Serve the prerendered not-found page body with a real 404 status.
  try {
    const page = await fetch(new URL("/lost", req.url));
    return new NextResponse(page.body, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex", "cache-control": "public, max-age=0, s-maxage=3600" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
}

export const config = {
  matcher: "/:slug", // single path segment only; files and built-in routes are skipped above
};
