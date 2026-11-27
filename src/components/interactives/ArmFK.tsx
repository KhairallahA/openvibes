"use client";

import { useState } from "react";
import { fk2 } from "./sim";
import { Btn, C, Panel, Readouts, Slider, Toggle, fmtDeg, rad } from "./ui";

/** Forward kinematics of a planar 2-link arm: joint angles in, end-effector position out. */
export default function ArmFK() {
  const [t1, setT1] = useState(35);
  const [t2, setT2] = useState(50);
  const [l1, setL1] = useState(1);
  const [l2, setL2] = useState(0.7);
  const [trace, setTrace] = useState(true);
  const [trail, setTrail] = useState<[number, number][]>([]);
  const { elbow, ee } = fk2(l1, l2, rad(t1), rad(t2));
  const S = 70, cx = 160, cy = 150;
  const v = (p: [number, number]) => [cx + S * p[0], cy - S * p[1]] as const;
  const e = v(elbow), f = v(ee);
  const push = (fn: () => void, a = t1, b = t2) => {
    fn();
    if (trace) {
      const p = fk2(l1, l2, rad(a), rad(b)).ee;
      setTrail((t) => [...t.slice(-400), p]);
    }
  };
  const rOut = l1 + l2, rIn = Math.abs(l1 - l2);
  return (
    <Panel
      controls={
        <>
          <Slider label="θ₁ (shoulder)" value={t1} min={-180} max={180} step={1} onChange={(v) => push(() => setT1(v), v, t2)} fmt={fmtDeg} />
          <Slider label="θ₂ (elbow, relative)" value={t2} min={-180} max={180} step={1} onChange={(v) => push(() => setT2(v), t1, v)} fmt={fmtDeg} />
          <Slider label="l₁" value={l1} min={0.4} max={1.2} step={0.05} onChange={(v) => { setL1(v); setTrail([]); }} fmt={(v) => `${v.toFixed(2)} m`} />
          <Slider label="l₂" value={l2} min={0.3} max={1.2} step={0.05} onChange={(v) => { setL2(v); setTrail([]); }} fmt={(v) => `${v.toFixed(2)} m`} />
          <Toggle label="Trace the end-effector" checked={trace} onChange={setTrace} />
          <Btn onClick={() => setTrail([])}>Clear trace</Btn>
        </>
      }
      footer={<>The shaded ring is the workspace: every point with |l₁ − l₂| ≤ r ≤ l₁ + l₂. Notice the end-effector depends on θ₁ + θ₂, not θ₂ alone.</>}
    >
      <svg viewBox="0 0 320 300" className="mx-auto block w-full max-w-[460px]" role="img" aria-label={`Two-link arm. End-effector at x ${ee[0].toFixed(2)}, y ${ee[1].toFixed(2)}`}>
        <circle cx={cx} cy={cy} r={S * rOut} style={{ fill: C.accent }} fillOpacity={0.06} />
        <circle cx={cx} cy={cy} r={S * rIn} style={{ fill: C.bg }} />
        <circle cx={cx} cy={cy} r={S * rOut} fill="none" style={{ stroke: C.line2 }} strokeDasharray="4 4" />
        <line x1={10} x2={310} y1={cy} y2={cy} style={{ stroke: C.line }} />
        <line x1={cx} x2={cx} y1={10} y2={290} style={{ stroke: C.line }} />
        {trail.length > 1 && <polyline points={trail.map((p) => v(p).join(",")).join(" ")} fill="none" style={{ stroke: C.amber }} strokeWidth={1.5} opacity={0.8} />}
        <path d={`M${cx + 22},${cy} A22,22 0 ${Math.abs(t1) > 180 ? 1 : 0},${t1 >= 0 ? 0 : 1} ${cx + 22 * Math.cos(rad(t1))},${cy - 22 * Math.sin(rad(t1))}`} fill="none" style={{ stroke: C.x }} />
        <line x1={cx} y1={cy} x2={e[0]} y2={e[1]} style={{ stroke: C.ink }} strokeWidth={8} strokeLinecap="round" opacity={0.85} />
        <line x1={e[0]} y1={e[1]} x2={f[0]} y2={f[1]} style={{ stroke: C.accent }} strokeWidth={7} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={7} style={{ fill: C.surface2, stroke: C.ink }} strokeWidth={2} />
        <circle cx={e[0]} cy={e[1]} r={5.5} style={{ fill: C.surface2, stroke: C.ink }} strokeWidth={2} />
        <circle cx={f[0]} cy={f[1]} r={5} style={{ fill: C.amber }} />
        <text x={f[0] + 8} y={f[1] - 6} fontSize={11} style={{ fill: C.amber }}>
          ({ee[0].toFixed(2)}, {ee[1].toFixed(2)})
        </text>
      </svg>
      <div className="mt-2 px-1">
        <Readouts
          items={[
            { k: "x = l₁cosθ₁ + l₂cos(θ₁+θ₂)", v: `${ee[0].toFixed(3)} m`, tone: "accent" },
            { k: "y = l₁sinθ₁ + l₂sin(θ₁+θ₂)", v: `${ee[1].toFixed(3)} m`, tone: "accent" },
            { k: "elbow", v: `(${elbow[0].toFixed(2)}, ${elbow[1].toFixed(2)})` },
            { k: "reach r", v: `${Math.hypot(ee[0], ee[1]).toFixed(3)} m` },
          ]}
        />
      </div>
    </Panel>
  );
}
