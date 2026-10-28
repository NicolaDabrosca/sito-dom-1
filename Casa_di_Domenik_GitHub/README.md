# L’ultima proiezione — Casa di Domenik

Invito interattivo per Halloween: **31 ottobre 2026, ore 21:21, Casa di Domenik**. Countdown reale nel fuso **Europe/Rome**, film horror e una sorpresa schifosa che rimane segreta.

## Pubblica su GitHub Pages, senza fornire credenziali a nessuno

Il pacchetto ZIP contiene già i file pronti: non richiede npm, build, account di altri servizi o chiavi API.

1. Estrai `Casa_di_Domenik_GitHub.zip` sul computer.
2. Crea su GitHub un repository, ad esempio `halloween-domenik`. Se usi GitHub Free, scegli un repository pubblico per usare Pages.
3. Nel repository scegli **Add file → Upload files**. Carica **tutti i contenuti estratti**, compresa la cartella `assets`, conservando i nomi. **`index.html` deve stare alla radice del repository**: non caricare soltanto lo ZIP o una cartella che contiene il sito. Conferma con **Commit changes**. Se il file vuoto `.nojekyll` non compare nel selettore, il sito funziona comunque: qui non ci sono file o cartelle speciali da escludere da Jekyll.
4. Apri **Settings → Pages**.
5. In **Build and deployment → Source** scegli **Deploy from a branch**.
6. Scegli il branch **main** e la cartella **/(root)**, poi **Save**.
7. Attendi la pubblicazione e apri l’indirizzo mostrato da GitHub nella stessa pagina. Quello è il link da inviare agli amici. Il sito non è stato pubblicato automaticamente.

Riferimenti ufficiali verificati per queste istruzioni:
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

Il sito usa percorsi relativi e funziona anche dentro un repository di progetto, senza dominio personalizzato. Se inizialmente vedi un 404, verifica che la pubblicazione sia terminata, il branch sia corretto e `index.html` sia nella cartella scelta come sorgente.

## Provalo prima di pubblicarlo

Apri `index.html` dopo aver estratto l’intera cartella. In alternativa, se hai Python, avvia dalla cartella del sito:

```bash
python -m http.server 8000
```

Poi apri http://localhost:8000 nel browser. Su alcuni dispositivi il comportamento di audio, salvataggi e download da `file://` è limitato: la versione HTTPS su Pages è quella da usare per gli invitati.

## Cambia i contenuti senza modificare il codice

1. Apri **Lo studio di Domenik** in fondo alla pagina, oppure `studio.html`.
2. Puoi scegliere un blocco locale con passphrase, oppure entrare senza blocco. Non esiste una password preimpostata.
3. Modifica titolo, data, ora, luogo, film, descrizione, nota, buste e messaggi radio.
4. Premi **Applica anteprima locale**: le modifiche vengono memorizzate nel browser. Apri o ricarica la casa per controllarle. Il banner in alto segnala che stai guardando un’anteprima locale.
5. Premi **Scarica config.js**.
6. Su GitHub apri il file `config.js` e usa l’editor per sostituire il contenuto con quello del file scaricato, oppure carica il file aggiornato nella radice del repository. Conferma il commit. Attendi la nuova pubblicazione.
7. Premi **Mostra versione pubblicata** nella casa per smettere di vedere la tua anteprima locale. Dopo l’aggiornamento ricarica la pagina. Se hai ancora i vecchi contenuti, effettua un ricaricamento completo o apri una finestra privata.

Per ripristinare un’anteprima, usa il comando apposito nello studio. Per riaprire una configurazione salvata, usa **Importa config.js o JSON**. Il pannello importa dati JSON senza eseguire JavaScript arbitrario. Non cambiare il nome del file esportato.

Puoi modificare direttamente `config.js` con un editor. Il campo `edition` distingue i progressi di un’edizione dell’evento: per riutilizzare il sito l’anno prossimo, cambia data, date delle buste e codice edizione, ad esempio `halloween-2027`.

### Cosa significa “blocco locale”

GitHub Pages pubblica i file del sito; questo progetto non include un backend. Il piccolo accesso nello studio è un blocco di cortesia sul browser, non un’autenticazione sicura. La passphrase viene derivata con PBKDF2 e salt e non viene inviata a nessuno; chi controlla il browser può comunque rimuovere il blocco. Il controllo che protegge le modifiche al sito pubblico rimane l’accesso al tuo repository GitHub. Lo studio non può cambiare i file pubblici da solo.

I testi delle buste non ancora aperte sono presenti in `config.js`: lo sblocco giornaliero è una meccanica di gioco, non un sistema per custodire informazioni riservate. Non è inserita alcuna spiegazione della sorpresa schifosa.

## Cosa possono fare gli invitati

- Countdown reale fino all’evento, con gestione automatica dell’ora legale/solare italiana; arrivato a zero, la pagina annuncia che la porta è aperta.
- Casa illustrata interattiva, con porta, finestra, luna e zucca cliccabili, utilizzabili anche tramite tastiera.
- Quattro buste, una per ogni giorno dal 28 al 31 ottobre, sbloccate a mezzanotte italiana. Le buste aperte restano rileggibili.
- Radio con frequenza determinata dalla giornata, messaggi diversi e indicatore di vicinanza al segnale.
- Prova “Sangue freddo”: tieni premuto per cinque secondi. È disponibile anche una modalità alternativa a cinque tocchi.
- Memory con otto carte e quattro coppie, mazzo rimescolato e record personale.
- Otto segreti con dossier persistente e suggerimenti, utilizzabili anche da smartphone.
- Biglietto SVG scaricabile, personalizzato con nome o soprannome, conservato soltanto sul dispositivo. Non invia una conferma di presenza all’organizzatore.
- Invito calendario `.ics` con l’ora italiana corretta.
- Condivisione tramite menu del dispositivo o copia del messaggio e del link.
- Il teaser originale di dieci secondi, avviato su richiesta.
- Audio ambientale sintetizzato, facoltativo e disattivato all’apertura; viene sospeso quando la pagina passa in secondo piano.

## Progressi e preferenze

Non ci sono classifiche condivise, iscrizioni, analytics o tracciamento di terze parti. Alias, record, segreti, buste lette e giorni di visita sono salvati in `localStorage`. Non si sincronizzano tra dispositivi. L’anteprima dei contenuti e il blocco dello studio sono anch’essi locali. In navigazione privata o se il browser blocca lo spazio locale, i progressi possono non essere conservati.

L’audio è sintetizzato nel browser; il video è un MP4 H.264/AAC. La casa è un SVG originale modificabile in un editor vettoriale. Font di sistema, nessuna dipendenza esterna, nessuna immagine gore e nessun effetto strobo. Le animazioni rispettano `prefers-reduced-motion`.

## File principali

| File | Funzione |
|---|---|
| `index.html` | Pagina per gli invitati |
| `style.css` | Grafica e layout responsive |
| `app.js` | Countdown, giochi, segreti, audio, biglietto e calendario |
| `config.js` | Contenuti dell’evento modificabili |
| `core.js` | Date, validazione, salvataggi e utilità |
| `studio.html`, `studio.css`, `studio.js` | Editor locale con blocco facoltativo |
| `assets/house.svg` | Casa illustrata con cui interagire |
| `assets/countdown.mp4` | Teaser originale |
| `assets/countdown-poster.jpg` | Copertina del teaser |
| `tests/core.test.cjs` | Verifiche delle date e della configurazione |

Verifiche automatiche (richiedono Node.js):

```bash
node --test tests/core.test.cjs
```

Le verifiche coprono l’istante dell’evento, il countdown a zero, lo sblocco a mezzanotte italiana, il cambio dell’ora, date non valide, configurazioni incomplete, frequenze giornaliere ed escaping dei testi. Sono stati verificati nel browser buste, segreti, radio, memory, persistenza, editor e anteprima locale. Il layout è stato controllato anche in una cornice da 390 pixel.

Nota sul teaser: l’editor aggiorna i contenuti della pagina, non i testi già impressi nel video. Per cambiare il teaser occorre rigenerare il video con il pacchetto modificabile consegnato in precedenza, poi sostituire `assets/countdown.mp4`.

---

## Soluzioni degli easter egg — per l’organizzatore

Questa sezione è nel repository. Non contiene la sorpresa della festa.

1. **Tre colpi:** premi la porta tre volte in sei secondi.
2. **L’ospite non in lista:** premi la finestra centrale sotto il tetto.
3. **Il logo ti guarda:** premi il logo dell’occhio tre volte in quattro secondi.
4. **Frequenza proibita:** sintonizza la radio sul segnale pulito. La frequenza cambia ogni giorno.
5. **Sangue freddo:** completa la tenuta di cinque secondi o l’alternativa a cinque tocchi.
6. **Memoria del buio:** completa le quattro coppie del memory.
7. **La parola proibita:** digita `incubo` fuori dai campi di testo, oppure usa il campo raggiungibile dal suggerimento del segreto 07 nel dossier.
8. **Meglio al buio:** spegni la candela in fondo alla pagina.

La luna e la zucca hanno anche battute nascoste che cambiano a ogni clic.
