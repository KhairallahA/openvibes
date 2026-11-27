"use client";

import { useRef, useState } from "react";
import { apply2, mul, se2, se2Inv } from "./sim";
import { C, MatrixView, Panel, Slider, fmtDeg, rad, svgPoint } from "./ui";

/** World ← robot ← lidar: chain two homogeneous transforms to put a lidar hit on the world map. Drag the hit point. */
export default function TransformChain() {
  const [rx, setRx] = useState(1.6);
  const [ry, setRy] = useState(1.0);
  const [rth, setRth] = useState(30);
  const [mount, setMount] = useState(0.35);
  const [mountTh, setMountTh] = useState(-20);
  const [hit, setHit] = useState<[number, number]>([1.2, 0.5]); // in lidar frame
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef(false);

  const TWB = se2(rad(rth), rx, ry);
  const TBS = se2(rad(mountTh), mount, 0);
  const TWS = mul(TWB, TBS);
  const pW = apply2(TWS, hit);

  // view: world x ∈ [-0.5, 5], y ∈ [-0.5, 3.5]; 1 m = 60 px; y up
  const S = 60, ox = 30, oy = 240;
  const v = (p: [number, number]) => [ox + S * p[0], oy - S * p[1]] as const;
  const frame = (M: number[][], len: number, label: string, color: string) => {
    const o = v([M[0][2], M[1][2]]);
    const xa = v(apply2(M, [len, 0]));
    const ya = v(apply2(M, [0, len]));
    return (
      <g>
        <line x1={o[0]} y1={o[1]} x2={xa[0]} y2={xa[1]} style={{ stroke: C.x }} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={o[0]} y1={o[1]} x2={ya[0]} y2={ya[1]} style={{ stroke: C.y }} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={o[0]} cy={o[1]} r={3} style={{ fill: color }} />
        <text x={o[0] - 6} y={o[1] + 14} fontSize={11} fontWeight={700} style={{ fill: color }}>
          {label}
        </text>
      </g>
    );
  };
  const robotCorners = ([[-0.3, -0.22], [0.3, -0.22], [0.3, 0.22], [-0.3, 0.22]] as [number, number][]).map((p) => v(apply2(TWB, p)));
  const sO = v([TWS[0][2], TWS[1][2]]);
  const pv = v(pW);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current || !svgRef.current) return;
    const q = svgPoint(svgRef.current, e.clientX, e.clientY);
    const world: [number, number] = [(q.x - ox) / S, (oy - q.y) / S];
    const local = apply2(se2Inv(TWS), world);
    setHit([+local[0].toFixed(2), +local[1].toFixed(2)]);
  };
  const nudge = (dx: number, dy: number) => setHit(([a, b]) => [+(a + dx).toFixed(2), +(b + dy).toFixed(2)]);

  return (
    <Panel
      controls={
        <>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">Robot pose in world (T_WB)</p>
          <Slider label="x" value={rx} min={0} max={4} step={0.05} onChange={setRx} fmt={(v) => `${v.toFixed(2)} m`} />
          <Slider label="y" value={ry} min={0} max={3} step={0.05} onChange={setRy} fmt={(v) => `${v.toFixed(2)} m`} />
          <Slider label="heading θ" value={rth} min={-180} max={180} step={1} onChange={setRth} fmt={fmtDeg} />
          <p className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-faint">Lidar mount on robot (T_BS)</p>
          <Slider label="forward offset" value={mount} min={-0.3} max={0.6} step={0.01} onChange={setMount} fmt={(v) => `${v.toFixed(2)} m`} />
          <Slider label="mount yaw" value={mountTh} min={-90} max={90} step={1} onChange={setMountTh} fmt={fmtDeg} />
        </>
      }
      footer={<>Drag the amber hit (or focus it and use arrow keys). The lidar only ever reports p<sub>S</sub>; the map needs p<sub>W</sub> = T<sub>WB</sub> T<sub>BS</sub> p<sub>S</sub>.</>}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 330 270"
        className="mx-auto block w-full max-w-[520px] touch-none select-none"
        onPointerMove={onMove}
        onPointerUp={() => (drag.current = false)}
        onPointerLeave={() => (drag.current = false)}
        role="img"
        aria-label="World, robot and lidar frames with a lidar hit point"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`gx${i}`} x1={ox + S * i} x2={ox + S * i} y1={10} y2={oy + 20} style={{ stroke: C.line }} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`gy${i}`} x1={10} x2={325} y1={oy - S * i} y2={oy - S * i} style={{ stroke: C.line }} />
        ))}
        {frame([[1, 0, 0], [0, 1, 0], [0, 0, 1]], 0.7, "W", C.muted)}
        <polygon points={robotCorners.map((p) => p.join(",")).join(" ")} style={{ fill: C.accent, stroke: C.accent }} fillOpacity={0.12} />
        {frame(TWB, 0.5, "B", C.accent)}
        {frame(TWS, 0.35, "S", C.violet)}
        <line x1={sO[0]} y1={sO[1]} x2={pv[0]} y2={pv[1]} style={{ stroke: C.amber }} strokeDasharray="3 3" />
        <circle
          cx={pv[0]}
          cy={pv[1]}
          r={9}
          tabIndex={0}
          role="slider"
          aria-label="Lidar hit point (arrow keys move it)"
          aria-valuetext={`x ${hit[0]} m, y ${hit[1]} m in lidar frame`}
          className="cursor-grab outline-none focus-visible:stroke-[3]"
          style={{ fill: C.amber, stroke: C.ink }}
          strokeWidth={1}
          fillOpacity={0.85}
          onPointerDown={(e) => {
            drag.current = true;
            (e.target as Element).setPointerCapture?.(e.pointerId);
          }}
          onKeyDown={(e) => {
            const k = e.key, d = 0.05;
            if (k === "ArrowRight") nudge(d, 0);
            else if (k === "ArrowLeft") nudge(-d, 0);
            else if (k === "ArrowUp") nudge(0, d);
            else if (k === "ArrowDown") nudge(0, -d);
            else return;
            e.preventDefault();
          }}
        />
      </svg>
      <div className="mt-2 grid gap-3 px-1 text-xs sm:grid-cols-2">
        <MatrixView m={TWB} label="T_WB =" />
        <MatrixView m={TBS} label="T_BS =" />
        <MatrixView m={TWS} label="T_WS =" />
        <div className="font-mono text-[11px] leading-relaxed text-ink-2 sm:text-xs">
          p<sub>S</sub> = ({hit[0].toFixed(2)}, {hit[1].toFixed(2)})
          <br />
          <span className="text-amber-400">
            p<sub>W</sub> = ({pW[0].toFixed(2)}, {pW[1].toFixed(2)}) m
          </span>
        </div>
      </div>
    </Panel>
  );
}
