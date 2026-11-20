# STØLE designmanual

Versjon 1, november 2026. Gjelder nettsiden, og er grunnlaget for alt annet STØLE lager om seg selv: tilbud, presentasjoner, sosiale medier, visittkort.

Denne filen er fasit. Verdiene står også i `src/css/main.css` under «STØLE designsystem». Endres en verdi, endres den begge steder.

## 1. Kjernen

STØLE rydder i visuelt rot for små og lokale bedrifter, og gjør dem lette å kjenne igjen.

Merkevaren har én spenning den skal holde: profesjonell nok til at en skeptisk bedriftseier stoler på den, og personlig nok til at hen tør å ta kontakt.

Den spenningen løses slik i alt visuelt:

* **Orden i strukturen.** Rutenett, typografi, avstander og knapper følger strenge regler. Det er dette som gjør STØLE troverdig.
* **Én personlig strek per skjerm.** Signaturen, en organisk kant, en håndtegnet skisse. Aldri flere enn det som trengs. Det er dette som gjør STØLE til en person.

Tre ord å teste alt mot: **fundament, samlingssted, kuratert rot.**

## 2. Fem prinsipper

1. **Det viktigste først, og størst.** Hver skjerm har ett budskap og én hovedhandling. Resten er mindre.
2. **Aksen.** Signaturen står på en midtakse, og det gjør sidens viktigste øyeblikk også: første skjerm, «Kjenner du deg igjen?» og tjenestene. Symmetrien gir ro, men vekten er aldri lik. Det viktigste står i midten og er størst eller mørkest, det rundt er lettere.
3. **Form med mening.** En form, farge eller kursiv brukes bare når den betyr noe. Står det ikke i denne manualen hva den betyr, skal den ikke brukes.
4. **Vis arbeidet.** Ekte prosjekter, ekte skisser og ekte ord. Aldri plassholdere, oppdiktede tall eller kunder.
5. **Det skal tåle virkeligheten.** Tomme tilstander, feil, treg nettforbindelse, stor tekst og tastatur er designet, ikke glemt.

## 3. Logo og merke

**Signaturen** (ST Ø LE) er hovedlogoen. Den er en håndskrift, og skal oppleves som en underskrift på arbeidet.

**Merket** (Ø med to vinkler og en spiss loddrett strek) brukes alene der signaturen blir for liten, og som stort bakgrunnsmotiv i kontaktfeltet.

Regler:

* Alltid flat. Ingen skygge, glød, skråkant eller 3D.
* Vin på lys grunn, krem på vin. Ingen andre fargekombinasjoner.
* Minste bredde for signaturen: 120 px på skjerm, 30 mm på trykk. Under det brukes merket.
* Fri sone rundt signaturen: høyden av Ø-en på alle sider.
* Signaturen står bare ett sted per skjerm. I toppmenyen er den liten. På første skjerm er den stor, i tåka over stølen.

## 4. Farger

Fargene har faste roller. Rollen avgjør bruken, ikke smak i øyeblikket.

| Navn | Verdi | Rolle |
|---|---|---|
| Vin | `#5a1a26` | Identiteten. Logo, overskrifter på lys grunn, mørke seksjoner. |
| Papir | `#f3ebe2` | Grunnen. Mest brukte flate. Gir luft. |
| Sand | `#e6daca` | Andre lyse flate. Skiller to lyse seksjoner fra hverandre. |
| Blekk | `#2a2421` | Brødtekst på lys grunn. |
| Rose | `#ddb8b2` | Dempet tekst på vin. |
| Fjell | `#a2c2e8` | Kundens stemme og det som varer. Se under. |
| Dyp vin | `#3a1118` | Dybde. Bunnen av mørke seksjoner og toninger. |

**Fjell betyr kunden, og står bare på vin.** På lys grunn har den for lav kontrast, og der markeres kundens stemme med kursiv alene. Den blå fargen brukes bare der kundens perspektiv eller et varig forhold er innholdet: andre halvdel av hovedspørsmålet («men gjør kundene dine det?»), sitatene i «Kjenner du deg igjen?», og seksjonen Fast designer. Brukes den til noe annet, mister den betydningen.

**Fordeling på en side:** omtrent halvparten lyst (papir og sand), resten vin og dyp vin, og fjell som et lite innslag. Mørke seksjoner settes der innholdet skal føles tyngre: problemet kunden kjenner igjen, arbeidet, personen og kontakten.

**Kontrast** (målt etter WCAG): vin på papir 11,1 til 1, blekk på papir 13,0, vin på sand 9,5, fjell på vin 7,1, fjell på dyp vin 9,0, rose på vin 7,2, vin på fjell 7,1. Fjell på papir er bare 1,6 til 1, og brukes derfor aldri. Alle par i bruk skal være minst 4,5 til 1.

## 5. Typografi

To skrifter, lagret lokalt:

* **Newsreader** (serif): det du ville sagt høyt. Overskrifter, sitater, pakkenavn, store tall.
* **Schibsted Grotesk** (grotesk): det du leser og bruker. Brødtekst, knapper, lenker, etiketter, skjema.

**Kursiv betyr en annen stemme.** Kursiv brukes bare når teksten er kundens ord eller kundens perspektiv: hovedspørsmålets andre halvdel og sitater. Ikke som pynt, ikke på knapper.

Skala (fra liten til stor skjerm):

| Nivå | Skrift | Størrelse | Linjehøyde |
|---|---|---|---|
| Hovedtittel | Newsreader 500 | 40 til 68 px | 1,04 |
| Seksjonstittel | Newsreader 500 | 32 til 52 px | 1,1 |
| Sitat og pakkenavn | Newsreader 500 | 24 til 34 px | 1,15 |
| Ingress | Schibsted 400 | 18 til 21 px | 1,5 |
| Brødtekst | Schibsted 400 | 17 px | 1,65 |
| Etikett og knapp | Schibsted 600 | 15 px | 1,4 |

Ingen løpende tekst under 15 px. Ingen versaler som etikett. Linjelengde i brødtekst: høyst 68 tegn.

## 6. Rutenett og luft

* 12 kolonner, maks 1280 px bredt, marg 20 til 88 px.
* **Aksen** brukes der siden gjør et utsagn: første skjerm, «Kjenner du deg igjen?» og tjenestene. Overskrift, etikett og knapper står på midten. Tre elementer på rad deles 1 til 1,3 til 1, så midten veier mest. Aksen gjelder også på mobil.
* **Lesespalten** brukes der siden forklarer: hvorfor, arbeid, prosess, fast designer, om og kontakt. Overskriften står til venstre, og lengre tekst står venstrejustert. Sentrert tekst er bare lov for korte ingresser og korttekster på inntil tre linjer. Lengre tekst sentreres aldri, fordi den er tung å lese.
* På mobil stables elementer i samme rekkefølge som på stor skjerm. Midten flyttes ikke først, fordi rekkefølgen (1, 2, 3 buer) er en del av betydningen.
* Avstander i trinn på 8 px: 8, 16, 24, 32, 48, 64, 96, 144. Luft mellom seksjoner: 96 til 160 px.
* Tettere avstand betyr «hører sammen». Mer luft betyr «nytt tema». Avstanden følger innholdet, den er ikke lik overalt.

## 7. Formspråket

**Streken.** Den spisse loddrette streken fra Ø-en er STØLEs eget tegn. Den står foran etiketter, markerer stegene i prosessen og viser hvor du er i menyen. Den erstatter punkt, versaler og nummererte bokser.

**Kantene.** Overgangene mellom seksjoner er tegnet, ikke rette. Hver kant har sin betydning:

* *Bølgen* er standard overgang mellom to temaer.
* *Den skjeve bølgen* brukes ett sted: der fortellingen snur fra problemet kunden kjenner igjen, til hva STØLE kan hjelpe med.
* *Skjellkanten* gjentar seg selv, og brukes derfor bare rundt Fast designer. Gjentakelsen er poenget: et samarbeid som går igjen.

**Tegningene.** Halvsirklene viser hvor dypt et oppdrag går inn i bedriften. Én bue er uttrykket, flere buer er identiteten, alle buer er hele bedriften. De brukes i samme rekkefølge overalt, og blir større jo større oppdraget er.

## 8. Komponenter

**Knapper.** To nivåer, aldri flere:

* *Hovedknapp:* fylt kapsel, 52 px høy på første skjerm, ellers 44 px. Én per skjerm.
* *Lenke:* halvfet tekst med › etter. For alt annet.

Samme handling heter det samme overalt. «Gratis prat (15 min)» er alltid hovedknappen. «Start et prosjekt» er alltid lenken.

**Lister før flater.** Innhold ligger rett på grunnen, ordnet med linjer og luft. En flate (kort med avrundede hjørner) brukes bare når innholdet er én ting du kan velge eller ta på: en pakke, et case, et skjema. Tjenestene på forsiden er tre pakker med ulik vekt: den midterste står på vin og er løftet, de to andre er lyse. Fast designer er et eget bånd under, fordi det er et samarbeid og ikke et oppdrag. På pakkesidene brukes listen.

**Klikkflater.** Minst 44 × 44 px. Hele raden er klikkbar når raden er én handling.

## 9. Bevegelse

* **Ett orkestrert øyeblikk:** signaturen skriver seg selv fra venstre mot høyre på første skjerm, én gang, på 1,4 sekunder.
* Ellers beveger bare det seg som svarer på deg: en pil som flytter seg når du holder over, en rad som skifter farge.
* Ingen innglidning av seksjoner når du ruller.
* Ber nettleseren om redusert bevegelse, står alt stille fra start.

## 10. Bilder

* Ekte foto og ekte arbeid. Ingen bildebank, ingen KI-genererte bilder, ingen generiske ikoner.
* Stølen i tåka er STØLEs bilde. Hytta og signaturen skal begge synes.
* Case vises som de faktisk ble levert: logo, flater, farger, mockup. Et selvinitiert prosjekt merkes som det.
* Ingen portrett av Simen.

## 11. Tekst

* Norsk bokmål. Du-form. Kort og konkret.
* Skriv hva kunden får, ikke hvordan designeren tenker.
* Tankestrek bare mellom tall og tider (14-15:00, 12.10 - 11.11), aldri i løpende tekst.
* Unngå: skreddersydd, helhetlig, unik, reise, og formen «ikke X, men Y» som vane.
* Aldri oppdiktede kunder, sitater, tall, priser eller utmerkelser.

## 12. Tilstander og virkelighet

Dette skal være designet, ikke overlatt til nettleseren:

* **Ett case eller ti.** Arbeidsseksjonen fungerer med ett prosjekt og vokser uten ny kode.
* **Ingen pris ennå.** Prisfeltet på pakkene vises bare når det er fylt ut.
* **Skjemaet.** Sier hva som mangler ved feltet det gjelder, lagrer underveis, og sier ærlig at det ikke er en bindende bestilling. Feiler innsendingen, vises epostadressen som reservevei.
* **Kopier adresse.** Bekrefter med tekst, også for skjermleser.
* **Uten JavaScript.** Alt innhold og alle lenker virker. Bare animasjonen og kopiknappen faller bort.
* **Stor tekst og smal skjerm.** Tåler 200 prosent tekst og 320 px bredde uten sideveis rulling.
* **Tastatur.** Synlig fokus i STØLEs farger på alt som kan trykkes.
* **Siden finnes ikke.** Egen side som sier hva som skjedde og gir tre veier videre.

## 13. Sjekkliste mot malpreg

Før noe publiseres, svar nei på alle:

* Er noe sentrert som ikke står på aksen, eller er tekst over tre linjer sentrert?
* Har tre ting på rad lik vekt, uten at én er tydelig viktigst?
* Står tre eller fire like kort på rad med samme høyde og vekt?
* Er alle seksjoner like høye, like tette og like viktige?
* Er det mer enn én hovedknapp på skjermen?
* Brukes kursiv, blått eller versaler uten at manualen sier hva det betyr?
* Glir ting inn når du ruller, uten at du har gjort noe?
* Kunne siden vært for hvilken som helst designer?

Og svar ja på disse:

* Ser man hytta og signaturen på første skjerm?
* Finnes det én personlig strek på hver skjerm?
* Er tomme tilstander, feil og stor tekst testet?
