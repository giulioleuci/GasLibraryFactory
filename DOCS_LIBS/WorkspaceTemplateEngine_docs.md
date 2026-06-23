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

---
*Parte dello stack GasLibraryFactory*
