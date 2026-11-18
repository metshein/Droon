# Droonikursus

Interaktiivne veebikursus neljarootoriliste droonide (quad) lendamisest, komponentidest ja ehitamisest. Iga teema on samm-sammult läbitav animeeritud skeem.

Autor: Mario Metshein

## Käivitamine

Vaja on Node.js 20 või uuemat.

```bash
npm install
npm run dev      # arendusserver, http://localhost:5173
npm run build    # valmis sait kausta dist/
npm run preview  # vaata valmis saiti
```

Iga `main` harusse tehtud muudatus avaldatakse automaatselt GitHub Pagesis (`.github/workflows/deploy.yml`).

## Sisu muutmine

Kogu sisu asub kaustas `src/content`, koodi pole selleks vaja puutuda.

- `src/content/index.ts` – moodulite nimekiri ja järjekord, kursuse pealkiri
- `src/content/moodulid/*.ts` – iga mooduli sammud ja enesekontrolli küsimused

Sammu väljad:

| Väli | Tähendus |
| --- | --- |
| `short` | lühinimi alumise sammuriba jaoks |
| `title` | sammu pealkiri |
| `tag` | silt: `MÕISTE`, `FÜÜSIKA`, `TEHNIKA`, `PROOVI`, `KOKKUVÕTE` |
| `text` | tekst; tühi rida = uus lõik, `- ` = loend, `**paks**`, `*kaldkiri*`, `` `kood` `` |
| `keyIdea` | põhimõte (lilla kast) |
| `changes` | „Mis muutus“ loend, `kind`: `+`, `~` või `-` |
| `metrics` | näidikud skeemi kohal |
| `scene` | skeem: `quadTop`, `quadSide`, `thrustCurve` või `mixer` koos seadetega (vt `src/types.ts`) |

Küsimuse väljad: `question`, `options`, `correct` (õige vastuse järjekorranumber alates 0-st) ja `explanation`.

Kohad, mis vajavad eksperdi ülevaatust, on koodis märgitud `TODO(ekspert)`.
