import { createContext, useContext, useRef } from 'react';
import { useAnimationFrame } from 'framer-motion';

// Skeemide ühine paus. Lõuendi "Paus" nupp ja tühikuklahv peatavad kõik animatsioonid.

export const PlaybackContext = createContext({ paused: false });

export function usePaused() {
  return useContext(PlaybackContext).paused;
}

/** Nagu useAnimationFrame, aga peatub pausi ajal. `dt` on millisekundites. */
export function useFrame(cb: (dt: number) => void) {
  const paused = useRef(false);
  paused.current = usePaused();
  useAnimationFrame((_, dt) => {
    if (!paused.current) cb(Math.min(dt, 50));
  });
}
