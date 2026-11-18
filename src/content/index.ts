import type { CourseModule } from '../types';
import kuidasLendab from './moodulid/01-kuidas-lendab';

// Kursuse moodulid järjekorras. Uue mooduli lisamiseks loo fail kausta ./moodulid
// ja lisa see siia nimekirja.

/** Moodulid, mille sisu pole veel valmis. Näidatakse avalehel kui "tulekul". */
const tulekul = (number: number, id: string, title: string, summary: string): CourseModule => ({
  id,
  number,
  title,
  summary,
  steps: [],
  quiz: [],
});

export const course = {
  title: 'Droonikursus',
  subtitle: 'Neljarootoriline droon: kuidas see lendab, millest koosneb ja kuidas see ise ehitada',
  author: 'Mario Metshein',
};

export const modules: CourseModule[] = [
  tulekul(0, 'sissejuhatus', 'Sissejuhatus', 'Mis on droon, droonitüübid ja miks keskendume quadile.'),
  kuidasLendab,
  tulekul(2, 'lendamine', 'Lendamise õpetus', 'Mode 2 pult, juhtkangid ja lennurežiimid.'),
  tulekul(3, 'komponendid', 'Komponendid', 'Raam, mootorid, ESC, lennukontroller, aku, raadio, FPV ja GPS.'),
  tulekul(4, 'susteemid', 'Süsteemid koos', 'Toide, juhtsignaal, stabiliseerimine, video ja failsafe.'),
  tulekul(5, 'ehitamine', 'Ehitamine', 'Komponentide valik, jootmine, kokkupanek ja Betaflighti seadistus.'),
  tulekul(6, 'ohutus', 'Ohutus ja reeglid', 'EL-i droonikategooriad ja Eesti nõuded.'),
];

export function findModule(id: string | undefined): CourseModule | undefined {
  return modules.find((m) => m.id === id);
}
