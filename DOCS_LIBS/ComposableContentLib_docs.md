# ComposableContentLib_docs.md - Approfondimento Tecnico

**Livello:** L4 (Domain Logic)
**Scopo:** Generazione di interfacce e contenuti dinamici tramite composizione di blocchi riutilizzabili.

## 🎯 Scopi Dettagliati
Creare contenuti "vivi" che si adattano al contesto senza scrivere infiniti `if/else`:
- **Composizione Dichiarativa**: Definisci il contenuto come una lista di blocchi (Header, Tabella, Footer) in una ricetta JSON.
- **Visibility Rules**: Ogni blocco può avere regole di visibilità basate su espressioni (es. "mostra il blocco promozionale solo se l'utente è premium").
- **Multi-Format Rendering**: Lo stesso set di blocchi può essere renderizzato in HTML per una email o in testo semplice per un log.

## 🏗️ Pattern Architetturali
- **Composite Pattern**: Il nucleo della libreria. I contenuti sono alberi di blocchi che possono contenere altri blocchi.
- **Registry Pattern**: `BlockRegistry` permette di estendere la libreria con nuovi tipi di blocchi personalizzati senza toccare il motore di composizione.
- **Strategy Pattern**: I `Renderer` cambiano il comportamento di output in base al formato richiesto.
- **Facade Pattern**: Il `ContentComposer` coordina valutazione, filtraggio e rendering in un unico metodo.

## 🛠️ Casi d'Uso comuni
- Generazione di email di benvenuto personalizzate con sezioni dinamiche.
- Creazione di cruscotti riassuntivi in sidebar HTML composti da widget indipendenti.
- Messaggistica automatizzata che varia il tono o il contenuto in base al destinatario.

---
*Parte dello stack GasLibraryFactory*
