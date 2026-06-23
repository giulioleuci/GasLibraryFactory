# RoleResolutionLib_docs.md - Approfondimento Tecnico

**Livello:** L4 (Domain Logic)
**Scopo:** Risoluzione complessa di gerarchie e deleghe di ruolo per determinare chi deve agire in un dato momento.

## 🎯 Scopi Dettagliati
Gestire la complessità delle organizzazioni reali:
- **Transitive Delegation**: Se Alice delega a Bob e Bob delega a Charlie, la libreria risolve automaticamente il destinatario finale come Charlie.
- **Routing Policies**: Decide chi deve ricevere comunicazioni in presenza di una delega (es. solo il delegato, entrambi come primary, o il delegante in CC).
- **Scoped Assignments**: Un utente può essere "Manager" a livello di Dipartimento ma "Visualizzatore" a livello di singolo Documento.

## 🏗️ Pattern Architetturali
- **Chain of Responsibility**: Utilizzato per percorrere la catena delle deleghe rilevando eventuali cicli infiniti.
- **Value Object Pattern**: Ruoli, Attori e Scope sono oggetti immutabili con logiche di uguaglianza strutturale.
- **Registry Pattern**: Il `RoleRegistry` permette di definire fallbacks (es. se non c'è un Manager, scala al Direttore).
- **Strategy Pattern**: Le `RoutingPolicy` definiscono algoritmi diversi per il calcolo dei destinatari (Primary/CC).

## 🛠️ Casi d'Uso comuni
- Sistemi di approvazione ferie o rimborsi spese con deleghe per assenza.
- Distribuzione automatica di notifiche basata sulle gerarchie organizzative.
- Controllo accessi granulare per applicazioni complesse.

---
*Parte dello stack GasLibraryFactory*
