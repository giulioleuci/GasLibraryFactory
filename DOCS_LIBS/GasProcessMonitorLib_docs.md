# GasProcessMonitorLib_docs.md - Approfondimento Tecnico

**Livello:** L4 (Monitoring)
**Scopo:** Telemetria e visualizzazione in tempo reale dello stato dei processi lunghi in GAS.

## 🎯 Scopi Dettagliati
Fornire feedback visivo all'utente e monitoraggio tecnico agli sviluppatori:
- **State Tracking**: Registra l'inizio, la fine e lo stato (Successo/Errore) di ogni Job e dei relativi Step.
- **Dashboard Sidebar**: Genera un'interfaccia HTML che si aggiorna tramite polling per mostrare la percentuale di completamento.
- **Optimized Persistence**: Usa una strategia a livelli (Cache per i progressi frequenti, Properties per lo stato finale) per non consumare le quote di scrittura di Google.

## 🏗️ Pattern Architetturali
- **Observer Pattern**: Il monitor agisce come un osservatore passivo dei processi, registrando eventi senza interferire con la logica.
- **Model-View-Controller (MVC)**: Il `ProcessMonitorService` gestisce lo stato (Model), la `DashboardUi` genera l'HTML (View) e gestisce il polling (Controller).
- **Loose Coupling**: Progettata per essere iniettata opzionalmente; se il monitor non è presente, le altre librerie continuano a funzionare senza errori.

## 🛠️ Casi d'Uso comuni
- Sidebar di progresso per l'utente durante l'esecuzione di un `JobRunner` pesante.
- Report finale di successo/errore per un processo ETL eseguito via trigger.
- Tracciamento dei tempi di esecuzione dei singoli step di una Pipeline per identificare colli di bottiglia.

---
*Parte dello stack GasLibraryFactory*
