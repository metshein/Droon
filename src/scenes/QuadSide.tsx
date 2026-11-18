import { useEffect, useRef } from 'react';
import { useSpring } from 'framer-motion';
import { useFrame } from './playback';

// Quad külgvaates (pitch) või tagantvaates (roll). Kalle + = parem pool alla.

const W = 400;
const H = 300;
const CX = 200;
const CY = 140;
const ARM = 85;
const GRID = 40;
// Vektoriskeemi alguspunkt
const VX = 345;
const VY = 250;

export interface QuadSideProps {
  axis: 'pitch' | 'roll';
  tilt: number;
  thrust: [number, number];
  motion?: 'hover' | 'up' | 'down' | 'right';
  showWeight?: boolean;
  showComponents?: boolean;
}

const LABELS = {
  pitch: { left: 'taga · M1+M3', right: 'ees · M2+M4', view: 'külgvaade, nina paremal' },
  roll: { left: 'vasak · M3+M4', right: 'parem · M1+M2', view: 'vaade tagant' },
};

function arrow(x: number, y: number, dx: number, dy: number) {
  return `M ${x} ${y} L ${x + dx} ${y + dy}`;
}

function SideProp({ x, power }: { x: number; power: number }) {
  // Külgvaates paistab pöörlev propeller "hingava" ellipsina.
  const ref = useRef<SVGEllipseElement>(null);
  const t = useRef(0);
  useFrame((dt) => {
    t.current += dt * (0.01 + power * 0.04);
    ref.current?.setAttribute('rx', String(30 + Math.abs(Math.sin(t.current)) * 8));
  });
  return (
    <g>
      <rect x={x - 7} y={-14} width={14} height={12} rx={2} className="motor-bell" />
      <line x1={x} y1={-14} x2={x} y2={-19} className="prop-shaft" />
      <ellipse ref={ref} cx={x} cy={-20} rx={34} ry={3} className="prop-side" opacity={0.4 + power * 0.5} />
    </g>
  );
}

export default function QuadSide({ axis, tilt, thrust, motion = 'hover', showWeight, showComponents }: QuadSideProps) {
  const tiltSpring = useSpring(tilt, { stiffness: 60, damping: 14 });
  useEffect(() => {
    tiltSpring.set(tilt);
  }, [tilt, tiltSpring]);

  const quad = useRef<SVGGElement>(null);
  const world = useRef<SVGGElement>(null);
  const grid = useRef<SVGGElement>(null);
  const st = useRef({ ox: 0, oy: 0, t: 0, vx: 0, vy: 0 });

  // Vektoriskeemi korral nihuta drooni veidi vasakule.
  const cx = showComponents ? 165 : CX;

  const target = {
    hover: [0, 0],
    up: [0, 60],
    down: [0, -60],
    right: [-90, 0],
  }[motion];

  useFrame((dt) => {
    const s = st.current;
    s.t += dt;
    s.vx += (target[0] - s.vx) * Math.min(1, dt / 600);
    s.vy += (target[1] - s.vy) * Math.min(1, dt / 600);
    s.ox = (((s.ox + (s.vx * dt) / 1000) % GRID) + GRID) % GRID;
    s.oy = (((s.oy + (s.vy * dt) / 1000) % GRID) + GRID) % GRID;
    grid.current?.setAttribute('transform', `translate(${s.ox - GRID} ${s.oy - GRID})`);
    const bob = Math.sin(s.t / 500) * 2;
    const a = tiltSpring.get();
    quad.current?.setAttribute('transform', `translate(${cx} ${CY + bob}) rotate(${a})`);
    world.current?.setAttribute('transform', `translate(${cx} ${CY + bob})`);
  });

  const labels = LABELS[axis];
  const total = thrust[0] + thrust[1];
  const rad = (tilt * Math.PI) / 180;
  const tLen = total * 110;

  const dots = [];
  for (let x = 0; x <= W + GRID; x += GRID) {
    for (let y = 0; y <= H + GRID; y += GRID) {
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.4} className="bg-dot" />);
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="scene-svg" role="img" aria-label={`Quad, ${labels.view}`}>
      <defs>
        <marker id="side-thrust" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fill-thrust" />
        </marker>
        <marker id="side-weight" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fill-weight" />
        </marker>
        <marker id="side-comp" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fill-comp" />
        </marker>
        <clipPath id="side-clip">
          <rect width={W} height={H} />
        </clipPath>
      </defs>

      <g clipPath="url(#side-clip)">
        <g ref={grid}>{dots}</g>
      </g>

      <g ref={quad}>
        <line x1={-ARM} y1={-2} x2={ARM} y2={-2} className="arm-outline side" />
        <line x1={-ARM} y1={-2} x2={ARM} y2={-2} className="arm-fill side" />
        <rect x={-28} y={-12} width={56} height={20} rx={6} className="frame-body" />
        <SideProp x={-ARM} power={thrust[0]} />
        <SideProp x={ARM} power={thrust[1]} />
        {[-ARM, ARM].map((x, i) => (
          <path
            key={x}
            d={arrow(x, -26, 0, -(10 + thrust[i] * 70))}
            className="thrust-arrow"
            markerEnd="url(#side-thrust)"
          />
        ))}
      </g>

      <g ref={world}>
        <text x={-ARM} y={50} className="side-label">
          {labels.left} · {Math.round(thrust[0] * 100)}%
        </text>
        <text x={ARM} y={50} className="side-label">
          {labels.right} · {Math.round(thrust[1] * 100)}%
        </text>
        {showWeight && (
          <>
            <path d={arrow(0, 10, 0, 72)} className="weight-arrow" markerEnd="url(#side-weight)" />
            <text x={-10} y={82} className="force-label weight end">
              raskusjõud
            </text>
          </>
        )}
      </g>

      {showComponents && Math.abs(tilt) > 1 && (
        // Kogutõukejõu vektor ja selle komponendid eraldi skeemina paremas servas.
        <g transform={`translate(${VX} ${VY})`}>
          <path d={arrow(0, 0, 0, -Math.cos(rad) * tLen)} className="comp-arrow" markerEnd="url(#side-comp)" />
          <path
            d={arrow(0, -Math.cos(rad) * tLen, Math.sin(rad) * tLen, 0)}
            className="comp-arrow"
            markerEnd="url(#side-comp)"
          />
          <path
            d={arrow(0, 0, Math.sin(rad) * tLen, -Math.cos(rad) * tLen)}
            className="thrust-arrow total"
            markerEnd="url(#side-thrust)"
          />
          <circle r={3} className="fill-thrust" />
          <text x={0} y={20} className="force-label thrust mid">
            tõukejõud
          </text>
          <text x={-8} y={-Math.cos(rad) * tLen * 0.12} className="force-label comp end">
            hoiab üleval
          </text>
          <text x={(Math.sin(rad) * tLen) / 2} y={-Math.cos(rad) * tLen - 10} className="force-label comp mid">
            viib edasi
          </text>
        </g>
      )}

      <text x={12} y={H - 12} className="view-label">
        {labels.view}
        {tilt !== 0 ? ` · kalle ${tilt}°` : ''}
      </text>
    </svg>
  );
}
