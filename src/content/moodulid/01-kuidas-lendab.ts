import type { CourseModule } from '../../types';

// Moodul 1: kuidas quad lendab.
// Mootorite järjekord on Betaflighti vaikimisi "Quad X" paigutus:
// M1 = tagumine parem, M2 = eesmine parem, M3 = tagumine vasak, M4 = eesmine vasak.
// Pöörlemissuunad ("props in"): M1 ja M4 päripäeva (CW), M2 ja M3 vastupäeva (CCW).

const moodul: CourseModule = {
  id: 'kuidas-lendab',
  number: 1,
  title: 'Kuidas quad lendab',
  summary:
    'Tõukejõud, mootorite pöörlemissuunad ja kuidas neli fikseeritud propellerit annavad juhtimise kõigil kolmel teljel.',
  steps: [
    {
      title: 'Neli rootorit, mitte ühtegi juhtpinda',
      text: `Lennukil on tüürid ja helikopteril keerukas rootoripea, mis muudab labade kaldenurka. Quadil pole kumbagi: neli **fikseeritud sammuga propellerit** on otse mootorite võllil.

Kogu juhtimine käib ainult **mootorite pöörlemiskiiruse muutmisega**. Neli mootorit, neli juhitavat suurust: kogutõukejõud ning pööre ümber kolme telje (roll, pitch, yaw).

Skeemil on droon ülalt vaadates, nina üleval. Numbrid järgivad Betaflighti vaikimisi **Quad X** paigutust:
- **M1** tagumine parem, **M2** eesmine parem
- **M3** tagumine vasak, **M4** eesmine vasak

Seda numeratsiooni kasutame terve kursuse jooksul.`,
      scene: { type: 'quadTop', motors: [0.5, 0.5, 0.5, 0.5], showNumbers: true },
    },
    {
      title: 'Tõukejõud kasvab pöörete ruuduga',
      text: `Propeller lükkab õhku alla ja Newtoni kolmanda seaduse järgi lükkab õhk propellerit üles. See on **tõukejõud** (thrust).

Paigal oleva propelleri puhul kehtib hea lähendusega
- tõukejõud **T ≈ k·n²**
- vajalik võimsus **P ∝ n³**

kus *n* on pöörlemissagedus ja *k* sõltub propelleri läbimõõdust, sammust, labade kujust ning õhu tihedusest.

Praktiline tagajärg: pöörete kahekordistamine annab umbes **neli korda** suurema tõukejõu, aga nõuab umbes **kaheksa korda** suuremat võimsust. Proovi liugurit.`,
      scene: { type: 'thrustCurve', rpm: 0.5 },
    },
    {
      title: 'Hõljumine: tõukejõud võrdub kaaluga',
      text: `Paigal hõljumiseks peab nelja mootori summaarne tõukejõud võrduma drooni kaaluga:

**T₁ + T₂ + T₃ + T₄ = m·g**

Näiteks 600 g droon vajab hõljumiseks kokku umbes 5,9 N ehk ligikaudu 150 grammi tõukejõudu mootori kohta.

Oluline disainiparameeter on **tõukejõu ja kaalu suhe** (thrust-to-weight, TWR): kui palju suurem on maksimaalne tõukejõud kaalust. Kaameradroonil piisab umbes 2:1, võistlus- ja freestyle-FPV droonid on sageli 8:1 või rohkem. Mida suurem suhe, seda väiksema gaasiga droon hõljub ja seda rohkem varu jääb manöövriteks.`,
      // TODO(ekspert): TWR vahemikud (kaameradroon ~2:1, 5" FPV 8:1+) on orienteeruvad, kontrolli.
      scene: { type: 'quadSide', axis: 'pitch', tilt: 0, thrust: [0.5, 0.5], motion: 'hover', showWeight: true },
    },
    {
      title: 'Tõus ja laskumine',
      text: `Kui kõik neli mootorit kiirendavad ühepalju, kasvab tõukejõud ja droon hakkab tõusma. Kui kõik aeglustavad, droon laskub. Pult saadab selle käsu **gaasikangiga** (throttle).

Kuna T ∝ n², annab tõukejõu kahekordistamise juba pöörete kasv umbes **41%** (√2 ≈ 1,41).

Kiirel vertikaalsel laskumisel satub droon oma propellerite poolt alla lükatud pöörisesse õhku. Tõukejõud muutub ebaühtlaseks ja droon hakkab vappuma (**propwash**, äärmisel juhul *vortex ring state*). Seepärast laskutakse sageli kerge edasiliikumisega.`,
      scene: { type: 'quadSide', axis: 'pitch', tilt: 0, thrust: [0.75, 0.75], motion: 'up', showWeight: true },
    },
    {
      title: 'Miks naaberpropellerid pöörlevad vastassuundades',
      text: `Õhutakistus pidurdab pöörlevat propellerit. Mootor peab seda takistusmomenti ületama ja Newtoni kolmanda seaduse järgi mõjub kerele **vastassuunaline reaktsioonimoment**. Ka see on ligikaudu võrdeline n²-ga.

Kui kõik propellerid pöörleksid samas suunas, keerleks kogu droon ümber oma telje. Seepärast pöörlevad **diagonaalpaarid** samas suunas:
- **M1 ja M4** päripäeva (CW, oranž)
- **M2 ja M3** vastupäeva (CCW, türkiis)

Lillad nooled näitavad momenti, millega iga mootor kere keerata püüab. Kui kõik mootorid pöörlevad sama kiirusega, on netomoment null.

Betaflighti vaikimisi suund on **props in** (eesmised propellerid liiguvad ees keskele). Paljud freestyle-piloodid kasutavad vastupidist **props out** suunda, mis tuleb siis ka seadistuses märkida.`,
      // TODO(ekspert): props out eelistamise põhjus (vähem prahti kaamera ette, parem käitumine yaw'l?) on jäetud lahti seletamata.
      scene: {
        type: 'quadTop',
        motors: [0.5, 0.5, 0.5, 0.5],
        showNumbers: true,
        showDirections: true,
        showTorque: true,
      },
    },
    {
      title: 'Pitch: tagumised mootorid kiiremaks',
      text: `Ette kallutamiseks (nina alla, **pitch**) kiirendavad **tagumised mootorid M1 ja M3** ning eesmised **M2 ja M4** aeglustavad.

Tagumine ots tõuseb, eesmine langeb ja droon pöörleb ümber oma põikitelje. Kuna üks CW ja üks CCW mootor kiirendab ning teised kaks aeglustavad, jäävad reaktsioonimomendid tasakaalu ja droon **ei hakka yaw-teljel keerama**.

Tahapoole kallutamiseks on kõik vastupidi.`,
      scene: {
        type: 'quadTop',
        motors: [0.72, 0.28, 0.72, 0.28],
        showNumbers: true,
        showDirections: true,
        highlight: [0, 2],
      },
    },
    {
      title: 'Kaldes tõukejõud liigutab drooni',
      text: `Kui droon on kaldes, siis mootorid enam ei erine, kõik pöörlevad jälle ühtlaselt. Muutunud on **tõukejõu suund**.

Kaldenurga **θ** korral jaguneb kogutõukejõud T kaheks:
- vertikaalne osa **T·cos θ** hoiab drooni õhus
- horisontaalne osa **T·sin θ** kiirendab drooni edasi

Kuna cos θ < 1, peab kõrguse hoidmiseks **gaasi lisama**. 30° kalde juures on vaja ligikaudu 15% rohkem tõukejõudu, 60° juures juba kaks korda rohkem. Tõukejõu varu (TWR) määrab, kui järsult saab droon kõrgust kaotamata lennata.

Skeem on külgvaates: nina on paremal.`,
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
      title: 'Roll: vasakpoolsed mootorid kiiremaks',
      text: `Külgsuunas kallutamine (**roll**) töötab samamoodi, ainult teise telje ümber. Paremale kallutamiseks kiirendavad **vasakpoolsed mootorid M3 ja M4** ning parempoolsed **M1 ja M2** aeglustavad.

Ka siin on kummaski paaris üks CW ja üks CCW mootor, nii et yaw jääb tasakaalu.

Pärast kallutamist liigub droon kalde suunas samamoodi nagu pitchi puhul: tõukejõu horisontaalne osa kiirendab teda paremale.`,
      scene: {
        type: 'quadTop',
        motors: [0.28, 0.28, 0.72, 0.72],
        showNumbers: true,
        showDirections: true,
        highlight: [2, 3],
      },
    },
    {
      title: 'Yaw: pööramine momentide vahega',
      text: `Ümber vertikaaltelje pööramiseks (**yaw**) kasutatakse reaktsioonimomentide vahet.

Paremale pööramiseks (ülalt vaadates päripäeva) kiirendavad **vastupäeva pöörlevad M2 ja M3** ning päripäeva pöörlevad **M1 ja M4** aeglustavad. CCW propellerite suurem reaktsioonimoment keerab kere päripäeva.

Kiirendatakse diagonaalpaari, seega tõukejõud kasvab ühtlaselt kahes vastasnurgas ja **droon ei kaldu**. Kogutõukejõud jääb ligikaudu samaks, nii et kõrgus ei muutu.

Yaw on kolmest teljest **nõrgim**: see tugineb ainult propellerite takistusmomendile, mitte tõukejõule õlaga nagu roll ja pitch.`,
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
      title: 'Mikser: kõik käsud korraga',
      text: `Päris lennus tuleb gaas, roll, pitch ja yaw kõik korraga. Lennukontrolleri **mikser** liidab need iga mootori jaoks kokku. Meie märgikokkuleppega (roll paremale, nina alla ja yaw paremale on positiivsed):

- **M1** = G − R + P − Y
- **M2** = G − R − P + Y
- **M3** = G + R + P + Y
- **M4** = G + R − P − Y

Proovi liugureid. Pane tähele, et kui mõni mootor jõuab nulli või maksimumi, ei saa mikser käsku enam täpselt täita. Seepärast hoiab Betaflight juhtimisele varu, vajadusel tõstes või langetades kõigi mootorite taset (**airmode**).`,
      // TODO(ekspert): Betaflighti sisemine mikseri märgikokkulepe võib erineda; siin on esitatud mõisteline versioon.
      scene: { type: 'mixer' },
    },
    {
      title: 'Lennukontroller hoiab tasakaalu',
      text: `Quad on **iseenesest ebastabiilne**: väikseimgi erinevus mootorites, tuuleiil või raskuskeskme nihe hakkab drooni pöörama ja ükski looduslik jõud ei too seda tagasi.

Seepärast mõõdab lennukontroller **güroskoobiga** pidevalt drooni pöörlemiskiirust, võrdleb seda piloodi soovitud väärtusega ja parandab mootorite kiirust. Betaflightis jookseb see tsükkel tavaliselt mitu tuhat korda sekundis.

Skeemil on näha, et ka "paigal hõljudes" muutuvad mootorite kiirused kogu aeg veidi. Kuidas see täpsemalt töötab (PID-regulaator), vaatame moodulis 4.`,
      // TODO(ekspert): "mitu tuhat korda sekundis" — Betaflight 4.x PID-tsükkel tavaliselt 4–8 kHz, sõltub FC-st.
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
        'Sest Betaflight piirab yaw\'d tarkvaraliselt alati 50%-ni',
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
