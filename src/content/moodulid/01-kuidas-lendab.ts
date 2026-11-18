import type { CourseModule } from '../../types';

// Moodul 1: kuidas quad lendab.
// Mootorite järjekord on Betaflighti vaikimisi "Quad X" paigutus:
// M1 = tagumine parem, M2 = eesmine parem, M3 = tagumine vasak, M4 = eesmine vasak.
// Pöörlemissuunad ("props in"): M1 ja M4 päripäeva (CW), M2 ja M3 vastupäeva (CCW).

const moodul: CourseModule = {
  id: 'kuidas-lendab',
  number: 1,
  title: 'Kuidas quad lendab',
  summary: 'Neli fikseeritud propellerit, ükski juhtpind, ja ometi täielik kontroll kolmel teljel. Vaatame, kuidas.',
  minutes: 15,
  level: 'Algaja',
  learn: [
    { text: 'Miks quad saab hakkama ilma juhtpindadeta', step: 1 },
    { text: 'Kuidas tõukejõud sõltub pööretest', step: 2 },
    { text: 'Miks naaberpropellerid pöörlevad vastassuundades', step: 5 },
    { text: 'Kuidas tekivad pitch, roll ja yaw', step: 9 },
    { text: 'Kuidas mikser pulgakäsud mootoriteks teisendab', step: 10 },
  ],
  steps: [
    {
      short: 'Neli rootorit',
      title: 'Neli rootorit, mitte ühtegi juhtpinda',
      tag: 'MÕISTE',
      text: `Lennukil on tüürid ja helikopteril keerukas rootoripea, mis muudab labade kaldenurka. Quadil pole kumbagi: neli **fikseeritud sammuga propellerit** on otse mootorite võllil.

Kogu juhtimine käib ainult **mootorite pöörlemiskiiruse muutmisega**.

Numbrid järgivad Betaflighti vaikimisi **Quad X** paigutust: M1 tagumine parem, M2 eesmine parem, M3 tagumine vasak, M4 eesmine vasak.`,
      keyIdea: 'Neli mootorit, neli juhitavat suurust: kogutõukejõud ning pööre ümber kolme telje.',
      changes: [
        { kind: '+', text: 'Quad X raam, nina üleval' },
        { kind: '+', text: 'Mootorid M1–M4' },
      ],
      metrics: [
        { label: 'Mootoreid', value: '4' },
        { label: 'Juhtpindu', value: '0' },
        { label: 'Juhitavaid suurusi', value: '4' },
      ],
      scene: { type: 'quadTop', motors: [0.5, 0.5, 0.5, 0.5], showNumbers: true },
    },
    {
      short: 'Tõukejõud',
      title: 'Tõukejõud kasvab pöörete ruuduga',
      tag: 'FÜÜSIKA',
      text: `Propeller lükkab õhku alla ja Newtoni kolmanda seaduse järgi lükkab õhk propellerit üles. See on **tõukejõud** (thrust).

Paigal oleva propelleri puhul kehtib hea lähendusega
- tõukejõud **T ≈ k·n²**
- vajalik võimsus **P ∝ n³**

kus *n* on pöörlemissagedus ja *k* sõltub propelleri läbimõõdust, sammust, labade kujust ning õhu tihedusest. Liiguta liugurit.`,
      keyIdea: 'Pöörete kahekordistamine annab umbes 4× tõukejõudu, aga nõuab umbes 8× võimsust.',
      changes: [
        { kind: '+', text: 'Tõukejõu kõver ∝ n²' },
        { kind: '+', text: 'Võimsuse kõver ∝ n³' },
      ],
      metrics: [
        { label: 'Pöörded', value: '×2' },
        { label: 'Tõukejõud', value: '×4' },
        { label: 'Võimsus', value: '×8' },
      ],
      scene: { type: 'thrustCurve', rpm: 0.5 },
    },
    {
      short: 'Hõljumine',
      title: 'Hõljumine: tõukejõud võrdub kaaluga',
      tag: 'FÜÜSIKA',
      text: `Paigal hõljumiseks peab nelja mootori summaarne tõukejõud võrduma drooni kaaluga:

**T₁ + T₂ + T₃ + T₄ = m·g**

Näiteks 600 g droon vajab hõljumiseks kokku umbes 5,9 N ehk ligikaudu 150 grammi tõukejõudu mootori kohta.

Oluline disainiparameeter on **tõukejõu ja kaalu suhe** (TWR). Kaameradroonil piisab umbes 2:1, võistlus- ja freestyle-FPV droonid on sageli 8:1 või rohkem.`,
      // TODO(ekspert): TWR vahemikud (kaameradroon ~2:1, 5" FPV 8:1+) on orienteeruvad, kontrolli.
      keyIdea: 'Mida suurem TWR, seda väiksema gaasiga droon hõljub ja seda rohkem varu jääb manöövriteks.',
      changes: [
        { kind: '+', text: 'Raskusjõud m·g' },
        { kind: '~', text: 'Vaade: külgvaade' },
      ],
      metrics: [
        { label: 'Kaal', value: '600 g' },
        { label: 'Vajalik ΣT', value: '5,9 N' },
        { label: 'Mootori kohta', value: '≈150 g' },
      ],
      scene: { type: 'quadSide', axis: 'pitch', tilt: 0, thrust: [0.5, 0.5], motion: 'hover', showWeight: true },
    },
    {
      short: 'Tõus',
      title: 'Tõus ja laskumine',
      tag: 'TEHNIKA',
      text: `Kui kõik neli mootorit kiirendavad ühepalju, kasvab tõukejõud ja droon tõuseb. Kui kõik aeglustavad, droon laskub. Pult saadab selle käsu **gaasikangiga** (throttle).

Kuna T ∝ n², annab tõukejõu kahekordistamise juba pöörete kasv umbes **41%** (√2 ≈ 1,41).

Kiirel vertikaalsel laskumisel satub droon oma propellerite alla lükatud pöörisesse õhku. Tõukejõud muutub ebaühtlaseks ja droon hakkab vappuma (**propwash**, äärmisel juhul *vortex ring state*). Seepärast laskutakse sageli kerge edasiliikumisega.`,
      keyIdea: 'Gaas muudab kõiki nelja mootorit korraga ja ühepalju, nii et droon ei kaldu ega pööra.',
      changes: [
        { kind: '~', text: 'Kõik mootorid 50% → 75%' },
        { kind: '+', text: 'Liikumine üles' },
      ],
      metrics: [
        { label: 'Gaas', value: '75%' },
        { label: 'ΣT / m·g', value: '> 1' },
        { label: 'Liikumine', value: '↑' },
      ],
      scene: { type: 'quadSide', axis: 'pitch', tilt: 0, thrust: [0.75, 0.75], motion: 'up', showWeight: true },
    },
    {
      short: 'Vastupöörlemine',
      title: 'Miks naaberpropellerid pöörlevad vastassuundades',
      tag: 'FÜÜSIKA',
      text: `Õhutakistus pidurdab pöörlevat propellerit. Mootor peab seda ületama ja Newtoni kolmanda seaduse järgi mõjub kerele **vastassuunaline reaktsioonimoment**, ligikaudu võrdeline n²-ga.

Seepärast pöörlevad **diagonaalpaarid** samas suunas: M1 ja M4 päripäeva (CW), M2 ja M3 vastupäeva (CCW). Lillad nooled näitavad momenti, millega iga mootor kere keerata püüab.

Betaflighti vaikimisi suund on **props in** (eesmised propellerid liiguvad ees keskele). Paljud freestyle-piloodid kasutavad vastupidist **props out** suunda, mis tuleb siis ka seadistuses märkida.`,
      // TODO(ekspert): props out eelistamise põhjus (vähem prahti kaamera ette, parem käitumine yaw'l?) on jäetud lahti seletamata.
      keyIdea: 'Kaks CW ja kaks CCW propellerit tasakaalustavad teineteise momendid: võrdse kiiruse juures on netomoment null.',
      changes: [
        { kind: '+', text: 'Pöörlemissuunad CW / CCW' },
        { kind: '+', text: 'Reaktsioonimomendid' },
        { kind: '~', text: 'Vaade: ülaltvaade' },
      ],
      metrics: [
        { label: 'CW', value: 'M1 M4' },
        { label: 'CCW', value: 'M2 M3' },
        { label: 'Netomoment', value: '0' },
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
      title: 'Pitch: tagumised mootorid kiiremaks',
      tag: 'TEHNIKA',
      text: `Ette kallutamiseks (nina alla, **pitch**) kiirendavad **tagumised mootorid M1 ja M3** ning eesmised **M2 ja M4** aeglustavad.

Tagumine ots tõuseb, eesmine langeb ja droon pöörleb ümber oma põikitelje.

Tahapoole kallutamiseks on kõik vastupidi.`,
      keyIdea: 'Kummaski paaris on üks CW ja üks CCW mootor, nii et momendid jäävad tasakaalu ja droon ei hakka pöörama.',
      changes: [
        { kind: '~', text: 'M1, M3 → 72%' },
        { kind: '~', text: 'M2, M4 → 28%' },
      ],
      metrics: [
        { label: 'Taga', value: '72%' },
        { label: 'Ees', value: '28%' },
        { label: 'Yaw', value: '0' },
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
      title: 'Kaldes tõukejõud liigutab drooni',
      tag: 'FÜÜSIKA',
      text: `Kui droon on kaldes, pöörlevad kõik mootorid jälle ühtlaselt. Muutunud on **tõukejõu suund**.

Kaldenurga **θ** korral jaguneb kogutõukejõud T kaheks:
- vertikaalne osa **T·cos θ** hoiab drooni õhus
- horisontaalne osa **T·sin θ** kiirendab drooni edasi

30° kalde juures on kõrguse hoidmiseks vaja ligikaudu 15% rohkem tõukejõudu, 60° juures juba kaks korda rohkem.`,
      keyIdea: 'Kuna cos θ < 1, tuleb kaldes lennul kõrguse hoidmiseks gaasi lisada.',
      changes: [
        { kind: '~', text: 'Kalle 0° → 20°' },
        { kind: '+', text: 'Komponendid T·cos θ ja T·sin θ' },
        { kind: '+', text: 'Liikumine edasi' },
      ],
      metrics: [
        { label: 'Kalle θ', value: '20°' },
        { label: 'cos θ', value: '0,94' },
        { label: 'Lisagaas', value: '+6%' },
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
      title: 'Roll: vasakpoolsed mootorid kiiremaks',
      tag: 'TEHNIKA',
      text: `Külgsuunas kallutamine (**roll**) töötab samamoodi, ainult teise telje ümber. Paremale kallutamiseks kiirendavad **vasakpoolsed mootorid M3 ja M4** ning parempoolsed **M1 ja M2** aeglustavad.

Pärast kallutamist liigub droon kalde suunas samamoodi nagu pitchi puhul: tõukejõu horisontaalne osa kiirendab teda paremale.`,
      keyIdea: 'Roll ja pitch tekivad tõukejõudude vahest, mis mõjub õlaga (mootori kaugus keskpunktist).',
      changes: [
        { kind: '~', text: 'M3, M4 → 72%' },
        { kind: '~', text: 'M1, M2 → 28%' },
      ],
      metrics: [
        { label: 'Vasak', value: '72%' },
        { label: 'Parem', value: '28%' },
        { label: 'Yaw', value: '0' },
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
      title: 'Yaw: pööramine momentide vahega',
      tag: 'TEHNIKA',
      text: `Paremale pööramiseks (ülalt vaadates päripäeva) kiirendavad **vastupäeva pöörlevad M2 ja M3** ning päripäeva pöörlevad **M1 ja M4** aeglustavad. CCW propellerite suurem reaktsioonimoment keerab kere päripäeva.

Kiirendatakse diagonaalpaari, seega tõukejõud kasvab ühtlaselt kahes vastasnurgas ja **droon ei kaldu**. Kogutõukejõud jääb ligikaudu samaks.

Yaw on kolmest teljest **nõrgim**: see tugineb ainult propellerite takistusmomendile, mitte tõukejõule õlaga.`,
      keyIdea: 'Kere pöörleb vastupidi nendele propelleritele, mis kiirendasid.',
      changes: [
        { kind: '~', text: 'M2, M3 (CCW) → 62%' },
        { kind: '~', text: 'M1, M4 (CW) → 36%' },
        { kind: '+', text: 'Netomoment päripäeva' },
      ],
      metrics: [
        { label: 'CCW paar', value: '62%' },
        { label: 'CW paar', value: '36%' },
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
      short: 'Mikser',
      title: 'Mikser: kõik käsud korraga',
      tag: 'PROOVI',
      text: `Päris lennus tuleb gaas, roll, pitch ja yaw kõik korraga. Lennukontrolleri **mikser** liidab need iga mootori jaoks kokku:

- **M1** = G − R + P − Y
- **M2** = G − R − P + Y
- **M3** = G + R + P + Y
- **M4** = G + R − P − Y

Proovi kange (**Mode 2**): vasak kang on gaas ja yaw, parem kang pitch ja roll. Lohista hiire või sõrmega või vali kang ja kasuta nooleklahve.

Kui mõni mootor jõuab nulli või maksimumi, ei saa mikser käsku enam täpselt täita. Betaflight hoiab juhtimisele varu, vajadusel nihutades kõigi mootorite taset (**airmode**).`,
      // TODO(ekspert): Betaflighti sisemine mikseri märgikokkulepe võib erineda; siin on esitatud mõisteline versioon.
      keyIdea: 'Iga mootori kiirus = gaas ± roll ± pitch ± yaw. Märgid sõltuvad mootori asukohast ja pöörlemissuunast.',
      changes: [
        { kind: '+', text: 'Mode 2 pult' },
        { kind: '+', text: 'Mikseri valem' },
      ],
      scene: { type: 'mixer' },
    },
    {
      short: 'Lennukontroller',
      title: 'Lennukontroller hoiab tasakaalu',
      tag: 'KOKKUVÕTE',
      text: `Quad on **iseenesest ebastabiilne**: väikseimgi erinevus mootorites, tuuleiil või raskuskeskme nihe hakkab drooni pöörama ja ükski looduslik jõud ei too seda tagasi.

Seepärast mõõdab lennukontroller **güroskoobiga** pidevalt drooni pöörlemiskiirust, võrdleb seda piloodi soovitud väärtusega ja parandab mootorite kiirust. Betaflightis jookseb see tsükkel tavaliselt mitu tuhat korda sekundis.

Ka "paigal hõljudes" muutuvad mootorite kiirused kogu aeg veidi. Kuidas see täpsemalt töötab (PID-regulaator), vaatame moodulis 4.`,
      // TODO(ekspert): "mitu tuhat korda sekundis" — Betaflight 4.x PID-tsükkel tavaliselt 4–8 kHz, sõltub FC-st.
      keyIdea: 'Piloot ei juhi mootoreid otse. Piloot ütleb, mida droon tegema peab, lennukontroller otsustab, kuidas.',
      changes: [{ kind: '+', text: 'Pidevad väikesed parandused' }],
      metrics: [
        { label: 'Andur', value: 'güroskoop' },
        { label: 'Tsükkel', value: '4–8 kHz' },
        { label: 'Järgmine', value: 'PID' },
      ],
      scene: { type: 'quadTop', motors: [0.5, 0.5, 0.5, 0.5], showNumbers: true, jitter: true },
    },
  ],
  quiz: [
    {
      question: 'Mis tingimus peab kehtima, et droon hõljuks paigal?',
      options: [
        'Kõik mootorid pöörlevad maksimumkiirusel',
        'Nelja mootori tõukejõudude summa võrdub drooni kaaluga',
        'Iga mootori tõukejõud võrdub drooni kaaluga',
        'CW mootorid pöörlevad kiiremini kui CCW mootorid',
      ],
      correct: 1,
      explanation: 'Hõljumisel on jõud tasakaalus: ΣT = m·g. Iga mootor kannab seega umbes veerandi kaalust.',
    },
    {
      question: 'Kui propelleri pöörlemissagedus kahekordistub, siis tõukejõud…',
      options: ['kahekordistub', 'kasvab umbes neli korda', 'kasvab umbes kaheksa korda', 'ei muutu'],
      correct: 1,
      explanation: 'Tõukejõud on ligikaudu võrdeline pöörete ruuduga: T ≈ k·n², seega 2² = 4. Võimsus kasvab aga umbes 2³ = 8 korda.',
    },
    {
      question: 'Miks pöörlevad naaberpropellerid vastassuundades?',
      options: [
        'Et vähendada müra',
        'Et propellereid saaks paigaldada ainult ühtpidi',
        'Et propellerite reaktsioonimomendid tasakaalustuksid ja droon ei keerleks',
        'Et suurendada kogutõukejõudu',
      ],
      correct: 2,
      explanation: 'Iga propeller püüab kere vastassuunas keerata. Kaks CW ja kaks CCW propellerit tasakaalustavad üksteist ning yaw-pööre tekib alles siis, kui paaride kiirused erinevad.',
    },
    {
      question: 'Droon peab nina alla kallutama (pitch ette). Millised mootorid kiirendavad (Betaflight Quad X)?',
      options: ['M2 ja M4 (eesmised)', 'M1 ja M3 (tagumised)', 'M3 ja M4 (vasakpoolsed)', 'M1 ja M4 (CW paar)'],
      correct: 1,
      explanation: 'Tagumised mootorid tõstavad tagaosa ja nina vajub alla. Kummaski paaris on üks CW ja üks CCW mootor, nii et yaw jääb tasakaalu.',
    },
    {
      question: 'Droon peab ülalt vaadates päripäeva pöörama (yaw paremale). Mida teeb mikser?',
      options: [
        'Kiirendab päripäeva pöörlevaid mootoreid M1 ja M4',
        'Kiirendab vastupäeva pöörlevaid mootoreid M2 ja M3',
        'Kiirendab parempoolseid mootoreid M1 ja M2',
        'Aeglustab kõiki mootoreid',
      ],
      correct: 1,
      explanation: 'Kere pöörleb vastupidi propelleritele, mis kiirendasid. CCW propellerite suurem reaktsioonimoment keerab kere päripäeva.',
    },
    {
      question: 'Miks peab ettepoole kallutatud droon kõrguse hoidmiseks gaasi lisama?',
      options: [
        'Sest kaldes propellerid on vähem efektiivsed',
        'Sest kallutamiseks kulub osa akust',
        'Sest kõrgust hoiab ainult tõukejõu vertikaalne osa T·cos θ, mis on väiksem kui T',
        'Sest õhutakistus kasvab',
      ],
      correct: 2,
      explanation: 'Kaldes jaguneb tõukejõud vertikaalseks (T·cos θ) ja horisontaalseks (T·sin θ) osaks. Kaalu kompenseerimiseks peab T suurenema.',
    },
    {
      question: 'Miks on yaw tavaliselt kolmest teljest kõige nõrgema juhtimisega?',
      options: [
        'Sest yaw-andur on vähem täpne',
        'Sest yaw tugineb ainult propellerite takistusmomendile, mitte tõukejõule õlaga',
        'Sest piloodid kasutavad yaw-kangi harva',
        "Sest Betaflight piirab yaw'd tarkvaraliselt alati 50%-ni",
      ],
      correct: 1,
      explanation: 'Roll ja pitch tekivad tõukejõu erinevusest korrutatuna õlaga (mootori kaugus keskpunktist). Yaw tekib ainult reaktsioonimomendist, mis on palju väiksem.',
    },
    {
      question: 'Miks ei saa quad lennata ilma lennukontrollerita?',
      options: [
        'Sest vastuvõtja ei oska mootoreid otse juhtida',
        'Sest quad on iseenesest ebastabiilne ja vajab pidevaid parandusi tuhandeid kordi sekundis',
        'Sest ESC-d vajavad lennukontrollerilt toidet',
        'Sest seadus nõuab seda',
      ],
      correct: 1,
      explanation: 'Ükski looduslik jõud ei too quadi tasakaaluasendisse tagasi. Lennukontroller mõõdab güroskoobiga pöördeid ja parandab mootorite kiirusi pidevalt.',
    },
  ],
};

export default moodul;
