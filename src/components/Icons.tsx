import type { ReactNode } from 'react';

// Väikesed joonikoonid. Kõik kasutavad currentColor värvi.

function Icon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconChevron = () => (
  <Icon size={14}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);
export const IconCheck = () => (
  <Icon size={14}>
    <path d="M5 12l5 5 9-10" />
  </Icon>
);
export const IconClock = () => (
  <Icon size={14}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);
export const IconLevel = () => (
  <Icon size={14}>
    <path d="M5 19v-4M10 19v-8M15 19v-12M20 19V3" />
  </Icon>
);
export const IconSteps = () => (
  <Icon size={14}>
    <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
  </Icon>
);
export const IconReplay = () => (
  <Icon size={15}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </Icon>
);
export const IconPause = () => (
  <Icon size={15}>
    <path d="M8 5v14M16 5v14" />
  </Icon>
);
export const IconPlay = () => (
  <Icon size={15}>
    <path d="M7 5l12 7-12 7z" />
  </Icon>
);
export const IconSun = () => (
  <Icon size={16}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);
export const IconMoon = () => (
  <Icon size={16}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Icon>
);
export const IconMenu = () => (
  <Icon size={18}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
);
export const IconArrowLeft = () => (
  <Icon size={15}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);
export const IconArrowRight = () => (
  <Icon size={15}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const IconSpark = () => (
  <Icon size={18}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
  </Icon>
);
export const IconDoc = () => (
  <Icon size={14}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </Icon>
);
export const IconQuiz = () => (
  <Icon size={14}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01" />
  </Icon>
);

export function IconFolder({ color }: { color: string }) {
  return (
    <svg width={18} height={16} viewBox="0 0 24 20" aria-hidden="true">
      <path d="M2 4a2 2 0 0 1 2-2h5l2 2.5h9a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill={color} />
      <path d="M2 7h20" stroke="rgba(0,0,0,.18)" />
    </svg>
  );
}
