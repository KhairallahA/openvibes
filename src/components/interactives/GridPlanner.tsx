"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/lib/stores";
import { gridSearch, rng, type Algo } from "./sim";
import { Btn, Panel, Readouts, Seg, Slider, Toggle, useRaf } from "./ui";

const GW = 28, GH = 17;
const NAMES: Record<Algo, string> = { astar: "A*", dijkstra: "Dijkstra", greedy: "Greedy best-first", bfs: "BFS" };

function maze(seed: number) {
  const R = rng(seed);
  const b = new Uint8Array(GW * GH);
  for (let x = 4; x < GW - 3; x += 5) {
    const gap = 1 + Math.floor(R.next() * (GH - 3));
    for (let y = 0; y < GH; y++) if (Math.abs(y - gap) > 1) b[y * GW + x] = 1;
  }
  return b;
}

/** Paint walls, move start/goal, and watch BFS, Dijkstra, greedy and A* explore the grid. */
export default function GridPlanner() {
  const { theme } = useTheme();
  const cv = useRef<HTMLCanvasElement>(null);
  const [blocked, setBlocked] = useState<Uint8Array>(() => maze(2));
  const [start, setStart] = useState(8 * GW + 1);
  const [goal, setGoal] = useState(8 * GW + GW - 2);
  const [algo, setAlgo] = useState<Algo>("astar");
  const [diag, setDiag] = useState(true);
  const [speed, setSpeed] = useState(12);
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(true);
  const drag = useRef<null | "start" | "goal" | 0 | 1>(null);

  const res = useMemo(() => gridSearch(GW, GH, blocked, start, goal, algo, diag), [blocked, start, goal, algo, diag]);
  const compare = useMemo(
    () => (["bfs", "dijkstra", "greedy", "astar"] as Algo[]).map((a) => ({ a, r: gridSearch(GW, GH, blocked, start, goal, a, diag) })),
    [blocked, start, goal, diag],
  );
  const opt = compare.find((c) => c.a === "dijkstra")!.r.length;
  const done = shown >= res.order.length;

  useRaf((dt) => setShown((s) => Math.min(res.order.length, s + Math.max(1, Math.round(speed * 60 * dt)))), playing && !done);

  // draw
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const css = getComputedStyle(c);
    const col = (n: string) => css.getPropertyValue(n).trim() || "#888";
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth, h = (w * GH) / GW;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    const g = c.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cs = w / GW;
    g.fillStyle = col("--bg-2");
    g.fillRect(0, 0, w, h);
    const accent = col("--accent-fg");
    g.globalAlpha = 0.28;
    g.fillStyle = accent;
    for (let i = 0; i < Math.min(shown, res.order.length); i++) {
      const n = res.order[i];
      g.fillRect((n % GW) * cs, Math.floor(n / GW) * cs, cs, cs);
    }
    g.globalAlpha = 1;
    if (!done && shown > 0) {
      const n = res.order[shown - 1];
      g.fillStyle = accent;
      g.fillRect((n % GW) * cs, Math.floor(n / GW) * cs, cs, cs);
    }
    g.fillStyle = col("--ink-2");
    for (let i = 0; i < GW * GH; i++) if (blocked[i]) g.fillRect((i % GW) * cs, Math.floor(i / GW) * cs, cs, cs);
    g.strokeStyle = col("--line");
    g.lineWidth = 1;
    g.beginPath();
    for (let x = 0; x <= GW; x++) {
      g.moveTo(x * cs + 0.5, 0);
      g.lineTo(x * cs + 0.5, h);
    }
    for (let y = 0; y <= GH; y++) {
      g.moveTo(0, y * cs + 0.5);
      g.lineTo(w, y * cs + 0.5);
    }
    g.stroke();
    if (done && res.found) {
      g.strokeStyle = "#fbbf24";
      g.lineWidth = Math.max(2, cs * 0.28);
      g.lineJoin = "round";
      g.beginPath();
      res.path.forEach((n, i) => {
        const x = (n % GW + 0.5) * cs, y = (Math.floor(n / GW) + 0.5) * cs;
        if (i) g.lineTo(x, y);
        else g.moveTo(x, y);
      });
      g.stroke();
    }
    const dot = (n: number, fill: string, label: string) => {
      const x = (n % GW + 0.5) * cs, y = (Math.floor(n / GW) + 0.5) * cs;
      g.fillStyle = fill;
      g.beginPath();
      g.arc(x, y, cs * 0.42, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#0b0b0d";
      g.font = `bold ${Math.round(cs * 0.55)}px sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(label, x, y + 0.5);
    };
    dot(start, "#4ade80", "S");
    dot(goal, "#f472b6", "G");
  }, [blocked, res, shown, done, start, goal, theme]);

  const cellAt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * GW), y = Math.floor(((e.clientY - r.top) / r.height) * GH);
    if (x < 0 || y < 0 || x >= GW || y >= GH) return -1;
    return y * GW + x;
  };
  const edit = (n: number) => {
    if (n < 0) return;
    const d = drag.current;
    if (d === "start" && !blocked[n] && n !== goal) setStart(n);
    else if (d === "goal" && !blocked[n] && n !== start) setGoal(n);
    else if ((d === 0 || d === 1) && n !== start && n !== goal && blocked[n] !== d) {
      setBlocked((b) => {
        const c = b.slice();
        c[n] = d;
        return c;
      });
    }
    setShown(0);
    setPlaying(true);
  };
  const replay = () => {
    setShown(0);
    setPlaying(true);
  };

  return (
    <Panel
      controls={
        <>
          <Seg label="Algorithm" value={algo} onChange={(a) => { setAlgo(a); replay(); }} options={(Object.keys(NAMES) as Algo[]).map((a) => ({ v: a, l: NAMES[a] }))} />
          <Toggle label="Allow diagonal moves" checked={diag} onChange={(v) => { setDiag(v); replay(); }} />
          <Slider label="Animation speed" value={speed} min={1} max={60} step={1} onChange={setSpeed} fmt={(v) => `${v}×`} />
          <div className="flex flex-wrap gap-1.5">
            <Btn primary onClick={replay}>Replay</Btn>
            <Btn onClick={() => setShown(res.order.length)}>Skip</Btn>
            <Btn onClick={() => { setBlocked(new Uint8Array(GW * GH)); replay(); }}>Clear</Btn>
            <Btn onClick={() => { setBlocked(maze(Math.floor(Math.random() * 1e6))); replay(); }}>Walls</Btn>
            <Btn
              onClick={() => {
                const R = rng(Math.floor(Math.random() * 1e6));
                const b = new Uint8Array(GW * GH);
                for (let i = 0; i < b.length; i++) b[i] = R.next() < 0.28 && i !== start && i !== goal ? 1 : 0;
                setBlocked(b);
                replay();
              }}
            >
              Random
            </Btn>
          </div>
        </>
      }
      footer={<>Drag on the grid to paint or erase walls; drag S or G to move them. Costs: 1 per straight step, √2 per diagonal. A* uses the octile distance, which never overestimates, so its path is optimal.</>}
    >
      <canvas
        ref={cv}
        className="block w-full touch-none select-none rounded-lg"
        style={{ aspectRatio: `${GW} / ${GH}` }}
        role="img"
        aria-label={`${NAMES[algo]} search on a grid: ${res.found ? `path of length ${res.length.toFixed(1)}` : "no path"}, ${res.order.length} cells expanded`}
        onPointerDown={(e) => {
          const n = cellAt(e);
          if (n < 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = n === start ? "start" : n === goal ? "goal" : blocked[n] ? 0 : 1;
          edit(n);
        }}
        onPointerMove={(e) => drag.current !== null && edit(cellAt(e))}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      />
      <div className="mt-2 px-1">
        <Readouts
          items={[
            { k: "cells expanded", v: `${Math.min(shown, res.order.length)} / ${res.order.length}` },
            { k: "path length", v: res.found ? res.length.toFixed(2) : "no path", tone: res.found ? (Math.abs(res.length - opt) < 1e-9 ? "good" : "bad") : "bad" },
          ]}
        />
        <table className="mt-2 w-full text-left text-xs">
          <caption className="sr-only">Comparison of all four algorithms on this map</caption>
          <thead className="text-faint">
            <tr>
              <th className="py-1 font-medium">Algorithm</th>
              <th className="py-1 text-right font-medium">Expanded</th>
              <th className="py-1 text-right font-medium">Path</th>
              <th className="py-1 text-right font-medium">Optimal?</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums text-ink-2">
            {compare.map(({ a, r }) => (
              <tr key={a} className={a === algo ? "text-ink" : ""}>
                <td className="py-0.5 font-sans">{NAMES[a]}</td>
                <td className="py-0.5 text-right">{r.order.length}</td>
                <td className="py-0.5 text-right">{r.found ? r.length.toFixed(2) : "—"}</td>
                <td className="py-0.5 text-right">{r.found ? (Math.abs(r.length - opt) < 1e-9 ? "✓" : "✗") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
