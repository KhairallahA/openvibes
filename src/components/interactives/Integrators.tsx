"use client";

import { useMemo, useState } from "react";
import { springSim } from "./sim";
import { C, Panel, Plot, Readouts, Slider, useRaf, useVisible } from "./ui";

const W = 2 * Math.PI; // 1 Hz spring
const T_END = 10;

/** The same spring simulated three ways. Bigger time steps make explicit Euler explode; symplectic Euler stays bounded; RK4 stays accurate. */
export default function Integrators() {
  const [ldt, setLdt] = useState(-1.7);
  const [cursor, setCursor] = useState(0);
  const [box, vis] = useVisible<HTMLDivElement>();
  const dt = 10 ** ldt;
  const runs = useMemo(
    () => [
      { n: "Explicit Euler", c: C.pink, r: springSim("euler", W, dt, T_END) },
      { n: "Symplectic Euler", c: C.amber, r: springSim("symplectic", W, dt, T_END) },
      { n: "RK4", c: C.accent, r: springSim("rk4", W, dt, T_END) },
    ],
    [dt],
  );
  useRaf((d) => setCursor((c) => (c + d >= T_END ? 0 : c + d)), vis);
  const exact = Array.from({ length: 400 }, (_, i) => [(i * T_END) / 399, Math.cos((W * i * T_END) / 399)] as [number, number]);
  const at = (r: { t: number[]; x: number[] }) => r.x[Math.min(r.x.length - 1, Math.floor(cursor / dt))];
  const clamp = (v: number) => Math.max(-3, Math.min(3, v));
  return (
    <Panel
      controls={
        <>
          <Slider label="Time step Δt" value={ldt} min={-3} max={-0.7} step={0.05} onChange={setLdt} fmt={() => `${(dt * 1000).toFixed(dt < 0.01 ? 1 : 0)} ms`} hint={`= ${(1 / dt).toFixed(0)} Hz physics rate`} />
          <Readouts
            items={runs.map((r) => ({
              k: `${r.n} energy at 10 s`,
              v: `${(r.r.E[r.r.E.length - 1] / r.r.E[0]).toPrecision(3)}×`,
              tone: Math.abs(r.r.E[r.r.E.length - 1] / r.r.E[0] - 1) < 0.05 ? ("good" as const) : ("bad" as const),
            }))}
          />
        </>
      }
      footer={<>Mass on a spring, ẍ = −ω²x with ω = 2π (1 Hz), released from x = 1. Total energy should stay exactly 1×. Physics engines use symplectic or implicit methods with small steps for this reason.</>}
    >
      <div ref={box}>
        <svg viewBox="0 0 320 70" className="block w-full" role="img" aria-label="Three masses on springs, one per integrator">
          {runs.map((r, i) => {
            const x = 160 + 40 * clamp(at(r.r));
            const y = 14 + i * 22;
            return (
              <g key={r.n}>
                <line x1={20} x2={x - 8} y1={y} y2={y} style={{ stroke: C.line2 }} strokeDasharray="2 2" />
                <rect x={x - 8} y={y - 7} width={16} height={14} rx={3} style={{ fill: r.c }} />
                <text x={312} y={y + 3} textAnchor="end" fontSize={8} style={{ fill: C.muted }}>
                  {r.n}
                </text>
              </g>
            );
          })}
          <line x1={160} x2={160} y1={2} y2={68} style={{ stroke: C.faint }} strokeDasharray="1 3" />
        </svg>
        <Plot
          ariaLabel="Position over time for three integrators"
          height={170}
          series={[{ pts: exact, color: C.faint, width: 4, label: "exact cos(ωt)" }, ...runs.map((r) => ({ pts: r.r.t.map((t, i) => [t, r.r.x[i]] as [number, number]), color: r.c, width: 1.8, label: r.n }))]}
          vline={cursor}
          x={[0, T_END]}
          y={[-2, 2]}
          xLabel="t (s)"
        />
        <Plot
          ariaLabel="Energy over time for three integrators"
          height={110}
          series={runs.map((r) => ({ pts: r.r.t.map((t, i) => [t, r.r.E[i] / r.r.E[0]] as [number, number]), color: r.c, width: 1.8 }))}
          hlines={[{ y: 1, color: C.faint, label: "true energy" }]}
          x={[0, T_END]}
          y={[0, 3]}
          yLabel="energy / initial"
        />
      </div>
    </Panel>
  );
}
