# JobRunnerLib_docs.md - Approfondimento Tecnico

**Livello:** L3 (Orchestration)
**Scopo:** Superare i limiti di tempo di esecuzione di GAS (6/30 minuti) tramite la gestione automatica di sospensione e ripresa.

## 🎯 Scopi Dettagliati
Semplifica radicalmente la scrittura di script che devono processare migliaia di elementi:
- **Recursive Trigger Pattern**: Prima che il tempo scada, lo script salva lo stato corrente e crea un trigger per ripartire tra 1 minuto.
- **Gestione dello Stato**: Salva automaticamente il "cursore" (dove eravamo rimasti) e eventuali dati parziali nelle `ScriptProperties`.
- **Locking Atomico**: Impedisce che due istanze dello stesso job girino contemporaneamente a causa di trigger sovrapposti.

## 🏗️ Pattern Architetturali
- **Iterator / Generator Pattern**: Lo sviluppatore scrive la logica usando `function*` e `yield`. Il `yield` è il punto in cui la libreria può decidere di fermarsi se il tempo sta per finire.
- **Command Pattern**: Ogni job è un comando incapsulato che può essere serializzato, salvato e rieseguito in un ambiente fresco.
- **Registry Pattern**: Permette di registrare diversi "Job Handlers" che il motore può richiamare dinamicamente in base al nome del job.

## 🛠️ Casi d'Uso comuni
- Importazione massiva di dati da un'API esterna che richiede ore per essere completata.
- Elaborazione e formattazione di centinaia di documenti Google in blocco.
- Invio programmato di email a liste di distribuzione molto ampie.

---
*Parte dello stack GasLibraryFactory*
