import { ImageResponse } from "next/og";
import { getAllLists, totalItems } from "@/lib/content";
import { domainLabel, site } from "@/lib/site";
import { OgFrame, ogFonts, ogSize } from "@/lib/og";

export const alt = `${site.name}: every free AI goldmine on the internet`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  const lists = getAllLists();
  return new ImageResponse(
    (
      <OgFrame accent="#c6ff3d">
        <div style={{ display: "flex", flexDirection: "column", padding: "72px 80px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40 }}>
            <div style={{ display: "flex", width: 56, height: 56, borderRadius: 14, background: "#c6ff3d", color: "#0b0b0d", alignItems: "center", justifyContent: "center", fontSize: 40 }}>v</div>
            {site.name}.
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 40, fontSize: 96, lineHeight: 0.98, letterSpacing: -4 }}>
            <div style={{ display: "flex" }}>
              Every free AI<span style={{ color: "#c6ff3d", marginLeft: 24 }}>goldmine</span>
            </div>
            <div style={{ display: "flex" }}>on the internet.</div>
          </div>
          <div style={{ display: "flex", marginTop: "auto", gap: 14, fontFamily: "Mono", fontSize: 19, color: "#c9c9d1" }}>
            {lists.slice(0, 4).map((l) => (
              <div key={l.slug} style={{ display: "flex", gap: 10, alignItems: "center", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999, padding: "10px 16px", whiteSpace: "nowrap" }}>
                <div style={{ display: "flex", width: 10, height: 10, borderRadius: 99, background: l.accent }} />
                {l.shortTitle} {l.count}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 22, fontFamily: "Mono", fontSize: 22, color: "#8b8b98" }}>
            {totalItems()} verified picks · {domainLabel}
          </div>
        </div>
      </OgFrame>
    ),
    { ...size, fonts: ogFonts },
  );
}
