"use client";

import { useMemo, useState } from "react";
import { c2d, cartPoleDeriv, cartPoleLinear, CP, dlqr, rk4 } from "./sim";
import { Btn, C, Panel, Plot, Readouts, Slider, Toggle, useRaf, useVisible } from "./ui";

const DT = 0.01;
const UMAX = 40;

/** Balance an inverted pendulum on a cart with LQR. Tune Q and R, push the pole, move the target, or switch the controller off. */
export default function LqrCartPole() {
  const [qx, setQx] = useState(1); // log10 weights
  const [qth, setQth] = useState(2);
  const [r, setR] = useState(-1);
  const [on, setOn] = useState(true);
  const [xRef, setXRef] = useState(0);
  const [st, setSt] = useState({ s: [0, 0, 0.15, 0], t: 0, u: 0, fallen: false });
  const [hist, setHist] = useState<[number, number][]>([]);
  const [box, vis] = useVisible<HTMLDivElement>();

  const K = useMemo(() => {
    const { A, B } = cartPoleLinear();
    const { Ad, Bd } = c2d(A, B, DT);
    const Q = [
      [10 ** qx, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 10 ** qth, 0],
      [0, 0, 0, 1],
    ];
    return dlqr(Ad, Bd, Q, 10 ** r).K;
  }, [qx, qth, r]);

  useRaf((dt) => {
    if (st.fallen) return;
    let s = st.s, u = 0, t = st.t;
    const n = Math.max(1, Math.round(dt / DT));
    for (let i = 0; i < n; i++) {
      const e = [s[0] - xRef, s[1], s[2], s[3]];
      u = on ? Math.max(-UMAX, Math.min(UMAX, -K.reduce((a, k, j) => a + k * e[j], 0))) : 0;
      const uu = u;
      s = rk4((x) => cartPoleDeriv(x, uu), s, DT);
      t += DT;
    }
    const fallen = Math.abs(s[2]) > Math.PI / 2;
    if (Math.abs(s[0]) > 2.4) s = [Math.sign(s[0]) * 2.4, 0, s[2], s[3]];
    setSt({ s, t, u, fallen });
    setHist((h) => {
      const nx = [...h, [t, (s[2] * 180) / Math.PI] as [number, number]];
      return nx.length > 500 ? nx.slice(-500) : nx;
    });
  }, vis);

  const push = (dir: number) => setSt((p) => ({ ...p, s: [p.s[0], p.s[1], p.s[2], p.s[3] + dir * 1.2] }));
  const reset = () => {
    setSt({ s: [0, 0, 0.15, 0], t: 0, u: 0, fallen: false });
    setHist([]);
  };

  const [x, , th] = st.s;
  const S = 60, cx = 160, gy = 150;
  const cartX = cx + S * x;
  const tipX = cartX + S * 2 * CP.l * Math.sin(th);
  const tipY = gy - 18 - S * 2 * CP.l * Math.cos(th);
  const fmt = (v: number) => v.toFixed(1);

  return (
    <Panel
      controls={
        <>
          <Slider label="Q weight on cart position" value={qx} min={-1} max={3} step={0.1} onChange={setQx} fmt={(v) => `10^${v.toFixed(1)}`} />
          <Slider label="Q weight on pole angle" value={qth} min={0} max={4} step={0.1} onChange={setQth} fmt={(v) => `10^${v.toFixed(1)}`} />
          <Slider label="R (cost of force)" value={r} min={-3} max={2} step={0.1} onChange={setR} fmt={(v) => `10^${v.toFixed(1)}`} />
          <Slider label="Cart target" value={xRef} min={-1.5} max={1.5} step={0.1} onChange={setXRef} fmt={(v) => `${v.toFixed(1)} m`} />
          <Toggle label="LQR controller on" checked={on} onChange={setOn} />
          <div className="flex flex-wrap gap-1.5">
            <Btn onClick={() => push(-1)} label="Push pole left">← Push</Btn>
            <Btn onClick={() => push(1)} label="Push pole right">Push →</Btn>
            <Btn primary onClick={reset}>Reset</Btn>
          </div>
        </>
      }
      footer={<>u = −K(x − x_ref). K comes from solving the discrete Riccati equation for the linearised model (100 Hz); the simulation itself is the full nonlinear cart-pole (M = 1 kg, m = 0.2 kg, l = 0.5 m), force limited to ±40 N.</>}
    >
      <div ref={box}>
        <svg viewBox="0 0 320 175" className="block w-full" role="img" aria-label={`Cart-pole, pole angle ${((th * 180) / Math.PI).toFixed(1)} degrees`}>
          <line x1={10} x2={310} y1={gy} y2={gy} style={{ stroke: C.line2 }} strokeWidth={2} />
          {[-2, -1, 0, 1, 2].map((v) => (
            <text key={v} x={cx + S * v} y={gy + 13} fontSize={8} textAnchor="middle" style={{ fill: C.faint }}>
              {v}
            </text>
          ))}
          <line x1={cx + S * xRef} x2={cx + S * xRef} y1={gy - 4} y2={gy + 4} style={{ stroke: C.amber }} strokeWidth={3} />
          <rect x={cartX - 22} y={gy - 26} width={44} height={20} rx={4} style={{ fill: C.surface2, stroke: C.ink }} />
          <line x1={cartX} y1={gy - 18} x2={tipX} y2={tipY} style={{ stroke: st.fallen ? C.pink : C.accent }} strokeWidth={5} strokeLinecap="round" />
          <circle cx={tipX} cy={tipY} r={8} style={{ fill: st.fallen ? C.pink : C.accent }} />
          {Math.abs(st.u) > 0.5 && <line x1={cartX} x2={cartX + st.u * 1.2} y1={gy - 16} y2={gy - 16} style={{ stroke: C.violet }} strokeWidth={3} markerEnd="" />}
          {st.fallen && (
            <text x={160} y={24} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: C.pink }}>
              It fell. Press Reset.
            </text>
          )}
        </svg>
        <Plot ariaLabel="Pole angle over time" height={110} series={[{ pts: hist, color: C.accent, label: "pole angle (deg)" }]} x={[Math.max(0, st.t - 8), Math.max(8, st.t)]} y={[-20, 20]} xLabel="t (s)" />
        <div className="mt-2 px-1">
          <Readouts
            items={[
              { k: "gain K", v: `[${K.map(fmt).join(", ")}]` },
              { k: "force u", v: `${st.u.toFixed(1)} N`, tone: Math.abs(st.u) >= UMAX - 0.1 ? "bad" : undefined },
              { k: "pole angle", v: `${((th * 180) / Math.PI).toFixed(2)}°`, tone: Math.abs(th) < 0.02 ? "good" : undefined },
              { k: "cart x", v: `${x.toFixed(2)} m` },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}
