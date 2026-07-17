#!/usr/bin/env node

/**
 * generate-offline-test-entry.cjs
 *
 * Scans all __tests__/ directories across the monorepo and generates
 * per-library webpack entry points that import the JestCompat layer
 * and all test files for that library.
 *
 * Output:
 *   dist/.offline-test-entries/
 *     CoreUtilsLib.tests.js
 *     GasResilienceLib.tests.js
 *     ... (one per library)
 *     _AllOfflineTests.entry.js   (master entry importing all)
 *
 * Usage:
 *   node scripts/generate-offline-test-entry.cjs [--output-dir=path]
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

function getArg(name) {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=').slice(1).join('=') : undefined;
}

const outputDir = path.resolve(rootDir, getArg('output-dir') || 'dist/.offline-test-entries');

// ─── Recursive file scanner (replaces glob) ───────────────────────────────────

function walkDir(dir, results) {
  if (!fs.existsSync(dir)) return results || [];
  results = results || [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '__testOnline__')
        continue;
      walkDir(fullPath, results);
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

function isTestFile(filePath) {
  return filePath.endsWith('.test.js') || filePath.endsWith('.spec.js');
}

function isInTestDir(filePath) {
  return filePath.includes('__tests__');
}

// Libraries to scan for tests
const LIBRARIES = [
  'CoreUtilsLib',
  'GasResilienceLib',
  'GoogleApiWrapper',
  'WorkspaceTemplateEngine',
  'GasExpressionEngineLib',
  'SheetDBLib',
  'JobRunnerLib',
  'PipelineFramework',
  'ContextEngine',
  'GasDataImporter',
  'DomainRepositoryLib',
  'RoleResolutionLib',
  'ComposableContentLib',
  'GasOnlineTestFramework',
  'GasProcessMonitorLib'
];

// Extra directories to scan
const EXTRA_TEST_DIRS = [
  { name: 'Integration', dir: 'test/__tests__/integration' },
  { name: 'Fakes', dir: 'test/fakes/__tests__' }
];

// ─── Scan ──────────────────────────────────────────────────────────────────────

function findTestFiles(libraryName) {
  const libDir = path.join(rootDir, libraryName);
  if (!fs.existsSync(libDir)) return [];

  const allFiles = walkDir(libDir);
  return allFiles
    .filter((f) => isTestFile(f) && (isInTestDir(f) || isTestFile(f)))
    .map((f) => path.relative(rootDir, f).replace(/\\/g, '/'))
    .sort();
}

function findExtraTestFiles(relDir) {
  const dir = path.join(rootDir, relDir);
  if (!fs.existsSync(dir)) return [];

  const allFiles = walkDir(dir);
  return allFiles
    .filter((f) => isTestFile(f))
    .map((f) => path.relative(rootDir, f).replace(/\\/g, '/'))
    .sort();
}

// ─── Generate ──────────────────────────────────────────────────────────────────

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const libraryEntries = {};
let totalTestFiles = 0;

// Compute paths to JestCompat and GasMockSetup relative to outputDir
const jestCompatRelPath = path
  .relative(outputDir, path.join(rootDir, 'test/offline-bundle/JestCompat.js'))
  .replace(/\\/g, '/');
const gasMockRelPath = path
  .relative(outputDir, path.join(rootDir, 'test/offline-bundle/GasMockSetup.js'))
  .replace(/\\/g, '/');

function generateEntryContent(name, testFiles, runnerName) {
  const relativePaths = testFiles.map((f) => {
    return path.relative(outputDir, path.join(rootDir, f)).replace(/\\/g, '/');
  });

  let content = `/**\n * Auto-generated offline test entry for ${name}\n * Generated: ${new Date().toISOString()}\n * Test files: ${testFiles.length}\n */\n\n`;
  content += `// Jest compatibility layer\n`;
  content += `import { describe, it, test, expect, beforeEach, afterEach, beforeAll, afterAll, jest, resetTestRegistry, runCollectedTests } from '${jestCompatRelPath}';\n`;
  content += `import { TestFramework, Assert } from '@GasOnlineTestFramework';\n`;
  content += `import '${gasMockRelPath}';\n\n`;

  // Expose Jest globals
  content += `// Expose Jest globals for test files\n`;
  content += `global.describe = describe;\n`;
  content += `global.it = it;\n`;
  content += `global.test = test;\n`;
  content += `global.expect = expect;\n`;
  content += `global.beforeEach = beforeEach;\n`;
  content += `global.afterEach = afterEach;\n`;
  content += `global.beforeAll = beforeAll;\n`;
  content += `global.afterAll = afterAll;\n`;
  content += `global.jest = jest;\n\n`;

  // Import test files
  content += `// Test files\n`;
  for (let i = 0; i < relativePaths.length; i++) {
    content += `import '${relativePaths[i]}';\n`;
  }
  content += `\n`;

  // Export runner function
  content += `// Runner function (callable from GAS)\n`;
  content += `export function ${runnerName}() {\n`;
  content += `  return runCollectedTests('${name} - Offline Tests (${testFiles.length} files)', TestFramework, Assert);\n`;
  content += `}\n`;
  content += `global.${runnerName} = ${runnerName};\n`;

  return content;
}

// Generate per-library entry files
for (const lib of LIBRARIES) {
  const testFiles = findTestFiles(lib);
  if (testFiles.length === 0) continue;

  totalTestFiles += testFiles.length;
  const runnerName = `runOfflineTests_${lib}`;
  const entryFile = path.join(outputDir, `${lib}.tests.js`);
  const content = generateEntryContent(lib, testFiles, runnerName);

  fs.writeFileSync(entryFile, content, 'utf8');
  libraryEntries[lib] = {
    entryFile,
    runnerName,
    testFileCount: testFiles.length,
    testFiles
  };
}

// Generate extra test entries (integration, fakes)
for (const extra of EXTRA_TEST_DIRS) {
  const testFiles = findExtraTestFiles(extra.dir);
  if (testFiles.length === 0) continue;

  totalTestFiles += testFiles.length;
  const runnerName = `runOfflineTests_${extra.name}`;
  const entryFile = path.join(outputDir, `${extra.name}.tests.js`);
  const content = generateEntryContent(extra.name, testFiles, runnerName);

  fs.writeFileSync(entryFile, content, 'utf8');
  libraryEntries[extra.name] = {
    entryFile,
    runnerName,
    testFileCount: testFiles.length,
    testFiles
  };
}

// Generate master entry that imports everything
const masterEntryFile = path.join(outputDir, '_AllOfflineTests.entry.js');
let masterContent = `/**\n * Auto-generated master offline test entry\n * Generated: ${new Date().toISOString()}\n * Total test files: ${totalTestFiles}\n * Libraries: ${Object.keys(libraryEntries).length}\n */\n\n`;

for (const [name, info] of Object.entries(libraryEntries)) {
  const relPath = path.relative(outputDir, info.entryFile).replace(/\\/g, '/');
  masterContent += `export { ${info.runnerName} } from './${relPath}';\n`;
}

masterContent += `\n`;

// Master runner
masterContent += `import { TestFramework, Assert } from '@GasOnlineTestFramework';\n\n`;

masterContent += `/**\n * Run ALL offline tests across all libraries.\n * This is the main entry point for running offline tests in GAS.\n */\n`;
masterContent += `function runAllOfflineTests() {\n`;
masterContent += `  Logger.log('═══════════════════════════════════════════════════════════');\n`;
masterContent += `  Logger.log('  OFFLINE TEST SUITE - Running compiled Jest tests in GAS');\n`;
masterContent += `  Logger.log('═══════════════════════════════════════════════════════════');\n`;
masterContent += `  Logger.log('');\n\n`;

masterContent += `  var results = {\n`;
masterContent += `    libraries: [],\n`;
masterContent += `    totalPassed: 0,\n`;
masterContent += `    totalFailed: 0,\n`;
masterContent += `    totalSkipped: 0\n`;
masterContent += `  };\n\n`;

masterContent += `  var runners = [\n`;
for (const [name, info] of Object.entries(libraryEntries)) {
  masterContent += `    { name: '${name}', runner: global.${info.runnerName}, files: ${info.testFileCount} },\n`;
}
masterContent += `  ];\n\n`;

masterContent += `  for (var i = 0; i < runners.length; i++) {\n`;
masterContent += `    var entry = runners[i];\n`;
masterContent += `    Logger.log('─── ' + entry.name + ' (' + entry.files + ' test files) ───');\n`;
masterContent += `    try {\n`;
masterContent += `      var result = entry.runner();\n`;
masterContent += `      results.libraries.push({\n`;
masterContent += `        name: entry.name,\n`;
masterContent += `        passed: result.passed,\n`;
masterContent += `        failed: result.failed,\n`;
masterContent += `        skipped: result.skipped\n`;
masterContent += `      });\n`;
masterContent += `      results.totalPassed += result.passed;\n`;
masterContent += `      results.totalFailed += result.failed;\n`;
masterContent += `      results.totalSkipped += result.skipped;\n`;
masterContent += `    } catch (e) {\n`;
masterContent += `      Logger.log('ERROR in ' + entry.name + ': ' + e.message);\n`;
masterContent += `      results.libraries.push({ name: entry.name, error: e.message });\n`;
masterContent += `    }\n`;
masterContent += `    Logger.log('');\n`;
masterContent += `  }\n\n`;

masterContent += `  // Print master summary\n`;
masterContent += `  var total = results.totalPassed + results.totalFailed + results.totalSkipped;\n`;
masterContent += `  Logger.log('═══════════════════════════════════════════════════════════');\n`;
masterContent += `  Logger.log('  OFFLINE TEST MASTER SUMMARY');\n`;
masterContent += `  Logger.log('═══════════════════════════════════════════════════════════');\n`;
masterContent += `  Logger.log('Total:   ' + total);\n`;
masterContent += `  Logger.log('Passed:  ' + results.totalPassed + ' ✓');\n`;
masterContent += `  Logger.log('Failed:  ' + results.totalFailed + ' ✗');\n`;
masterContent += `  Logger.log('Skipped: ' + results.totalSkipped + ' ⊘');\n`;
masterContent += `  Logger.log('═══════════════════════════════════════════════════════════');\n\n`;

masterContent += `  return results;\n`;
masterContent += `}\n\n`;

masterContent += `global.runAllOfflineTests = runAllOfflineTests;\n`;
masterContent += `export { runAllOfflineTests };\n`;

fs.writeFileSync(masterEntryFile, masterContent, 'utf8');

// Generate manifest with test file info
const manifest = {
  generated: new Date().toISOString(),
  totalTestFiles,
  libraryCount: Object.keys(libraryEntries).length,
  libraries: {}
};

for (const [name, info] of Object.entries(libraryEntries)) {
  manifest.libraries[name] = {
    testFileCount: info.testFileCount,
    runnerFunction: info.runnerName,
    testFiles: info.testFiles
  };
}

fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

// Print summary
console.log(`\nOffline Test Entry Generator`);
console.log(`${'─'.repeat(50)}`);
console.log(`Total test files: ${totalTestFiles}`);
console.log(`Libraries: ${Object.keys(libraryEntries).length}`);
for (const [name, info] of Object.entries(libraryEntries)) {
  console.log(`  ${name}: ${info.testFileCount} test file(s)`);
}
console.log(`Output: ${outputDir}`);
console.log(`Master entry: _AllOfflineTests.entry.js`);
console.log(`${'─'.repeat(50)}\n`);
