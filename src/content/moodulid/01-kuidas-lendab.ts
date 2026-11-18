import type { CourseModule } from '../../types';

// Moodul 1: kuidas quad lendab.
// Mootorite järjekord on Betaflighti vaikimisi "Quad X" paigutus:
// M1 = tagumine parem, M2 = eesmine parem, M3 = tagumine vasak, M4 = eesmine vasak.
// Pöörlemissuunad ("props in"): M1 ja M4 päripäeva (CW), M2 ja M3 vastupäeva (CCW).

const moodul: CourseModule = {
  id: 'kuidas-lendab',
  number: 1,
  title: 'Kuidas quad lendab',
  summary: 'Neli propellerit ja mitte ühtegi tüüri, ometi saab drooni juhtida igas suunas. Vaatame, kuidas.',
  minutes: 12,
  level: 'Algaja',
  learn: [
    { text: 'Miks droonil pole tüüre vaja', step: 1 },
    { text: 'Kuidas propeller drooni üles tõstab', step: 2 },
    { text: 'Miks propellerid pöörlevad eri suundades', step: 5 },
    { text: 'Kuidas droon kaldub ja pöörab', step: 9 },
    { text: 'Kuidas puldi kangid mootoreid juhivad', step: 10 },
  ],
  steps: [
    {
      short: 'Neli rootorit',
      title: 'Neli propellerit, mitte ühtegi tüüri',
      tag: 'MÕISTE',
      text: `Lennukil on tiibadel liikuvad tüürid. Quadil neid pole: neli propellerit on kinni otse mootorite küljes.

Droon liigub ainult nii, et mõni mootor pöörleb **kiiremini** ja mõni **aeglasemalt**. See on kogu saladus.

Mootoritel on numbrid. Kasutame samu numbreid, mida kasutab populaarne droonitarkvara **Betaflight**: M1 taga paremal, M2 ees paremal, M3 taga vasakul, M4 ees vasakul.`,
      keyIdea: 'Kõik, mida droon teeb, tuleb nelja mootori kiiruse muutmisest.',
      changes: [
        { kind: '+', text: 'Droon ülalt vaadates, nina üleval' },
        { kind: '+', text: 'Mootorid M1–M4' },
      ],
      metrics: [
        { label: 'Mootoreid', value: '4' },
        { label: 'Tüüre', value: '0' },
      ],
      scene: { type: 'quadTop', motors: [0.5, 0.5, 0.5, 0.5], showNumbers: true },
    },
    {
      short: 'Tõukejõud',
      title: 'Propeller lükkab õhku alla',
      tag: 'FÜÜSIKA',
      text: `Propeller töötab nagu ventilaator: see lükkab õhku alla ja õhk lükkab propellerit vastu üles. Seda ülespoole suunatud jõudu nimetatakse **tõukejõuks**.

Mida kiiremini propeller pöörleb, seda suurem on tõukejõud, aga mitte võrdeliselt. **Kaks korda kiiremini** pöörlev propeller annab umbes **neli korda** rohkem tõukejõudu.

Liiguta liugurit ja vaata, kuidas roheline joon kasvab.`,
      keyIdea: 'Natuke kiirem pöörlemine annab tunduvalt rohkem jõudu, aga kulutab ka palju rohkem akut.',
      changes: [{ kind: '+', text: 'Tõukejõu graafik' }],
      metrics: [
        { label: 'Pöörded', value: '×2' },
        { label: 'Tõukejõud', value: '≈ ×4' },
      ],
      scene: { type: 'thrustCurve', rpm: 0.5 },
    },
    {
      short: 'Hõljumine',
      title: 'Hõljumine: jõud on tasakaalus',
      tag: 'FÜÜSIKA',
      text: `Raskusjõud tõmbab drooni alla. Kui nelja propelleri tõukejõud kokku on täpselt sama suur, jääb droon õhus paigale: see **hõljub**.

Näiteks 600-grammine droon vajab hõljumiseks, et iga mootor tõstaks umbes 150 grammi.

Hea droon suudab tõsta mitu korda rohkem, kui ta ise kaalub. Siis jääb jõudu üle kiireks tõusuks ja manöövriteks.`,
      // TODO(ekspert): kas lisada orienteeruvad tõukejõu/kaalu suhted (kaameradroon ~2:1, FPV 5"+ 8:1)?
      keyIdea: 'Hõljumiseks peab tõukejõud võrduma drooni kaaluga.',
      changes: [
        { kind: '+', text: 'Raskusjõud (punane nool)' },
        { kind: '~', text: 'Vaade küljelt' },
      ],
      metrics: [
        { label: 'Kaal', value: '600 g' },
        { label: 'Mootori kohta', value: '≈150 g' },
      ],
      scene: { type: 'quadSide', axis: 'pitch', tilt: 0, thrust: [0.5, 0.5], motion: 'hover', showWeight: true },
    },
    {
      short: 'Tõus',
      title: 'Tõus ja laskumine',
      tag: 'TEHNIKA',
      text: `Kui kõik neli mootorit hakkavad ühepalju kiiremini pöörlema, on tõukejõud kaalust suurem ja droon **tõuseb**. Kui kõik aeglustavad, droon **laskub**.

Puldil juhib seda **gaasikang** (inglise keeles *throttle*).

Kui droon laskub otse alla, satub ta oma propellerite tekitatud keerisesse ja hakkab vappuma. Seepärast tasub laskuda kerge edasiliikumisega.`,
      keyIdea: 'Gaas muudab kõiki nelja mootorit korraga, nii et droon liigub otse üles või alla.',
      changes: [
        { kind: '~', text: 'Kõik mootorid kiiremaks' },
        { kind: '+', text: 'Liikumine üles' },
      ],
      metrics: [
        { label: 'Gaas', value: '75%' },
        { label: 'Liikumine', value: '↑' },
      ],
      scene: { type: 'quadSide', axis: 'pitch', tilt: 0, thrust: [0.75, 0.75], motion: 'up', showWeight: true },
    },
    {
      short: 'Vastupöörlemine',
      title: 'Miks propellerid pöörlevad eri suundades',
      tag: 'FÜÜSIKA',
      text: `Kui propeller pöörleb ühele poole, püüab see drooni keha keerata teisele poole. Proovi kontoritoolil istudes käega kiiresti ringe teha: tool hakkab vastupidi keerama.

Kui kõik propellerid pöörleksid samas suunas, keerleks droon pidevalt ringi. Seepärast pöörlevad **pooled päripäeva ja pooled vastupäeva**:
- M1 ja M4 päripäeva (oranž)
- M2 ja M3 vastupäeva (sinine)

Lillad nooled näitavad, kuhu poole iga mootor kere keerata püüab. Need tühistavad üksteist.`,
      keyIdea: 'Kaks propellerit keerab ühele poole, kaks teisele. Nii jääb droon otse.',
      changes: [
        { kind: '+', text: 'Pöörlemissuunad' },
        { kind: '+', text: 'Keeramise jõud (lillad nooled)' },
        { kind: '~', text: 'Vaade ülalt' },
      ],
      metrics: [
        { label: 'Päripäeva', value: 'M1 M4' },
        { label: 'Vastupäeva', value: 'M2 M3' },
      ],
      scene: {
        type: 'quadTop',
        motors: [0.5, 0.5, 0.5, 0.5],
        showNumbers: true,
        showDirections: true,
        showTorque: true,
      },
    },
    {
      short: 'Pitch',
      title: 'Ette kallutamine (pitch)',
      tag: 'TEHNIKA',
      text: `Et droon kalduks nina ette, hakkavad **tagumised mootorid** (M1 ja M3) kiiremini pöörlema ja **eesmised** (M2 ja M4) aeglasemalt.

Tagaots tõuseb, nina vajub alla. Seda liigutust nimetatakse inglise keeles **pitch**.

Taha kallutamiseks on kõik vastupidi.`,
      keyIdea: 'Kuhu poole droon kaldub, seal pool mootorid aeglustavad.',
      changes: [
        { kind: '~', text: 'Tagumised mootorid kiiremaks' },
        { kind: '~', text: 'Eesmised mootorid aeglasemaks' },
      ],
      metrics: [
        { label: 'Taga', value: 'kiirem' },
        { label: 'Ees', value: 'aeglasem' },
      ],
      scene: {
        type: 'quadTop',
        motors: [0.72, 0.28, 0.72, 0.28],
        showNumbers: true,
        showDirections: true,
        highlight: [0, 2],
      },
    },
    {
      short: 'Kaldes lend',
      title: 'Kaldes droon liigub edasi',
      tag: 'FÜÜSIKA',
      text: `Kui droon on kaldes, pöörlevad kõik mootorid jälle ühtlaselt. Muutunud on see, **kuhu propellerid õhku lükkavad**: mitte enam otse alla, vaid alla ja taha.

Seepärast jaguneb tõukejõud kaheks:
- üks osa hoiab drooni **üleval**
- teine osa viib drooni **edasi**

Kuna üles jääb nüüd vähem jõudu, hakkab kaldes droon kõrgust kaotama, kui piloot gaasi juurde ei anna.`,
      keyIdea: 'Mida rohkem droon kaldub, seda kiiremini ta liigub, aga seda rohkem gaasi on vaja.',
      changes: [
        { kind: '~', text: 'Droon kaldes' },
        { kind: '+', text: 'Tõukejõu jagunemine' },
        { kind: '+', text: 'Liikumine edasi' },
      ],
      metrics: [
        { label: 'Kalle', value: '20°' },
        { label: 'Liikumine', value: '→' },
      ],
      scene: {
        type: 'quadSide',
        axis: 'pitch',
        tilt: 20,
        thrust: [0.6, 0.6],
        motion: 'right',
        showWeight: true,
        showComponents: true,
      },
    },
    {
      short: 'Roll',
      title: 'Külgsuunas kallutamine (roll)',
      tag: 'TEHNIKA',
      text: `Paremale kallutamine käib samamoodi nagu ette kallutamine, ainult teises suunas. **Vasakpoolsed mootorid** (M3 ja M4) kiirendavad ja **parempoolsed** (M1 ja M2) aeglustavad.

Droon kaldub paremale ja hakkab paremale liikuma. Seda nimetatakse **roll**.`,
      keyIdea: 'Ette, taha, vasakule ja paremale liigub droon alati kallutades.',
      changes: [
        { kind: '~', text: 'Vasakpoolsed mootorid kiiremaks' },
        { kind: '~', text: 'Parempoolsed mootorid aeglasemaks' },
      ],
      metrics: [
        { label: 'Vasak', value: 'kiirem' },
        { label: 'Parem', value: 'aeglasem' },
      ],
      scene: {
        type: 'quadTop',
        motors: [0.28, 0.28, 0.72, 0.72],
        showNumbers: true,
        showDirections: true,
        highlight: [2, 3],
      },
    },
    {
      short: 'Yaw',
      title: 'Paigal pööramine (yaw)',
      tag: 'TEHNIKA',
      text: `Paigal ringi pööramiseks kasutab droon sama keeramise jõudu, mida nägime sammus 5.

Paremale pööramiseks hakkavad **vastupäeva pöörlevad** mootorid (M2 ja M3) kiiremini käima ja päripäeva pöörlevad aeglasemalt. Nende keeramise jõud on nüüd suurem ja droon pöörab.

Kõrgus ei muutu, sest kaks mootorit kiirendab ja kaks aeglustab. Seda liigutust nimetatakse **yaw**.`,
      keyIdea: 'Droon pöörab vastupidi nendele propelleritele, mis kiirendasid.',
      changes: [
        { kind: '~', text: 'Vastupäeva mootorid kiiremaks' },
        { kind: '+', text: 'Droon pöörab paremale' },
      ],
      metrics: [
        { label: 'Kiirem', value: 'M2 M3' },
        { label: 'Pööre', value: '↻' },
      ],
      scene: {
        type: 'quadTop',
        motors: [0.36, 0.62, 0.62, 0.36],
        showNumbers: true,
        showDirections: true,
        showTorque: true,
        highlight: [1, 2],
        bodyYaw: 25,
      },
    },
    {
      short: 'Proovi ise',
      title: 'Proovi ise: lenda puldiga',
      tag: 'PROOVI',
      text: `Nüüd saad ise lennata. Puldil on kaks kangi (seda paigutust nimetatakse **Mode 2**):
- **vasak kang**: üles-alla on gaas, vasakule-paremale on pööramine
- **parem kang**: ette-taha ja vasakule-paremale kallutamine

Lohista kange hiire või sõrmega. Võid ka kangi valida ja kasutada nooleklahve.

Propellerite juures olevad sildid näitavad, milline mootor kiirendab (roheline) ja milline aeglustab (punane). Ülesanne: tõuse üles ja lenda läbi oranži värava.

Siin on lendamine lihtsustatud. Päris drooni juhtimist harjutame moodulis 2.`,
      keyIdea: 'Sina annad kangidega käsu, lennukontroller otsustab, kui kiiresti iga mootor pöörleb.',
      changes: [
        { kind: '+', text: 'Pult kahe kangiga' },
        { kind: '+', text: 'Ruumiline lennuvaade' },
      ],
      scene: { type: 'mixer' },
    },
    {
      short: 'Lennukontroller',
      title: 'Lennukontroller hoiab tasakaalu',
      tag: 'KOKKUVÕTE',
      text: `Quad ei püsi ise tasakaalus. Väike tuuleiil või ebaühtlane mootor võib selle kohe ümber lükata.

Seepärast on droonil väike arvuti, **lennukontroller**. See mõõdab tuhandeid kordi sekundis, kuidas droon liigub, ja muudab vajadusel mootorite kiirust.

Vaata: isegi paigal hõljudes muutuvad mootorite kiirused kogu aeg natuke. Lennukontroller parandab pidevalt.`,
      // TODO(ekspert): "tuhandeid kordi sekundis" — Betaflight 4.x PID-tsükkel tavaliselt 4–8 kHz, sõltub FC-st.
      keyIdea: 'Ilma lennukontrollerita ei saaks quadiga üldse lennata.',
      changes: [{ kind: '+', text: 'Pidevad väikesed parandused' }],
      metrics: [
        { label: 'Parandusi', value: 'tuhandeid/s' },
        { label: 'Järgmine', value: 'moodul 2' },
      ],
      scene: { type: 'quadTop', motors: [0.5, 0.5, 0.5, 0.5], showNumbers: true, jitter: true },
    },
  ],
  quiz: [
    {
      question: 'Mis peab olema täidetud, et droon õhus paigal hõljuks?',
      options: [
        'Kõik mootorid pöörlevad täiskiirusel',
        'Propellerite tõukejõud kokku on sama suur kui drooni kaal',
        'Iga mootor tõstab üksi kogu drooni',
        'Mootorid on välja lülitatud',
      ],
      correct: 1,
      explanation: 'Kui ülespoole lükkav jõud ja raskusjõud on võrdsed, ei liigu droon üles ega alla.',
    },
    {
      question: 'Propeller hakkab kaks korda kiiremini pöörlema. Mis juhtub tõukejõuga?',
      options: ['Jääb samaks', 'Kasvab kaks korda', 'Kasvab umbes neli korda', 'Väheneb'],
      correct: 2,
      explanation: 'Tõukejõud kasvab kiiremini kui pöörded: kaks korda kiirem pöörlemine annab umbes neli korda rohkem jõudu.',
    },
    {
      question: 'Miks pöörlevad pooled propellerid päripäeva ja pooled vastupäeva?',
      options: [
        'Et droon ei hakkaks ise ringi keerlema',
        'Et droon oleks vaiksem',
        'Et propellereid oleks lihtsam osta',
        'Et droon lendaks kiiremini',
      ],
      correct: 0,
      explanation: 'Iga propeller püüab drooni keha vastassuunas keerata. Kui pooled pöörlevad ühele ja pooled teisele poole, need jõud tühistavad üksteist.',
    },
    {
      question: 'Droon peab nina ette kallutama. Millised mootorid kiirendavad?',
      options: ['Eesmised (M2 ja M4)', 'Vasakpoolsed (M3 ja M4)', 'Kõik neli ühepalju', 'Tagumised (M1 ja M3)'],
      correct: 3,
      explanation: 'Tagumised mootorid tõstavad drooni tagaosa ja nina vajub alla.',
    },
    {
      question: 'Kuidas droon paigal paremale pöörab (yaw)?',
      options: [
        'Kõik mootorid aeglustavad',
        'Parempoolsed mootorid kiirendavad',
        'Vastupäeva pöörlevad mootorid kiirendavad ja päripäeva pöörlevad aeglustavad',
        'Droon peab enne maanduma',
      ],
      correct: 2,
      explanation: 'Kiiremad propellerid keeravad kere vastassuunas. Vastupäeva pöörlevad propellerid keeravad drooni päripäeva ehk paremale.',
    },
    {
      question: 'Droon kaldub ette, aga piloot gaasi juurde ei anna. Mis juhtub?',
      options: [
        'Droon liigub edasi ja hakkab kõrgust kaotama',
        'Droon jääb paigale',
        'Droon tõuseb kiiresti',
        'Droon pöörab ringi',
      ],
      correct: 0,
      explanation: 'Kaldes läheb osa tõukejõust edasiliikumiseks ja drooni üleval hoidmiseks jääb vähem jõudu.',
    },
    {
      question: 'Mida teeb puldi vasak kang (Mode 2)?',
      options: [
        'Kallutab drooni ette ja taha',
        'Lülitab kaamera sisse',
        'Kallutab drooni vasakule ja paremale',
        'Muudab gaasi (üles-alla) ja pöörab drooni (vasakule-paremale)',
      ],
      correct: 3,
      explanation: 'Mode 2 puldil on vasak kang gaas ja pööramine, parem kang kallutamine.',
    },
    {
      question: 'Miks on droonil vaja lennukontrollerit?',
      options: [
        'Et droon saaks muusikat mängida',
        'Et hoida drooni tasakaalus, parandades mootorite kiirust tuhandeid kordi sekundis',
        'Et aku kauem vastu peaks',
        'Ainult video salvestamiseks',
      ],
      correct: 1,
      explanation: 'Quad ei püsi ise tasakaalus. Lennukontroller mõõdab pidevalt drooni liikumist ja parandab mootorite kiirusi.',
    },
  ],
};

export default moodul;
