"use client";

import { useMemo, useState } from "react";
import { simulateKalman1D } from "./sim";
import { Btn, C, Panel, Plot, Readouts, Slider, Toggle } from "./ui";

/** 1-D constant-velocity Kalman filter: a robot moves along a rail, a noisy range sensor measures it. */
export default function Kalman1D() {
  const [r, setR] = useState(2);
  const [lq, setLq] = useState(0); // log10 of the filter's process-noise assumption
  const [seed, setSeed] = useState(3);
  const [band, setBand] = useState(true);
  const res = useMemo(() => simulateKalman1D({ q: 10 ** lq, r, n: 150, dt: 0.1, seed, qTrue: 1 }), [r, lq, seed]);
  const t = res.truth.map((_, i) => i * 0.1);
  const pts = (a: number[]) => a.map((v, i) => [t[i], v] as [number, number]);
  const all = [...res.truth, ...res.est];
  const lo = Math.min(...all) - 2 * r, hi = Math.max(...all) + 2 * r;
  const improvement = (1 - res.rmseEst / res.rmseMeas) * 100;
  return (
    <Panel
      controls={
        <>
          <Slider label="Sensor noise σ (true and assumed)" value={r} min={0.1} max={6} step={0.1} onChange={setR} fmt={(v) => `${v.toFixed(1)} m`} />
          <Slider
            label="Filter's process noise q"
            value={lq}
            min={-3}
            max={3}
            step={0.1}
            onChange={setLq}
            fmt={(v) => `10^${v.toFixed(1)}`}
            hint="True q = 1. Too small: the filter trusts its model and lags. Too big: it just follows the noisy sensor."
          />
          <Toggle label="Show ±2σ band" checked={band} onChange={setBand} />
          <div className="flex gap-1.5">
            <Btn onClick={() => setSeed((s) => s + 1)}>New random run</Btn>
            <Btn onClick={() => setLq(0)}>q = true value</Btn>
          </div>
          <Readouts
            items={[
              { k: "sensor RMSE", v: `${res.rmseMeas.toFixed(2)} m` },
              { k: "filter RMSE", v: `${res.rmseEst.toFixed(2)} m`, tone: res.rmseEst < res.rmseMeas ? "good" : "bad" },
              { k: "improvement", v: `${improvement.toFixed(0)} %`, tone: improvement > 0 ? "good" : "bad" },
              { k: "steady gain K", v: res.gain[res.gain.length - 1].toFixed(3) },
            ]}
          />
        </>
      }
      footer={<>State (position, velocity); motion model x′ = x + v·Δt with random acceleration; sensor z = x + noise. Each step: predict (uncertainty grows), then update with K = P/(P + σ²).</>}
    >
      <Plot
        ariaLabel="Kalman filter: truth, measurements and estimate"
        height={260}
        bands={band ? [{ lo: res.est.map((v, i) => [t[i], v - 2 * res.sd[i]]), hi: res.est.map((v, i) => [t[i], v + 2 * res.sd[i]]), color: C.accent }] : []}
        series={[
          { pts: pts(res.meas), color: C.faint, dots: true, label: "sensor readings" },
          { pts: pts(res.truth), color: C.amber, width: 2, dash: "5 3", label: "true position" },
          { pts: pts(res.est), color: C.accent, width: 2.5, label: "Kalman estimate" },
        ]}
        x={[0, 15]}
        y={[lo, hi]}
        xLabel="t (s)"
        yLabel="position (m)"
      />
      <Plot ariaLabel="Kalman gain over time" height={70} series={[{ pts: pts(res.gain), color: C.violet, width: 1.5, label: "Kalman gain K (how much each reading is trusted)" }]} x={[0, 15]} y={[0, 1]} />
    </Panel>
  );
}
