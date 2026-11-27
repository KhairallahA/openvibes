"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/* ---------- colours (CSS variables so dark/light both work) ---------- */
export const C = {
  accent: "var(--accent-fg)",
  ink: "var(--ink)",
  ink2: "var(--ink-2)",
  muted: "var(--muted)",
  faint: "var(--faint)",
  line: "var(--line)",
  line2: "var(--line-2)",
  surface: "var(--surface)",
  surface2: "var(--surface-2)",
  bg: "var(--bg)",
  x: "#f87171", // red   (x axis / series 1)
  y: "#4ade80", // green (y axis)
  z: "#60a5fa", // blue  (z axis)
  amber: "#fbbf24",
  pink: "#f472b6",
  violet: "#a78bfa",
};

/* ---------- hooks ---------- */
/** Width of an element (ResizeObserver). */
export function useWidth<T extends HTMLElement>(initial = 600) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** requestAnimationFrame loop calling cb(dtSeconds) while running. Paused when the tab is hidden or reduced motion is on and not explicitly started. */
export function useRaf(cb: (dt: number) => void, running: boolean) {
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
  useEffect(() => {
    if (!running) return;
    let id = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      cbRef.current(dt);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [running]);
}

/** Pause animations while the panel is off-screen. */
export function useVisible<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { rootMargin: "100px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, vis] as const;
}

/** Pointer dragging inside an SVG: converts client coordinates to SVG user units. */
export function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const r = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const sx = vb && vb.width ? vb.width / r.width : 1;
  const sy = vb && vb.height ? vb.height / r.height : 1;
  return { x: (clientX - r.left) * sx + (vb?.x ?? 0), y: (clientY - r.top) * sy + (vb?.y ?? 0) };
}

/* ---------- layout ---------- */
export function Panel({ children, controls, footer }: { children: ReactNode; controls?: ReactNode; footer?: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-bg/60">
      <div className={controls ? "grid gap-0 md:grid-cols-[minmax(0,1fr)_15rem]" : ""}>
        <div className="min-w-0 p-2 sm:p-3">{children}</div>
        {controls && <div className="min-w-0 space-y-3 border-t border-line p-3 sm:p-4 md:border-l md:border-t-0">{controls}</div>}
      </div>
      {footer && <div className="border-t border-line px-3 py-2.5 text-xs text-muted sm:px-4">{footer}</div>}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  fmt = (v) => v.toFixed(2),
  hint,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  fmt?: (v: number) => string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <label htmlFor={id} className="text-ink-2">
          {label}
        </label>
        <output htmlFor={id} className="font-mono tabular-nums text-ink">
          {fmt(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 h-6 w-full cursor-pointer accent-[var(--accent-fg)]"
        aria-describedby={hint ? `${id}-h` : undefined}
      />
      {hint && (
        <p id={`${id}-h`} className="text-[11px] leading-snug text-faint">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="mb-1.5 text-xs text-ink-2">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={value === o.v}
            onClick={() => onChange(o.v)}
            className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs transition ${value === o.v ? "border-accent/60 bg-accent/15 text-ink" : "border-line text-muted hover:border-line-2 hover:text-ink"}`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Btn({ children, onClick, primary, disabled, label }: { children: ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        primary ? "bg-accent text-brand-ink hover:brightness-110" : "border border-line text-ink-2 hover:border-line-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-xs text-ink-2">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 cursor-pointer accent-[var(--accent-fg)]" />
    </label>
  );
}

export function Readouts({ items }: { items: { k: ReactNode; v: ReactNode; tone?: "good" | "bad" | "accent" }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-1.5">
      {items.map((it, i) => (
        <div key={i} className="min-w-0 rounded-lg bg-surface-2 px-2 py-1.5">
          <dt className="truncate text-[10px] uppercase tracking-wider text-faint">{it.k}</dt>
          <dd className={`truncate font-mono text-sm tabular-nums ${it.tone === "good" ? "text-emerald-400" : it.tone === "bad" ? "text-rose-400" : it.tone === "accent" ? "text-accent-fg" : "text-ink"}`}>{it.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Small matrix display (HTML, no KaTeX on the client). */
export function MatrixView({ m, label, digits = 2, colColors }: { m: number[][]; label?: ReactNode; digits?: number; colColors?: string[] }) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs">
      {label && <span className="text-ink-2">{label}</span>}
      <span className="flex items-stretch">
        <span className="w-1.5 rounded-l border-y border-l border-ink-2/70" aria-hidden />
        <table className="mx-0.5 border-separate border-spacing-x-1.5 tabular-nums" aria-label={typeof label === "string" ? label : "matrix"}>
          <tbody>
            {m.map((r, i) => (
              <tr key={i}>
                {r.map((v, j) => (
                  <td key={j} className="text-right" style={{ color: colColors?.[j] ?? C.ink }}>
                    {(Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v).toFixed(digits)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <span className="w-1.5 rounded-r border-y border-r border-ink-2/70" aria-hidden />
      </span>
    </div>
  );
}

/* ---------- line plot ---------- */
export type Series = { pts: [number, number][]; color: string; width?: number; dash?: string; label?: string; dots?: boolean };
export function Plot({
  series,
  x,
  y,
  height = 180,
  xLabel,
  yLabel,
  bands,
  hlines,
  vline,
  ariaLabel,
}: {
  series: Series[];
  x: [number, number];
  y: [number, number];
  height?: number;
  xLabel?: string;
  yLabel?: string;
  bands?: { lo: [number, number][]; hi: [number, number][]; color: string }[];
  hlines?: { y: number; color: string; dash?: string; label?: string }[];
  vline?: number;
  ariaLabel: string;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const m = { l: 34, r: 8, t: 8, b: xLabel ? 26 : 16 };
  const W = w, H = height;
  const sx = (v: number) => m.l + ((v - x[0]) / (x[1] - x[0] || 1)) * (W - m.l - m.r);
  const sy = (v: number) => m.t + (1 - (v - y[0]) / (y[1] - y[0] || 1)) * (H - m.t - m.b);
  const ticks = (a: number, b: number, n: number) => {
    const span = b - a, raw = span / n, mag = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 5, 10].map((k) => k * mag).find((s) => span / s <= n) ?? raw;
    const out: number[] = [];
    for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  };
  const path = (pts: [number, number][]) => {
    let d = "";
    for (let i = 0; i < pts.length; i++) {
      const [a, b] = pts[i];
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      const yy = Math.max(-1000, Math.min(H + 1000, sy(b)));
      d += `${d ? "L" : "M"}${sx(a).toFixed(1)},${yy.toFixed(1)}`;
    }
    return d;
  };
  const fmt = (v: number) => (Math.abs(v) >= 1000 ? v.toExponential(0) : String(+v.toFixed(2)));
  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="block">
        <defs>
          <clipPath id={`clip-${ariaLabel.replace(/\W/g, "")}`}>
            <rect x={m.l} y={m.t} width={Math.max(0, W - m.l - m.r)} height={Math.max(0, H - m.t - m.b)} />
          </clipPath>
        </defs>
        {ticks(y[0], y[1], 4).map((v) => (
          <g key={`y${v}`}>
            <line x1={m.l} x2={W - m.r} y1={sy(v)} y2={sy(v)} style={{ stroke: C.line }} />
            <text x={m.l - 4} y={sy(v) + 3} textAnchor="end" fontSize={10} style={{ fill: C.faint }}>
              {fmt(v)}
            </text>
          </g>
        ))}
        {ticks(x[0], x[1], Math.max(3, Math.floor(W / 90))).map((v) => (
          <text key={`x${v}`} x={sx(v)} y={H - m.b + 12} textAnchor="middle" fontSize={10} style={{ fill: C.faint }}>
            {fmt(v)}
          </text>
        ))}
        {xLabel && (
          <text x={W - m.r} y={H - 2} textAnchor="end" fontSize={10} style={{ fill: C.muted }}>
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text x={m.l + 4} y={m.t + 10} fontSize={10} style={{ fill: C.muted }}>
            {yLabel}
          </text>
        )}
        <g clipPath={`url(#clip-${ariaLabel.replace(/\W/g, "")})`}>
          {bands?.map((b, i) => (
            <path key={i} d={`${path(b.hi)}${path([...b.lo].reverse()).replace(/^M/, "L")}Z`} style={{ fill: b.color, opacity: 0.18 }} />
          ))}
          {hlines?.map((h, i) => (
            <g key={i}>
              <line x1={m.l} x2={W - m.r} y1={sy(h.y)} y2={sy(h.y)} style={{ stroke: h.color }} strokeDasharray={h.dash ?? "4 4"} />
              {h.label && (
                <text x={W - m.r - 2} y={sy(h.y) - 3} textAnchor="end" fontSize={10} style={{ fill: h.color }}>
                  {h.label}
                </text>
              )}
            </g>
          ))}
          {vline !== undefined && <line x1={sx(vline)} x2={sx(vline)} y1={m.t} y2={H - m.b} style={{ stroke: C.muted }} strokeDasharray="2 3" />}
          {series.map((s, i) =>
            s.dots ? (
              <g key={i} style={{ fill: s.color }}>
                {s.pts.map(([a, b], k) => (
                  <circle key={k} cx={sx(a)} cy={sy(b)} r={1.8} opacity={0.7} />
                ))}
              </g>
            ) : (
              <path key={i} d={path(s.pts)} fill="none" style={{ stroke: s.color }} strokeWidth={s.width ?? 2} strokeDasharray={s.dash} strokeLinejoin="round" />
            ),
          )}
        </g>
      </svg>
      {series.some((s) => s.label) && (
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 pl-8 text-[11px] text-muted">
          {series
            .filter((s) => s.label)
            .map((s) => (
              <li key={s.label} className="inline-flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-3 rounded" style={{ background: s.color }} />
                {s.label}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export const deg = (r: number) => (r * 180) / Math.PI;
export const rad = (d: number) => (d * Math.PI) / 180;
export const fmtDeg = (v: number) => `${Math.round(v)}°`;
