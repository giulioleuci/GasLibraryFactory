# GasExpressionEngineLib_docs.md - Approfondimento Tecnico

**Livello:** L2 (Domain Logic)
**Scopo:** Valutazione sicura e performante di espressioni logico-matematiche dinamiche, senza l'uso di `eval()`.

## 🎯 Scopi Dettagliati

Permettere la configurazione di logica di business esterna al codice sorgente:

- **Abstract Syntax Tree (AST)**: Utilizza un parser (jsep) per trasformare stringhe in alberi sintattici, garantendo sicurezza contro attacchi di injection.
- **Custom Operators**: Introduce operatori specifici come `in` (appartenenza array), `between` (range) e `match` (regex).
- **AST Caching**: Poiché il parsing è costoso, gli alberi sintattici vengono memorizzati per essere riutilizzati istantaneamente con dati diversi.

## 🏗️ Pattern Architetturali

- **Interpreter Pattern**: Il nucleo della libreria. Naviga ricorsivamente l'AST per calcolare il risultato finale.
- **Parser Pattern**: Implementa un parser a discesa ricorsiva per gestire la grammatica delle espressioni.
- **Strategy Pattern**: Ogni operatore e funzione integrata (es. `len`, `abs`, `round`) è implementata come una strategia isolata.
- **Flyweight Pattern**: Condivide gli oggetti dei nodi AST tra diverse valutazioni per ottimizzare la memoria.

## 🛠️ Casi d'Uso comuni

- Filtri dinamici definiti dall'utente in un foglio di configurazione (es. "Importa se `{{prezzo}} > 100`").
- Calcolo di campi derivati in `GasDataImporter` (es. `{{quantità}} * {{prezzo_unitario}}`).
- Regole di visibilità condizionale in `ComposableContentLib`.

---

_Parte dello stack GasLibraryFactory_
