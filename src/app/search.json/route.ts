import { addGuidesToIndex, searchIndex } from "@/lib/content";
import { getAllGuides } from "@/lib/guides";

// Static JSON index for ⌘K search and the /saved page. Generated at build time.
export function GET() {
  return Response.json(addGuidesToIndex(searchIndex(), getAllGuides()), { headers: { "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800" } });
}
