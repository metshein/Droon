import { useState } from 'react';
import QuadTop, { MOTOR_DIR } from './QuadTop';
import type { MotorQuad } from '../types';

// Interaktiivne mikser: gaas + roll + pitch + yaw -> nelja mootori kiirused.
// Märgid: roll paremale, nina alla ja yaw paremale (päripäeva) on positiivsed.
export const MIX: [number, number, number][] = [
  // [roll, pitch, yaw]
  [-1, 1, -1], // M1 tagumine parem, CW
  [-1, -1, 1], // M2 eesmine parem, CCW
  [1, 1, 1], // M3 tagumine vasak, CCW
  [1, -1, -1], // M4 eesmine vasak, CW
];

export function mix(throttle: number, roll: number, pitch: number, yaw: number): MotorQuad {
  return MIX.map(([r, p, y]) => Math.min(1, Math.max(0, throttle + r * roll + p * pitch + y * yaw))) as MotorQuad;
}

const AXES = [
  { key: 'g', label: 'Gaas (G)', min: 0, max: 1, def: 0.5 },
  { key: 'r', label: 'Roll (R)', min: -0.4, max: 0.4, def: 0 },
  { key: 'p', label: 'Pitch (P)', min: -0.4, max: 0.4, def: 0 },
  { key: 'y', label: 'Yaw (Y)', min: -0.4, max: 0.4, def: 0 },
] as const;

type Key = (typeof AXES)[number]['key'];

export default function Mixer() {
  const [v, setV] = useState<Record<Key, number>>({ g: 0.5, r: 0, p: 0, y: 0 });
  const motors = mix(v.g, v.r, v.p, v.y);
  const net = -motors.reduce((s, m, i) => s + MOTOR_DIR[i] * m * m, 0);
  const saturated = MIX.some(([r, p, y]) => {
    const raw = v.g + r * v.r + p * v.p + y * v.y;
    return raw < 0 || raw > 1;
  });

  return (
    <div className="scene-stack">
      <QuadTop motors={motors} showNumbers showDirections showTorque bodyYaw={net * 120} />
      <div className="scene-controls grid">
        {AXES.map((a) => (
          <label key={a.key} className="slider">
            <span>
              {a.label}: {v[a.key] > 0 && a.key !== 'g' ? '+' : ''}
              {Math.round(v[a.key] * 100)}
            </span>
            <input
              type="range"
              min={a.min}
              max={a.max}
              step={0.01}
              value={v[a.key]}
              onChange={(e) => setV({ ...v, [a.key]: Number(e.target.value) })}
            />
          </label>
        ))}
        <div className="mixer-footer">
          <button type="button" className="btn small" onClick={() => setV({ g: 0.5, r: 0, p: 0, y: 0 })}>
            Lähtesta
          </button>
          {saturated && <span className="warn">Mootor on piiril (0% või 100%), käsku ei saa täpselt täita</span>}
        </div>
      </div>
    </div>
  );
}
