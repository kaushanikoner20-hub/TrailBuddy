// The closing scene's choreography as pure functions of time (seconds).
// The Three.js code only applies these values, so the timing and layout rules can be tested without WebGL.

export const DURATION = 7;
export const FLIGHT_START = 1.6;

const PHASE_STARTS = [
  ['arrival', 0],
  ['takeoff', FLIGHT_START],
  ['message', 3.4],
  ['settled', DURATION - 0.2],
];

export function phaseAt(t) {
  let name = 'arrival';
  for (const [phase, start] of PHASE_STARTS) {
    if (t >= start) name = phase;
  }
  return name;
}

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smoothstep = (x) => x * x * (3 - 2 * x);
const lerp = (a, b, k) => a + (b - a) * k;
const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

export const PERCH = [2.2, 3.4, -6.0];
export const PERCH_TREE = { x: 3.6, z: -6.4 };
const FLIGHT_CONTROL = [-1.0, 9.0, -20.0];
const FLIGHT_END = [-9.0, 17.0, -80.0];
const FOLDED_WING = -1.15;

function bezier(u) {
  const a = (1 - u) * (1 - u);
  const b = 2 * (1 - u) * u;
  const c = u * u;
  return [0, 1, 2].map((i) => a * PERCH[i] + b * FLIGHT_CONTROL[i] + c * FLIGHT_END[i]);
}

function bezierTangent(u) {
  return [0, 1, 2].map(
    (i) => 2 * (1 - u) * (FLIGHT_CONTROL[i] - PERCH[i]) + 2 * u * (FLIGHT_END[i] - FLIGHT_CONTROL[i]),
  );
}

/** Where the bird is, which way it faces, and how its wings are held at time t. */
export function birdPose(t) {
  const x = clamp01((t - FLIGHT_START) / (DURATION - FLIGHT_START));
  const u = Math.pow(x, 1.7); // starts slowly off the branch, then accelerates away
  const airborne = t >= FLIGHT_START;

  const position = airborne ? bezier(u) : [PERCH[0], PERCH[1] + 0.02 * Math.sin(t * 4), PERCH[2]];

  let wingAngle;
  if (t < FLIGHT_START - 0.3) wingAngle = FOLDED_WING;
  else if (t < FLIGHT_START) wingAngle = lerp(FOLDED_WING, 0.3, clamp01((t - (FLIGHT_START - 0.3)) / 0.3));
  else wingAngle = 0.1 + 0.85 * Math.sin(20 * (t - FLIGHT_START));

  return {
    position,
    tangent: bezierTangent(u),
    wingAngle,
    airborne,
    turn: clamp01((t - FLIGHT_START) / 0.6),
  };
}

/** Camera position and look-at point at time t: a gentle dolly in, then a slow tilt up after the bird. */
export function cameraPose(t) {
  const dolly = smoothstep(clamp01(t / FLIGHT_START));
  const follow = smoothstep(clamp01((t - FLIGHT_START) / 4.5));
  return {
    position: [0, 3.2 + dolly * 0.1 + follow * 1.2, 10.6 - dolly * 1.2],
    look: lerp3([1.6, 3.7, -6], [-2.5, 10, -38], follow),
  };
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic tree placement. Keeps the middle of the view and the perch tree's area clear. */
export function treeLayout(count = 34, seed = 7) {
  const random = mulberry32(seed);
  const trees = [];
  for (let attempt = 0; attempt < 2000 && trees.length < count; attempt += 1) {
    const z = -(3 + random() * 70);
    const halfWidth = 6 + Math.abs(z) * 0.55;
    const x = (random() * 2 - 1) * halfWidth;
    const inCorridor = Math.abs(x) < 3.2 && z > -30;
    const nearPerchTree = Math.hypot(x - PERCH_TREE.x, z - PERCH_TREE.z) < 4;
    const kind = random() < 0.65 ? 'pine' : 'round';
    const scale = 0.8 + random() * 0.9;
    const phase = random() * Math.PI * 2;
    if (inCorridor || nearPerchTree) continue;
    trees.push({ x, z, kind, scale, phase });
  }
  return trees;
}