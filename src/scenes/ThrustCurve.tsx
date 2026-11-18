import { useState } from 'react';

// Tõukejõu (∝ n²) ja võimsuse (∝ n³) suhteline kasv pöörlemissageduse funktsioonina.

const W = 400;
const H = 300;
const L = 48;
const R = 380;
const T = 24;
const B = 240;

const px = (v: number) => L + v * (R - L);
const py = (v: number) => B - v * (B - T);

function curve(pow: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 50; i++) {
    const v = i / 50;
    pts.push(`${i ? 'L' : 'M'} ${px(v).toFixed(1)} ${py(v ** pow).toFixed(1)}`);
  }
  return pts.join(' ');
}

export default function ThrustCurve({ rpm = 0.5 }: { rpm?: number }) {
  const [n, setN] = useState(rpm);
  const thrust = n * n;
  const power = n * n * n;

  return (
    <div className="scene-stack">
      <svg viewBox={`0 0 ${W} ${H}`} className="scene-svg" role="img" aria-label="Tõukejõu ja võimsuse graafik">
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={L} x2={R} y1={py(v)} y2={py(v)} className="grid-line" />
            <text x={L - 8} y={py(v) + 4} className="axis-label end">
              {Math.round(v * 100)}%
            </text>
            <text x={px(v)} y={B + 18} className="axis-label">
              {Math.round(v * 100)}%
            </text>
          </g>
        ))}
        <text x={(L + R) / 2} y={H - 8} className="axis-title">
          pöörlemissagedus n (maksimumist)
        </text>

        <path d={curve(1)} className="curve linear" />
        <path d={curve(2)} className="curve thrust" />
        <path d={curve(3)} className="curve power" />

        <line x1={px(n)} x2={px(n)} y1={T} y2={B} className="cursor-line" />
        <circle cx={px(n)} cy={py(thrust)} r={6} className="curve-dot thrust" />
        <circle cx={px(n)} cy={py(power)} r={6} className="curve-dot power" />

        <g className="legend" transform={`translate(${L + 10} ${T + 6})`}>
          <rect width={176} height={64} rx={10} className="legend-bg" />
          <line x1={10} x2={30} y1={16} y2={16} className="curve thrust" />
          <text x={38} y={20}>tõukejõud ∝ n²</text>
          <line x1={10} x2={30} y1={34} y2={34} className="curve power" />
          <text x={38} y={38}>võimsus ∝ n³</text>
          <line x1={10} x2={30} y1={52} y2={52} className="curve linear" />
          <text x={38} y={56}>lineaarne (võrdluseks)</text>
        </g>
      </svg>

      <div className="scene-controls">
        <label className="slider">
          <span>Pöörded: {Math.round(n * 100)}%</span>
          <input type="range" min={0} max={1} step={0.01} value={n} onChange={(e) => setN(Number(e.target.value))} />
        </label>
        <div className="readout">
          <span className="thrust">Tõukejõud {Math.round(thrust * 100)}%</span>
          <span className="power">Võimsus {Math.round(power * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
