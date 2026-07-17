# SheetDBLib_docs.md - Approfondimento Tecnico

**Livello:** L2 (Persistence)
**Scopo:** Trasformare Google Sheets in un database relazionale performante, supportando logiche SQL-like e transazioni.

## 🎯 Scopi Dettagliati

Gestire dati su Sheets come se fossero righe di un DB tradizionale. Risolve i problemi di:

- **Integrità dei Dati**: Tramite `beginTransaction` e `commit`, assicura che se un'operazione su più tabelle fallisce, i dati rimangano consistenti.
- **Performance di Join**: Implementa algoritmi di **Hash Join** (O(n+m)) per collegare tabelle diverse senza fare cicli annidati lenti.
- **Astrazione delle Colonne**: Permette di mappare le colonne per nome (intestazione) anziché per indice numerico, rendendo lo script immune allo spostamento di colonne nel foglio.

## 🏗️ Pattern Architetturali

- **Table Data Gateway**: Ogni foglio è gestito da un `TableService` che ne incapsula l'accesso.
- **Unit of Work**: Il `DatabaseService` tiene traccia di tutti i cambiamenti "pendenti" (insert, update, delete) e li persiste in un'unica chiamata batch solo al momento del `.save()`.
- **Proxy Pattern**: Utilizzato per il Lazy Loading: i dati di una riga vengono letti effettivamente solo quando si accede a una sua proprietà.
- **Query Object Pattern**: L' `AdvancedQueryBuilder` permette di costruire query complesse tramite metodi concatenati (`.select().where().orderBy()`).

## 🛠️ Casi d'Uso comuni

- Gestione di un database di utenti e relativi ordini su fogli separati.
- Aggiornamenti massivi di prezzi filtrati per categoria.
- Creazione di indici in memoria per lookup istantanei (O(1)) su tabelle con migliaia di righe.

---

_Parte dello stack GasLibraryFactory_
