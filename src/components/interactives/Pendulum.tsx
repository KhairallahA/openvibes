"use client";

import { useState } from "react";
import { pendulumPeriod, pendulumStep, type PendState } from "./sim";
import { Btn, C, Panel, Plot, Readouts, Slider, fmtDeg, rad, useRaf, useVisible } from "./ui";

const G = 9.81;

/** A real (nonlinear, RK4-integrated) pendulum: watch energy slosh between kinetic and potential, and the period grow with amplitude. */
export default function Pendulum() {
  const [a0, setA0] = useState(60);
  const [L, setL] = useState(1);
  const [c, setC] = useState(0.1);
  const [run, setRun] = useState(true);
  const [s, setS] = useState<PendState & { t: number }>({ th: rad(60), w: 0, t: 0 });
  const [hist, setHist] = useState<[number, number][]>([]);
  const [box, vis] = useVisible<HTMLDivElement>();

  const reset = (deg = a0) => {
    setS({ th: rad(deg), w: 0, t: 0 });
    setHist([]);
  };

  useRaf((dt) => {
    let cur: PendState = s;
    const h = 1 / 600;
    const n = Math.max(1, Math.round(dt / h));
    for (let i = 0; i < n; i++) cur = pendulumStep(cur, h, G, L, c);
    const time = s.t + n * h;
    setS({ ...cur, t: time });
    setHist((p) => {
      const next = [...p, [time, (cur.th * 180) / Math.PI] as [number, number]];
      return next.length > 600 ? next.slice(-600) : next;
    });
  }, run && vis);

  const m = 1;
  const KE = 0.5 * m * (L * s.w) ** 2;
  const PE = m * G * L * (1 - Math.cos(s.th));
  const E0 = m * G * L * (1 - Math.cos(rad(a0)));
  const Tsmall = 2 * Math.PI * Math.sqrt(L / G);
  const Treal = pendulumPeriod(rad(a0), G, L);
  const px = 160 + 110 * (L / 1.5) * Math.sin(s.th);
  const py = 30 + 110 * (L / 1.5) * Math.cos(s.th);
  const tNow = s.t;
  const maxE = Math.max(E0, KE + PE, 1e-6);

  return (
    <Panel
      controls={
        <>
          <Slider label="Release angle θ₀" value={a0} min={5} max={175} step={1} onChange={(v) => { setA0(v); reset(v); }} fmt={fmtDeg} />
          <Slider label="Length L" value={L} min={0.25} max={1.5} step={0.05} onChange={(v) => { setL(v); reset(); }} fmt={(v) => `${v.toFixed(2)} m`} />
          <Slider label="Damping c" value={c} min={0} max={1} step={0.01} onChange={setC} fmt={(v) => `${v.toFixed(2)} 1/s`} />
          <div className="flex gap-1.5">
            <Btn primary onClick={() => setRun((r) => !r)}>{run ? "Pause" : "Play"}</Btn>
            <Btn onClick={() => reset()}>Release again</Btn>
          </div>
          <Readouts
            items={[
              { k: "T small-angle", v: `${Tsmall.toFixed(3)} s` },
              { k: `T at ${a0}°`, v: Number.isFinite(Treal) ? `${Treal.toFixed(3)} s` : "—", tone: "accent" },
              { k: "ratio", v: Number.isFinite(Treal) ? (Treal / Tsmall).toFixed(3) : "—" },
              { k: "energy now / start", v: E0 > 0 ? ((KE + PE) / E0).toFixed(3) : "—" },
            ]}
          />
        </>
      }
      footer={<>θ̈ = −(g/L) sin θ − c θ̇, integrated with RK4 at 600 Hz. With c = 0 total energy stays flat; at large angles the period is longer than 2π√(L/g).</>}
    >
      <div ref={box} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem]">
        <svg viewBox="0 0 320 200" className="block w-full" role="img" aria-label={`Pendulum at ${Math.round((s.th * 180) / Math.PI)} degrees`}>
          <line x1={110} x2={210} y1={30} y2={30} style={{ stroke: C.line2 }} strokeWidth={3} />
          <line x1={160} y1={30} x2={px} y2={py} style={{ stroke: C.ink }} strokeWidth={2} />
          <circle cx={px} cy={py} r={12} style={{ fill: C.accent }} />
          <circle cx={160} cy={30} r={3} style={{ fill: C.ink }} />
        </svg>
        <div className="flex items-end justify-center gap-3 pb-2" aria-label="Energy bars">
          {[
            { l: "KE", v: KE, c: C.amber },
            { l: "PE", v: PE, c: C.z },
            { l: "Total", v: KE + PE, c: C.accent },
          ].map((b) => (
            <div key={b.l} className="flex flex-col items-center gap-1">
              <div className="flex h-28 w-5 items-end overflow-hidden rounded bg-surface-2">
                <div className="w-full rounded" style={{ height: `${Math.min(100, (b.v / maxE) * 100)}%`, background: b.c }} />
              </div>
              <span className="text-[10px] text-muted">{b.l}</span>
            </div>
          ))}
        </div>
      </div>
      <Plot
        ariaLabel="Angle over time"
        height={140}
        series={[{ pts: hist, color: C.accent, label: "θ (deg)" }]}
        x={[Math.max(0, tNow - 10), Math.max(10, tNow)]}
        y={[-Math.max(10, a0) * 1.1, Math.max(10, a0) * 1.1]}
        xLabel="t (s)"
      />
    </Panel>
  );
}
