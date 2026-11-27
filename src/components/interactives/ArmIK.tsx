"use client";

import { useRef, useState } from "react";
import { dlsStep, ellipse2, fk2, ik2, jac2 } from "./sim";
import { Btn, C, MatrixView, Panel, Readouts, Seg, Slider, deg, svgPoint, useRaf } from "./ui";

type Mode = "analytic" | "dls";
const L1 = 1, L2 = 0.75;

/** Drag a target: closed-form IK (two elbow solutions) or damped-least-squares iterations, with the live Jacobian and its manipulability ellipse. */
export default function ArmIK() {
  const [target, setTarget] = useState<[number, number]>([1.1, 0.7]);
  const [elbowUp, setElbowUp] = useState(true);
  const [mode, setMode] = useState<Mode>("analytic");
  const [q, setQ] = useState<[number, number]>([0.2, 0.4]);
  const [lambda, setLambda] = useState(0.08);
  const [iters, setIters] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef(false);

  const sol = ik2(L1, L2, target[0], target[1], elbowUp);
  const [t1, t2] = mode === "analytic" ? [sol.t1, sol.t2] : q;
  const { elbow, ee } = fk2(L1, L2, t1, t2);
  const J = jac2(L1, L2, t1, t2);
  const detJ = J[0][0] * J[1][1] - J[0][1] * J[1][0];
  const ell = ellipse2(J);
  const err = Math.hypot(target[0] - ee[0], target[1] - ee[1]);

  // DLS animation: a few iterations per frame until converged
  useRaf(() => {
    if (mode !== "dls" || err < 1e-4) return;
    let cur = q;
    for (let k = 0; k < 2; k++) cur = dlsStep(L1, L2, cur[0], cur[1], target[0], target[1], lambda);
    setQ(cur);
    setIters((n) => n + 2);
  }, mode === "dls" && err >= 1e-4 && iters < 4000);

  const S = 80, cx = 160, cy = 160;
  const v = (p: [number, number]) => [cx + S * p[0], cy - S * p[1]] as const;
  const e = v(elbow), f = v(ee), tg = v(target);

  const setFromClient = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const p = svgPoint(svgRef.current, clientX, clientY);
    setTarget([+((p.x - cx) / S).toFixed(3), +((cy - p.y) / S).toFixed(3)]);
    setIters(0);
  };
  const nudge = (dx: number, dy: number) => {
    setTarget(([a, b]) => [+(a + dx).toFixed(3), +(b + dy).toFixed(3)]);
    setIters(0);
  };
  const singular = Math.abs(detJ) < 0.06;

  return (
    <Panel
      controls={
        <>
          <Seg label="Solver" value={mode} onChange={(m) => { setMode(m); setIters(0); }} options={[{ v: "analytic", l: "Closed form" }, { v: "dls", l: "Numerical (DLS)" }]} />
          {mode === "analytic" ? (
            <Seg label="Solution branch" value={elbowUp ? "up" : "down"} onChange={(v) => setElbowUp(v === "up")} options={[{ v: "up", l: "Elbow up" }, { v: "down", l: "Elbow down" }]} />
          ) : (
            <>
              <Slider label="Damping λ" value={lambda} min={0.01} max={0.5} step={0.01} onChange={setLambda} hint="Small λ: fast but jumpy near singularities. Large λ: smooth but slow." />
              <Btn onClick={() => { setQ([0.2, 0.4]); setIters(0); }}>Restart from θ = (0.2, 0.4)</Btn>
            </>
          )}
          <div className="flex flex-wrap gap-1.5">
            <Btn onClick={() => { setTarget([1.7, 0.2]); setIters(0); }}>Near full stretch</Btn>
            <Btn onClick={() => { setTarget([2.2, 1]); setIters(0); }}>Out of reach</Btn>
          </div>
          <Readouts
            items={[
              { k: "θ₁", v: `${deg(t1).toFixed(1)}°` },
              { k: "θ₂", v: `${deg(t2).toFixed(1)}°` },
              { k: "error", v: err < 1e-3 ? "< 1 mm" : `${(err * 1000).toFixed(0)} mm`, tone: err < 1e-3 ? "good" : "bad" },
              { k: mode === "dls" ? "iterations" : "reachable", v: mode === "dls" ? iters : sol.reachable ? "yes" : "no", tone: mode === "dls" ? undefined : sol.reachable ? "good" : "bad" },
            ]}
          />
        </>
      }
      footer={<>Drag the target (or focus it and use arrow keys). The ellipse shows how fast the hand can move in each direction for unit joint speed; it collapses to a line at a singularity (det J = 0).</>}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 320 300"
        className="mx-auto block w-full max-w-[460px] touch-none select-none"
        onPointerDown={(e) => {
          drag.current = true;
          (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
          setFromClient(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => drag.current && setFromClient(e.clientX, e.clientY)}
        onPointerUp={() => (drag.current = false)}
        onPointerCancel={() => (drag.current = false)}
        role="img"
        aria-label="Two-link arm reaching for a draggable target"
      >
        <circle cx={cx} cy={cy} r={S * (L1 + L2)} style={{ fill: C.accent }} fillOpacity={0.05} />
        <circle cx={cx} cy={cy} r={S * (L1 - L2)} style={{ fill: C.bg }} />
        <circle cx={cx} cy={cy} r={S * (L1 + L2)} fill="none" style={{ stroke: C.line2 }} strokeDasharray="4 4" />
        <line x1={0} x2={320} y1={cy} y2={cy} style={{ stroke: C.line }} />
        <line x1={cx} x2={cx} y1={0} y2={300} style={{ stroke: C.line }} />
        {mode === "analytic" &&
          (() => {
            const alt = ik2(L1, L2, target[0], target[1], !elbowUp);
            const a = fk2(L1, L2, alt.t1, alt.t2);
            const ae = v(a.elbow), af = v(a.ee);
            return <polyline points={`${cx},${cy} ${ae[0]},${ae[1]} ${af[0]},${af[1]}`} fill="none" style={{ stroke: C.faint }} strokeWidth={3} strokeDasharray="5 4" strokeLinecap="round" />;
          })()}
        <line x1={cx} y1={cy} x2={e[0]} y2={e[1]} style={{ stroke: C.ink }} strokeWidth={8} strokeLinecap="round" opacity={0.85} />
        <line x1={e[0]} y1={e[1]} x2={f[0]} y2={f[1]} style={{ stroke: C.accent }} strokeWidth={7} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={7} style={{ fill: C.surface2, stroke: C.ink }} strokeWidth={2} />
        <circle cx={e[0]} cy={e[1]} r={5.5} style={{ fill: C.surface2, stroke: C.ink }} strokeWidth={2} />
        <ellipse
          cx={f[0]}
          cy={f[1]}
          rx={Math.max(0.5, 28 * ell.s1)}
          ry={Math.max(0.5, 28 * ell.s2)}
          transform={`rotate(${-deg(ell.angle)} ${f[0]} ${f[1]})`}
          style={{ fill: singular ? C.pink : C.violet, stroke: singular ? C.pink : C.violet }}
          fillOpacity={0.15}
        />
        <circle
          cx={tg[0]}
          cy={tg[1]}
          r={11}
          tabIndex={0}
          role="slider"
          aria-label="IK target (arrow keys move it)"
          aria-valuetext={`x ${target[0].toFixed(2)}, y ${target[1].toFixed(2)}`}
          onKeyDown={(e) => {
            const d = 0.05;
            if (e.key === "ArrowRight") nudge(d, 0);
            else if (e.key === "ArrowLeft") nudge(-d, 0);
            else if (e.key === "ArrowUp") nudge(0, d);
            else if (e.key === "ArrowDown") nudge(0, -d);
            else return;
            e.preventDefault();
          }}
          className="cursor-grab outline-none"
          fill="none"
          style={{ stroke: sol.reachable ? C.amber : C.pink }}
          strokeWidth={2.5}
        />
        <circle cx={tg[0]} cy={tg[1]} r={3} style={{ fill: sol.reachable ? C.amber : C.pink }} />
        <circle cx={f[0]} cy={f[1]} r={4} style={{ fill: C.ink }} />
        {singular && (
          <text x={160} y={292} textAnchor="middle" fontSize={11} fontWeight={700} style={{ fill: C.pink }}>
            Near a singularity: det J ≈ 0
          </text>
        )}
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-1">
        <MatrixView m={J} label="J(θ) =" digits={3} />
        <span className={`font-mono text-xs ${singular ? "text-rose-400" : "text-ink-2"}`}>det J = l₁l₂ sin θ₂ = {detJ.toFixed(3)}</span>
      </div>
    </Panel>
  );
}
