import { searchIndex } from "@/lib/content";

// Static JSON index for ⌘K search and the /saved page. Generated at build time.
export function GET() {
  return Response.json(searchIndex(), { headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800" } });
}
