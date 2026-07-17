# ContextEngine_docs.md - Approfondimento Tecnico

**Livello:** L3 (Orchestration)
**Scopo:** Risoluzione dinamica di contesti dati tramite ricette JSON, eliminando il "Data Fetching Spaghetti".

## 🎯 Scopi Dettagliati

Centralizzare il reperimento dei dati per applicazioni complesse:

- **Declarative Recipes**: Invece di scrivere codice per fetchare l'utente e poi i suoi ordini, definisci un file JSON che descrive queste dipendenze.
- **Dependency Resolution**: Calcola automaticamente l'ordine corretto di esecuzione (DAG - Directed Acyclic Graph) in modo che i parametri di un provider siano pronti prima della sua chiamata.
- **Interception (Middleware)**: Permette di modificare i dati "al volo" (es. sostituire un utente con il suo delegato) in modo trasparente per il resto dell'applicazione.

## 🏗️ Pattern Architetturali

- **Dependency Injection**: I `DataProvider` sono registrati in un registry e iniettati nell'assemblatore a runtime.
- **Interceptor Pattern**: I `ContextInterceptor` permettono di iniettare logica trasversale (enrichment, swapping) durante l'assemblaggio.
- **Registry Pattern**: `ProviderRegistry` e `InterceptorRegistry` disaccoppiano il motore dalle specifiche sorgenti dati.
- **Flyweight Pattern**: Le istanze dei provider vengono riutilizzate per ridurre l'overhead di allocazione memoria.

## 🛠️ Casi d'Uso comuni

- Assemblaggio di un "Context" per una lettera di convocazione: 1. Fetch Studente -> 2. Fetch Docente (con eventuale sostituto) -> 3. Fetch Orario.
- Configurazione dinamica di interfacce UI basata sul ruolo dell'utente loggato.
- Normalizzazione di dati provenienti da API diverse in un unico oggetto coerente.

---

_Parte dello stack GasLibraryFactory_
