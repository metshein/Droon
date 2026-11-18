import { useState } from 'react';

// Hele/tume teema. Vaikimisi hele; valik salvestatakse localStorage'isse.
// Algväärtuse seab juba index.html, et leht ei vilguks.

const KEY = 'droonikursus.teema';
export type Theme = 'light' | 'dark';

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  );
  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // salvestus pole saadaval
    }
    setTheme(next);
  };
  return [theme, toggle];
}
