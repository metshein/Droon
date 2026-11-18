import { useState } from 'react';
import QuadTop from './QuadTop';
import Stick from './Stick';
import FlightView from './FlightView';
import type { MotorQuad } from '../types';

// Interaktiivne mikser Mode 2 puldiga: vasak kang = gaas + yaw, parem kang = pitch + roll.
// Kere pööre näitab ainult yaw-käsku: päris droonil kompenseerib lennukontroller roll/pitch-i kõrvalmõju.
// Märgid: roll paremale, nina alla ja yaw paremale (päripäeva) on positiivsed.
export const MIX: [number, number, number][] = [
  // [roll, pitch, yaw]
  [-1, 1, -1], // M1 tagumine parem, CW
  [-1, -1, 1], // M2 eesmine parem, CCW
  [1, 1, 1], // M3 tagumine vasak, CCW
  [1, -1, -1], // M4 eesmine vasak, CW
];

export function mixRaw(throttle: number, roll: number, pitch: number, yaw: number): number[] {
  return MIX.map(([r, p, y]) => throttle + r * roll + p * pitch + y * yaw);
}

export function mix(throttle: number, roll: number, pitch: number, yaw: number): MotorQuad {
  return mixRaw(throttle, roll, pitch, yaw).map((v) => Math.min(1, Math.max(0, v))) as MotorQuad;
}

/** Kangi täishälbe mõju mootorile. */
const AUTHORITY = 0.3;

function MotorChips({ deltas }: { deltas: number[] }) {
  return (
    <div className="motor-chips">
      {deltas.map((d, i) => (
        <span key={i} className={d > 0.02 ? 'chip up' : d < -0.02 ? 'chip down' : 'chip'}>
          M{i + 1} {d > 0.02 ? '▲' : d < -0.02 ? '▼' : '·'}
        </span>
      ))}
    </div>
  );
}

export default function Mixer() {
  const [left, setLeft] = useState({ x: 0, y: 0 });
  const [right, setRight] = useState({ x: 0, y: 0 });

  const g = (left.y + 1) / 2;
  const yaw = left.x * AUTHORITY;
  const roll = right.x * AUTHORITY;
  const pitch = right.y * AUTHORITY;

  const motors = mix(g, roll, pitch, yaw);
  const saturated = mixRaw(g, roll, pitch, yaw).some((v) => v < 0 || v > 1);
  const leftDeltas = MIX.map(([, , y]) => g - 0.5 + y * yaw);
  const rightDeltas = MIX.map(([r, p]) => r * roll + p * pitch);
  const accelerating = leftDeltas.map((_, i) => i).filter((i) => leftDeltas[i] + rightDeltas[i] > 0.02);

  return (
    <div className="mixer">
      <div className="mixer-quad">
        <QuadTop
          motors={motors}
          showNumbers
          showDirections
          showTorque
          highlight={accelerating}
          bodyYaw={yaw * 300}
        />
      </div>
      <div className="stick-col left">
          <Stick
            label="Vasak · gaas + yaw"
            x={left.x}
            y={left.y}
            springY={false}
            onChange={(x, y) => setLeft({ x, y })}
            axes={{ up: 'gaas +', down: 'gaas −', left: '↺', right: '↻' }}
          />
          <MotorChips deltas={leftDeltas} />
      </div>
      <div className="stick-col right">
          <Stick
            label="Parem · pitch + roll"
            x={right.x}
            y={right.y}
            onChange={(x, y) => setRight({ x, y })}
            axes={{ up: 'nina alla', down: 'nina üles', left: '◀', right: '▶' }}
          />
          <MotorChips deltas={rightDeltas} />
      </div>
      <FlightView
        // Püsivas kaldes pöörlevad mootorid jälle ühtlaselt, seega kogutõukejõud tuleb gaasist (T ∝ n²).
        thrust={(g / 0.5) ** 2}
        pitch={right.y * 30}
        roll={right.x * 30}
      />
      <p className={saturated ? 'mixer-note warn' : 'mixer-note'}>
        {saturated
          ? 'Mõni mootor on piiril (0% või 100%): käsku ei saa täpselt täita.'
          : `G ${Math.round(g * 100)}% · R ${Math.round(roll * 100)} · P ${Math.round(pitch * 100)} · Y ${Math.round(yaw * 100)}`}
      </p>
    </div>
  );
}
