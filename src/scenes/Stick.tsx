import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

// Puldi juhtkang (gimbal). Väärtused -1…1, y positiivne = kang üleval.
// Vedruga teljed naasevad lahti laskmisel keskele (nagu päris pultidel kõik peale gaasi).

export interface StickProps {
  label: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
  springX?: boolean;
  springY?: boolean;
  axes: { up: string; down: string; left: string; right: string };
}

const S = 160;
const C = S / 2;
const R = 62;
const clamp = (v: number) => Math.max(-1, Math.min(1, v));

export default function Stick({ label, x, y, onChange, springX = true, springY = true, axes }: StickProps) {
  const [drag, setDrag] = useState(false);
  const svg = useRef<SVGSVGElement>(null);

  const fromPointer = (e: PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * S;
    const py = ((e.clientY - r.top) / r.height) * S;
    onChange(clamp((px - C) / R), clamp(-(py - C) / R));
  };

  const release = () => {
    setDrag(false);
    onChange(springX ? 0 : x, springY ? 0 : y);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const step = 0.1;
    let nx = x;
    let ny = y;
    if (e.key === 'ArrowLeft') nx = springX ? -0.8 : clamp(x - step);
    else if (e.key === 'ArrowRight') nx = springX ? 0.8 : clamp(x + step);
    else if (e.key === 'ArrowUp') ny = springY ? 0.8 : clamp(y + step);
    else if (e.key === 'ArrowDown') ny = springY ? -0.8 : clamp(y - step);
    else return;
    e.preventDefault();
    onChange(nx, ny);
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && springX) onChange(0, y);
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && springY) onChange(x, 0);
  };

  const kx = C + x * R;
  const ky = C - y * R;

  return (
    <div className="stick">
      <svg
        ref={svg}
        viewBox={`0 0 ${S} ${S}`}
        className={drag ? 'stick-svg dragging' : 'stick-svg'}
        tabIndex={0}
        data-stick
        role="application"
        aria-label={`${label}. Nooleklahvid liigutavad kangi.`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.focus();
          setDrag(true);
          fromPointer(e);
        }}
        onPointerMove={(e) => drag && fromPointer(e)}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      >
        <rect x={6} y={6} width={S - 12} height={S - 12} rx={18} className="stick-base" />
        <line x1={C} y1={C - R} x2={C} y2={C + R} className="stick-cross" />
        <line x1={C - R} y1={C} x2={C + R} y2={C} className="stick-cross" />
        <circle cx={C} cy={C} r={R} className="stick-ring" />
        <text x={C} y={16} className="stick-axis">{axes.up}</text>
        <text x={C} y={S - 9} className="stick-axis">{axes.down}</text>
        <text x={11} y={C - 6} className="stick-axis start">{axes.left}</text>
        <text x={S - 11} y={C - 6} className="stick-axis end">{axes.right}</text>
        <line x1={C} y1={C} x2={kx} y2={ky} className="stick-stem" />
        <circle cx={kx} cy={ky} r={17} className="stick-knob" />
        <circle cx={kx} cy={ky} r={7} className="stick-knob-top" />
      </svg>
      <span className="stick-label">{label}</span>
    </div>
  );
}
