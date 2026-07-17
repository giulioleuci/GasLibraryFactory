# 📚 Guida alla Gestione dello Stack GasLibraryFactory

Questo documento è il riferimento tecnico per lo sviluppo di nuovi progetti (Consumer Apps) all'interno dell'ecosistema **GasLibraryFactory**. È progettato per essere consumato da un LLM per comprendere le capacità esistenti ed evitare la riscrittura di codice già gestito dalle librerie core.

---

## 🏗️ Architettura a Livelli (Layered Architecture)

Il sistema segue una gerarchia rigorosa (L0 -> L4). Una libreria di un livello superiore può dipendere da una inferiore, MAI il contrario.

### **L0: Fondamenta (Stateless & Resilience)**

- **`CoreUtilsLib`**: Utility pure (Date, UUID, PII Redaction, Regex Safety). **Usa sempre questa per manipolare oggetti/stringhe.**
- **`GasResilienceLib`**: Il "motore di stabilità". Gestisce retry, exponential backoff e Circuit Breaker. **Non scrivere mai `try-catch` per errori di quota Google; usa questa.**
- **`GasOnlineTestFramework`**: Framework di test nativo per l'ambiente GAS.

### **L1: Infrastruttura (I/O & Validation)**

- **`GoogleApiWrapper`**: Wrapper **Batch-First** per Drive, Sheets, Docs, Gmail. Ottimizzato per performance estreme. **Mai usare `SpreadsheetApp` direttamente per cicli massivi; usa questo.**
- **`GasSchemaValidatorLib`**: Motore di validazione basato su **Zod**. Garantisce che i dati in ingresso/uscita siano corretti.

### **L2: Persistenza & Logica di Dominio (Data & Logic)**

- **`SheetDBLib`**: ORM-lite che trasforma Google Sheets in un database relazionale con transazioni ACID e Query SQL-like (O(n+m)).
- **`GasExpressionEngineLib`**: Valutatore di espressioni dinamiche (AST-based). Permette logica di business in stringhe (es. `{{prezzo}} * 1.22 > 100`).
- **`WorkspaceTemplateEngine`**: Motore di templating per Docs/Sheets con logica di espansione tabelle e "Reverse-Order Strategy" (evita crash di indici in Google Docs).

### **L3: Orchestrazione (Process & Workflow)**

- **`JobRunnerLib`**: Supera i limiti di 6/30 minuti di GAS tramite il **Recursive Trigger Pattern**. Gestisce sospensione e ripresa automatica via Generator Functions (`yield`).
- **`PipelineFramework`**: Motore ETL (Extract, Transform, Load) basato sul pattern **Chain of Responsibility**. Ideale per workflow sequenziali.
- **`ContextEngine`**: Dependency Injection & Assembler di dati basato su ricette JSON. Risolve il "Data Fetching Spaghetti".
- **`DomainRepositoryLib`**: Implementa il pattern Repository/Aggregate (DDD). Disaccoppia la logica di business dalla persistenza.
- **`GasDataImporter`**: Motore di importazione dati configurabile (JSON recipes) per caricare dati massivi in SheetDB.

### **L4: Context & Domain (Presentation & UI)**

- **`RoleResolutionLib`**: Gestione complessa di ruoli, deleghe (A->B->C) e routing delle comunicazioni (chi riceve l'email se il titolare è in ferie?).
- **`ComposableContentLib`**: Framework per comporre contenuti dinamici (email, messaggi) tramite blocchi riutilizzabili.
- **`GasProcessMonitorLib`**: Monitoraggio real-time con dashboard/sidebar HTML per tracciare l'avanzamento di Job e Pipeline.

---

## 🚀 Come Iniziare un Nuovo Progetto (Consumer App)

### 1. Inizializzazione del Core

Ogni progetto deve inizializzare i servizi base tramite la `ServiceFactory` di `GoogleApiWrapper` o istanziando i componenti L0.

```javascript
const logger = new LoggerService();
const utils = new UtilsService((ms) => Utilities.sleep(ms));
const exceptionService = new ExceptionService(logger, utils);
```

### 2. Definizione del Data Layer (SheetDB + Repository)

Invece di manipolare righe, definisci una **Entity** e un **Repository**.

```javascript
class UserRepository extends Repository {
  constructor(db) {
    super(db, 'Users', UserEntity);
  }
}
```

### 3. Orchestrazione con Pipeline o JobRunner

- Se il processo è **sequenziale e veloce**: usa `PipelineFramework`.
- Se il processo è **massivo e rischia il timeout**: usa `JobRunnerLib`.

### 4. Utilizzo del ContextEngine per la Logica di Business

Non passare oggetti enormi tra le funzioni. Usa una **Recipe** del `ContextEngine` per caricare solo ciò che serve, quando serve.

---

## 🛠️ Regole d'Oro per lo Sviluppatore/LLM

1.  **Non Reinventare il Batching**: Se devi aggiornare 100 righe su Sheets o spostare 50 file su Drive, usa `GoogleApiWrapper`. Fa tutto in un'unica chiamata atomica.
2.  **Gestione dei Timeout**: Per cicli `for` lunghi, usa `JobRunnerLib`. Trasforma il ciclo in un `yield` e la libreria gestirà il trigger di ripresa.
3.  **Sicurezza Regex**: Usa sempre `RegexUtils` per evitare attacchi ReDoS su input utente.
4.  **Dry-Run First**: Tutte le librerie di mutazione (`SheetDBLib`, `GoogleApiWrapper`, `PipelineFramework`) supportano la modalità `{ dryRun: true }`. Usala per testare senza scrivere dati.
5.  **Validazione Obbligatoria**: Ogni dato che entra nel sistema da Sheets o API esterne deve passare per `GasSchemaValidatorLib`.
6.  **Errori Intelligenti**: Non usare `throw new Error('msg')`. Usa le eccezioni specializzate (es. `ValidationException`, `QuotaExceededException`) per permettere al sistema di decidere se fare un retry o fermarsi.
7.  **Reverse-Order in Docs**: Se modifichi un Google Doc, parti sempre dal fondo (gestito automaticamente da `WorkspaceTemplateEngine`) per non invalidare gli indici dei cursori.

---

## 🔍 Mappa delle Soluzioni Veloci

| Problema                                          | Libreria da Usare                        |
| :------------------------------------------------ | :--------------------------------------- |
| Devo validare un JSON complesso                   | `GasSchemaValidatorLib`                  |
| Il mio script va in timeout (6 min)               | `JobRunnerLib`                           |
| Devo fare una JOIN tra due fogli Sheets           | `SheetDBLib` (AdvancedQueryBuilder)      |
| Devo inviare email con deleghe attive             | `RoleResolutionLib` + `GoogleApiWrapper` |
| Devo generare un PDF da un Doc con tabelle        | `WorkspaceTemplateEngine`                |
| Devo tracciare l'avanzamento di un processo lungo | `GasProcessMonitorLib`                   |
| Devo pulire dati sensibili (email, token) dai log | `CoreUtilsLib` (PiiRedactor)             |

---

_Documento generato per il supporto allo sviluppo del monorepo GasLibraryFactory._
