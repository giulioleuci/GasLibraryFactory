# GasSchemaValidatorLib_docs.md - Approfondimento Tecnico

**Livello:** L1 (Infrastructure)
**Scopo:** Portare la potenza di Zod in Google Apps Script per garantire l'integrità dei dati a runtime.

## 🎯 Scopi Dettagliati

In GAS i dati provengono spesso da fonti non tipizzate (Sheets, JSON esterni). Questa libreria:

- **Enforcement del Tipo**: Impedisce che una stringa "123" venga trattata come numero se non esplicitamente convertita.
- **Errori Dettagliati**: Restituisce esattamente quale campo ha fallito e perché (es. "email non valida", "array troppo corto").
- **Caching delle Funzioni di Validazione**: Poiché il parsing dello schema è costoso, i parser generati da Zod vengono memorizzati in una `WeakMap` per massimizzare le performance.

## 🏗️ Pattern Architetturali

- **Adapter Pattern**: Adatta le eccezioni verbose di Zod nel formato standard `BaseError` dell'ecosistema.
- **Proxy Pattern**: La classe `SchemaValidator` agisce come proxy verso le funzioni di `safeParse` di Zod, aggiungendo logica di logging e telemetria.

## 🛠️ Casi d'Uso comuni

- Validazione di un oggetto di configurazione caricato da un file JSON.
- Controllo dei dati inseriti in un modulo prima di salvarli nel database Sheets.
- Sanitizzazione dei parametri passati a una Pipeline per evitare "Undefined error" a metà esecuzione.

---

_Parte dello stack GasLibraryFactory_
