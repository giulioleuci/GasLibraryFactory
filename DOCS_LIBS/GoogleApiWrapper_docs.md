# GoogleApiWrapper_docs.md - Approfondimento Tecnico

**Livello:** L1 (Infrastructure)
**Scopo:** Ottimizzare l'I/O verso i servizi Google tramite l'uso sistematico di Advanced REST APIs e architetture Batch-First.

## 🎯 Scopi Dettagliati

L'uso standard delle classi `App` (es. `DriveApp`) è lento perché ogni operazione è una chiamata di rete singola. Questa libreria:

- **Batching Multipart**: Raggruppa centinaia di richieste in un unico payload HTTP (Drive/Sheets API).
- **Quota Tracking**: Monitora i limiti di invio email per prevenire blocchi dell'account.
- **Abstract Factory**: Centralizza la creazione di servizi (Drive, Sheets, Docs, Gmail) iniettando automaticamente Logger e Resilience.

## 🏗️ Pattern Architetturali

- **Adapter Pattern**: Converte le interfacce complesse delle REST API di Google in metodi semplici e consistenti.
- **Bridge Pattern**: Separa l'astrazione del servizio dalla sua implementazione batch, permettendo di aggiornare le API (es. Drive v2 -> v3) senza cambiare il codice che le consuma.
- **Singleton/Service Locator**: La `ServiceFactory` garantisce che per ogni esecuzione esista una sola istanza configurata di ciascun servizio, ottimizzando il caching interno.

## 🛠️ Casi d'Uso comuni

- Eliminazione di 500 file in una singola chiamata (`DriveService.deleteFiles`).
- Aggiornamento di range non contigui in uno Sheet con una sola operazione (`SpreadsheetService.updateRanges`).
- Condivisione silenziosa di file (senza email di notifica) tramite `PermissionService`.
- Inserimento di tabelle dati in un Google Doc tramite `DocumentService`:
  - `document(documentId).createTable(data, options).execute()` — builder fluente, accoda la tabella in fondo al corpo del documento (via `DocumentApp` standard API); `options` supporta `headerRow`, `alternatingRows`, `columnWidths`.
  - `insertTableAtMarker(documentId, markerText, data, options)` — inserisce la tabella subito dopo il paragrafo che contiene il testo letterale `markerText` (cercato con `body.findText`), invece che in fondo al documento; lancia un errore se il marker non viene trovato, e NON rimuove il testo del marker (va rimosso separatamente, es. con `replaceText`).
  - `scanDocumentStructure(documentId, textPatterns = ['{{'])` — scansiona la struttura del documento (via Advanced Docs API) e restituisce `{ tables, textMatches }`, utile per localizzare placeholder tipo `{{TABELLA:...}}` prima di un `insertTableAtMarker`.
  - Esempio d'uso reale (SGSA/ALDO, `DocumentTableFacade`): scan dei marker `{{TABELLA:<sheetFileId>}}` con `scanDocumentStructure`, poi `insertTableAtMarker` per posizionare la tabella e `document(fileId).replaceText(marker, '').execute()` per ripulire il marker.
- `DriveService.getFileOwnerEmail(fileId)` — risolve l'indirizzo email del proprietario Drive di un file (riusa la cache/retry di `getFiles`, che già richiede il campo `owners`). Ritorna `null` se il file non ha un proprietario risolvibile (es. file su Shared Drive).

---

_Parte dello stack GasLibraryFactory_
