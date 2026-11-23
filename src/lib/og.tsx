import { readFileSync } from "node:fs";
import { join } from "node:path";

const fontDir = join(process.cwd(), "node_modules/@fontsource");
// Read once at module scope (static, same for every request).
const display = readFileSync(join(fontDir, "bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff"));
const mono = readFileSync(join(fontDir, "jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff"));
const monoBold = readFileSync(join(fontDir, "jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff"));

export const ogSize = { width: 1200, height: 630 };

export const ogFonts = [
  { name: "Display", data: display, weight: 800 as const, style: "normal" as const },
  { name: "Mono", data: mono, weight: 500 as const, style: "normal" as const },
  { name: "Mono", data: monoBold, weight: 700 as const, style: "normal" as const },
];

export function OgFrame({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#08080a",
        backgroundImage: `radial-gradient(circle at 88% 8%, ${accent}59 0%, ${accent}1f 28%, #08080a00 52%)`,
        color: "#f4f4f6",
        fontFamily: "Display",
        overflow: "hidden",
      }}
    >
      {/* grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      
      {children}
    </div>
  );
}
