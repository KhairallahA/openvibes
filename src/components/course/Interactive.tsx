"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentType } from "react";

/**
 * Interactives are referenced by name from content (chapter.interactive.name) and code-split:
 * each one is a separate chunk, downloaded only when its panel scrolls near the viewport.
 */
const load = (f: () => Promise<{ default: ComponentType }>) => dynamic(f, { ssr: false, loading: () => <Skeleton /> });
const REGISTRY: Record<string, ComponentType> = {
  FrameExplorer: load(() => import("../interactives/FrameExplorer")),
  TransformChain: load(() => import("../interactives/TransformChain")),
  ArmFK: load(() => import("../interactives/ArmFK")),
  ArmIK: load(() => import("../interactives/ArmIK")),
  Pendulum: load(() => import("../interactives/Pendulum")),
  PidTuner: load(() => import("../interactives/PidTuner")),
  LqrCartPole: load(() => import("../interactives/LqrCartPole")),
  Kalman1D: load(() => import("../interactives/Kalman1D")),
  Localization: load(() => import("../interactives/Localization")),
  GridPlanner: load(() => import("../interactives/GridPlanner")),
  ArmRRT: load(() => import("../interactives/ArmRRT")),
  StereoDepth: load(() => import("../interactives/StereoDepth")),
  RosGraph: load(() => import("../interactives/RosGraph")),
  Integrators: load(() => import("../interactives/Integrators")),
  GridworldRL: load(() => import("../interactives/GridworldRL")),
  LipmWalker: load(() => import("../interactives/LipmWalker")),
};
export const INTERACTIVE_NAMES = Object.keys(REGISTRY);

function Skeleton() {
  return (
    <div className="grid min-h-[22rem] place-items-center rounded-xl border border-dashed border-line text-sm text-faint">
      <span className="animate-pulse">Loading interactive…</span>
    </div>
  );
}

export function Interactive({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setShow(true);
          obs.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const C = REGISTRY[name];
  return (
    <div ref={ref} data-interactive={name}>
      {!C ? <p className="text-sm text-rose-400">Unknown interactive “{name}”.</p> : show ? <C /> : <Skeleton />}
    </div>
  );
}
