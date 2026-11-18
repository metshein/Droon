import { useRef } from 'react';
import type { MotorQuad } from '../types';
import { useFrame } from './playback';
import { MOTOR_DIR } from './QuadTop';

// Ruumiline (2,5D) lennuvaade: kaamera järgneb droonile tagant ja veidi ülevalt.
// Lihtsustatud füüsika: kalle järgib kangi (angle-režiim), yaw-kang annab pöörlemiskiiruse,
// vertikaalkiirendus tuleb tõukejõu vertikaalosa ja kaalu vahest, horisontaalne kalde suunas.

interface Props {
  /** Mootorite kiirused 0–1 (propellerite pöörlemine ja sildid). */
  motors: MotorQuad;
  /** Gaas 0–1, 0,5 = hõljumine. */
  throttle: number;
  /** Soovitud pitch-kalle kraadides, + = nina alla. */
  pitch: number;
  /** Soovitud roll-kalle kraadides, + = paremale. */
  roll: number;
  /** Yaw-kang -1…1, + = paremale (päripäeva). */
  yaw: number;
}

const rad = (d: number) => (d * Math.PI) / 180;
const CAM_PITCH = rad(13);
const CAM_BACK = 5;
const CAM_UP = 2;
const ARM = 0.64;
const PROP_R = 0.46;
const GRID = 4;
const VIEW = 64;
const TILE = 36;
const MAX_ALT = 40;

/** Mootorite asukohad kerel [paremale, ette]: M1 taga paremal, M2 ees paremal, M3 taga vasakul, M4 ees vasakul. */
const MOTORS: [number, number][] = [
  [ARM, -ARM],
  [ARM, ARM],
  [-ARM, -ARM],
  [-ARM, ARM],
];
const BODY: [number, number][] = [
  [-0.24, -0.38],
  [0.24, -0.38],
  [0.24, 0.38],
  [-0.24, 0.38],
];
const LANDMARKS: { kind: 'cone' | 'gate' | 'tree'; x: number; y: number }[] = [
  { kind: 'gate', x: 0, y: 14 },
  { kind: 'cone', x: -7, y: 6 },
  { kind: 'cone', x: 8, y: 21 },
  { kind: 'tree', x: -12, y: 25 },
  { kind: 'tree', x: 13, y: -6 },
  { kind: 'cone', x: -4, y: -11 },
  { kind: 'gate', x: -14, y: -17 },
  { kind: 'tree', x: 10, y: 9 },
];

const COLOR_VARS = ['bg', 'panel', 'ink', 'line', 'muted', 'blue-soft', 'green-soft', 'red-soft', 'cw-soft', 'ccw-soft', 'cw-ink', 'frame', 'frame-body', 'metal'] as const;
type Colors = Record<(typeof COLOR_VARS)[number], string>;

function readColors(): Colors {
  const cs = getComputedStyle(document.documentElement);
  return Object.fromEntries(COLOR_VARS.map((v) => [v, cs.getPropertyValue(`--${v}`).trim() || '#888'])) as Colors;
}

function withAlpha(hex: string, a: number) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function angleDiff(a: number, b: number) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

type P2 = { x: number; y: number; d: number } | null;

export default function FlightSim({ motors, throttle, pitch, roll, yaw }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const colors = useRef<Colors | null>(null);
  const st = useRef({
    x: 0,
    y: 0,
    h: 2,
    vx: 0,
    vy: 0,
    vh: 0,
    psi: 0,
    theta: 0,
    phi: 0,
    camYaw: 0,
    camH: 2,
    blades: [0, 0.8, 1.6, 2.4],
    frame: 0,
  });

  useFrame((dt) => {
    const s = st.current;
    const k = dt / 1000;

    // --- Füüsika ---
    s.theta += (rad(pitch) - s.theta) * Math.min(1, k / 0.15);
    s.phi += (rad(roll) - s.phi) * Math.min(1, k / 0.15);
    const T = (throttle / 0.5) ** 2;
    const lift = T * Math.cos(s.theta) * Math.cos(s.phi);
    const grounded = s.h <= 0 && lift <= 1.0001;
    if (!grounded) s.psi += rad(yaw * 90) * k;

    s.vh += (9.81 * (lift - 1) * 0.5 - 1.5 * s.vh) * k;
    s.h += s.vh * k;
    if (s.h <= 0) {
      s.h = 0;
      s.vh = Math.max(0, s.vh);
    } else if (s.h >= MAX_ALT) {
      s.h = MAX_ALT;
      s.vh = Math.min(0, s.vh);
    }

    const fx = Math.sin(s.psi);
    const fy = Math.cos(s.psi);
    const af = grounded ? 0 : 9.81 * 0.6 * T * Math.sin(s.theta);
    const ar = grounded ? 0 : 9.81 * 0.6 * T * Math.sin(s.phi);
    const drag = grounded ? 4 : 0.5;
    s.vx += (af * fx + ar * fy - drag * s.vx) * k;
    s.vy += (af * fy - ar * fx - drag * s.vy) * k;
    s.x += s.vx * k;
    s.y += s.vy * k;

    s.camYaw += angleDiff(s.psi, s.camYaw) * Math.min(1, k / 0.35);
    // Kaamera järgneb kõrgusele väikese viivitusega, et tõus ja laskumine oleksid näha.
    s.camH += (s.h - s.camH) * Math.min(1, k / 0.3);
    s.camH = Math.max(s.h - 1, Math.min(s.h + 1, s.camH));
    motors.forEach((m, i) => {
      s.blades[i] += k * (3 + m * 28) * MOTOR_DIR[i];
    });

    // --- Joonistamine ---
    const cv = canvas.current;
    if (!cv) return;
    const W = cv.clientWidth;
    const H = cv.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    if (!colors.current || s.frame++ % 30 === 0) colors.current = readColors();
    const c = colors.current;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const F = W * 0.8;
    const sinC = Math.sin(s.camYaw);
    const cosC = Math.cos(s.camYaw);
    const camX = s.x - sinC * CAM_BACK;
    const camY = s.y - cosC * CAM_BACK;
    const camZ = s.camH + CAM_UP;
    const cosA = Math.cos(CAM_PITCH);
    const sinA = Math.sin(CAM_PITCH);
    const cy0 = H * 0.45;

    const project = (X: number, Y: number, Z: number): P2 => {
      const dx = X - camX;
      const dy = Y - camY;
      const dz = Z - camZ;
      const f0 = dx * sinC + dy * cosC;
      const r = dx * cosC - dy * sinC;
      const fc = f0 * cosA - dz * sinA;
      if (fc < 0.4) return null;
      const uc = f0 * sinA + dz * cosA;
      return { x: W / 2 + (r * F) / fc, y: cy0 - (uc * F) / fc, d: fc };
    };

    // Taevas ja maapind
    const horizon = cy0 - F * Math.tan(CAM_PITCH);
    const sky = ctx.createLinearGradient(0, 0, 0, Math.max(1, horizon));
    sky.addColorStop(0, c['blue-soft']);
    sky.addColorStop(1, c.panel);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, Math.max(0, horizon));
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, horizon, W, H - horizon);

    // Ruudustik
    ctx.strokeStyle = c.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const gx0 = Math.floor((camX - VIEW) / GRID) * GRID;
    const gy0 = Math.floor((camY - VIEW) / GRID) * GRID;
    for (let a = 0; a <= (2 * VIEW) / GRID; a++) {
      for (const axis of [0, 1]) {
        let prev: P2 = null;
        for (let b = 0; b <= (2 * VIEW) / GRID; b++) {
          const X = axis ? gx0 + a * GRID : gx0 + b * GRID;
          const Y = axis ? gy0 + b * GRID : gy0 + a * GRID;
          const p = project(X, Y, 0);
          if (p && prev) {
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(p.x, p.y);
          }
          prev = p;
        }
      }
    }
    ctx.stroke();

    // Udu horisondi juures
    const fog = ctx.createLinearGradient(0, horizon, 0, horizon + H * 0.28);
    fog.addColorStop(0, withAlpha(c.bg, 1));
    fog.addColorStop(1, withAlpha(c.bg, 0));
    ctx.fillStyle = fog;
    ctx.fillRect(0, horizon, W, H * 0.28);

    const polygon = (pts: P2[]) => {
      if (pts.some((p) => !p)) return false;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p!.x, p!.y) : ctx.moveTo(p!.x, p!.y)));
      ctx.closePath();
      return true;
    };
    const circle = (X: number, Y: number, Z: number, R: number, n = 20) =>
      Array.from({ length: n }, (_, i) => project(X + R * Math.cos((i / n) * 2 * Math.PI), Y + R * Math.sin((i / n) * 2 * Math.PI), Z));

    // Stardiplats
    if (polygon(circle(0, 0, 0, 1.6, 28))) {
      ctx.fillStyle = c['green-soft'];
      ctx.fill();
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 2;
      ctx.stroke();
      const h1 = [project(-0.5, -0.6, 0), project(-0.5, 0.6, 0), project(0.5, -0.6, 0), project(0.5, 0.6, 0), project(-0.5, 0, 0), project(0.5, 0, 0)];
      if (h1.every(Boolean)) {
        ctx.beginPath();
        ctx.moveTo(h1[0]!.x, h1[0]!.y);
        ctx.lineTo(h1[1]!.x, h1[1]!.y);
        ctx.moveTo(h1[2]!.x, h1[2]!.y);
        ctx.lineTo(h1[3]!.x, h1[3]!.y);
        ctx.moveTo(h1[4]!.x, h1[4]!.y);
        ctx.lineTo(h1[5]!.x, h1[5]!.y);
        ctx.stroke();
      }
    }

    // Vari
    if (polygon(circle(s.x, s.y, 0, 0.9, 16))) {
      ctx.fillStyle = withAlpha(c.ink, 0.28 * Math.max(0.15, 1 - s.h / 25));
      ctx.fill();
    }

    // Maamärgid (korduvad plaatidena) ja droon, sorteeritud kauguse järgi
    type Item = { d: number; draw: () => void };
    const items: Item[] = [];
    for (const lm of LANDMARKS) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const X = lm.x + TILE * (Math.round((s.x - lm.x) / TILE) + i);
          const Y = lm.y + TILE * (Math.round((s.y - lm.y) / TILE) + j);
          const base = project(X, Y, 0);
          if (!base || base.d > VIEW) continue;
          const fade = Math.min(1, (VIEW - base.d) / 20);
          items.push({
            d: base.d,
            draw: () => {
              ctx.save();
              ctx.globalAlpha = fade;
              ctx.strokeStyle = c.ink;
              ctx.lineWidth = 2;
              const sc = F / base.d;
              if (lm.kind === 'cone') {
                const top = project(X, Y, 0.9);
                if (!top) return ctx.restore();
                ctx.beginPath();
                ctx.moveTo(base.x - 0.35 * sc, base.y);
                ctx.lineTo(top.x, top.y);
                ctx.lineTo(base.x + 0.35 * sc, base.y);
                ctx.closePath();
                ctx.fillStyle = c['cw-soft'];
                ctx.fill();
                ctx.stroke();
              } else if (lm.kind === 'tree') {
                const top = project(X, Y, 2.3);
                if (!top) return ctx.restore();
                ctx.lineWidth = Math.max(2, 0.18 * sc);
                ctx.beginPath();
                ctx.moveTo(base.x, base.y);
                ctx.lineTo(top.x, top.y);
                ctx.stroke();
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(top.x, top.y, 0.9 * sc, 0, Math.PI * 2);
                ctx.fillStyle = c['green-soft'];
                ctx.fill();
                ctx.stroke();
              } else {
                const pts = [project(X - 1.6, Y, 0), project(X - 1.6, Y, 2.6), project(X + 1.6, Y, 2.6), project(X + 1.6, Y, 0)];
                if (pts.every(Boolean)) {
                  ctx.lineWidth = Math.max(3, 0.22 * sc);
                  ctx.strokeStyle = c['cw-ink'];
                  ctx.beginPath();
                  pts.forEach((p, n) => (n ? ctx.lineTo(p!.x, p!.y) : ctx.moveTo(p!.x, p!.y)));
                  ctx.stroke();
                }
              }
              ctx.restore();
            },
          });
        }
      }
    }

    // Droon: kere koordinaadid [paremale, ette, üles] -> maailm
    const cT = Math.cos(s.theta);
    const sT = Math.sin(s.theta);
    const cP = Math.cos(s.phi);
    const sP = Math.sin(s.phi);
    const fX = Math.sin(s.psi);
    const fY = Math.cos(s.psi);
    const body = (bx: number, by: number, bz: number) => {
      // pitch (nina alla +)
      const by1 = by * cT + bz * sT;
      const bz1 = bz * cT - by * sT;
      // roll (parem pool alla +)
      const bx2 = bx * cP + bz1 * sP;
      const bz2 = bz1 * cP - bx * sP;
      return project(s.x + bx2 * fY + by1 * fX, s.y - bx2 * fX + by1 * fY, s.h + 0.35 + bz2);
    };
    const center = body(0, 0, 0);
    if (center) {
      items.push({
        d: center.d,
        draw: () => {
          const sc = F / center.d;
          const motorPts = MOTORS.map(([bx, by]) => body(bx, by, 0.1));
          const drawProp = (i: number) => {
            const [bx, by] = MOTORS[i];
            const ring = Array.from({ length: 18 }, (_, n) =>
              body(bx + PROP_R * Math.cos((n / 18) * 2 * Math.PI), by + PROP_R * Math.sin((n / 18) * 2 * Math.PI), 0.14),
            );
            if (!polygon(ring)) return;
            ctx.globalAlpha = 0.35 + motors[i] * 0.6;
            ctx.fillStyle = MOTOR_DIR[i] > 0 ? c['cw-soft'] : c['ccw-soft'];
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = c.ink;
            ctx.lineWidth = 2;
            ctx.stroke();
            const a = s.blades[i];
            const b1 = body(bx + PROP_R * 0.9 * Math.cos(a), by + PROP_R * 0.9 * Math.sin(a), 0.15);
            const b2 = body(bx - PROP_R * 0.9 * Math.cos(a), by - PROP_R * 0.9 * Math.sin(a), 0.15);
            if (b1 && b2) {
              ctx.globalAlpha = 0.75;
              ctx.lineWidth = Math.max(2, 0.06 * sc);
              ctx.beginPath();
              ctx.moveTo(b1.x, b1.y);
              ctx.lineTo(b2.x, b2.y);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
            const m = motorPts[i];
            if (m) {
              ctx.beginPath();
              ctx.arc(m.x, m.y, Math.max(3, 0.08 * sc), 0, Math.PI * 2);
              ctx.fillStyle = c.metal;
              ctx.fill();
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          };
          const order = [0, 1, 2, 3].sort((a, b) => (motorPts[b]?.d ?? 0) - (motorPts[a]?.d ?? 0));
          const far = order.filter((i) => (motorPts[i]?.d ?? 0) > center.d);
          const near = order.filter((i) => (motorPts[i]?.d ?? 0) <= center.d);
          far.forEach(drawProp);

          // Raam
          for (const [w, col] of [
            [0.12, c.ink],
            [0.07, c.frame],
          ] as const) {
            ctx.strokeStyle = col;
            ctx.lineWidth = Math.max(2, w * sc);
            ctx.lineCap = 'round';
            ctx.beginPath();
            motorPts.forEach((m) => {
              if (!m) return;
              ctx.moveTo(center.x, center.y);
              ctx.lineTo(m.x, m.y);
            });
            ctx.stroke();
          }
          if (polygon(BODY.map(([bx, by]) => body(bx, by, 0.12)))) {
            ctx.fillStyle = c['frame-body'];
            ctx.fill();
            ctx.strokeStyle = c.ink;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          if (polygon([body(0, 0.32, 0.13), body(0.13, 0.08, 0.13), body(-0.13, 0.08, 0.13)])) {
            ctx.fillStyle = c.ink;
            ctx.fill();
          }
          near.forEach(drawProp);

          // Mootorite sildid: roheline = kiirendab, punane = aeglustab
          ctx.font = '700 11px "JetBrains Mono", ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          MOTORS.forEach(([bx, by], i) => {
            const p = body(bx * 1.75, by * 1.75, 0.14);
            if (!p) return;
            const txt = `M${i + 1} ${Math.round(motors[i] * 100)}%`;
            const w = ctx.measureText(txt).width + 14;
            const diff = motors[i] - throttle;
            ctx.beginPath();
            ctx.roundRect(p.x - w / 2, p.y - 10, w, 20, 10);
            ctx.fillStyle = diff > 0.02 ? c['green-soft'] : diff < -0.02 ? c['red-soft'] : c.panel;
            ctx.fill();
            ctx.strokeStyle = c.ink;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = c.ink;
            ctx.fillText(txt, p.x, p.y + 0.5);
          });
        },
      });
    }

    items.sort((a, b) => b.d - a.d).forEach((it) => it.draw());

    // Näidikud (nagu FPV OSD)
    const speed = Math.hypot(s.vx, s.vy);
    const hdg = ((((s.psi * 180) / Math.PI) % 360) + 360) % 360;
    const lines = [
      `KÕRGUS ${s.h.toFixed(1)} m`,
      `V/S    ${s.vh >= 0 ? '+' : ''}${s.vh.toFixed(1)} m/s`,
      `KIIRUS ${speed.toFixed(1)} m/s`,
      `KURSS  ${String(Math.round(hdg)).padStart(3, '0')}°`,
    ];
    ctx.font = '700 11px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const boxW = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20;
    ctx.beginPath();
    ctx.roundRect(10, 10, boxW, lines.length * 16 + 12, 8);
    ctx.fillStyle = withAlpha(c.panel, 0.88);
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = c.ink;
    lines.forEach((l, i) => ctx.fillText(l, 20, 28 + i * 16));
    if (s.h === 0) {
      ctx.fillStyle = c.muted;
      ctx.textAlign = 'right';
      ctx.fillText('maas · anna gaasi', W - 12, 24);
    }
  });

  return (
    <canvas
      ref={canvas}
      className="sim-canvas"
      role="img"
      aria-label="Ruumiline lennuvaade: droon kaamera eest, kaamera järgneb tagant"
    />
  );
}
