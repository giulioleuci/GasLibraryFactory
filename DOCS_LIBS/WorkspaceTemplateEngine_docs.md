# WorkspaceTemplateEngine_docs.md - Approfondimento Tecnico

**Livello:** L3 (Domain Logic)
**Scopo:** Generazione di documenti e fogli di calcolo complessi tramite templating avanzato e trasformazione dati.

## 🎯 Scopi Dettagliati

Andare oltre il semplice "Replace Text". Questa libreria gestisce strutture dinamiche:

- **Espansione Strutturale**: Se un placeholder è dentro una tabella, la libreria può duplicare le righe o le colonne in base al numero di elementi nei dati.
- **Reverse-Order Strategy**: Fondamentale per Google Docs. Poiché inserire testo sposta tutti gli indici successivi, questa libreria esegue le modifiche dall'ultima alla prima, mantenendo validi tutti i riferimenti di posizione.
- **Pipe-Filter Syntax**: Supporta trasformazioni nel template, es. `{{data | date:'yyyy-MM-dd'}}` o `{{nome | uppercase}}`.

## 🏗️ Pattern Architetturali

- **Interpreter Pattern**: Un parser personalizzato analizza la sintassi Mustache-style e le estensioni proprietarie.
- **Strategy Pattern**: I filtri (`date`, `uppercase`, `join`) sono implementati come strategie intercambiabili registrate in un `FilterRegistry`.
- **Facade Pattern**: Il `PlaceholderService` nasconde la complessità delle API di Docs e Sheets, offrendo metodi semplici come `processDocument()`.

## 🛠️ Casi d'Uso comuni

- Generazione automatica di contratti (Google Docs) con tabelle di prezzi variabili.
- Creazione di report finanziari (Google Sheets) con griglie di dati espanse dinamicamente.
- Personalizzazione di email HTML con logica condizionale (sezioni visibili solo per certi utenti).

## 📐 Placeholder `{{dynamic_columns[...]}}` (Google Sheets)

Espande orizzontalmente, a partire dalla cella del placeholder, una o più colonne
per ciascun elemento di un array del context, opzionalmente proteggendo (ACL) ogni
colonna generata. Gestito da `SheetProcessor._prepareDynamicColumnRequests`.

### Sintassi a gruppo singolo (invariata)

```
{{dynamic_columns[source=studenti,value=nome,acl=email,scope=column]}}
```

- `source` — percorso (risolto via `mustache.getValue`) di un array nel context.
- `value` — espressione per-item (risolta contro il singolo elemento) usata come
  testo di intestazione della colonna.
- `acl` (opzionale) — espressione per-item; se valorizzata, aggiunge una richiesta
  di protezione sulla colonna (o sulla singola cella, con `scope=range`).
- `scope` — `column` (default, protegge l'intera colonna) o `range` (protegge solo
  la cella di intestazione).

### Sintassi multi-gruppo (nuova)

Un singolo placeholder può dichiarare **N gruppi sequenziali** di colonne, ciascuno
con la propria `source`/`value`/`acl`/`scope`, disposti come blocchi contigui
nell'ordine dichiarato, tutti a partire dalla posizione del placeholder. Il gruppo
1 usa le chiavi senza suffisso (compatibilità totale con la sintassi esistente); i
gruppi successivi (2, 3, ...) usano chiavi con **suffisso numerico**:
`source2=`, `value2=`, `acl2=`, `scope2=`, `label2=`, `source3=`, ecc.

Dal secondo gruppo in poi è possibile specificare `labelN=` — un percorso risolto
**una sola volta contro l'intero context** (non per-item) — che inserisce una
colonna etichetta strutturale immediatamente prima delle colonne di quel gruppo.
Le colonne etichetta non ricevono mai una protezione ACL.

```
{{dynamic_columns[
  source=condivise,value=sigla,
  source2=gruppo1,value2=sigla,label2=partner1,
  source3=gruppo2,value3=sigla,label3=partner2
]}}
```

Con `condivise=[MAT,ITA]`, `gruppo1=[FIS]`, `gruppo2=[CHI,BIO]`,
`partner1='Gruppo A'`, `partner2='Gruppo B'`, produce le colonne, in ordine:
`MAT, ITA, "Gruppo A", FIS, "Gruppo B", CHI, BIO` — dove `"Gruppo A"` e
`"Gruppo B"` sono colonne etichetta (`isLabel: true`, nessuna ACL).

Se il `source` del gruppo 1 non risolve a un array, l'intero placeholder non
produce alcuna richiesta (comportamento identico alla versione pre-multi-gruppo:
nessuna pulizia della cella placeholder, solo un warning in log). I gruppi
successivi con `source` non valido vengono invece saltati singolarmente (warning
in log), senza interrompere il rendering degli altri gruppi.

### Contratto di ritorno

`_prepareDynamicColumnRequests` restituisce `{ valueRequests, protectionRequests, layout }`.
Il campo `layout` (`{ sheetName, headerRow, startColumn, columns }`, oppure `null`
se nulla è stato renderizzato) riporta la posizione colonna effettivamente
assegnata a ciascun elemento (`columns: [{ header, column, isLabel }]`), utile a un
chiamante che debba applicare in seguito una logica di autorizzazione più
complessa di quanto la semplice espressione statica `acl=` possa esprimere.

`SheetProcessor.process()` raccoglie tutti i `layout` incontrati durante la
scansione in un array `layouts`, e `PlaceholderService.processSheet()` lo espone
nel proprio valore di ritorno, che è cambiato da booleano a
`{ success: boolean, layouts: Array<...> }` (`success` resta `false`, con
`layouts` vuoto, in caso di errore — stesso comportamento "swallow and log" di
prima).

## 📐 Placeholder `{{dynamic_rows[...]}}` (Google Sheets)

Espande verticalmente, a partire dalla cella del placeholder, una riga per ciascun
elemento di un array del context — il mirror verticale di `{{dynamic_columns[...]}}`.
Gestito da `SheetProcessor._prepareDynamicRowRequests`. Solo sintassi a gruppo
singolo: nessun multi-gruppo, nessun `acl`/`scope` (nessun caso d'uso li richiede
oggi — YAGNI rispetto a `dynamic_columns`).

```
{{dynamic_rows[source=alunni,value=cognomeNome]}}
```

- `source` — percorso (risolto via `mustache.getValue`) di un array nel context.
- `value` — espressione per-item (risolta contro il singolo elemento) usata come
  testo della cella in quella riga.

Se `source` non risolve a un array, il placeholder non produce alcuna richiesta
(stesso comportamento "warn, nessuna pulizia della cella" di `dynamic_columns`).
Un array vuoto pulisce solo la cella del placeholder.

---

_Parte dello stack GasLibraryFactory_
