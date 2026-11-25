"use client";

import { useState } from "react";
import { det3, mul, mv, rpy, Rx, Ry, Rz, T } from "./sim";
import { Btn, C, MatrixView, Panel, Readouts, Seg, Slider, fmtDeg, rad } from "./ui";

type Order = "zyx" | "xyz";

/** Roll / pitch / yaw explorer: rotate a body frame, read the rotation matrix, see order matters and gimbal lock. */
export default function FrameExplorer() {
  const [roll, setRoll] = useState(20);
  const [pitch, setPitch] = useState(-25);
  const [yaw, setYaw] = useState(40);
  const [order, setOrder] = useState<Order>("zyx");
  const [az, setAz] = useState(35);

  const R = order === "zyx" ? rpy(rad(roll), rad(pitch), rad(yaw)) : mul(mul(Rx(rad(roll)), Ry(rad(pitch))), Rz(rad(yaw)));
  const other = order === "zyx" ? mul(mul(Rx(rad(roll)), Ry(rad(pitch))), Rz(rad(yaw))) : rpy(rad(roll), rad(pitch), rad(yaw));
  const RtR = mul(T(R), R);
  const orthoErr = Math.max(...RtR.flatMap((r, i) => r.map((v, j) => Math.abs(v - (i === j ? 1 : 0)))));
  const diff = Math.max(...R.flatMap((r, i) => r.map((v, j) => Math.abs(v - other[i][j]))));
  const pB = [1, 0.5, 0.3];
  const pW = mv(R, pB);

  // orthographic camera: yaw az around world z, then tilt by el
  const el = rad(22);
  const cam = mul(Rx(-Math.PI / 2 + el), Rz(-rad(az)));
  const S = 95, cx = 160, cy = 150;
  const proj = (v: number[]) => {
    const p = mv(cam, v);
    return { x: cx + S * p[0], y: cy - S * p[1], depth: p[2] };
  };
  const o = proj([0, 0, 0]);
  const axes = (M: number[][], len: number) =>
    [0, 1, 2].map((k) => {
      const v = [M[0][k] * len, M[1][k] * len, M[2][k] * len];
      return { k, p: proj(v), v };
    });
  const world = axes([[1, 0, 0], [0, 1, 0], [0, 0, 1]], 1.25);
  const body = axes(R, 1);
  const col = [C.x, C.y, C.z];
  const names = ["x", "y", "z"];

  // a box (the "robot body") 0.9 × 0.5 × 0.2
  const hx = 0.45, hy = 0.25, hz = 0.1;
  const corners = [-1, 1].flatMap((a) => [-1, 1].flatMap((b) => [-1, 1].map((c) => mv(R, [a * hx, b * hy, c * hz]))));
  const faces = [
    [0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5],
  ]
    .map((f) => ({ f, pts: f.map((i) => proj(corners[i])), z: f.reduce((s, i) => s + proj(corners[i]).depth, 0) / 4 }))
    .sort((a, b) => a.z - b.z);
  const gimbal = Math.abs(Math.abs(pitch) - 90) < 4 && order === "zyx";
  const pw = proj(pW);

  return (
    <Panel
      controls={
        <>
          <Slider label="Roll φ (about x)" value={roll} min={-180} max={180} step={1} onChange={setRoll} fmt={fmtDeg} />
          <Slider label="Pitch θ (about y)" value={pitch} min={-90} max={90} step={1} onChange={setPitch} fmt={fmtDeg} />
          <Slider label="Yaw ψ (about z)" value={yaw} min={-180} max={180} step={1} onChange={setYaw} fmt={fmtDeg} />
          <Seg
            label="Multiply order"
            value={order}
            onChange={setOrder}
            options={[
              { v: "zyx", l: "Rz·Ry·Rx (RPY)" },
              { v: "xyz", l: "Rx·Ry·Rz" },
            ]}
          />
          <Slider label="Camera orbit" value={az} min={-180} max={180} step={1} onChange={setAz} fmt={fmtDeg} />
          <div className="flex flex-wrap gap-1.5">
            <Btn onClick={() => { setRoll(0); setPitch(0); setYaw(0); }}>Identity</Btn>
            <Btn onClick={() => { setRoll(30); setPitch(90); setYaw(0); }}>Gimbal lock</Btn>
            <Btn onClick={() => { setRoll(0); setPitch(0); setYaw(90); }}>Yaw 90°</Btn>
          </div>
        </>
      }
      footer={
        <>
          Columns of R are the body axes written in world coordinates (colours match). Body point p<sub>B</sub> = (1, 0.5, 0.3) lands at p<sub>W</sub> = R·p<sub>B</sub> = (
          {pW.map((v) => v.toFixed(2)).join(", ")}).
        </>
      }
    >
      <svg viewBox="0 0 320 290" className="mx-auto block w-full max-w-[460px] touch-none" role="img" aria-label="3D view of world frame and rotated body frame">
        {world.map((a) => (
          <g key={`w${a.k}`}>
            <line x1={o.x} y1={o.y} x2={a.p.x} y2={a.p.y} style={{ stroke: C.faint }} strokeDasharray="3 3" />
            <text x={a.p.x + 4} y={a.p.y + 4} fontSize={10} style={{ fill: C.faint }}>
              {names[a.k]}
              <tspan fontSize={7}>W</tspan>
            </text>
          </g>
        ))}
        {faces.map((f, i) => (
          <polygon key={i} points={f.pts.map((p) => `${p.x},${p.y}`).join(" ")} style={{ fill: C.accent, stroke: C.accent }} fillOpacity={0.1} strokeOpacity={0.45} />
        ))}
        {body
          .slice()
          .sort((a, b) => a.p.depth - b.p.depth)
          .map((a) => (
            <g key={`b${a.k}`}>
              <line x1={o.x} y1={o.y} x2={a.p.x} y2={a.p.y} style={{ stroke: col[a.k] }} strokeWidth={3} strokeLinecap="round" />
              <circle cx={a.p.x} cy={a.p.y} r={3.5} style={{ fill: col[a.k] }} />
              <text x={a.p.x + 6} y={a.p.y - 4} fontSize={12} fontWeight={700} style={{ fill: col[a.k] }}>
                {names[a.k]}
                <tspan fontSize={8}>B</tspan>
              </text>
            </g>
          ))}
        <line x1={o.x} y1={o.y} x2={pw.x} y2={pw.y} style={{ stroke: C.amber }} strokeWidth={1.5} strokeDasharray="2 2" />
        <circle cx={pw.x} cy={pw.y} r={4} style={{ fill: C.amber }} />
        <text x={pw.x + 6} y={pw.y + 12} fontSize={10} style={{ fill: C.amber }}>
          p
        </text>
        {gimbal && (
          <text x={160} y={282} textAnchor="middle" fontSize={11} fontWeight={700} style={{ fill: C.pink }}>
            Gimbal lock: roll and yaw now spin about the same axis
          </text>
        )}
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-1">
        <MatrixView m={R} label="R =" colColors={col} />
        <div className="w-full max-w-[16rem]">
          <Readouts
            items={[
              { k: "det R", v: det3(R).toFixed(4), tone: "good" },
              { k: "max |RᵀR − I|", v: orthoErr.toExponential(1), tone: "good" },
              { k: "other order differs by", v: diff.toFixed(3), tone: diff > 1e-6 ? "accent" : undefined },
              { k: "pitch", v: fmtDeg(pitch) },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}
