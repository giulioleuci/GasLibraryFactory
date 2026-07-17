# GasResilienceLib_docs.md - Approfondimento Tecnico

**Livello:** L1 (Infrastructure)
**Scopo:** Garantire la stabilità delle esecuzioni GAS contro errori transienti, limiti di quota e indisponibilità dei servizi Google.

## 🎯 Scopi Dettagliati

GAS è un ambiente "fragile" dove una chiamata a `SpreadsheetApp` può fallire casualmente. Questa libreria astrae la gestione dell'errore:

- **Classificazione degli Errori**: Identifica se un errore è di Quota (429), di Rete (502/503) o Fatale (403/401).
- **Exponential Backoff**: Invece di riprovare subito (peggiorando la congestione), attende tempi crescenti con un fattore di "jitter" per evitare collisioni.
- **Circuit Breaker**: Se un servizio (es. Drive API) fallisce ripetutamente, il "circuito" si apre e le chiamate successive falliscono istantaneamente per risparmiare tempo di esecuzione, riprovando solo dopo un cooldown.

## 🏗️ Pattern Architetturali

- **Strategy Pattern**: Il `RecoveryManager` sceglie la strategia di recupero (`RETRY_BACKOFF_LONG`, `FAIL_FAST`) in base alla categoria dell'errore.
- **State Machine**: Il `CircuitBreaker` è implementato come una macchina a stati (CLOSED, OPEN, HALF-OPEN).
- **Decorator Pattern**: I metodi `executeWithRetry` agiscono come decoratori che avvolgono funzioni arbitrarie aggiungendo loro "superpoteri" di resilienza.

## 🛠️ Casi d'Uso comuni

- Scrittura massiva su Sheets che potrebbe incappare in "Too many requests".
- Chiamate URLFetch verso API esterne potenzialmente instabili.
- Operazioni critiche che non devono fallire (es. invio di un report finale) fornendo un `defaultValue` in caso di fallimento totale (`executeWithBypass`).

---

_Parte dello stack GasLibraryFactory_
