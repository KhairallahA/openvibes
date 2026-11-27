"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/lib/stores";
import { armCollides, cspaceGrid, fk2, rrt, shortcut, wrap, type Circle } from "./sim";
import { Btn, C, Panel, Readouts, Seg, Slider, svgPoint, useRaf } from "./ui";

const L1 = 1, L2 = 0.8, N = 96;
type Q = [number, number];

/** Configuration space of a 2-link arm: drag obstacles in the workspace, watch them become blobs in (θ₁, θ₂), then plan with RRT. */
export default function ArmRRT() {
  const { theme } = useTheme();
  const [obs, setObs] = useState<Circle[]>([
    { x: 0.9, y: 0.6, r: 0.25 },
    { x: -0.6, y: 0.9, r: 0.3 },
    { x: 0.2, y: -1.1, r: 0.25 },
  ]);
  const [start, setStart] = useState<Q>([-0.3, 1.5]);
  const [goal, setGoal] = useState<Q>([0, -2.1]);
  const [pick, setPick] = useState<"start" | "goal">("goal");
  const [stepSize, setStepSize] = useState(0.25);
  const [seed, setSeed] = useState(1);
  const [phase, setPhase] = useState(0); // 0..1 tree growth, 1..2 arm motion
  const [running, setRunning] = useState(false);
  const cv = useRef<HTMLCanvasElement>(null);
  const ws = useRef<SVGSVGElement>(null);
  const dragObs = useRef<number | null>(null);

  const grid = useMemo(() => cspaceGrid(L1, L2, obs, N), [obs]);
  const startBad = armCollides(L1, L2, start[0], start[1], obs), goalBad = armCollides(L1, L2, goal[0], goal[1], obs);
  const [planned, setPlanned] = useState<{ plan: ReturnType<typeof rrt>; smooth: Q[] } | null>(null);
  const plan = planned?.plan ?? null;
  const smooth = planned?.smooth ?? [];
  const invalidate = () => {
    setPlanned(null);
    setPhase(0);
    setRunning(false);
  };

  useRaf((dt) => setPhase((p) => (p >= 2 ? 2 : p + dt * (p < 1 ? 0.6 : 0.45))), running && phase < 2);
  const run = (sd = seed) => {
    if (startBad || goalBad) return;
    const p = rrt(L1, L2, obs, start, goal, { step: stepSize, iters: 3000, seed: sd });
    setPlanned({ plan: p, smooth: p.found ? (shortcut(L1, L2, p.path, obs) as Q[]) : [] });
    setPhase(0);
    setRunning(true);
  };

  // configuration along the smoothed path at phase ∈ [1, 2]
  const along = (s: number): Q => {
    if (smooth.length < 2) return start;
    const segs = smooth.slice(1).map((q, i) => {
      const a = smooth[i];
      const d0 = wrap(q[0] - a[0]), d1 = wrap(q[1] - a[1]);
      return { a, d0, d1, len: Math.hypot(d0, d1) };
    });
    const total = segs.reduce((n, g) => n + g.len, 0);
    let rem = Math.max(0, Math.min(1, s)) * total;
    for (const g of segs) {
      if (rem <= g.len) return [wrap(g.a[0] + (g.d0 * rem) / (g.len || 1)), wrap(g.a[1] + (g.d1 * rem) / (g.len || 1))];
      rem -= g.len;
    }
    return smooth[smooth.length - 1];
  };
  const qNow: Q = phase > 1 && plan?.found ? along(phase - 1) : start;
  const shownNodes = plan ? Math.floor(Math.min(1, phase) * plan.nodes.length) : 0;

  // C-space canvas
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const css = getComputedStyle(c);
    const col = (n: string) => css.getPropertyValue(n).trim() || "#888";
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth;
    c.width = Math.round(w * dpr);
    c.height = Math.round(w * dpr);
    const g = c.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cs = w / N;
    g.fillStyle = col("--bg-2");
    g.fillRect(0, 0, w, w);
    g.fillStyle = "#f87171";
    g.globalAlpha = 0.55;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (grid[j * N + i]) g.fillRect(i * cs, (N - 1 - j) * cs, cs + 0.5, cs + 0.5);
    g.globalAlpha = 1;
    const P = (q: Q) => [((q[0] + Math.PI) / (2 * Math.PI)) * w, (1 - (q[1] + Math.PI) / (2 * Math.PI)) * w];
    const seg = (a: Q, b: Q) => {
      if (Math.abs(b[0] - a[0]) > Math.PI || Math.abs(b[1] - a[1]) > Math.PI) return; // wraps around the torus: skip
      const [x1, y1] = P(a), [x2, y2] = P(b);
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
    };
    if (plan) {
      g.strokeStyle = col("--accent-fg");
      g.globalAlpha = 0.6;
      g.lineWidth = 1;
      g.beginPath();
      for (let k = 1; k < shownNodes; k++) seg(plan.nodes[plan.parent[k]], plan.nodes[k]);
      g.stroke();
      g.globalAlpha = 1;
      if (phase >= 1 && plan.found) {
        g.strokeStyle = "#fbbf24";
        g.lineWidth = 2.5;
        g.beginPath();
        for (let k = 0; k <= 200; k++) {
          if (k) seg(along((k - 1) / 200), along(k / 200));
        }
        g.stroke();
      }
    }
    const dot = (q: Q, c2: string) => {
      const [x, y] = P(q);
      g.fillStyle = c2;
      g.beginPath();
      g.arc(x, y, 5, 0, 7);
      g.fill();
    };
    dot(start, "#4ade80");
    dot(goal, "#f472b6");
    if (phase > 1) dot(qNow, col("--ink"));
    g.fillStyle = col("--faint");
    g.font = "10px sans-serif";
    g.fillText("θ₁ →", w - 30, w - 4);
    g.fillText("θ₂ ↑", 4, 12);
  }, [grid, plan, shownNodes, phase, start, goal, qNow, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  const S = 70, cx = 150, cy = 150;
  const V = (p: [number, number]) => [cx + S * p[0], cy - S * p[1]] as const;
  const arm = (q: Q, color: string, op = 1, dash?: string) => {
    const { elbow, ee } = fk2(L1, L2, q[0], q[1]);
    const e = V(elbow), f = V(ee);
    return <polyline points={`${cx},${cy} ${e[0]},${e[1]} ${f[0]},${f[1]}`} fill="none" style={{ stroke: color }} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={op} strokeDasharray={dash} />;
  };

  const onCs = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const q: Q = [-Math.PI + ((e.clientX - r.left) / r.width) * 2 * Math.PI, Math.PI - ((e.clientY - r.top) / r.height) * 2 * Math.PI];
    if (pick === "start") setStart(q);
    else setGoal(q);
    invalidate();
  };

  return (
    <Panel
      controls={
        <>
          <Seg label="Tap the C-space to set" value={pick} onChange={setPick} options={[{ v: "start", l: "Start (green)" }, { v: "goal", l: "Goal (pink)" }]} />
          <Slider label="RRT step size" value={stepSize} min={0.08} max={0.6} step={0.01} onChange={(v) => { setStepSize(v); invalidate(); }} fmt={(v) => `${v.toFixed(2)} rad`} />
          <div className="flex flex-wrap gap-1.5">
            <Btn primary onClick={() => run()} disabled={startBad || goalBad}>Plan with RRT</Btn>
            <Btn onClick={() => { setSeed(seed + 1); run(seed + 1); }}>Re-plan (new seed)</Btn>
          </div>
          <Readouts
            items={[
              { k: "tree nodes", v: plan ? plan.nodes.length : "—" },
              { k: "result", v: startBad ? "start collides" : goalBad ? "goal collides" : !plan ? "press Plan" : plan.found ? `${smooth.length - 1} segment${smooth.length === 2 ? "" : "s"}` : "no path", tone: !plan && !startBad && !goalBad ? undefined : plan?.found ? "good" : "bad" },
            ]}
          />
          {plan && !plan.found && !startBad && !goalBad && <p className="text-[11px] leading-snug text-rose-400">No path after 3000 samples. Start and goal are probably in different free regions of C-space: no motion can connect them.</p>}
        </>
      }
      footer={<>Left: the real arm and obstacles (drag them). Right: the same scene in configuration space, where each pixel is one (θ₁, θ₂) and red means “the arm hits something”. The planner only ever works on the right.</>}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <svg
          ref={ws}
          viewBox="0 0 300 300"
          className="block w-full touch-none select-none"
          role="img"
          aria-label="Arm workspace with draggable obstacles"
          onPointerMove={(e) => {
            if (dragObs.current === null || !ws.current) return;
            const p = svgPoint(ws.current, e.clientX, e.clientY);
            const i = dragObs.current;
            setObs((o) => o.map((c, k) => (k === i ? { ...c, x: +((p.x - cx) / S).toFixed(2), y: +((cy - p.y) / S).toFixed(2) } : c)));
            invalidate();
          }}
          onPointerUp={() => (dragObs.current = null)}
          onPointerCancel={() => (dragObs.current = null)}
        >
          <circle cx={cx} cy={cy} r={S * (L1 + L2)} fill="none" style={{ stroke: C.line2 }} strokeDasharray="4 4" />
          {obs.map((o, i) => {
            const [x, y] = V([o.x, o.y]);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={S * o.r}
                className="cursor-grab"
                style={{ fill: "#f87171", stroke: "#f87171" }}
                fillOpacity={0.35}
                onPointerDown={(e) => {
                  dragObs.current = i;
                  (e.currentTarget.ownerSVGElement as Element | null)?.setPointerCapture?.(e.pointerId);
                }}
              />
            );
          })}
          {arm(start, "#4ade80", 0.35, "6 4")}
          {arm(goal, "#f472b6", 0.35, "6 4")}
          {arm(qNow, C.accent)}
          <circle cx={cx} cy={cy} r={6} style={{ fill: C.surface2, stroke: C.ink }} strokeWidth={2} />
        </svg>
        <canvas ref={cv} className="block aspect-square w-full touch-none rounded-lg" onPointerDown={onCs} role="img" aria-label="Configuration space map; tap to set start or goal" />
      </div>
    </Panel>
  );
}
