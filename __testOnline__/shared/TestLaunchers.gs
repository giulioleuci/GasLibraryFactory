/**
 * Test Launchers for Google Apps Script Editor
 *
 * Funzioni selezionabili dal menu a discesa dell'editor GAS per lanciare
 * gruppi specifici di test senza dover passare parametri manuali.
 *
 * Ordine:
 *   1. Master launchers
 *   2. Unit test per layer architetturale: L0 → L4
 *   3. Integration test per gruppo omogeneo di librerie
 *   4. Debug & utilities
 */

// ============================================================
// MASTER LAUNCHERS
// ============================================================

/** Lancia tutti i test online del progetto */
function LAUNCH_ALL_TESTS() {
  return runAllOnlineTests();
}

/** Lancia tutti i test di integrazione cross-library */
function LAUNCH_INTEGRATION_ALL() {
  return runTests('Integration');
}

// ============================================================
// UNIT TESTS — L0: Foundation
// CoreUtilsLib
// ============================================================

/** [L0] CoreUtilsLib — Formatting, Collections, Logic */
function LAUNCH_L0_CoreUtilsLib() {
  return runTests('CoreUtilsLib');
}

// ============================================================
// UNIT TESTS — L1: Resilience
// GasResilienceLib
// ============================================================

/** [L1] GasResilienceLib — Retries, Error Handling */
function LAUNCH_L1_GasResilienceLib() {
  return runTests('GasResilienceLib');
}

// ============================================================
// UNIT TESTS — L2: Google API Wrapper
// GoogleApiWrapper
// ============================================================

/** [L2] GoogleApiWrapper — Drive, Docs, Sheets, Gmail, Services */
function LAUNCH_L2_GoogleApiWrapper() {
  return runTests('GoogleApiWrapper');
}

// ============================================================
// UNIT TESTS — L3: Domain Frameworks
// Dipendenze dirette da GoogleApiWrapper, in ordine di dipendenza
// ============================================================

/** [L3] SheetDBLib — Database, Tables, Queries, ORM */
function LAUNCH_L3_SheetDBLib() {
  return runTests('SheetDBLib');
}

/** [L3] DomainRepositoryLib — Entity mapping & Repository pattern (dipende da SheetDBLib) */
function LAUNCH_L3_DomainRepositoryLib() {
  return runTests('DomainRepositoryLib');
}

/** [L3] GasDataImporter — CSV & Excel importing (dipende da SheetDBLib) */
function LAUNCH_L3_GasDataImporter() {
  return runTests('GasDataImporter');
}

/** [L3] WorkspaceTemplateEngine — Document & Spreadsheet generation */
function LAUNCH_L3_WorkspaceTemplateEngine() {
  return runTests('WorkspaceTemplateEngine');
}

/** [L3] GasExpressionEngineLib — Logic parser & evaluation (dipende da WorkspaceTemplateEngine) */
function LAUNCH_L3_GasExpressionEngineLib() {
  return runTests('GasExpressionEngineLib');
}

/** [L3] RoleResolutionLib — User & group permissions */
function LAUNCH_L3_RoleResolutionLib() {
  return runTests('RoleResolutionLib');
}

/** [L3] ComposableContentLib — Composable content blocks */
function LAUNCH_L3_ComposableContentLib() {
  return runTests('ComposableContentLib');
}

/** [L3] JobRunnerLib — Background task management */
function LAUNCH_L3_JobRunnerLib() {
  return runTests('JobRunnerLib');
}

/** [L3] PipelineFramework — Workflow & step management */
function LAUNCH_L3_PipelineFramework() {
  return runTests('PipelineFramework');
}

/** [L3] GasProcessMonitorLib — Execution tracking & health (opzionale) */
function LAUNCH_L3_GasProcessMonitorLib() {
  return runTests('GasProcessMonitorLib');
}

// ============================================================
// UNIT TESTS — L4: Context Engine
// ContextEngine (dipende da GasExpressionEngineLib)
// ============================================================

/** [L4] ContextEngine — Context-aware logic */
function LAUNCH_L4_ContextEngine() {
  return runTests('ContextEngine');
}

// ============================================================
// INTEGRATION TESTS — Gruppo 1: API Foundation
// GoogleApiWrapper × WorkspaceTemplateEngine
// (Drive/Sheet creation, Template Engine, Trigger management)
// ============================================================

/** [INT-1] Tutti i test API Foundation (GoogleApiWrapper + WorkspaceTemplateEngine) */
function LAUNCH_INT_Utils() {
  return runTests('Integration/Utils');
}

/** [INT-1] Creazione cartelle e spreadsheet via GoogleApiWrapper */
function LAUNCH_INT_Drive_Sheet() {
  return runTests('Integration/Utils/Drive_Sheet_Integration');
}

/** [INT-1] Gestione trigger via GoogleApiWrapper */
function LAUNCH_INT_Triggers() {
  return runTests('Integration/Utils/Trigger_Management');
}

/** [INT-1] Sostituzione placeholder in documenti via WorkspaceTemplateEngine */
function LAUNCH_INT_TemplateEngine_Doc() {
  return runTests('Integration/Utils/TemplateEngine_Doc');
}

/** [INT-1] Rendering tabelle via WorkspaceTemplateEngine */
function LAUNCH_INT_TemplateEngine_Table() {
  return runTests('Integration/Utils/TemplateEngine_Table');
}

/** [INT-1] Colonne dinamiche protette via WorkspaceTemplateEngine */
function LAUNCH_INT_TemplateEngine_DynamicColumns() {
  return runTests('Integration/Utils/TemplateEngine_Dynamic_Protected_Columns');
}

/** [INT-1] Rendering matrice dati su sheet via WorkspaceTemplateEngine */
function LAUNCH_INT_TemplateEngine_Matrice() {
  return runTests('Integration/Utils/TemplateEngine_Matrice_Dati');
}

// ============================================================
// INTEGRATION TESTS — Gruppo 2: Data Layer
// SheetDBLib × DomainRepositoryLib × GasExpressionEngineLib × RoleResolutionLib
// (Persistence, Queries, Repository pattern, Role-backed data)
// ============================================================

/** [INT-2] Tutti i test Data Layer (SheetDB + DomainRepository + ExpressionEngine + RoleResolution) */
function LAUNCH_INT_SheetDB() {
  return runTests('Integration/SheetDB');
}

/** [INT-2] SheetDB — ciclo completo CRUD (Create, Read, Update, Delete) */
function LAUNCH_INT_SheetDB_CRUD() {
  return runTests('Integration/SheetDB/CRUD_Lifecycle');
}

/** [INT-2] SheetDB — insert batch e performance delle query */
function LAUNCH_INT_SheetDB_Batch() {
  return runTests('Integration/SheetDB/Batch_Performance');
}

/** [INT-2] SheetDB — serializzazione e deserializzazione date ISO */
function LAUNCH_INT_SheetDB_Dates() {
  return runTests('Integration/SheetDB/Date_Handling');
}

/** [INT-2] SheetDB — persistenza di testi lunghi (5000+ caratteri) */
function LAUNCH_INT_SheetDB_LargeText() {
  return runTests('Integration/SheetDB/Large_Text');
}

/** [INT-2] SheetDB — simulazione transazioni (aggiornamenti atomici) */
function LAUNCH_INT_SheetDB_Transactions() {
  return runTests('Integration/SheetDB/Transactions');
}

/** [INT-2] SheetDB — query avanzate con join tra tabelle */
function LAUNCH_INT_SheetDB_Queries() {
  return runTests('Integration/SheetDB/Advanced_Queries');
}

// ============================================================
// INTEGRATION TESTS — Gruppo 3: Workflow Layer
// JobRunnerLib × PipelineFramework
// (Job lifecycle, Pipeline post-processing, Audit logging)
// ============================================================

/** [INT-3] Tutti i test Workflow Layer (JobRunner + Pipeline) */
function LAUNCH_INT_Workflows() {
  return runTests('Integration/Workflows');
}

/** [INT-3] JobRunner — ciclo di vita completo (PENDING → RUNNING → COMPLETED) */
function LAUNCH_INT_JobRunner_Lifecycle() {
  return runTests('Integration/Workflows/JobRunner_Lifecycle');
}

/** [INT-3] Pipeline — post-processor con audit log su SheetDB */
function LAUNCH_INT_Pipeline_PostProcessor() {
  return runTests('Integration/Workflows/Pipeline_PostProcessor');
}

// ============================================================
// INTEGRATION TESTS — Gruppo 4: Lifecycle Layer
// WorkspaceTemplateEngine × GoogleApiWrapper × SheetDBLib
// (Full document/sheet generation lifecycle)
// ============================================================

/** [INT-4] Tutti i test Lifecycle (Generation, Sharing, Persistence) */
function LAUNCH_INT_Lifecycle() {
  return runTests('Integration/Lifecycle');
}

/** [INT-4] Doc Lifecycle — Copy, Rename, Process, Share, Persist */
function LAUNCH_INT_Doc_Lifecycle() {
  return runTests('Integration/Lifecycle/Doc_Lifecycle');
}

/** [INT-4] Sheet Lifecycle — Copy, Rename, Process, Share, Persist */
function LAUNCH_INT_Sheet_Lifecycle() {
  return runTests('Integration/Lifecycle/Sheet_Lifecycle');
}

// ============================================================
// DEBUG & UTILITIES
// ============================================================

/** Elenca tutti i test registrati nel Logger (utile per trovare il path esatto) */
function DEBUG_ListAllTests() {
  initializeAllTests();
  Logger.log('--- TEST REGISTRY ---');
  runner.registry.forEach((t) => Logger.log(t.path));
  Logger.log('---------------------');
}
