# CoreUtilsLib_docs.md - Approfondimento Tecnico

**Livello:** L0 (Foundation)
**Scopo:** Fornire un set di utility stateless, sicure e performanti che fungano da fondamenta per l'intero ecosistema.

## 🎯 Scopi Dettagliati

La libreria nasce per risolvere l'inconsistenza di alcune API native in GAS e per centralizzare logiche ripetitive come:

- **Sanitizzazione PII (Personally Identifiable Information)**: Fondamentale per la conformità GDPR/Privacy, permette di loggare dati senza esporre email o token.
- **Sicurezza Regex**: Previene attacchi ReDoS (Regular Expression Denial of Service) tramite validazione preventiva dei pattern.
- **Hashing Deterministico**: Necessario per strategie di caching dove l'ordine delle chiavi negli oggetti non deve influenzare l'hash generato.

## 🏗️ Pattern Architetturali

- **Facade Pattern**: `UtilsService` raggruppa decine di funzioni (date, ID, stringhe) in un unico punto di accesso, nascondendo la complessità delle implementazioni native (es. `Utilities.sleep` vs `setTimeout`).
- **Flyweight Pattern**: Le istanze di configurazione pesanti sono condivise tra i vari servizi per minimizzare l'impatto sulla memoria (RAM limitata in GAS).
- **Dependency Injection**: Fondamentale per il testing. Il servizio di `sleep` viene iniettato per permettere ai test unitari di eseguire istantaneamente senza attendere i tempi reali.

## 🛠️ Casi d'Uso comuni

- Generazione di UUID v4 sicuri per chiavi primarie in Sheets.
- Entropia sicura grezza tramite `UtilsService.getRandomValues(size)` (`IdGenerator`) — equivalente Web-Crypto di `crypto.getRandomValues`, per chi necessita di byte casuali (token, salt, nonce) invece di un ID già formattato; usa la stessa catena ambiente-aware degli altri generatori (`Utilities.getUuid()` + SHA-256 in GAS, `crypto.getRandomValues` fuori da GAS, fallback insicuro con warning solo in ultima istanza). **Non** chiamare `crypto.getRandomValues` direttamente in codice destinato a GAS: non è supportato dal runtime V8 di Apps Script (vedi scan pattern in `scripts/build-and-prepare.cjs`) — passare sempre da questo metodo.
- Parsing di date da formati eterogenei (ISO, Excel Serial Numbers, Google Apps Script Date).
- Creazione di logger "child" che aggiungono prefissi (es. `[AuthService]`) automaticamente a ogni riga di log.
- Validazione del formato email tramite `UtilsService.isValidEmail(email)` — regex `user@domain.tld` di base (non verifica deliverability); pensata per essere il punto unico di validazione formato-email invece di farla riscrivere ad ogni chiamante (es. VO di dominio come `Email` nelle app che consumano la libreria).
- Gestione di periodi/intervalli di date tramite `DateRange`: `new DateRange(start, end?)` — `end` omesso o `null` produce un range aperto (sentinella "infinito", niente magic number lato chiamante); `contains(date)`, `durationInDays()` (span troncato in giorni interi) e `overlaps(other)` per confronti tra due `DateRange`.

---

_Parte dello stack GasLibraryFactory_
