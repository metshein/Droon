import { useSyncExternalStore } from 'react';

// Edenemine salvestatakse brauseri localStorage'isse.

const KEY = 'droonikursus.edenemine.v1';

export interface QuizResult {
  score: number;
  total: number;
  /** ISO kuupäev */
  date: string;
}

export interface Progress {
  /** Mooduli id -> läbitud sammude indeksid */
  visited: Record<string, number[]>;
  /** Mooduli id (või "koondtest") -> parim tulemus */
  quiz: Record<string, QuizResult>;
}

const empty: Progress = { visited: {}, quiz: {} };

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const data = JSON.parse(raw) as Partial<Progress>;
    return { visited: data.visited ?? {}, quiz: data.quiz ?? {} };
  } catch {
    return empty;
  }
}

let state = load();
const listeners = new Set<() => void>();

function save(next: Progress) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Privaatne aken või blokeeritud salvestus: edenemine kehtib ainult selle seansi ajal.
  }
  listeners.forEach((l) => l());
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export function markVisited(moduleId: string, step: number) {
  const seen = state.visited[moduleId] ?? [];
  if (seen.includes(step)) return;
  save({ ...state, visited: { ...state.visited, [moduleId]: [...seen, step] } });
}

export function saveQuizResult(key: string, score: number, total: number) {
  const prev = state.quiz[key];
  if (prev && prev.score / prev.total > score / total) return;
  save({ ...state, quiz: { ...state.quiz, [key]: { score, total, date: new Date().toISOString() } } });
}

export function resetProgress() {
  save(empty);
}
