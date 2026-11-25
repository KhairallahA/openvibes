"use client";

import { useMemo, useRef, useState } from "react";
import { ACTIONS, gwTerminal, qEpisode, rng, valueIteration, type GridWorld } from "./sim";
import { Btn, C, Panel, Plot, Readouts, Slider, Toggle, useRaf, useVisible } from "./ui";

const BASE = { w: 7, h: 5, walls: new Set([9, 16, 23, 11, 25]), goal: 6, pit: 20, start: 28, stepCost: 0.04 };

/** Tabular Q-learning, live. The robot starts knowing nothing; watch values spread back from the goal and the arrows become a policy. */
export default function GridworldRL() {
  const [alpha, setAlpha] = useState(0.5);
  const [gamma, setGamma] = useState(0.95);
  const [eps, setEps] = useState(0.2);
  const [slip, setSlip] = useState(0);
  const [auto, setAuto] = useState(false);
  const [showOpt, setShowOpt] = useState(false);
  const R = useRef(rng(4));
  const gw: GridWorld = useMemo(() => ({ ...BASE, slip }), [slip]);
  const [st, setSt] = useState(() => ({ Q: new Float64Array(BASE.w * BASE.h * 4), returns: [] as number[], trail: [] as number[], ep: 0 }));
  const V = useMemo(() => valueIteration(gw, gamma), [gw, gamma]);
  const [box, vis] = useVisible<HTMLDivElement>();

  const train = (n: number) =>
    setSt((p) => {
      const Q = p.Q.slice();
      const returns = p.returns.slice();
      let trail = p.trail;
      for (let i = 0; i < n; i++) {
        const r = qEpisode(gw, Q, alpha, gamma, eps, R.current);
        returns.push(r.ret);
        trail = r.visited;
      }
      return { Q, returns: returns.slice(-500), trail, ep: p.ep + n };
    });
  useRaf(() => train(2), auto && vis);

  const maxQ = (s: number) => Math.max(st.Q[s * 4], st.Q[s * 4 + 1], st.Q[s * 4 + 2], st.Q[s * 4 + 3]);
  const best = (s: number) => {
    let a = 0;
    for (let k = 1; k < 4; k++) if (st.Q[s * 4 + k] > st.Q[s * 4 + a]) a = k;
    return a;
  };
  const cs = 44;
  const color = (v: number) => (v >= 0 ? `rgba(74, 222, 128, ${Math.min(0.85, Math.abs(v))})` : `rgba(248, 113, 113, ${Math.min(0.85, Math.abs(v))})`);
  // greedy rollout success
  let s = gw.start, steps = 0;
  const seen = new Set<number>();
  while (!gwTerminal(gw, s) && steps < 40 && !seen.has(s)) {
    seen.add(s);
    const a = best(s);
    const x = (s % gw.w) + ACTIONS[a][0], y = Math.floor(s / gw.w) + ACTIONS[a][1];
    const n = y * gw.w + x;
    s = x < 0 || y < 0 || x >= gw.w || y >= gw.h || gw.walls.has(n) ? s : n;
    steps++;
  }
  const solved = s === gw.goal;
  const avg = st.returns.length ? st.returns.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, st.returns.length) : 0;
  const ma = st.returns.map((_, i) => {
    const w = st.returns.slice(Math.max(0, i - 19), i + 1);
    return [i, w.reduce((a, b) => a + b, 0) / w.length] as [number, number];
  });

  return (
    <Panel
      controls={
        <>
          <Slider label="Learning rate α" value={alpha} min={0.01} max={1} step={0.01} onChange={setAlpha} />
          <Slider label="Discount γ" value={gamma} min={0.5} max={0.99} step={0.01} onChange={setGamma} />
          <Slider label="Exploration ε" value={eps} min={0} max={1} step={0.01} onChange={setEps} />
          <Slider label="Slippery floor" value={slip} min={0} max={0.4} step={0.05} onChange={setSlip} fmt={(v) => `${Math.round(v * 100)} %`} hint="Chance the robot slides sideways instead of moving as commanded." />
          <div className="flex flex-wrap gap-1.5">
            <Btn primary onClick={() => setAuto((a) => !a)}>{auto ? "Pause" : "Train live"}</Btn>
            <Btn onClick={() => train(1)}>+1 episode</Btn>
            <Btn onClick={() => train(200)}>+200</Btn>
            <Btn onClick={() => setSt({ Q: new Float64Array(BASE.w * BASE.h * 4), returns: [], trail: [], ep: 0 })}>Forget</Btn>
          </div>
          <Toggle label="Show optimal values (value iteration)" checked={showOpt} onChange={setShowOpt} />
        </>
      }
      footer={<>Reward +1 at the goal, −1 in the pit, −0.04 per step. Update: Q(s,a) ← Q(s,a) + α [r + γ maxₐ′ Q(s′,a′) − Q(s,a)]. Cell colour = value; arrows = greedy action; dots = last episode.</>}
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${gw.w * cs} ${gw.h * cs}`} className="mx-auto block w-full max-w-[420px]" role="img" aria-label={`Grid world after ${st.ep} episodes; greedy policy ${solved ? "reaches the goal" : "does not reach the goal yet"}`}>
          {Array.from({ length: gw.w * gw.h }, (_, i) => {
            const x = (i % gw.w) * cs, y = Math.floor(i / gw.w) * cs;
            const wall = gw.walls.has(i);
            const term = i === gw.goal || i === gw.pit;
            const v = showOpt ? V[i] : maxQ(i);
            const a = best(i);
            return (
              <g key={i}>
                <rect x={x + 1} y={y + 1} width={cs - 2} height={cs - 2} rx={5} style={{ fill: wall ? C.ink2 : term ? (i === gw.goal ? "#4ade80" : "#f87171") : C.surface2 }} />
                {!wall && !term && <rect x={x + 1} y={y + 1} width={cs - 2} height={cs - 2} rx={5} style={{ fill: color(v) }} />}
                {!wall && !term && (st.ep > 0 || showOpt) && (
                  <text x={x + cs / 2} y={y + cs - 6} textAnchor="middle" fontSize={8} fontFamily="monospace" style={{ fill: C.ink }}>
                    {v.toFixed(2)}
                  </text>
                )}
                {!wall && !term && st.ep > 0 && !showOpt && (
                  <path d="M0,-8 L5,0 L1.8,0 L1.8,7 L-1.8,7 L-1.8,0 L-5,0 Z" transform={`translate(${x + cs / 2},${y + cs / 2 - 4}) rotate(${a * 90}) scale(0.9)`} style={{ fill: C.ink }} opacity={0.75} />
                )}
                {term && (
                  <text x={x + cs / 2} y={y + cs / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0b0b0d">
                    {i === gw.goal ? "+1" : "−1"}
                  </text>
                )}
                {i === gw.start && (
                  <text x={x + 5} y={y + 12} fontSize={9} fontWeight={700} style={{ fill: C.ink }}>
                    S
                  </text>
                )}
              </g>
            );
          })}
          {st.trail.map((n, k) => (
            <circle key={k} cx={(n % gw.w) * cs + cs / 2 + ((k * 7) % 9) - 4} cy={Math.floor(n / gw.w) * cs + cs / 2 + ((k * 5) % 9) - 4} r={2} style={{ fill: C.amber }} opacity={0.8} />
          ))}
        </svg>
        <Plot ariaLabel="Episode return" height={100} series={[{ pts: ma, color: C.accent, label: "discounted return per episode (20-ep average)" }]} x={[0, Math.max(20, st.returns.length)]} y={[-1.5, 1]} />
        <div className="mt-2 px-1">
          <Readouts
            items={[
              { k: "episodes", v: st.ep },
              { k: "greedy policy", v: solved ? `reaches goal in ${steps}` : "not yet", tone: solved ? "good" : "bad" },
              { k: "avg return, last 50", v: avg.toFixed(2) },
              { k: "optimal V(start)", v: V[gw.start].toFixed(2) },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}
