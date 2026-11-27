"use client";

import { useRef, useState } from "react";
import { diffDrive, nEff, pfMean, pfPredict, pfUpdate, resample, rng, type Particle, type Pose } from "./sim";
import { Btn, C, Panel, Readouts, Slider, Toggle, useRaf, useVisible } from "./ui";

const W = 6, H = 4, WB = 0.35, N = 250, DT = 0.05;
const LM: [number, number][] = [[0.4, 0.4], [5.6, 0.6], [5.4, 3.6], [0.6, 3.5], [3, 2.2]];
type Cmd = { v: number; w: number };
type State = { truth: Pose; odo: Pose; ps: Particle[]; tTrail: [number, number][]; oTrail: [number, number][]; pTrail: [number, number][]; t: number };

function init(seed: number): State {
  const R = rng(seed);
  const start = { x: 1.2, y: 1.2, th: 0.3 };
  return {
    truth: start,
    odo: start,
    ps: Array.from({ length: N }, () => ({ x: start.x + 0.1 * R.gauss(), y: start.y + 0.1 * R.gauss(), th: start.th + 0.05 * R.gauss(), w: 1 / N })),
    tTrail: [],
    oTrail: [],
    pTrail: [],
    t: 0,
  };
}

/** Drive a differential-drive robot. Wheel odometry drifts; a particle filter with landmark ranges does not. */
export default function Localization() {
  const R = useRef(rng(21));
  const [st, setSt] = useState<State>(() => init(5));
  const [cmd, setCmd] = useState<Cmd>({ v: 0, w: 0 });
  const [auto, setAuto] = useState(true);
  const [bias, setBias] = useState(3);
  const [useLm, setUseLm] = useState(true);
  const [showP, setShowP] = useState(true);
  const [box, vis] = useVisible<HTMLDivElement>();

  const command = (t: number): Cmd => (auto ? { v: 0.55, w: 0.9 * Math.sin(t * 0.45) + 0.25 } : cmd);

  useRaf((dt) => {
    const rr = R.current;
    let s = st;
    const steps = Math.max(1, Math.round(dt / DT));
    for (let k = 0; k < steps; k++) {
      const c = command(s.t);
      const vl0 = c.v - (c.w * WB) / 2, vr0 = c.v + (c.w * WB) / 2;
      // true wheel speeds (a little slip), robot stops at the walls
      const vl = vl0 * (1 + 0.02 * rr.gauss()), vr = vr0 * (1 + 0.02 * rr.gauss());
      let truth = diffDrive(s.truth, vl, vr, WB, DT);
      let ml = vl * (1 + bias / 100) * (1 + 0.01 * rr.gauss()), mr = vr * (1 + 0.01 * rr.gauss());
      if (truth.x < 0.2 || truth.x > W - 0.2 || truth.y < 0.2 || truth.y > H - 0.2) {
        // bumper: rotate in place instead of going through the wall
        const turn = 1.2 * DT;
        truth = { ...s.truth, th: s.truth.th + turn };
        ml = (-turn * WB) / 2 / DT;
        mr = (turn * WB) / 2 / DT;
      }
      const odo = diffDrive(s.odo, ml, mr, WB, DT);
      let ps = pfPredict(s.ps, ml, mr, WB, DT, 0.06, rr);
      if (useLm) {
        const z = LM.map((l) => Math.hypot(l[0] - truth.x, l[1] - truth.y) + 0.08 * rr.gauss());
        ps = pfUpdate(ps, z, LM, 0.15);
        if (nEff(ps) < N / 2) ps = resample(ps, rr);
      }
      const m = pfMean(ps);
      const tail = (a: [number, number][], p: [number, number]) => (a.length > 400 ? [...a.slice(-400), p] : [...a, p]);
      s = { truth, odo, ps, t: s.t + DT, tTrail: tail(s.tTrail, [truth.x, truth.y]), oTrail: tail(s.oTrail, [odo.x, odo.y]), pTrail: tail(s.pTrail, [m.x, m.y]) };
    }
    setSt(s);
  }, vis && (auto || cmd.v !== 0 || cmd.w !== 0));

  const S = 50, ox = 10, oy = 210;
  const v = (x: number, y: number) => [ox + S * x, oy - S * y] as const;
  const m = pfMean(st.ps);
  const eOdo = Math.hypot(st.odo.x - st.truth.x, st.odo.y - st.truth.y);
  const ePf = Math.hypot(m.x - st.truth.x, m.y - st.truth.y);
  const robot = (p: Pose, color: string, dashed = false) => {
    const [x, y] = v(p.x, p.y);
    return (
      <g transform={`translate(${x},${y}) rotate(${(-p.th * 180) / Math.PI})`}>
        <circle r={9} style={{ fill: dashed ? "none" : color, stroke: color }} strokeDasharray={dashed ? "3 2" : undefined} strokeWidth={2} fillOpacity={0.25} />
        <line x1={0} y1={0} x2={13} y2={0} style={{ stroke: color }} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    );
  };
  const line = (pts: [number, number][]) => pts.map((p) => v(p[0], p[1]).join(",")).join(" ");
  const hold = (c: Cmd) => ({
    onPointerDown: (e: React.PointerEvent) => {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      setAuto(false);
      setCmd(c);
    },
    onPointerUp: () => setCmd({ v: 0, w: 0 }),
    onPointerCancel: () => setCmd({ v: 0, w: 0 }),
  });
  const pad = "grid size-10 cursor-pointer select-none place-items-center rounded-lg border border-line text-ink-2 active:bg-accent/20 touch-none";

  return (
    <Panel
      controls={
        <>
          <Toggle label="Autopilot (wander)" checked={auto} onChange={setAuto} />
          <div>
            <p className="mb-1.5 text-xs text-ink-2">Drive (hold, or focus the map and use arrow keys)</p>
            <div className="grid w-max grid-cols-3 gap-1">
              <span />
              <button type="button" aria-label="Forward" className={pad} {...hold({ v: 0.6, w: 0 })}>↑</button>
              <span />
              <button type="button" aria-label="Turn left" className={pad} {...hold({ v: 0.25, w: 1.4 })}>↶</button>
              <button type="button" aria-label="Reverse" className={pad} {...hold({ v: -0.4, w: 0 })}>↓</button>
              <button type="button" aria-label="Turn right" className={pad} {...hold({ v: 0.25, w: -1.4 })}>↷</button>
            </div>
          </div>
          <Slider label="Left encoder calibration error" value={bias} min={0} max={8} step={0.5} onChange={setBias} fmt={(v) => `${v.toFixed(1)} %`} hint="A wheel that is 3% off makes odometry curve away from reality." />
          <Toggle label="Particle filter uses landmark ranges" checked={useLm} onChange={setUseLm} />
          <Toggle label="Show particles" checked={showP} onChange={setShowP} />
          <Btn primary onClick={() => setSt(init(Math.floor(Math.random() * 1e6)))}>Reset</Btn>
        </>
      }
      footer={<>Grey dashed = wheel odometry (dead reckoning). Accent = particle-filter estimate from {N} particles that also read ranges to the {LM.length} landmarks. Amber = ground truth.</>}
    >
      <div ref={box}>
        <svg
          viewBox="0 0 320 220"
          className="block w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
          tabIndex={0}
          role="application"
          aria-label="Robot map. Arrow keys drive the robot."
          onKeyDown={(e) => {
            const map: Record<string, Cmd> = { ArrowUp: { v: 0.6, w: 0 }, ArrowDown: { v: -0.4, w: 0 }, ArrowLeft: { v: 0.25, w: 1.4 }, ArrowRight: { v: 0.25, w: -1.4 } };
            if (map[e.key]) {
              e.preventDefault();
              setAuto(false);
              setCmd(map[e.key]);
            }
          }}
          onKeyUp={() => setCmd({ v: 0, w: 0 })}
        >
          <rect x={ox} y={oy - S * H} width={S * W} height={S * H} rx={6} fill="none" style={{ stroke: C.line2 }} strokeWidth={2} />
          {LM.map((l, i) => {
            const [x, y] = v(l[0], l[1]);
            return (
              <g key={i}>
                {useLm && <line x1={x} y1={y} x2={v(st.truth.x, st.truth.y)[0]} y2={v(st.truth.x, st.truth.y)[1]} style={{ stroke: C.amber }} opacity={0.18} />}
                <rect x={x - 5} y={y - 5} width={10} height={10} transform={`rotate(45 ${x} ${y})`} style={{ fill: C.amber }} />
              </g>
            );
          })}
          {showP &&
            st.ps.map((p, i) => {
              const [x, y] = v(p.x, p.y);
              return <circle key={i} cx={x} cy={y} r={1.4} style={{ fill: C.accent }} opacity={0.55} />;
            })}
          <polyline points={line(st.oTrail)} fill="none" style={{ stroke: C.muted }} strokeDasharray="4 3" strokeWidth={1.5} />
          <polyline points={line(st.tTrail)} fill="none" style={{ stroke: C.amber }} strokeWidth={1.5} />
          <polyline points={line(st.pTrail)} fill="none" style={{ stroke: C.accent }} strokeWidth={1.5} opacity={0.8} />
          {robot(st.odo, C.muted, true)}
          {robot(m, C.accent)}
          {robot(st.truth, C.amber)}
        </svg>
        <div className="mt-2 px-1">
          <Readouts
            items={[
              { k: "odometry error", v: `${(eOdo * 100).toFixed(0)} cm`, tone: eOdo > 0.3 ? "bad" : undefined },
              { k: "particle filter error", v: `${(ePf * 100).toFixed(0)} cm`, tone: ePf < 0.2 ? "good" : "bad" },
              { k: "effective particles", v: nEff(st.ps).toFixed(0) },
              { k: "time driven", v: `${st.t.toFixed(0)} s` },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}
