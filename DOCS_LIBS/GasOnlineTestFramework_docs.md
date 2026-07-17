# GasOnlineTestFramework_docs.md - Approfondimento Tecnico

**Livello:** L0 (Infrastructure)
**Scopo:** Fornire un framework di testing nativo per Google Apps Script che validi il comportamento reale nel cloud.

## 🎯 Scopi Dettagliati

Colmare il gap tra test unitari offline (Jest) e realtà GAS:

- **Validazione Real-API**: Testa se le chiamate a `DriveApp` o `SpreadsheetApp` funzionano davvero (permessi, quote, limiti).
- **Fluent Assertions**: Fornisce un set completo di asserzioni (`Assert.equals`, `Assert.throws`, `Assert.deepEquals`) con messaggi di errore chiari.
- **Resource Cleanup**: Gestisce la creazione e la cancellazione automatica di file e fogli creati durante i test per non inquinare il Drive dell'utente.

## 🏗️ Pattern Architetturali

- **Fluent Interface**: Permette di concatenare le definizioni dei test e degli hook (`.setup().test().teardown()`).
- **Command Pattern**: I test sono registrati come comandi in una coda e vengono eseguiti sequenzialmente dal motore.
- **Static Assertion Pattern**: La classe `Assert` fornisce metodi statici pronti all'uso, mantenendo il codice dei test pulito e leggibile.

## 🛠️ Casi d'Uso comuni

- Test di integrazione per verificare che una Pipeline crei correttamente le cartelle su Drive.
- Smoke test post-deployment per assicurarsi che i permessi del servizio siano configurati bene.
- Validazione di logiche che dipendono strettamente dal runtime GAS (es. trigger, quote).

---

_Parte dello stack GasLibraryFactory_
