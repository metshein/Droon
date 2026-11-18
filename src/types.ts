// Kursuse sisu tüübid. Sisu ise asub kaustas src/content.

/** Mootorite väärtused Betaflighti järjekorras: [M1, M2, M3, M4], vahemik 0–1. */
export type MotorQuad = [number, number, number, number];

/** Skeem (animatsioon), mida samm näitab. `type` valib komponendi kaustast src/scenes. */
export type SceneSpec =
  | {
      type: 'quadTop';
      /** Mootorite kiirused 0–1. */
      motors: MotorQuad;
      /** Näita mootorite numbreid ja kiirusribasid. */
      showNumbers?: boolean;
      /** Näita propellerite pöörlemissuunda (CW/CCW). */
      showDirections?: boolean;
      /** Näita reaktsioonimomente ja kerele mõjuvat netomomenti. */
      showTorque?: boolean;
      /** Esiletõstetud mootorite indeksid (0 = M1). */
      highlight?: number[];
      /** Kere pöörlemiskiirus ülalt vaadates, kraadi sekundis (+ = päripäeva). */
      bodyYaw?: number;
      /** Väikesed juhuslikud mootorikiiruse muutused (lennukontrolleri parandused). */
      jitter?: boolean;
    }
  | {
      type: 'quadSide';
      /** Vaate telg: 'pitch' = külgvaade (nina paremal), 'roll' = vaade tagant. */
      axis: 'pitch' | 'roll';
      /** Kalle kraadides, + = parem pool alla (nina alla / kallutus paremale). */
      tilt: number;
      /** Vasaku ja parema mootoripaari tõukejõud 0–1. */
      thrust: [number, number];
      /** Liikumine, mida taust näitab. */
      motion?: 'hover' | 'up' | 'down' | 'right';
      /** Näita raskusjõudu. */
      showWeight?: boolean;
      /** Jaga kogutõukejõud vertikaal- ja horisontaalkomponendiks. */
      showComponents?: boolean;
    }
  | {
      type: 'thrustCurve';
      /** Alguse pöörete väärtus 0–1. */
      rpm?: number;
    }
  | { type: 'mixer' };

/** Sammu silt paremal paneelil. */
export type StepTag = 'MÕISTE' | 'FÜÜSIKA' | 'TEHNIKA' | 'PROOVI' | 'KOKKUVÕTE';

export interface Step {
  /** Lühike nimi alumise sammuriba jaoks, 1–2 sõna. */
  short: string;
  title: string;
  tag?: StepTag;
  /** Lihtne markdown: tühi rida = uus lõik, "- " = loend, **paks**, *kaldkiri*, `kood`. */
  text: string;
  /** Põhimõte, mida tasub meeles pidada (lilla kast). */
  keyIdea?: string;
  /** "Mis muutus" loend: + lisandus, ~ muutus, − kadus. */
  changes?: { kind: '+' | '~' | '-'; text: string }[];
  /** Näidikud skeemi kohal, nt { label: 'Kalle', value: '20°' }. */
  metrics?: { label: string; value: string }[];
  scene: SceneSpec;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Õige vastuse indeks massiivis `options` (alates 0-st). */
  correct: number;
  explanation: string;
}

export interface CourseModule {
  /** URL-is kasutatav lühinimi, nt "kuidas-lendab". */
  id: string;
  number: number;
  title: string;
  summary: string;
  /** Hinnanguline kestus minutites. */
  minutes?: number;
  level?: 'Algaja' | 'Kesktase' | 'Edasijõudnu';
  /** "Õpid" loend. `step` = sammu number (alates 1-st), mille läbimisel punkt linnukese saab. */
  learn?: { text: string; step: number }[];
  steps: Step[];
  quiz: QuizQuestion[];
}
