import { useEffect, useRef, useState } from 'react';
import { useAnimationFrame } from 'framer-motion';
import type { MotorQuad } from '../types';

// Quad ülalt vaadates, nina üleval. Mootorid Betaflighti Quad X järjekorras.

const C = 200;
export const MOTOR_POS: [number, number][] = [
  [300, 300], // M1 tagumine parem
  [300, 100], // M2 eesmine parem
  [100, 300], // M3 tagumine vasak
  [100, 100], // M4 eesmine vasak
];
/** 1 = päripäeva (CW), -1 = vastupäeva (CCW), "props in" */
export const MOTOR_DIR = [1, -1, -1, 1];
const PROP_R = 62;

export interface QuadTopProps {
  motors: MotorQuad;
  showNumbers?: boolean;
  showDirections?: boolean;
  showTorque?: boolean;
  highlight?: number[];
  bodyYaw?: number;
  jitter?: boolean;
}

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/** Kaar keskmega `mid` kraadides ja laiusega `span`, noolega suunas `dir` (1 = päripäeva). */
function arcPath(cx: number, cy: number, r: number, mid: number, span: number, dir: number) {
  const a0 = mid - (span / 2) * dir;
  const a1 = mid + (span / 2) * dir;
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${span > 180 ? 1 : 0} ${dir > 0 ? 1 : 0} ${x1} ${y1}`;
}

function Prop({ x, y, speed, dir, highlight }: { x: number; y: number; speed: number; dir: number; highlight: boolean }) {
  const blade = useRef<SVGGElement>(null);
  const disc = useRef<SVGCircleElement>(null);
  const s = useRef({ angle: Math.random() * 180, cur: speed });

  useAnimationFrame((_, dt) => {
    const st = s.current;
    st.cur += (speed - st.cur) * Math.min(1, dt / 250);
    st.angle = (st.angle + dir * (0.05 + st.cur) * dt * 0.9) % 360;
    blade.current?.setAttribute('transform', `rotate(${st.angle})`);
    disc.current?.setAttribute('opacity', String(0.08 + st.cur * 0.32));
  });

  return (
    <g transform={`translate(${x} ${y})`}>
      {highlight && <circle r={PROP_R + 6} className="prop-highlight" />}
      <circle ref={disc} r={PROP_R} className={dir > 0 ? 'prop-disc cw' : 'prop-disc ccw'} />
      <g ref={blade}>
        <ellipse rx={PROP_R - 2} ry={6} className="prop-blade" />
      </g>
      <circle r={13} className="motor-bell" />
    </g>
  );
}

export default function QuadTop({
  motors,
  showNumbers,
  showDirections,
  showTorque,
  highlight = [],
  bodyYaw = 0,
  jitter,
}: QuadTopProps) {
  const [noise, setNoise] = useState<MotorQuad>([0, 0, 0, 0]);
  useEffect(() => {
    if (!jitter) {
      setNoise([0, 0, 0, 0]);
      return;
    }
    const id = setInterval(() => {
      setNoise(() => [0, 1, 2, 3].map(() => (Math.random() - 0.5) * 0.14) as MotorQuad);
    }, 160);
    return () => clearInterval(id);
  }, [jitter]);

  const speeds = motors.map((m, i) => Math.min(1, Math.max(0, m + noise[i]))) as MotorQuad;

  // Kerele mõjuv reaktsioonimoment on propelleri pöörlemisele vastupidine ja ∝ n².
  const net = -speeds.reduce((sum, v, i) => sum + MOTOR_DIR[i] * v * v, 0);

  const body = useRef<SVGGElement>(null);
  const yaw = useRef({ angle: 0, rate: bodyYaw });
  useAnimationFrame((_, dt) => {
    const y = yaw.current;
    y.rate += (bodyYaw - y.rate) * Math.min(1, dt / 400);
    if (Math.abs(y.rate) < 0.01 && bodyYaw === 0) {
      // Pööra tagasi algasendisse.
      const back = ((y.angle % 360) + 540) % 360 - 180;
      y.angle = back * (1 - Math.min(1, dt / 300));
    } else {
      y.angle += (y.rate * dt) / 1000;
    }
    body.current?.setAttribute('transform', `rotate(${y.angle} ${C} ${C})`);
  });

  return (
    <svg viewBox={showTorque ? '0 -14 400 452' : '0 -14 400 428'} className="scene-svg" role="img" aria-label="Quad ülalt vaadates">
      <defs>
        <marker id="arrow-cw" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fill-cw" />
        </marker>
        <marker id="arrow-ccw" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fill-ccw" />
        </marker>
        <marker id="arrow-torque" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fill-torque" />
        </marker>
      </defs>

      <g ref={body}>
        {MOTOR_POS.map(([x, y], i) => (
          <line key={i} x1={C} y1={C} x2={x} y2={y} className="frame-arm" />
        ))}
        <rect x={C - 34} y={C - 46} width={68} height={92} rx={12} className="frame-body" />
        <path d={`M ${C} ${C - 36} l 12 18 h -24 z`} className="front-marker" />

        {MOTOR_POS.map(([x, y], i) => (
          <Prop
            key={i}
            x={x}
            y={y}
            speed={speeds[i]}
            dir={MOTOR_DIR[i]}
            highlight={highlight.includes(i)}
          />
        ))}

        {showDirections &&
          MOTOR_POS.map(([x, y], i) => {
            const out = (Math.atan2(y - C, x - C) * 180) / Math.PI;
            const cw = MOTOR_DIR[i] > 0;
            return (
              <path
                key={i}
                d={arcPath(x, y, PROP_R + 12, out, 70, MOTOR_DIR[i])}
                className={cw ? 'dir-arc cw' : 'dir-arc ccw'}
                markerEnd={`url(#arrow-${cw ? 'cw' : 'ccw'})`}
              />
            );
          })}

        {showTorque &&
          MOTOR_POS.map(([x, y], i) => {
            const inward = (Math.atan2(C - y, C - x) * 180) / Math.PI;
            const w = 1 + speeds[i] * speeds[i] * 5;
            return (
              <path
                key={i}
                d={arcPath(x, y, 30, inward, 110, -MOTOR_DIR[i])}
                className="torque-arc"
                strokeWidth={w}
                markerEnd="url(#arrow-torque)"
              />
            );
          })}

        <text x={C} y={C + 4} className="body-label">
          FC
        </text>
      </g>

      <text x={C} y={-2} className="front-label">
        EES ▲
      </text>

      {showNumbers &&
        MOTOR_POS.map(([x, y], i) => {
          const top = y < C;
          const ly = top ? y - PROP_R - 26 : y + PROP_R + 22;
          const pct = Math.round(speeds[i] * 100);
          return (
            <g key={i} className="motor-label">
              <text x={x} y={ly} className={MOTOR_DIR[i] > 0 ? 'label cw' : 'label ccw'}>
                M{i + 1} · {MOTOR_DIR[i] > 0 ? 'CW' : 'CCW'} · {pct}%
              </text>
              <rect x={x - 40} y={ly + 6} width={80} height={5} rx={2.5} className="bar-bg" />
              <rect x={x - 40} y={ly + 6} width={80 * speeds[i]} height={5} rx={2.5} className="bar-fg" />
            </g>
          );
        })}

      {showTorque && (
        <g className="net-torque">
          {Math.abs(net) > 0.02 ? (
            <path
              d={arcPath(C, C, 64, 90, 140, Math.sign(net))}
              className="torque-arc net"
              strokeWidth={2 + Math.abs(net) * 8}
              markerEnd="url(#arrow-torque)"
            />
          ) : null}
          <text x={C} y={428} className="torque-label">
            {Math.abs(net) > 0.02
              ? `netomoment: ${net > 0 ? 'päripäeva ↻' : 'vastupäeva ↺'}`
              : 'netomoment ≈ 0'}
          </text>
        </g>
      )}
    </svg>
  );
}
