# GasDataImporter_docs.md - Approfondimento Tecnico

**Livello:** L3 (Orchestration)
**Scopo:** Motore ETL (Extract, Transform, Load) configurabile per l'ingestion massiva di dati in Sheets.

## 🎯 Scopi Dettagliati
Automatizzare processi di importazione ripetitivi tramite "Ricette" JSON:
- **Estrazione Flessibile**: Può leggere da un singolo Sheet o da tutti i file contenuti in una cartella Drive.
- **Trasformazione Programmabile**: Supporta mappatura colonne, normalizzazione (trim, case) e calcolo di nuovi campi tramite `GasExpressionEngineLib`.
- **Loading Intelligente**: Gestisce diverse strategie di risoluzione conflitti (`UPSERT`, `INSERT_ONLY`, `OVERWRITE`) interfacciandosi con `SheetDBLib`.

## 🏗️ Pattern Architetturali
- **Strategy Pattern**: Utilizzato per le sorgenti dati (`SourceStrategy`) e per le strategie di caricamento (`LoadStrategy`).
- **Factory Pattern**: Il `SourceStrategyFactory` crea l'estrattore corretto in base alla configurazione della ricetta.
- **Facade Pattern**: `ImportEngine` orchestra le fasi di Extract, Transform e Load nascondendo i dettagli tecnici.
- **Pipeline Pattern**: Il flusso dati è strettamente sequenziale e ogni fase ha interfacce di input/output ben definite.

## 🛠️ Casi d'Uso comuni
- Sincronizzazione notturna di dati provenienti da file CSV o Excel caricati su Drive.
- Consolidamento di report provenienti da diversi uffici/file in un unico database master.
- Pulizia e arricchimento di liste contatti prima del salvataggio nel CRM su Sheets.

---
*Parte dello stack GasLibraryFactory*
