import { useEffect, useRef, useState } from 'react';
import type { MotorQuad } from '../types';
import { useFrame, usePaused } from './playback';

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
const PROP_R = 60;
const DEPTH = 6;

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

  useFrame((dt) => {
    const st = s.current;
    st.cur += (speed - st.cur) * Math.min(1, dt / 250);
    st.angle = (st.angle + dir * (0.05 + st.cur) * dt * 0.9) % 360;
    blade.current?.setAttribute('transform', `rotate(${st.angle})`);
    disc.current?.setAttribute('opacity', String(0.25 + st.cur * 0.75));
  });

  const cls = dir > 0 ? 'cw' : 'ccw';
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={PROP_R} cx={DEPTH * 0.6} cy={DEPTH * 0.8} className="depth" />
      <circle r={PROP_R} className="prop-base" />
      <circle ref={disc} r={PROP_R} className={`prop-disc ${cls}`} />
      <circle r={PROP_R} className={highlight ? 'prop-ring hl' : 'prop-ring'} />
      <g ref={blade}>
        <path
          d={`M ${-PROP_R + 4} 0 C ${-PROP_R + 14} -9, -14 -8, 0 -6 C 14 -4, ${PROP_R - 14} 7, ${PROP_R - 4} 0 C ${PROP_R - 14} 9, 14 8, 0 6 C -14 4, ${-PROP_R + 14} -7, ${-PROP_R + 4} 0 Z`}
          className="prop-blade"
        />
      </g>
      <circle r={13} className="motor-bell" />
      <circle r={4} className="motor-shaft" />
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
  const paused = usePaused();
  const [noise, setNoise] = useState<MotorQuad>([0, 0, 0, 0]);
  useEffect(() => {
    if (!jitter || paused) {
      if (!jitter) setNoise([0, 0, 0, 0]);
      return;
    }
    const id = setInterval(() => {
      setNoise(() => [0, 1, 2, 3].map(() => (Math.random() - 0.5) * 0.14) as MotorQuad);
    }, 160);
    return () => clearInterval(id);
  }, [jitter, paused]);

  const speeds = motors.map((m, i) => Math.min(1, Math.max(0, m + noise[i]))) as MotorQuad;

  // Kerele mõjuv reaktsioonimoment on propelleri pöörlemisele vastupidine ja ∝ n².
  const net = -speeds.reduce((sum, v, i) => sum + MOTOR_DIR[i] * v * v, 0);

  const body = useRef<SVGGElement>(null);
  const yaw = useRef({ angle: 0, rate: bodyYaw });
  useFrame((dt) => {
    const y = yaw.current;
    y.rate += (bodyYaw - y.rate) * Math.min(1, dt / 400);
    if (Math.abs(y.rate) < 0.01 && bodyYaw === 0) {
      // Pööra tagasi algasendisse.
      const back = ((((y.angle % 360) + 540) % 360) - 180);
      y.angle = back * (1 - Math.min(1, dt / 300));
    } else {
      y.angle += (y.rate * dt) / 1000;
    }
    body.current?.setAttribute('transform', `rotate(${y.angle} ${C} ${C})`);
  });

  const height = showTorque ? 456 : 432;

  return (
    <svg viewBox={`0 -16 400 ${height}`} className="scene-svg" role="img" aria-label="Quad ülalt vaadates">
      <defs>
        {['cw', 'ccw', 'torque'].map((k) => (
          <marker key={k} id={`qt-${k}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" className={`fill-${k}`} />
          </marker>
        ))}
      </defs>

      <g ref={body}>
        {MOTOR_POS.map(([x, y], i) => (
          <line key={`d${i}`} x1={C + DEPTH * 0.6} y1={C + DEPTH * 0.8} x2={x + DEPTH * 0.6} y2={y + DEPTH * 0.8} className="arm-depth" />
        ))}
        {MOTOR_POS.map(([x, y], i) => (
          <line key={`o${i}`} x1={C} y1={C} x2={x} y2={y} className="arm-outline" />
        ))}
        {MOTOR_POS.map(([x, y], i) => (
          <line key={`f${i}`} x1={C} y1={C} x2={x} y2={y} className="arm-fill" />
        ))}

        {MOTOR_POS.map(([x, y], i) => (
          <Prop key={i} x={x} y={y} speed={speeds[i]} dir={MOTOR_DIR[i]} highlight={highlight.includes(i)} />
        ))}

        <rect x={C - 34 + DEPTH} y={C - 46 + DEPTH} width={68} height={92} rx={14} className="depth" />
        <rect x={C - 34} y={C - 46} width={68} height={92} rx={14} className="frame-body" />
        <path d={`M ${C} ${C - 36} l 11 16 h -22 z`} className="front-marker" />
        <text x={C} y={C + 10} className="body-label">
          FC
        </text>

        {showDirections &&
          MOTOR_POS.map(([x, y], i) => {
            const out = (Math.atan2(y - C, x - C) * 180) / Math.PI;
            const cw = MOTOR_DIR[i] > 0;
            return (
              <path
                key={i}
                d={arcPath(x, y, PROP_R + 12, out, 70, MOTOR_DIR[i])}
                className={cw ? 'dir-arc cw' : 'dir-arc ccw'}
                markerEnd={`url(#qt-${cw ? 'cw' : 'ccw'})`}
              />
            );
          })}

        {showTorque &&
          MOTOR_POS.map(([x, y], i) => {
            const inward = (Math.atan2(C - y, C - x) * 180) / Math.PI;
            return (
              <path
                key={i}
                d={arcPath(x, y, 30, inward, 110, -MOTOR_DIR[i])}
                className="torque-arc"
                strokeWidth={1.5 + speeds[i] * speeds[i] * 5}
                markerEnd="url(#qt-torque)"
              />
            );
          })}
      </g>

      <g className="pill-label" transform={`translate(${C} -2)`}>
        <rect x={-30} y={-12} width={60} height={22} rx={11} />
        <text y={4}>EES ▲</text>
      </g>

      {showNumbers &&
        MOTOR_POS.map(([x, y], i) => {
          const top = y < C;
          const ly = top ? y - PROP_R - 30 : y + PROP_R + 26;
          const pct = Math.round(speeds[i] * 100);
          const cw = MOTOR_DIR[i] > 0;
          return (
            <g key={i} className="motor-label" transform={`translate(${x} ${ly})`}>
              <rect x={-58} y={-12} width={116} height={22} rx={11} className="pill" />
              <circle cx={-44} cy={-1} r={5} className={cw ? 'swatch cw' : 'swatch ccw'} />
              <text x={6} y={4}>
                M{i + 1} {cw ? 'CW' : 'CCW'} {pct}%
              </text>
              <rect x={-44} y={14} width={88} height={5} rx={2.5} className="bar-bg" />
              <rect x={-44} y={14} width={88 * speeds[i]} height={5} rx={2.5} className="bar-fg" />
            </g>
          );
        })}

      {showTorque && (
        <g>
          {Math.abs(net) > 0.02 && (
            <path
              d={arcPath(C, C, 66, 90, 140, Math.sign(net))}
              className="torque-arc net"
              strokeWidth={2 + Math.abs(net) * 8}
              markerEnd="url(#qt-torque)"
            />
          )}
          <g className="pill-label torque" transform={`translate(${C} 430)`}>
            <rect x={-92} y={-12} width={184} height={22} rx={11} />
            <text y={4}>
              {Math.abs(net) > 0.02 ? `netomoment ${net > 0 ? 'päripäeva ↻' : 'vastupäeva ↺'}` : 'netomoment ≈ 0'}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}
