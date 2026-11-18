import { useSyncExternalStore } from 'react';

// Hash-põhine marsruutimine: #/moodul/samm. Töötab GitHub Pagesis ilma serveri seadistuseta.

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

export function useRoute(): string[] {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
}

export function href(...parts: (string | number)[]): string {
  return '#/' + parts.map((p) => encodeURIComponent(String(p))).join('/');
}

export function navigate(...parts: (string | number)[]) {
  window.location.hash = href(...parts);
}
