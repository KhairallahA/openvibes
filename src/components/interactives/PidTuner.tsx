"use client";

import { useMemo, useState } from "react";
import { simulatePid } from "./sim";
import { Btn, C, Panel, Plot, Readouts, Slider, Toggle, useRaf, useVisible } from "./ui";

const presets: Record<string, [number, number, number]> = {
  "P only": [10, 0, 0],
  PD: [10, 0, 5.3],
  PID: [12, 4, 5],
  Aggressive: [80, 20, 6],
};

/** Tune a PID position controller on a 1 kg cart with friction. Live step response with rise time, overshoot, settling time. */
export default function PidTuner() {
  const [kp, setKp] = useState(10);
  const [ki, setKi] = useState(0);
  const [kd, setKd] = useState(0);
  const [noise, setNoise] = useState(0);
  const [dist, setDist] = useState(false);
  const [limit, setLimit] = useState(false);
  const [play, setPlay] = useState(0);
  const [box, vis] = useVisible<HTMLDivElement>();

  const sim = useMemo(
    () => simulatePid({ kp, ki, kd, m: 1, b: 1, setpoint: 1, tEnd: 12, noise, disturbance: dist ? -3 : 0, tDist: dist ? 7 : Infinity, uMax: limit ? 15 : Infinity }),
    [kp, ki, kd, noise, dist, limit],
  );
  const mt = sim.metrics;
  useRaf((dt) => setPlay((p) => (p + dt * 2 >= 12 ? 0 : p + dt * 2)), vis);
  const k = Math.max(0, Math.min(sim.t.length - 1, Math.round(play / 0.02)));
  const xCart = sim.y[k];
  const yAll = sim.y.concat([0, 1.2]);
  const yMax = Math.min(3, Math.max(...yAll) * 1.05), yMin = Math.max(-1, Math.min(...yAll));
  const uMaxAbs = Math.max(1, ...sim.u.map(Math.abs));
  const ok = (v: number) => Number.isFinite(v);

  return (
    <Panel
      controls={
        <>
          <Slider label="Kp (proportional)" value={kp} min={0} max={100} step={0.5} onChange={setKp} fmt={(v) => v.toFixed(1)} />
          <Slider label="Ki (integral)" value={ki} min={0} max={40} step={0.5} onChange={setKi} fmt={(v) => v.toFixed(1)} />
          <Slider label="Kd (derivative)" value={kd} min={0} max={20} step={0.1} onChange={setKd} fmt={(v) => v.toFixed(1)} />
          <Slider label="Sensor noise σ" value={noise} min={0} max={0.02} step={0.001} onChange={setNoise} fmt={(v) => `${(v * 1000).toFixed(0)} mm`} />
          <Toggle label="Push the cart at t = 7 s (−3 N)" checked={dist} onChange={setDist} />
          <Toggle label="Motor limit ±15 N" checked={limit} onChange={setLimit} />
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(presets).map(([n, [a, b, c]]) => (
              <Btn key={n} onClick={() => { setKp(a); setKi(b); setKd(c); }}>{n}</Btn>
            ))}
          </div>
        </>
      }
      footer={<>Plant: m ẍ = u − b ẋ (+ push) with m = 1 kg, b = 1 N·s/m, simulated at 1 kHz. Derivative acts on the measurement; integral has anti-windup.</>}
    >
      <div ref={box}>
        <svg viewBox="0 0 320 54" className="block w-full" role="img" aria-label={`Cart at ${xCart.toFixed(2)} metres, target 1 metre`}>
          <line x1={20} x2={300} y1={44} y2={44} style={{ stroke: C.line2 }} />
          {[0, 0.5, 1, 1.5].map((v) => (
            <text key={v} x={40 + v * 160} y={53} fontSize={8} textAnchor="middle" style={{ fill: C.faint }}>
              {v} m
            </text>
          ))}
          <line x1={200} x2={200} y1={6} y2={44} style={{ stroke: C.amber }} strokeDasharray="3 3" />
          <g transform={`translate(${40 + Math.max(-0.2, Math.min(1.7, xCart)) * 160},0)`}>
            <rect x={-16} y={20} width={32} height={18} rx={4} style={{ fill: C.accent }} />
            <circle cx={-9} cy={40} r={4} style={{ fill: C.ink }} />
            <circle cx={9} cy={40} r={4} style={{ fill: C.ink }} />
          </g>
        </svg>
        <Plot
          ariaLabel="Position step response"
          height={170}
          series={[{ pts: sim.t.map((t, i) => [t, sim.y[i]] as [number, number]), color: C.accent, label: "position x (m)" }]}
          hlines={[
            { y: 1, color: C.amber, label: "target" },
            { y: 1.02, color: C.faint, dash: "1 3" },
            { y: 0.98, color: C.faint, dash: "1 3" },
          ]}
          vline={play}
          x={[0, 12]}
          y={[yMin, yMax]}
        />
        <Plot ariaLabel="Control effort" height={80} series={[{ pts: sim.t.map((t, i) => [t, sim.u[i]] as [number, number]), color: C.violet, width: 1.5, label: "motor force u (N)" }]} x={[0, 12]} y={[-uMaxAbs, uMaxAbs]} xLabel="t (s)" />
        <div className="mt-2 px-1">
          <Readouts
            items={[
              { k: "rise 10→90 %", v: ok(mt.rise) ? `${mt.rise.toFixed(2)} s` : "never", tone: ok(mt.rise) ? undefined : "bad" },
              { k: "overshoot", v: `${mt.overshoot.toFixed(1)} %`, tone: mt.overshoot > 20 ? "bad" : mt.overshoot < 5 ? "good" : undefined },
              { k: "settle (±2 %)", v: ok(mt.settle) ? `${mt.settle.toFixed(2)} s` : "not settled", tone: ok(mt.settle) ? (mt.settle < 3 ? "good" : undefined) : "bad" },
              { k: dist ? "final error after push" : "steady-state error", v: `${((dist ? 1 - sim.y[sim.y.length - 1] : mt.sse) * 1000).toFixed(1)} mm` },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}
