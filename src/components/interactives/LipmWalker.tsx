"use client";

import { useMemo, useState } from "react";
import { capturePoint, lipm } from "./sim";
import { Btn, C, Panel, Plot, Readouts, Seg, Slider, useRaf, useVisible } from "./ui";

const G = 9.81;
type Mode = "push" | "walk";

/** Linear inverted pendulum: shove the robot, then choose where to step. Step on the capture point and it stops dead. */
export default function LipmWalker() {
  const [mode, setMode] = useState<Mode>("push");
  const [z0, setZ0] = useState(0.9);
  const [v0, setV0] = useState(0.6);
  const [foot, setFoot] = useState(0.15);
  const [b, setB] = useState(0.05);
  const [tStep, setTStep] = useState(0.45);
  const [t, setT] = useState(0);
  const [run, setRun] = useState(false);
  const [box, vis] = useVisible<HTMLDivElement>();
  const w = Math.sqrt(G / z0);
  const xi0 = capturePoint(0, v0, z0);
  const DUR = mode === "push" ? 2 : 4;

  // precompute trajectory
  const traj = useMemo(() => {
    const out: { t: number; x: number; v: number; p: number; xi: number }[] = [];
    if (mode === "push") {
      for (let k = 0; k <= 200; k++) {
        const tt = (k / 200) * DUR;
        const s = lipm(0, v0, foot, z0, tt);
        out.push({ t: tt, x: s.x, v: s.v, p: foot, xi: s.x + s.v / w });
      }
    } else {
      // walking: each step lasts tStep; next foot = capture point − b (b > 0 keeps walking forward, b = 0 stops)
      let x = 0, v = v0, p = 0, t0 = 0;
      for (let k = 0; k <= 400; k++) {
        const tt = (k / 400) * DUR;
        while (tt - t0 >= tStep) {
          const s = lipm(x, v, p, z0, tStep);
          x = s.x;
          v = s.v;
          p = capturePoint(x, v, z0) - b;
          t0 += tStep;
        }
        const s = lipm(x, v, p, z0, tt - t0);
        out.push({ t: tt, x: s.x, v: s.v, p, xi: s.x + s.v / w });
      }
    }
    return out;
  }, [mode, v0, foot, z0, w, b, tStep, DUR]);

  useRaf((dt) => setT((p) => (p + dt >= DUR ? DUR : p + dt)), run && vis && t < DUR);
  const cur = traj[Math.min(traj.length - 1, Math.round((t / DUR) * (traj.length - 1)))];
  const fell = mode === "push" && Math.abs(cur.x - cur.p) > z0 * 0.8;
  const outcome = mode === "push" ? (Math.abs(foot - xi0) < 0.02 ? "captured: comes to rest over the foot" : foot < xi0 ? "falls forward (step too short)" : "falls backward (step too long)") : "";

  // view: x ∈ [-0.6, 3] m
  const span = mode === "push" ? [-0.6, 1.6] : [-0.5, Math.max(2, traj[traj.length - 1].x + 0.5)];
  const sx = (x: number) => 15 + ((x - span[0]) / (span[1] - span[0])) * 290;
  const sy = (z: number) => 170 - z * 130;
  const comX = Math.max(span[0] - 1, Math.min(span[1] + 1, cur.x));
  const start = () => {
    setT(0);
    setRun(true);
  };

  return (
    <Panel
      controls={
        <>
          <Seg label="Experiment" value={mode} onChange={(m) => { setMode(m); setT(0); setRun(false); }} options={[{ v: "push", l: "Push & one step" }, { v: "walk", l: "Walk" }]} />
          <Slider label="Push: initial speed v₀" value={v0} min={-1} max={1} step={0.05} onChange={(v) => { setV0(v); setT(0); }} fmt={(v) => `${v.toFixed(2)} m/s`} />
          <Slider label="COM height z₀" value={z0} min={0.5} max={1.2} step={0.05} onChange={(v) => { setZ0(v); setT(0); }} fmt={(v) => `${v.toFixed(2)} m`} />
          {mode === "push" ? (
            <>
              <Slider label="Where you step (foot x)" value={foot} min={-0.4} max={0.8} step={0.01} onChange={(v) => { setFoot(v); setT(0); }} fmt={(v) => `${v.toFixed(2)} m`} />
              <Btn onClick={() => { setFoot(+xi0.toFixed(2)); setT(0); }}>Step on the capture point</Btn>
            </>
          ) : (
            <>
              <Slider label="Step behind capture point b" value={b} min={0} max={0.15} step={0.005} onChange={(v) => { setB(v); setT(0); }} fmt={(v) => `${(v * 100).toFixed(1)} cm`} hint="b = 0 stops after one step; larger b keeps walking faster." />
              <Slider label="Step duration" value={tStep} min={0.25} max={0.8} step={0.05} onChange={(v) => { setTStep(v); setT(0); }} fmt={(v) => `${v.toFixed(2)} s`} />
            </>
          )}
          <Btn primary onClick={start}>{t > 0 && t < DUR ? "Restart" : "Run"}</Btn>
          <Readouts
            items={[
              { k: "ω = √(g/z₀)", v: `${w.toFixed(2)} 1/s` },
              { k: "capture point ξ₀", v: `${xi0.toFixed(3)} m`, tone: "accent" },
              { k: "COM speed now", v: `${cur.v.toFixed(2)} m/s` },
              { k: mode === "push" ? "outcome" : "COM x", v: mode === "push" ? (Math.abs(foot - xi0) < 0.02 ? "captured" : foot < xi0 ? "falls fwd" : "falls back") : `${cur.x.toFixed(2)} m`, tone: mode === "push" ? (Math.abs(foot - xi0) < 0.02 ? "good" : "bad") : undefined },
            ]}
          />
        </>
      }
      footer={<>LIPM: ẍ = ω²(x − p). The capture point ξ = x + ẋ/ω is where the foot must go to stop. {mode === "push" && outcome && <strong className="text-ink-2">With this step it {outcome}.</strong>}</>}
    >
      <div ref={box}>
        <svg viewBox="0 0 320 190" className="block w-full" role="img" aria-label="Side view of a walking robot modelled as an inverted pendulum">
          <line x1={0} x2={320} y1={sy(0)} y2={sy(0)} style={{ stroke: C.line2 }} strokeWidth={2} />
          <line x1={0} x2={320} y1={sy(z0)} y2={sy(z0)} style={{ stroke: C.line }} strokeDasharray="3 4" />
          <line x1={sx(cur.xi)} x2={sx(cur.xi)} y1={sy(0) - 8} y2={sy(0) + 8} style={{ stroke: C.amber }} strokeWidth={3} />
          <text x={sx(cur.xi)} y={sy(0) + 18} textAnchor="middle" fontSize={9} style={{ fill: C.amber }}>
            ξ
          </text>
          <line x1={sx(cur.p)} y1={sy(0)} x2={sx(comX)} y2={fell ? sy(0.15) : sy(z0)} style={{ stroke: C.ink }} strokeWidth={3} strokeLinecap="round" />
          <rect x={sx(cur.p) - 9} y={sy(0) - 4} width={18} height={5} rx={2} style={{ fill: C.ink2 }} />
          <circle cx={sx(comX)} cy={fell ? sy(0.15) : sy(z0)} r={11} style={{ fill: fell ? C.pink : C.accent }} />
          <text x={sx(comX)} y={(fell ? sy(0.15) : sy(z0)) - 16} textAnchor="middle" fontSize={9} style={{ fill: C.muted }}>
            COM
          </text>
        </svg>
        <Plot
          ariaLabel="COM position, foot and capture point over time"
          height={130}
          series={[
            { pts: traj.filter((p) => p.t <= t + 1e-9).map((p) => [p.t, p.x] as [number, number]), color: C.accent, label: "COM x" },
            { pts: traj.filter((p) => p.t <= t + 1e-9).map((p) => [p.t, p.p] as [number, number]), color: C.ink2, width: 1.5, label: "foot p" },
            { pts: traj.filter((p) => p.t <= t + 1e-9).map((p) => [p.t, p.xi] as [number, number]), color: C.amber, width: 1.5, dash: "4 3", label: "capture point ξ" },
          ]}
          x={[0, DUR]}
          y={[span[0], span[1]]}
          xLabel="t (s)"
        />
      </div>
    </Panel>
  );
}
