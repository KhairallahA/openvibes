import { ImageResponse } from "next/og";
import { getAllLists, getList, hostOf } from "@/lib/content";
import { domainLabel } from "@/lib/site";
import { OgFrame, ogFonts, ogSize } from "@/lib/og";

export const alt = "List preview";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllLists().map((l) => ({ slug: l.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = getList(slug);
  if (!list) return new ImageResponse(<div style={{ display: "flex" }}>Not found</div>, size);
  const picks = list.items.slice(0, 4);
  const hosts = [...new Set(list.items.map((i) => hostOf(i.url)))].slice(0, 3).join(" · ");
  const titleSize = list.title.length > 46 ? 64 : 76;

  return new ImageResponse(
    (
      <OgFrame accent={list.accent}>
        <div style={{ display: "flex", flexDirection: "column", padding: "64px 72px", width: 760, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Mono", fontSize: 22, letterSpacing: 3, color: "#8b8b98" }}>
            <div style={{ display: "flex", width: 14, height: 14, borderRadius: 99, background: list.accent }} />
            FREE DIRECTORY · {list.category.toUpperCase()}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: titleSize, lineHeight: 1.02, letterSpacing: -2.5 }}>{list.title}</div>
          <div style={{ display: "flex", marginTop: "auto", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", background: list.accent, color: "#0b0b0d", borderRadius: 999, padding: "12px 26px", fontSize: 28, whiteSpace: "nowrap", flexShrink: 0 }}>Save it rn</div>
            <div style={{ display: "flex", fontFamily: "Mono", fontWeight: 700, fontSize: 26, color: "#f4f4f6", whiteSpace: "nowrap" }}>
              {domainLabel}/{list.slug}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", position: "absolute", right: 64, top: 64, bottom: 64, width: 340, gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", fontSize: 168, lineHeight: 0.9, color: list.accent, letterSpacing: -8 }}>{list.count}</div>
            <div style={{ display: "flex", fontFamily: "Mono", fontSize: 20, letterSpacing: 4, color: "#8b8b98", marginTop: 6 }}>VERIFIED PICKS</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
            {picks.slice(0, 3).map((p, i) => (
              <div
                key={p.id}
                style={{ display: "flex", alignItems: "center", gap: 12, background: "#121217", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "12px 16px" }}
              >
                <div style={{ display: "flex", fontFamily: "Mono", fontSize: 16, color: "#5d5d6a" }}>{String(i + 1).padStart(2, "0")}</div>
                <div style={{ display: "flex", fontSize: 22, flex: 1, overflow: "hidden", whiteSpace: "nowrap" }}>{p.name.length > 22 ? p.name.slice(0, 21).trimEnd() + "…" : p.name}</div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", fontFamily: "Mono", fontSize: 16, color: "#5d5d6a" }}>{hosts}</div>
          </div>
        </div>
      </OgFrame>
    ),
    { ...size, fonts: ogFonts },
  );
}
