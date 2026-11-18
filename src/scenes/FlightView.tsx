import { useRef } from 'react';
import { useFrame } from './playback';

// Mikseri lennuvaade: külgvaade (pitch) ja tagantvaade (roll) koos kõrgusega.
// Lihtsustatud füüsika: kalle järgib kangi nagu angle-režiimis, tõus/laskumine tuleb
// kogutõukejõu vertikaalosa ja kaalu vahest, edasiliikumine kalde suunas.

interface Props {
  /** Kogutõukejõud kaalu suhtes (1 = hõljumine). */
  thrust: number;
  /** Soovitud pitch-kalle kraadides, + = nina alla. */
  pitch: number;
  /** Soovitud roll-kalle kraadides, + = paremale. */
  roll: number;
}

const W = 300;
const H = 150;
const GROUND = 134;
const TOP = 30;
const GRID = 30;
const ARM = 50;

const rad = (d: number) => (d * Math.PI) / 180;
const wrap = (v: number) => ((v % GRID) + GRID) % GRID;

interface PanelRefs {
  quad: React.RefObject<SVGGElement | null>;
  grid: React.RefObject<SVGGElement | null>;
  alt: React.RefObject<SVGCircleElement | null>;
}

function Panel({ id, title, left, right, refs }: { id: string; title: string; left: string; right: string; refs: PanelRefs }) {
  const dots = [];
  for (let x = 0; x <= W + GRID; x += GRID) {
    for (let y = 18; y < GROUND; y += GRID) dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} className="bg-dot" />);
    dots.push(<line key={`t${x}`} x1={x} y1={GROUND} x2={x - 8} y2={GROUND + 8} className="ground-tick" />);
  }
  return (
    <figure className="flight-panel">
      <svg viewBox={`0 0 ${W} ${H}`} className="flight-svg" role="img" aria-label={title}>
        <defs>
          <clipPath id={`flight-clip-${id}`}>
            <rect width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath={`url(#flight-clip-${id})`}>
          <g ref={refs.grid}>{dots}</g>
        </g>
        <line x1={0} y1={GROUND} x2={W} y2={GROUND} className="ground-line" />
        <line x1={W - 12} y1={TOP - 8} x2={W - 12} y2={GROUND} className="alt-scale" />
        <circle ref={refs.alt} cx={W - 12} cy={GROUND} r={4.5} className="alt-dot" />
        <g ref={refs.quad}>
          <line x1={-ARM} y1={0} x2={ARM} y2={0} className="arm-outline side" />
          <line x1={-ARM} y1={0} x2={ARM} y2={0} className="arm-fill side" />
          <rect x={-16} y={-8} width={32} height={14} rx={4} className="frame-body" />
          {[-ARM, ARM].map((x) => (
            <g key={x}>
              <rect x={x - 5} y={-10} width={10} height={8} rx={2} className="motor-bell" />
              <ellipse cx={x} cy={-13} rx={22} ry={2.5} className="prop-side" opacity={0.75} />
            </g>
          ))}
          <text x={-ARM} y={22} className="side-label">
            {left}
          </text>
          <text x={ARM} y={22} className="side-label">
            {right}
          </text>
        </g>
      </svg>
      <figcaption>{title}</figcaption>
    </figure>
  );
}

export default function FlightView({ thrust, pitch, roll }: Props) {
  const side: PanelRefs = { quad: useRef(null), grid: useRef(null), alt: useRef(null) };
  const back: PanelRefs = { quad: useRef(null), grid: useRef(null), alt: useRef(null) };
  const readout = useRef<HTMLSpanElement>(null);
  const st = useRef({ h: 0.5, v: 0, p: 0, r: 0, vx: 0, vy: 0, ox: 0, oy: 0 });

  useFrame((dt) => {
    const s = st.current;
    const k = dt / 1000;
    s.p += (pitch - s.p) * Math.min(1, k / 0.15);
    s.r += (roll - s.r) * Math.min(1, k / 0.15);

    // Vertikaalne: tõukejõu vertikaalosa vs kaal, õhutakistusega.
    const lift = thrust * Math.cos(rad(s.p)) * Math.cos(rad(s.r));
    s.v += ((lift - 1) * 0.7 - 1.6 * s.v) * k;
    s.v = Math.max(-0.35, Math.min(0.35, s.v));
    s.h += s.v * k;
    if (s.h <= 0) {
      s.h = 0;
      s.v = Math.max(0, s.v);
    } else if (s.h >= 1) {
      s.h = 1;
      s.v = Math.min(0, s.v);
    }

    // Horisontaalne: tõukejõu horisontaalosa. Maas seistes ei liigu.
    const grounded = s.h === 0 && lift <= 1;
    const tvx = grounded ? 0 : Math.sin(rad(s.p)) * thrust * 160;
    const tvy = grounded ? 0 : Math.sin(rad(s.r)) * thrust * 160;
    s.vx += (tvx - s.vx) * Math.min(1, k / 0.6);
    s.vy += (tvy - s.vy) * Math.min(1, k / 0.6);
    s.ox = wrap(s.ox - s.vx * k);
    s.oy = wrap(s.oy - s.vy * k);

    const qy = GROUND - 20 - s.h * (GROUND - 20 - TOP);
    const ay = GROUND - s.h * (GROUND - TOP + 8);
    side.quad.current?.setAttribute('transform', `translate(${W / 2 - 6} ${qy}) rotate(${s.p})`);
    back.quad.current?.setAttribute('transform', `translate(${W / 2 - 6} ${qy}) rotate(${s.r})`);
    side.grid.current?.setAttribute('transform', `translate(${s.ox - GRID} 0)`);
    back.grid.current?.setAttribute('transform', `translate(${s.oy - GRID} 0)`);
    side.alt.current?.setAttribute('cy', String(ay));
    back.alt.current?.setAttribute('cy', String(ay));

    if (readout.current) {
      const vert =
        s.h === 0 && s.v <= 0.005 ? 'maas' : s.h === 1 ? 'ülemine piir' : s.v > 0.01 ? '↑ tõuseb' : s.v < -0.01 ? '↓ laskub' : 'hõljub';
      const moves = [];
      if (Math.abs(s.vx) > 8) moves.push(s.vx > 0 ? 'edasi' : 'tagasi');
      if (Math.abs(s.vy) > 8) moves.push(s.vy > 0 ? 'paremale' : 'vasakule');
      readout.current.textContent = `kõrgus ${Math.round(s.h * 100)}% · ${vert}${moves.length ? ' · liigub ' + moves.join(' ja ') : ''}`;
    }
  });

  return (
    <div className="flight">
      <Panel id="side" title="Külgvaade · nina →" left="taga" right="ees" refs={side} />
      <Panel id="back" title="Vaade tagant" left="vasak" right="parem" refs={back} />
      <span ref={readout} className="flight-readout" aria-live="off" />
    </div>
  );
}
