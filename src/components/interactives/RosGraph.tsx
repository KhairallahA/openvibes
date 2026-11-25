"use client";

import { useRef, useState } from "react";
import { Btn, C, Panel, Readouts, Slider, Toggle, useRaf, useVisible } from "./ui";

type NodeId = "camera" | "lidar" | "detector" | "planner" | "motors" | "map";
const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  camera: { x: 40, y: 50, label: "/camera_driver" },
  lidar: { x: 40, y: 190, label: "/lidar_driver" },
  detector: { x: 160, y: 50, label: "/detector" },
  planner: { x: 250, y: 120, label: "/planner" },
  motors: { x: 250, y: 220, label: "/motor_driver" },
  map: { x: 125, y: 245, label: "/map_server" },
};
// topic edges: publisher → subscriber through a named topic
const TOPICS = [
  { name: "/image_raw", from: "camera", to: "detector", rate: "cam" },
  { name: "/detections", from: "detector", to: "planner", rate: "det" },
  { name: "/scan", from: "lidar", to: "planner", rate: "lidar" },
  { name: "/cmd_vel", from: "planner", to: "motors", rate: "plan" },
] as const;
type Msg = { topic: number; t: number; drop: boolean; kind?: "req" | "res" };
const TRAVEL = 0.45; // seconds a dot takes to cross an edge (visual only)

/** A live ROS 2 graph: publishers, subscribers, topics, QoS drops, a service call, and what happens when a node dies. */
export default function RosGraph() {
  const [camHz, setCamHz] = useState(15);
  const [lidarHz, setLidarHz] = useState(10);
  const [loss, setLoss] = useState(0);
  const [reliable, setReliable] = useState(false);
  const [alive, setAlive] = useState<Record<NodeId, boolean>>({ camera: true, lidar: true, detector: true, planner: true, motors: true, map: true });
  const [st, setSt] = useState({ t: 0, msgs: [] as Msg[], last: {} as Record<string, number>, recv: {} as Record<string, number[]>, svc: "" as string, svcT: -1 });
  const acc = useRef({ cam: 0, lidar: 0, plan: 0 });
  const [box, vis] = useVisible<HTMLDivElement>();

  useRaf((dt) => {
    const t = st.t + dt;
    let msgs = st.msgs.filter((m) => t - m.t < TRAVEL);
    const last = { ...st.last };
    const recv = { ...st.recv };
    const a = acc.current;
    const publish = (i: number) => {
      const lossy = i === 0 || i === 2; // sensor data crosses a flaky link
      const drop = lossy && !reliable && Math.random() < loss;
      msgs.push({ topic: i, t, drop });
    };
    // deliveries: messages that just arrived
    for (const m of st.msgs) {
      if (m.drop || m.kind) continue;
      if (st.t - m.t < TRAVEL && t - m.t >= TRAVEL) {
        const tp = TOPICS[m.topic];
        if (!alive[tp.to as NodeId]) continue;
        last[tp.name] = t;
        recv[tp.name] = [...(recv[tp.name] ?? []).filter((x) => t - x < 2), t];
        if (tp.name === "/image_raw" && alive.detector) publish(1); // detector republishes on every image
      }
    }
    // reliable QoS: a "dropped" sample is re-sent, arriving late (we just model the extra latency by not dropping)
    a.cam += dt * camHz;
    a.lidar += dt * lidarHz;
    a.plan += dt * 10;
    while (a.cam >= 1) {
      a.cam -= 1;
      if (alive.camera) publish(0);
    }
    while (a.lidar >= 1) {
      a.lidar -= 1;
      if (alive.lidar) publish(2);
    }
    const fresh = (name: string) => t - (last[name] ?? -9) < 0.5;
    while (a.plan >= 1) {
      a.plan -= 1;
      if (alive.planner && fresh("/detections") && fresh("/scan")) publish(3);
    }
    let svc = st.svc, svcT = st.svcT;
    if (svc === "calling" && t - svcT > TRAVEL) {
      if (alive.map) {
        svc = "responding";
        svcT = t;
        msgs.push({ topic: -1, t, drop: false, kind: "res" });
      } else if (t - svcT > 1.5) svc = "timeout";
    } else if (svc === "responding" && t - svcT > TRAVEL) svc = "ok";
    msgs = msgs.slice(-200);
    setSt({ t, msgs, last, recv, svc, svcT });
  }, vis);

  const hz = (name: string) => ((st.recv[name] ?? []).filter((x) => st.t - x < 2).length / 2).toFixed(1);
  const moving = st.t - (st.last["/cmd_vel"] ?? -9) < 0.3;
  const callSvc = () => setSt((p) => ({ ...p, svc: "calling", svcT: p.t, msgs: [...p.msgs, { topic: -1, t: p.t, drop: false, kind: "req" }] }));
  const pos = (from: NodeId, to: NodeId, f: number) => [NODES[from].x + (NODES[to].x - NODES[from].x) * f, NODES[from].y + (NODES[to].y - NODES[from].y) * f];

  return (
    <Panel
      controls={
        <>
          <Slider label="Camera rate" value={camHz} min={1} max={30} step={1} onChange={setCamHz} fmt={(v) => `${v} Hz`} />
          <Slider label="Lidar rate" value={lidarHz} min={1} max={20} step={1} onChange={setLidarHz} fmt={(v) => `${v} Hz`} />
          <Slider label="Wi-Fi packet loss on sensor links" value={loss} min={0} max={0.9} step={0.05} onChange={setLoss} fmt={(v) => `${Math.round(v * 100)} %`} />
          <Toggle label="QoS: reliable (re-send lost samples)" checked={reliable} onChange={setReliable} />
          <Btn onClick={callSvc}>Call service /get_map</Btn>
          <p className="text-[11px] leading-snug text-faint">Tap a node to kill or restart it.</p>
        </>
      }
      footer={<>The planner publishes /cmd_vel at 10 Hz only while both /detections and /scan are fresh (&lt; 0.5 s old). Kill the lidar or crank the packet loss and the robot stops: a safe default.</>}
    >
      <div ref={box}>
        <svg viewBox="0 0 320 275" className="block w-full select-none" role="img" aria-label="ROS 2 computation graph with live message flow">
          {TOPICS.map((tp) => {
            const a = NODES[tp.from as NodeId], b = NODES[tp.to as NodeId];
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            return (
              <g key={tp.name}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} style={{ stroke: C.line2 }} strokeWidth={2} />
                <rect x={mx - 34} y={my - 9} width={68} height={18} rx={9} style={{ fill: C.surface2, stroke: C.line2 }} />
                <text x={mx} y={my + 3.5} textAnchor="middle" fontSize={8.5} style={{ fill: C.ink2 }} fontFamily="monospace">
                  {tp.name}
                </text>
                <text x={mx} y={my + 19} textAnchor="middle" fontSize={8} style={{ fill: C.faint }}>
                  {hz(tp.name)} Hz
                </text>
              </g>
            );
          })}
          <line x1={NODES.planner.x} y1={NODES.planner.y} x2={NODES.map.x} y2={NODES.map.y} style={{ stroke: C.violet }} strokeDasharray="4 3" opacity={0.6} />
          <text x={(NODES.planner.x + NODES.map.x) / 2 + 16} y={(NODES.planner.y + NODES.map.y) / 2 + 8} fontSize={8} style={{ fill: C.violet }} fontFamily="monospace">
            /get_map (srv)
          </text>
          {st.msgs.map((m, k) => {
            const f = Math.min(1, (st.t - m.t) / TRAVEL);
            if (m.kind) {
              const [x, y] = m.kind === "req" ? pos("planner", "map", f) : pos("map", "planner", f);
              if (m.kind === "req" && !alive.map && f > 0.85) return null;
              return <rect key={k} x={x - 4} y={y - 4} width={8} height={8} style={{ fill: C.violet }} />;
            }
            const tp = TOPICS[m.topic];
            const ff = m.drop ? Math.min(f, 0.5) : f;
            const [x, y] = pos(tp.from as NodeId, tp.to as NodeId, ff);
            return <circle key={k} cx={x} cy={y} r={m.drop ? 4 : 3.2} style={{ fill: m.drop ? C.pink : C.accent }} opacity={m.drop ? 1 - f : 1} />;
          })}
          {(Object.keys(NODES) as NodeId[]).map((id) => {
            const n = NODES[id];
            const on = alive[id];
            return (
              <g
                key={id}
                role="button"
                tabIndex={0}
                aria-pressed={!on}
                aria-label={`${n.label}: ${on ? "running, press to kill" : "dead, press to restart"}`}
                className="cursor-pointer outline-none"
                onClick={() => setAlive((a) => ({ ...a, [id]: !a[id] }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setAlive((a) => ({ ...a, [id]: !a[id] }));
                  }
                }}
              >
                <ellipse cx={n.x} cy={n.y} rx={38} ry={15} style={{ fill: on ? C.surface : C.bg, stroke: on ? C.accent : C.pink }} strokeWidth={on ? 1.5 : 1.5} strokeDasharray={on ? undefined : "3 3"} />
                <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize={8.5} fontFamily="monospace" style={{ fill: on ? C.ink : C.pink }}>
                  {n.label}
                </text>
              </g>
            );
          })}
          <g transform={`translate(${NODES.motors.x + 6},${NODES.motors.y + 26})`}>
            <text textAnchor="middle" fontSize={9} fontWeight={700} style={{ fill: moving ? "#4ade80" : C.pink }}>
              {moving ? "● robot moving" : "■ robot stopped"}
            </text>
          </g>
        </svg>
        <div className="mt-1 px-1">
          <Readouts
            items={[
              { k: "ros2 topic hz /scan", v: `${hz("/scan")} Hz` },
              { k: "ros2 topic hz /cmd_vel", v: `${hz("/cmd_vel")} Hz`, tone: moving ? "good" : "bad" },
              { k: "service /get_map", v: st.svc === "" ? "idle" : st.svc === "ok" ? "response ✓" : st.svc === "timeout" ? "not available" : `${st.svc}…`, tone: st.svc === "ok" ? "good" : st.svc === "timeout" ? "bad" : undefined },
              { k: "nodes alive", v: `${Object.values(alive).filter(Boolean).length}/6` },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}
