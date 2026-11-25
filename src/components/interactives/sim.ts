/**
 * Pure math / physics used by the robotics interactives. No DOM, no React, no imports,
 * so it can be unit-tested directly with Node (see /workspace/vibes-research/robotics-course/test-sim.ts).
 */

export type Vec = number[];
export type Mat = number[][];

/* ---------------- random ---------------- */
export function rng(seed = 1) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let spare: number | null = null;
  const gauss = () => {
    if (spare !== null) {
      const s = spare;
      spare = null;
      return s;
    }
    let u = 0;
    while (u === 0) u = next();
    const v = next();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  };
  return { next, gauss };
}

/* ---------------- small linear algebra ---------------- */
export const zeros = (r: number, c: number): Mat => Array.from({ length: r }, () => Array(c).fill(0));
export const eye = (n: number): Mat => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
export const T = (A: Mat): Mat => A[0].map((_, j) => A.map((r) => r[j]));
export function mul(A: Mat, B: Mat): Mat {
  const out = zeros(A.length, B[0].length);
  for (let i = 0; i < A.length; i++)
    for (let k = 0; k < B.length; k++) {
      const a = A[i][k];
      if (a !== 0) for (let j = 0; j < B[0].length; j++) out[i][j] += a * B[k][j];
    }
  return out;
}
export const add = (A: Mat, B: Mat): Mat => A.map((r, i) => r.map((v, j) => v + B[i][j]));
export const sub = (A: Mat, B: Mat): Mat => A.map((r, i) => r.map((v, j) => v - B[i][j]));
export const scale = (A: Mat, s: number): Mat => A.map((r) => r.map((v) => v * s));
export const mv = (A: Mat, x: Vec): Vec => A.map((r) => r.reduce((s, v, j) => s + v * x[j], 0));
export const det3 = (R: Mat) =>
  R[0][0] * (R[1][1] * R[2][2] - R[1][2] * R[2][1]) - R[0][1] * (R[1][0] * R[2][2] - R[1][2] * R[2][0]) + R[0][2] * (R[1][0] * R[2][1] - R[1][1] * R[2][0]);

/* ---------------- 1. rotations ---------------- */
export const Rx = (a: number): Mat => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
export const Ry = (a: number): Mat => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
export const Rz = (a: number): Mat => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
/** Roll-pitch-yaw (Z-Y-X): R = Rz(yaw) · Ry(pitch) · Rx(roll). */
export const rpy = (roll: number, pitch: number, yaw: number): Mat => mul(mul(Rz(yaw), Ry(pitch)), Rx(roll));

/* ---------------- 2. planar homogeneous transforms (SE(2)) ---------------- */
export const se2 = (th: number, x: number, y: number): Mat => [[Math.cos(th), -Math.sin(th), x], [Math.sin(th), Math.cos(th), y], [0, 0, 1]];
export const se2Inv = (M: Mat): Mat => {
  // [R p; 0 1]^-1 = [Rᵀ  -Rᵀp; 0 1]
  const [c, s, x, y] = [M[0][0], M[1][0], M[0][2], M[1][2]];
  return [[c, s, -(c * x + s * y)], [-s, c, -(-s * x + c * y)], [0, 0, 1]];
};
export const apply2 = (M: Mat, p: [number, number]): [number, number] => [M[0][0] * p[0] + M[0][1] * p[1] + M[0][2], M[1][0] * p[0] + M[1][1] * p[1] + M[1][2]];

/* ---------------- 3-4. planar 2-link arm ---------------- */
export function fk2(l1: number, l2: number, t1: number, t2: number) {
  const elbow: [number, number] = [l1 * Math.cos(t1), l1 * Math.sin(t1)];
  const ee: [number, number] = [elbow[0] + l2 * Math.cos(t1 + t2), elbow[1] + l2 * Math.sin(t1 + t2)];
  return { elbow, ee };
}
/** Closed-form IK. elbowUp picks the sign of θ2 (θ2 < 0 = elbow up for a base at the origin). Unreachable targets are projected onto the workspace boundary. */
export function ik2(l1: number, l2: number, x: number, y: number, elbowUp = true) {
  const r = Math.hypot(x, y);
  const rMax = l1 + l2;
  const rMin = Math.abs(l1 - l2);
  const reachable = r <= rMax + 1e-9 && r >= rMin - 1e-9;
  let tx = x, ty = y;
  if (!reachable) {
    const rr = r < 1e-9 ? rMin : Math.min(Math.max(r, rMin), rMax);
    const ang = r < 1e-9 ? 0 : Math.atan2(y, x);
    tx = rr * Math.cos(ang);
    ty = rr * Math.sin(ang);
  }
  const c2 = Math.min(1, Math.max(-1, (tx * tx + ty * ty - l1 * l1 - l2 * l2) / (2 * l1 * l2)));
  const t2 = (elbowUp ? -1 : 1) * Math.acos(c2);
  const t1 = Math.atan2(ty, tx) - Math.atan2(l2 * Math.sin(t2), l1 + l2 * Math.cos(t2));
  return { t1: wrap(t1), t2, reachable };
}
/** Geometric Jacobian of the end-effector position wrt (θ1, θ2). */
export function jac2(l1: number, l2: number, t1: number, t2: number): Mat {
  const s1 = Math.sin(t1), c1 = Math.cos(t1), s12 = Math.sin(t1 + t2), c12 = Math.cos(t1 + t2);
  return [
    [-l1 * s1 - l2 * s12, -l2 * s12],
    [l1 * c1 + l2 * c12, l2 * c12],
  ];
}
/** Velocity manipulability ellipse of J: semi-axes = singular values, angle of the major axis. */
export function ellipse2(J: Mat) {
  const A = mul(J, T(J)); // symmetric 2x2
  const a = A[0][0], b = A[0][1], d = A[1][1];
  const tr = a + d, dt = a * d - b * b;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - dt));
  const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
  const angle = Math.abs(b) < 1e-12 ? (a >= d ? 0 : Math.PI / 2) : Math.atan2(l1 - a, b);
  return { s1: Math.sqrt(Math.max(0, l1)), s2: Math.sqrt(Math.max(0, l2)), angle };
}
/** One damped-least-squares IK step: Δθ = Jᵀ (J Jᵀ + λ² I)⁻¹ e */
export function dlsStep(l1: number, l2: number, t1: number, t2: number, tx: number, ty: number, lambda = 0.1): [number, number] {
  const { ee } = fk2(l1, l2, t1, t2);
  const e = [tx - ee[0], ty - ee[1]];
  const J = jac2(l1, l2, t1, t2);
  const A = add(mul(J, T(J)), scale(eye(2), lambda * lambda));
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const inv = [[A[1][1] / det, -A[0][1] / det], [-A[1][0] / det, A[0][0] / det]];
  const y = mv(inv, e);
  const d = mv(T(J), y);
  return [t1 + d[0], t2 + d[1]];
}
export const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/* ---------------- 5. pendulum ---------------- */
export type PendState = { th: number; w: number };
export function pendulumStep(s: PendState, dt: number, g: number, L: number, c: number): PendState {
  const f = (th: number, w: number) => [w, -(g / L) * Math.sin(th) - c * w];
  const [k1a, k1b] = f(s.th, s.w);
  const [k2a, k2b] = f(s.th + (dt / 2) * k1a, s.w + (dt / 2) * k1b);
  const [k3a, k3b] = f(s.th + (dt / 2) * k2a, s.w + (dt / 2) * k2b);
  const [k4a, k4b] = f(s.th + dt * k3a, s.w + dt * k3b);
  return { th: s.th + (dt / 6) * (k1a + 2 * k2a + 2 * k3a + k4a), w: s.w + (dt / 6) * (k1b + 2 * k2b + 2 * k3b + k4b) };
}
/** Measures the oscillation period from upward zero crossings of θ (undamped or lightly damped). */
export function pendulumPeriod(th0: number, g: number, L: number, c = 0, dt = 1 / 1000, tMax = 30) {
  let s: PendState = { th: th0, w: 0 };
  const crossings: number[] = [];
  for (let t = 0; t < tMax && crossings.length < 3; t += dt) {
    const n = pendulumStep(s, dt, g, L, c);
    if (s.th < 0 && n.th >= 0) crossings.push(t + dt * (-s.th / (n.th - s.th)));
    s = n;
  }
  return crossings.length >= 2 ? crossings[1] - crossings[0] : NaN;
}

/* ---------------- 6. PID on a mass with viscous friction ---------------- */
export type PidOpts = {
  kp: number; ki: number; kd: number;
  m?: number; b?: number;
  setpoint?: number; tEnd?: number; dt?: number;
  uMax?: number; // actuator limit (Infinity = none)
  noise?: number; // std-dev of position sensor noise
  disturbance?: number; // constant force applied from tDist
  tDist?: number;
  seed?: number;
};
export function simulatePid(o: PidOpts) {
  const m = o.m ?? 1, b = o.b ?? 1, r = o.setpoint ?? 1, tEnd = o.tEnd ?? 10, dt = o.dt ?? 0.001;
  const uMax = o.uMax ?? Infinity, noise = o.noise ?? 0, dist = o.disturbance ?? 0, tDist = o.tDist ?? Infinity;
  const R = rng(o.seed ?? 7);
  let x = 0, v = 0, integ = 0, prevMeas = 0;
  const t: number[] = [], y: number[] = [], u: number[] = [];
  const every = Math.max(1, Math.round(0.02 / dt));
  const n = Math.round(tEnd / dt);
  for (let i = 0; i <= n; i++) {
    const time = i * dt;
    const meas = x + (noise ? noise * R.gauss() : 0);
    const e = r - meas;
    // derivative on measurement avoids the "derivative kick" on a setpoint step
    const dMeas = i === 0 ? 0 : (meas - prevMeas) / dt;
    prevMeas = meas;
    let uu = o.kp * e + o.ki * integ - o.kd * dMeas;
    const sat = Math.max(-uMax, Math.min(uMax, uu));
    // conditional integration (anti-windup): stop integrating while saturated in the same direction
    if (sat === uu || Math.sign(e) !== Math.sign(uu)) integ += e * dt;
    uu = sat;
    const f = uu + (time >= tDist ? dist : 0);
    // semi-implicit Euler, dt = 1 ms
    v += ((f - b * v) / m) * dt;
    x += v * dt;
    if (i % every === 0) {
      t.push(time);
      y.push(x);
      u.push(uu);
    }
  }
  return { t, y, u, metrics: stepInfo(t, y, r, o.tDist) };
}
/** Rise time (10→90 %), overshoot %, 2 % settling time, steady-state error (mean of last 5 % before any disturbance). */
export function stepInfo(t: number[], y: number[], r: number, tStop = Infinity) {
  const idx = t.findIndex((v) => v >= tStop);
  const end = idx === -1 ? t.length : idx;
  const tt = t.slice(0, end), yy = y.slice(0, end);
  const i10 = yy.findIndex((v) => v >= 0.1 * r);
  const i90 = yy.findIndex((v) => v >= 0.9 * r);
  const rise = i10 >= 0 && i90 >= 0 ? tt[i90] - tt[i10] : NaN;
  const peak = Math.max(...yy);
  const overshoot = Math.max(0, ((peak - r) / Math.abs(r)) * 100);
  let settle = NaN;
  for (let i = yy.length - 1; i >= 0; i--) {
    if (Math.abs(yy[i] - r) > 0.02 * Math.abs(r)) {
      settle = i === yy.length - 1 ? NaN : tt[i + 1];
      break;
    }
    if (i === 0) settle = 0;
  }
  const tail = yy.slice(Math.floor(yy.length * 0.95));
  const sse = r - tail.reduce((s, v) => s + v, 0) / Math.max(1, tail.length);
  return { rise, overshoot, settle, sse, peak };
}

/* ---------------- 7. cart-pole + LQR ---------------- */
export const CP = { M: 1, m: 0.2, l: 0.5, g: 9.81 };
/** θ = 0 is upright. Point mass m at the tip of a massless rod of length l, cart mass M, force u. */
export function cartPoleDeriv(s: Vec, u: number, p = CP): Vec {
  const [, xd, th, thd] = s;
  const sn = Math.sin(th), cs = Math.cos(th);
  const xdd = (u + p.m * sn * (p.l * thd * thd - p.g * cs)) / (p.M + p.m * sn * sn);
  const thdd = (p.g * sn - xdd * cs) / p.l;
  return [xd, xdd, thd, thdd];
}
export function rk4(f: (s: Vec) => Vec, s: Vec, dt: number): Vec {
  const k1 = f(s);
  const k2 = f(s.map((v, i) => v + (dt / 2) * k1[i]));
  const k3 = f(s.map((v, i) => v + (dt / 2) * k2[i]));
  const k4 = f(s.map((v, i) => v + dt * k3[i]));
  return s.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}
export function cartPoleLinear(p = CP): { A: Mat; B: Mat } {
  return {
    A: [
      [0, 1, 0, 0],
      [0, 0, (-p.m * p.g) / p.M, 0],
      [0, 0, 0, 1],
      [0, 0, ((p.M + p.m) * p.g) / (p.M * p.l), 0],
    ],
    B: [[0], [1 / p.M], [0], [-1 / (p.M * p.l)]],
  };
}
/** Zero-order-hold discretisation by truncated series (accurate for small A·dt). */
export function c2d(A: Mat, B: Mat, dt: number) {
  const n = A.length;
  let Ad = eye(n), term = eye(n), S = scale(eye(n), dt), termS = scale(eye(n), dt);
  for (let k = 1; k < 12; k++) {
    term = scale(mul(term, A), dt / k);
    Ad = add(Ad, term);
    termS = scale(mul(termS, A), dt / (k + 1));
    S = add(S, termS);
  }
  return { Ad, Bd: mul(S, B) };
}
/** Discrete LQR for a single input by iterating the Riccati equation. Returns K with u = −K x. */
export function dlqr(Ad: Mat, Bd: Mat, Q: Mat, r: number, iters = 20000, tol = 1e-10) {
  let P = Q.map((row) => row.slice());
  const At = T(Ad), Bt = T(Bd);
  let K: Mat = [[0, 0, 0, 0]];
  for (let it = 0; it < iters; it++) {
    const BtP = mul(Bt, P);
    const den = r + mul(BtP, Bd)[0][0];
    K = scale(mul(BtP, Ad), 1 / den);
    const AtP = mul(At, P);
    const Pn = add(Q, sub(mul(AtP, Ad), mul(mul(AtP, Bd), K)));
    let diff = 0;
    for (let i = 0; i < P.length; i++) for (let j = 0; j < P.length; j++) diff = Math.max(diff, Math.abs(Pn[i][j] - P[i][j]));
    P = Pn;
    if (diff < tol * (1 + Math.abs(P[0][0]))) break;
  }
  return { K: K[0], P };
}

/* ---------------- 8. Kalman filter, 1-D constant velocity ---------------- */
export function simulateKalman1D(o: { q: number; r: number; n?: number; dt?: number; seed?: number; qTrue?: number }) {
  const n = o.n ?? 200, dt = o.dt ?? 0.1;
  const R = rng(o.seed ?? 3);
  const qTrue = o.qTrue ?? 1; // true process noise intensity (accel spectral density)
  const Fm: Mat = [[1, dt], [0, 1]];
  const Qm = (q: number): Mat => [[(q * dt ** 3) / 3, (q * dt ** 2) / 2], [(q * dt ** 2) / 2, q * dt]];
  // exact sampling of the true process noise via Cholesky of Qm(qTrue)
  const Qt = Qm(qTrue);
  const l11 = Math.sqrt(Qt[0][0]), l21 = Qt[1][0] / l11, l22 = Math.sqrt(Math.max(0, Qt[1][1] - l21 * l21));
  let xt = [0, 1];
  let x = [0, 0];
  let P: Mat = [[10, 0], [0, 10]];
  const Q = Qm(o.q), rr = o.r * o.r;
  const truth: number[] = [], meas: number[] = [], est: number[] = [], sd: number[] = [], gain: number[] = [];
  for (let k = 0; k < n; k++) {
    const w1 = R.gauss(), w2 = R.gauss();
    xt = [xt[0] + dt * xt[1] + l11 * w1, xt[1] + l21 * w1 + l22 * w2];
    const z = xt[0] + o.r * R.gauss();
    // predict
    x = mv(Fm, x);
    P = add(mul(mul(Fm, P), T(Fm)), Q);
    // update (H = [1 0])
    const S = P[0][0] + rr;
    const K = [P[0][0] / S, P[1][0] / S];
    const yres = z - x[0];
    x = [x[0] + K[0] * yres, x[1] + K[1] * yres];
    P = [
      [(1 - K[0]) * P[0][0], (1 - K[0]) * P[0][1]],
      [P[1][0] - K[1] * P[0][0], P[1][1] - K[1] * P[0][1]],
    ];
    truth.push(xt[0]);
    meas.push(z);
    est.push(x[0]);
    sd.push(Math.sqrt(P[0][0]));
    gain.push(K[0]);
  }
  const rmse = (a: number[]) => Math.sqrt(a.reduce((s, v, i) => s + (v - truth[i]) ** 2, 0) / a.length);
  return { truth, meas, est, sd, gain, rmseMeas: rmse(meas), rmseEst: rmse(est) };
}

/* ---------------- 9. differential drive + particle filter ---------------- */
export type Pose = { x: number; y: number; th: number };
/** Exact integration of unicycle motion over dt for wheel speeds vl, vr and wheel base W. */
export function diffDrive(p: Pose, vl: number, vr: number, W: number, dt: number): Pose {
  const v = (vr + vl) / 2, w = (vr - vl) / W;
  if (Math.abs(w) < 1e-9) return { x: p.x + v * dt * Math.cos(p.th), y: p.y + v * dt * Math.sin(p.th), th: p.th };
  const R = v / w, th2 = p.th + w * dt;
  return { x: p.x + R * (Math.sin(th2) - Math.sin(p.th)), y: p.y - R * (Math.cos(th2) - Math.cos(p.th)), th: wrap(th2) };
}
export type Particle = Pose & { w: number };
export function pfPredict(ps: Particle[], vl: number, vr: number, W: number, dt: number, sigma: number, R: ReturnType<typeof rng>) {
  return ps.map((p) => {
    const nl = vl * (1 + sigma * R.gauss()), nr = vr * (1 + sigma * R.gauss());
    return { ...diffDrive(p, nl, nr, W, dt), w: p.w };
  });
}
export function pfUpdate(ps: Particle[], ranges: number[], landmarks: [number, number][], sigma: number) {
  let total = 0;
  const out = ps.map((p) => {
    let logw = 0;
    landmarks.forEach((l, i) => {
      const d = Math.hypot(l[0] - p.x, l[1] - p.y);
      logw += -((ranges[i] - d) ** 2) / (2 * sigma * sigma);
    });
    return { ...p, w: p.w * Math.exp(logw) };
  });
  out.forEach((p) => (total += p.w));
  if (!(total > 0) || !Number.isFinite(total)) return out.map((p) => ({ ...p, w: 1 / out.length }));
  return out.map((p) => ({ ...p, w: p.w / total }));
}
export const nEff = (ps: Particle[]) => 1 / ps.reduce((s, p) => s + p.w * p.w, 0);
/** Low-variance (systematic) resampling. */
export function resample(ps: Particle[], R: ReturnType<typeof rng>) {
  const n = ps.length, out: Particle[] = [];
  const r = R.next() / n;
  let c = ps[0].w, i = 0;
  for (let m = 0; m < n; m++) {
    const U = r + m / n;
    while (U > c && i < n - 1) c += ps[++i].w;
    out.push({ ...ps[i], w: 1 / n });
  }
  return out;
}
export function pfMean(ps: Particle[]): Pose {
  let x = 0, y = 0, s = 0, c = 0;
  for (const p of ps) {
    x += p.w * p.x;
    y += p.w * p.y;
    s += p.w * Math.sin(p.th);
    c += p.w * Math.cos(p.th);
  }
  return { x, y, th: Math.atan2(s, c) };
}

/* ---------------- 10. grid search: BFS / Dijkstra / A* / greedy ---------------- */
export type Algo = "astar" | "dijkstra" | "greedy" | "bfs";
export function gridSearch(w: number, h: number, blocked: Uint8Array, start: number, goal: number, algo: Algo, diag = true) {
  const gx = goal % w, gy = Math.floor(goal / w);
  const D2 = Math.SQRT2;
  const heur = (i: number) => {
    const dx = Math.abs((i % w) - gx), dy = Math.abs(Math.floor(i / w) - gy);
    return diag ? dx + dy + (D2 - 2) * Math.min(dx, dy) : dx + dy; // octile / Manhattan: admissible
  };
  const g = new Float64Array(w * h).fill(Infinity);
  const parent = new Int32Array(w * h).fill(-1);
  const closed = new Uint8Array(w * h);
  const order: number[] = [];
  // binary heap of [priority, tie, node]
  const heap: [number, number, number][] = [];
  let tie = 0;
  const push = (p: number, n: number) => {
    heap.push([p, tie++, n]);
    let i = heap.length - 1;
    while (i > 0) {
      const j = (i - 1) >> 1;
      if (heap[j][0] < heap[i][0] || (heap[j][0] === heap[i][0] && heap[j][1] <= heap[i][1])) break;
      [heap[i], heap[j]] = [heap[j], heap[i]];
      i = j;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        const less = (a: number, b: number) => heap[a][0] < heap[b][0] || (heap[a][0] === heap[b][0] && heap[a][1] < heap[b][1]);
        if (l < heap.length && less(l, m)) m = l;
        if (r < heap.length && less(r, m)) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return top;
  };
  const prio = (n: number) => (algo === "astar" ? g[n] + heur(n) : algo === "greedy" ? heur(n) : g[n]);
  g[start] = 0;
  push(prio(start), start);
  const moves = diag
    ? [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, D2], [1, -1, D2], [-1, 1, D2], [-1, -1, D2]]
    : [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1]];
  while (heap.length) {
    const [, , n] = pop();
    if (closed[n]) continue;
    closed[n] = 1;
    order.push(n);
    if (n === goal) break;
    const x = n % w, y = Math.floor(n / w);
    for (const [dx, dy, c] of moves) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const m = ny * w + nx;
      if (blocked[m] || closed[m]) continue;
      if (dx && dy && (blocked[y * w + nx] || blocked[ny * w + x])) continue; // no corner cutting
      const cost = algo === "bfs" ? 1 : c;
      const ng = g[n] + cost;
      if (ng < g[m]) {
        g[m] = ng;
        parent[m] = n;
        push(prio(m), m);
      }
    }
  }
  const path: number[] = [];
  if (closed[goal]) for (let n = goal; n !== -1; n = parent[n]) path.unshift(n);
  let length = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i];
    length += (a % w !== b % w && Math.floor(a / w) !== Math.floor(b / w)) ? D2 : 1;
  }
  return { order, path, length, found: path.length > 0 };
}

/* ---------------- 11. C-space + RRT for a 2-link arm ---------------- */
export type Circle = { x: number; y: number; r: number };
const segDist = (ax: number, ay: number, bx: number, by: number, px: number, py: number) => {
  const vx = bx - ax, vy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy || 1)));
  return Math.hypot(ax + t * vx - px, ay + t * vy - py);
};
export function armCollides(l1: number, l2: number, t1: number, t2: number, obs: Circle[], pad = 0) {
  const { elbow, ee } = fk2(l1, l2, t1, t2);
  return obs.some((o) => segDist(0, 0, elbow[0], elbow[1], o.x, o.y) < o.r + pad || segDist(elbow[0], elbow[1], ee[0], ee[1], o.x, o.y) < o.r + pad);
}
export function cspaceGrid(l1: number, l2: number, obs: Circle[], n: number) {
  const grid = new Uint8Array(n * n);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const t1 = -Math.PI + ((i + 0.5) * 2 * Math.PI) / n;
      const t2 = -Math.PI + ((j + 0.5) * 2 * Math.PI) / n;
      grid[j * n + i] = armCollides(l1, l2, t1, t2, obs) ? 1 : 0;
    }
  return grid;
}
/** Angular difference on the torus (shortest way round). */
const adiff = (a: number, b: number) => wrap(b - a);
export const cdist = (a: [number, number], b: [number, number]) => Math.hypot(adiff(a[0], b[0]), adiff(a[1], b[1]));
export function edgeFree(l1: number, l2: number, a: [number, number], b: [number, number], obs: Circle[], res = 0.02) {
  const d0 = adiff(a[0], b[0]), d1 = adiff(a[1], b[1]);
  const steps = Math.max(1, Math.ceil(Math.hypot(d0, d1) / res));
  for (let k = 0; k <= steps; k++) if (armCollides(l1, l2, a[0] + (d0 * k) / steps, a[1] + (d1 * k) / steps, obs)) return false;
  return true;
}
export function rrt(l1: number, l2: number, obs: Circle[], start: [number, number], goal: [number, number], opts: { step?: number; iters?: number; goalBias?: number; seed?: number } = {}) {
  const step = opts.step ?? 0.25, iters = opts.iters ?? 4000, bias = opts.goalBias ?? 0.1;
  const R = rng(opts.seed ?? 11);
  const nodes: [number, number][] = [start];
  const parent = [-1];
  let goalIdx = -1;
  for (let it = 0; it < iters && goalIdx < 0; it++) {
    const q: [number, number] = R.next() < bias ? goal : [-Math.PI + 2 * Math.PI * R.next(), -Math.PI + 2 * Math.PI * R.next()];
    let near = 0, best = Infinity;
    for (let i = 0; i < nodes.length; i++) {
      const d = cdist(nodes[i], q);
      if (d < best) [best, near] = [d, i];
    }
    const a = nodes[near];
    const f = Math.min(1, step / (best || 1));
    const nw: [number, number] = [wrap(a[0] + adiff(a[0], q[0]) * f), wrap(a[1] + adiff(a[1], q[1]) * f)];
    if (!edgeFree(l1, l2, a, nw, obs)) continue;
    nodes.push(nw);
    parent.push(near);
    if (cdist(nw, goal) < step && edgeFree(l1, l2, nw, goal, obs)) {
      nodes.push(goal);
      parent.push(nodes.length - 2);
      goalIdx = nodes.length - 1;
    }
  }
  const path: [number, number][] = [];
  for (let i = goalIdx; i >= 0; i = parent[i]) path.unshift(nodes[i]);
  return { nodes, parent, path, found: goalIdx >= 0 };
}
/** Greedy shortcutting: skip to the farthest node with a free straight edge. */
export function shortcut(l1: number, l2: number, path: [number, number][], obs: Circle[]) {
  if (path.length < 3) return path;
  const out = [path[0]];
  let i = 0;
  while (i < path.length - 1) {
    let j = path.length - 1;
    while (j > i + 1 && !edgeFree(l1, l2, path[i], path[j], obs)) j--;
    out.push(path[j]);
    i = j;
  }
  return out;
}

/* ---------------- 12. stereo depth ---------------- */
/** Two pinhole cameras at x = ±B/2 looking along +Z. Returns pixel coords (u, from the principal point), disparity and depth. */
export function stereo(f: number, B: number, X: number, Z: number) {
  const uL = (f * (X + B / 2)) / Z;
  const uR = (f * (X - B / 2)) / Z;
  const d = uL - uR;
  return { uL, uR, d, Z: (f * B) / d, dZper1px: (Z * Z) / (f * B) };
}

/* ---------------- 14. numerical integrators on a spring ---------------- */
export type Integrator = "euler" | "symplectic" | "rk4";
export function springSim(method: Integrator, omega: number, dt: number, tEnd: number) {
  let x = 1, v = 0;
  const t: number[] = [], xs: number[] = [], E: number[] = [];
  const f = (s: Vec) => [s[1], -omega * omega * s[0]];
  const n = Math.round(tEnd / dt);
  for (let i = 0; i <= n; i++) {
    t.push(i * dt);
    xs.push(x);
    E.push(0.5 * v * v + 0.5 * omega * omega * x * x);
    if (method === "euler") [x, v] = [x + dt * v, v - dt * omega * omega * x];
    else if (method === "symplectic") {
      v = v - dt * omega * omega * x;
      x = x + dt * v;
    } else [x, v] = rk4(f, [x, v], dt);
  }
  return { t, x: xs, E };
}

/* ---------------- 15. tabular Q-learning on a grid world ---------------- */
export type GridWorld = { w: number; h: number; walls: Set<number>; goal: number; pit: number; start: number; stepCost: number; slip: number };
export const ACTIONS: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up right down left
export function gwMove(gw: GridWorld, s: number, a: number) {
  const x = s % gw.w, y = Math.floor(s / gw.w);
  const nx = x + ACTIONS[a][0], ny = y + ACTIONS[a][1];
  if (nx < 0 || ny < 0 || nx >= gw.w || ny >= gw.h) return s;
  const n = ny * gw.w + nx;
  return gw.walls.has(n) ? s : n;
}
export const gwTerminal = (gw: GridWorld, s: number) => s === gw.goal || s === gw.pit;
export const gwReward = (gw: GridWorld, s2: number) => (s2 === gw.goal ? 1 : s2 === gw.pit ? -1 : -gw.stepCost);
/** Environment step with slip: with prob slip the robot moves perpendicular (half each side). */
export function gwStep(gw: GridWorld, s: number, a: number, R: ReturnType<typeof rng>) {
  let act = a;
  const u = R.next();
  if (u < gw.slip / 2) act = (a + 1) % 4;
  else if (u < gw.slip) act = (a + 3) % 4;
  const s2 = gwMove(gw, s, act);
  return { s2, r: gwReward(gw, s2), done: gwTerminal(gw, s2) };
}
export function qEpisode(gw: GridWorld, Q: Float64Array, alpha: number, gamma: number, eps: number, R: ReturnType<typeof rng>, maxSteps = 200) {
  let s = gw.start, ret = 0, steps = 0, disc = 1;
  const visited: number[] = [s];
  while (steps < maxSteps) {
    let a = 0;
    if (R.next() < eps) a = Math.floor(R.next() * 4);
    else {
      let best = -Infinity;
      for (let k = 0; k < 4; k++) if (Q[s * 4 + k] > best + 1e-12 || (Math.abs(Q[s * 4 + k] - best) <= 1e-12 && R.next() < 0.5)) [best, a] = [Q[s * 4 + k], k];
    }
    const { s2, r, done } = gwStep(gw, s, a, R);
    let maxNext = 0;
    if (!done) {
      maxNext = -Infinity;
      for (let k = 0; k < 4; k++) maxNext = Math.max(maxNext, Q[s2 * 4 + k]);
    }
    Q[s * 4 + a] += alpha * (r + gamma * maxNext - Q[s * 4 + a]);
    ret += disc * r; // discounted return, comparable with V(start)
    disc *= gamma;
    steps++;
    s = s2;
    visited.push(s);
    if (done) break;
  }
  return { ret, steps, visited };
}
/** Value iteration ground truth for the same MDP. */
export function valueIteration(gw: GridWorld, gamma: number, iters = 1000) {
  const n = gw.w * gw.h;
  let V = new Float64Array(n);
  for (let it = 0; it < iters; it++) {
    const Vn = new Float64Array(n);
    let delta = 0;
    for (let s = 0; s < n; s++) {
      if (gw.walls.has(s) || gwTerminal(gw, s)) continue;
      let best = -Infinity;
      for (let a = 0; a < 4; a++) {
        const outs: [number, number][] = [[a, 1 - gw.slip], [(a + 1) % 4, gw.slip / 2], [(a + 3) % 4, gw.slip / 2]];
        let q = 0;
        for (const [act, p] of outs) {
          if (p === 0) continue;
          const s2 = gwMove(gw, s, act);
          q += p * (gwReward(gw, s2) + (gwTerminal(gw, s2) ? 0 : gamma * V[s2]));
        }
        best = Math.max(best, q);
      }
      Vn[s] = best;
      delta = Math.max(delta, Math.abs(best - V[s]));
    }
    V = Vn;
    if (delta < 1e-10) break;
  }
  return V;
}

/* ---------------- 16. linear inverted pendulum (LIPM) ---------------- */
/** COM height z0, foot at p. ẍ = ω² (x − p), ω = √(g/z0). Closed-form state at time t. */
export function lipm(x0: number, v0: number, p: number, z0: number, t: number, g = 9.81) {
  const w = Math.sqrt(g / z0);
  const ch = Math.cosh(w * t), sh = Math.sinh(w * t);
  return { x: p + (x0 - p) * ch + (v0 / w) * sh, v: (x0 - p) * w * sh + v0 * ch, w };
}
export const capturePoint = (x: number, v: number, z0: number, g = 9.81) => x + v / Math.sqrt(g / z0);
