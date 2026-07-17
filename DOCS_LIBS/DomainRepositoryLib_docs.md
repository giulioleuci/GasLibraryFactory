# DomainRepositoryLib_docs.md - Approfondimento Tecnico

**Livello:** L3 (Orchestration)
**Scopo:** Implementare pattern di Domain-Driven Design (DDD) sopra Sheets, elevando le righe a vere Entità di business.

## 🎯 Scopi Dettagliati

Separare nettamente il "come" salviamo i dati dal "cosa" rappresentano:

- **Rich Entities**: Invece di semplici oggetti POJO, le entità contengono logica di business (es. `user.deactivate()`).
- **Specification Pattern**: Permette di incapsulare regole di query (es. `new ActiveUsersSpec()`) che possono essere usate sia per filtrare i dati su Sheets sia per validare oggetti in memoria.
- **Dirty Checking**: Il repository sa quali campi sono cambiati e aggiorna solo quelli, ottimizzando le chiamate alle API di Sheets.

## 🏗️ Pattern Architetturali

- **Repository Pattern**: Astrae l'accesso alle tabelle di `SheetDBLib`, fornendo un'interfaccia basata su oggetti di dominio.
- **Aggregate Root Pattern**: Gestisce gruppi di entità correlate (es. un `Ordine` e le sue `RigheOrdine`) come un'unica unità di persistenza.
- **Identity Map**: Assicura che la stessa riga del database non venga caricata due volte come oggetti diversi nella stessa sessione, evitando conflitti di stato.
- **Data Mapper**: Mappa campi tecnici del DB (snake_case) a proprietà dell'entità (camelCase) in modo automatico.

## 🛠️ Casi d'Uso comuni

- Gestione di workflow aziendali dove lo stato di un'entità (es. una Pratica) determina quali azioni sono possibili.
- Mappatura dinamica di colonne JSON-espanse in proprietà di classe di primo livello.
- Audit logging automatico delle modifiche ai campi sensibili tramite gli hook del repository.

---

_Parte dello stack GasLibraryFactory_
