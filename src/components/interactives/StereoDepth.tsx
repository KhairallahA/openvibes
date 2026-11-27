"use client";

import { useRef, useState } from "react";
import { stereo } from "./sim";
import { C, Panel, Plot, Readouts, Slider, Toggle, svgPoint } from "./ui";

const IMG = 640; // image width in pixels

/** Two pinhole cameras see one point. Drag it: watch the disparity shrink with distance, and depth error grow as Z². */
export default function StereoDepth() {
  const [f, setF] = useState(700);
  const [B, setB] = useState(0.12);
  const [P, setP] = useState<[number, number]>([0.3, 2.5]);
  const [quant, setQuant] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef(false);
  const s = stereo(f, B, P[0], P[1]);
  const dMeas = quant ? Math.max(1, Math.round(s.d)) : s.d;
  const zMeas = (f * B) / dMeas;
  const zs = Array.from({ length: 80 }, (_, i) => 0.3 + (i * 9.7) / 79);

  // top view: X ∈ [-2, 2] → 320 px, Z ∈ [0, 10] → 220 px
  const sx = (x: number) => 160 + x * 75, sz = (z: number) => 230 - z * 21;
  const camL = -B / 2, camR = B / 2;
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current || !svgRef.current) return;
    const q = svgPoint(svgRef.current, e.clientX, e.clientY);
    setP([+Math.max(-2, Math.min(2, (q.x - 160) / 75)).toFixed(2), +Math.max(0.3, Math.min(10, (230 - q.y) / 21)).toFixed(2)]);
  };
  const inView = (u: number) => Math.abs(u) <= IMG / 2;
  return (
    <Panel
      controls={
        <>
          <Slider label="Focal length f" value={f} min={300} max={1500} step={10} onChange={setF} fmt={(v) => `${v} px`} />
          <Slider label="Baseline B" value={B} min={0.04} max={0.5} step={0.01} onChange={setB} fmt={(v) => `${(v * 100).toFixed(0)} cm`} />
          <Slider label="Point depth Z" value={P[1]} min={0.3} max={10} step={0.05} onChange={(z) => setP([P[0], z])} fmt={(v) => `${v.toFixed(2)} m`} />
          <Toggle label="Round disparity to whole pixels" checked={quant} onChange={setQuant} />
          <Readouts
            items={[
              { k: quant ? "disparity d (rounded)" : "disparity d", v: quant ? `${dMeas} px (true ${s.d.toFixed(1)})` : `${s.d.toFixed(2)} px`, tone: "accent" },
              { k: "depth from d", v: `${zMeas.toFixed(3)} m`, tone: Math.abs(zMeas - P[1]) / P[1] < 0.02 ? "good" : "bad" },
              { k: "error per 1 px", v: `±${(s.dZper1px * 100).toFixed(1)} cm` },
              { k: "true depth", v: `${P[1].toFixed(3)} m` },
            ]}
          />
        </>
      }
      footer={<>u = f·X/Z for each camera; disparity d = u_L − u_R = f·B/Z, so Z = f·B/d. One pixel of disparity error costs ΔZ ≈ Z²/(f·B): far things are measured badly unless you widen the baseline.</>}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 320 262"
        className="block w-full touch-none select-none"
        onPointerMove={onMove}
        onPointerUp={() => (drag.current = false)}
        onPointerCancel={() => (drag.current = false)}
        role="img"
        aria-label={`Stereo cameras seeing a point at depth ${P[1]} metres`}
      >
        {[2, 4, 6, 8, 10].map((z) => (
          <g key={z}>
            <line x1={0} x2={320} y1={sz(z)} y2={sz(z)} style={{ stroke: C.line }} />
            <text x={4} y={sz(z) - 2} fontSize={8} style={{ fill: C.faint }}>
              {z} m
            </text>
          </g>
        ))}
        {[camL, camR].map((cxm, i) => (
          <g key={i}>
            <line x1={sx(cxm)} y1={sz(0)} x2={sx(P[0])} y2={sz(P[1])} style={{ stroke: i ? C.z : C.x }} strokeWidth={1.5} opacity={0.8} />
            <rect x={sx(cxm) - 6} y={sz(0)} width={12} height={9} rx={2} style={{ fill: i ? C.z : C.x }} />
          </g>
        ))}
        <text x={sx(0)} y={sz(0) + 22} textAnchor="middle" fontSize={9} style={{ fill: C.muted }}>
          baseline {(B * 100).toFixed(0)} cm
        </text>
        <line x1={sx(P[0]) - 40} x2={sx(P[0]) + 40} y1={sz(P[1] - s.dZper1px)} y2={sz(P[1] - s.dZper1px)} style={{ stroke: C.amber }} strokeDasharray="2 2" />
        <line x1={sx(P[0]) - 40} x2={sx(P[0]) + 40} y1={sz(P[1] + s.dZper1px)} y2={sz(P[1] + s.dZper1px)} style={{ stroke: C.amber }} strokeDasharray="2 2" />
        <circle
          cx={sx(P[0])}
          cy={sz(P[1])}
          r={8}
          tabIndex={0}
          role="slider"
          aria-label="Point (arrow keys move it)"
          aria-valuetext={`X ${P[0]} m, Z ${P[1]} m`}
          className="cursor-grab outline-none"
          style={{ fill: C.amber, stroke: C.ink }}
          onPointerDown={(e) => {
            drag.current = true;
            (e.currentTarget.ownerSVGElement as Element | null)?.setPointerCapture?.(e.pointerId);
          }}
          onKeyDown={(e) => {
            const m: Record<string, [number, number]> = { ArrowLeft: [-0.05, 0], ArrowRight: [0.05, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] };
            const d = m[e.key];
            if (!d) return;
            e.preventDefault();
            setP(([x, z]) => [+Math.max(-2, Math.min(2, x + d[0])).toFixed(2), +Math.max(0.3, Math.min(10, z + d[1])).toFixed(2)]);
          }}
        />
        {/* image strips */}
        {[
          { u: s.uL, c: C.x, y: 244, l: "left image" },
          { u: s.uR, c: C.z, y: 254, l: "right image" },
        ].map((im) => (
          <g key={im.l}>
            <rect x={60} y={im.y - 4} width={200} height={7} rx={2} style={{ fill: C.surface2 }} />
            {inView(im.u) && <rect x={160 + (im.u / IMG) * 200 - 1.5} y={im.y - 5} width={3} height={9} style={{ fill: im.c }} />}
            <text x={56} y={im.y + 2} textAnchor="end" fontSize={8} style={{ fill: C.faint }}>
              {im.l}
            </text>
          </g>
        ))}
      </svg>
      <Plot
        ariaLabel="Depth error versus distance"
        height={110}
        series={[
          { pts: zs.map((z) => [z, (z * z) / (f * B)] as [number, number]), color: C.amber, label: "depth error for 1 px disparity error (m)" },
          { pts: [[P[1], s.dZper1px]], color: C.accent, dots: true },
        ]}
        vline={P[1]}
        x={[0, 10]}
        y={[0, Math.min(5, 100 / (f * B))]}
        xLabel="Z (m)"
      />
    </Panel>
  );
}
