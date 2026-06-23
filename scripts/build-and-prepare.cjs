#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(msg) {
  console.log(msg);
}

function heading(text) {
  log(`\n${'='.repeat(80)}`);
  log(`${c.bold}${c.cyan}${text}${c.reset}`);
  log(`${'='.repeat(80)}`);
}

function step(n, total, text) {
  log(`\n${c.yellow}[${n}/${total}] ${text}${c.reset}`);
}

function ok(msg) {
  log(`  ${c.green}✓${c.reset} ${msg}`);
}

function warn(msg) {
  log(`  ${c.yellow}⚠${c.reset} ${msg}`);
}

function fail(msg) {
  log(`  ${c.red}✗${c.reset} ${msg}`);
}

function info(msg) {
  log(`  ${c.blue}ℹ${c.reset} ${msg}`);
}

const args = process.argv.slice(2);

function getArg(name) {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=').slice(1).join('=') : undefined;
}

const mode = getArg('mode') || 'testing';
const onlineTestsFlag = getArg('online-tests');
const includeOfflineTestsFlag = getArg('include-offline-tests');

const includeOnlineTests =
  mode === 'testing' && (onlineTestsFlag !== undefined ? onlineTestsFlag !== 'false' : true);

// --include-offline-tests: Bundle Jest tests into GAS-deployable .gs files
// Available in testoffline mode. When enabled, compiles all __tests__/ files
// through webpack with a Jest compatibility layer for GAS execution.
const includeOfflineTests =
  mode === 'testoffline' &&
  (includeOfflineTestsFlag !== undefined ? includeOfflineTestsFlag !== 'false' : false);

if (!['production', 'testing', 'testoffline'].includes(mode)) {
  console.error(
    `${c.red}Error: Invalid mode "${mode}". Use --mode=production, --mode=testing, or --mode=testoffline${c.reset}`
  );
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const codeJsPath = path.join(distDir, 'Code.js');
const appsscriptSrc = path.join(rootDir, 'appsscript.json');
const appsscriptDest = path.join(distDir, 'appsscript.json');

const webpackCmd =
  mode === 'production'
    ? 'npx webpack --mode production'
    : 'npx webpack --mode production --env readable';

// Extra step when including offline tests: generate entries + webpack test build + V8 patches
const TOTAL_STEPS = mode === 'testoffline' ? (includeOfflineTests ? 10 : 8) : 7;

heading('GasLibraryFactory - Build and Prepare');
info(`Mode:         ${c.bold}${mode.toUpperCase()}${c.reset}`);
if (mode === 'testoffline') {
  info(`Code.js:      Readable (not minified), no comments`);
  info(`Offline tests: Will run after build (unit + integration + bundle validation)`);
  if (includeOfflineTests) {
    info(`Bundle tests: ${c.bold}${c.cyan}ENABLED${c.reset} — Jest tests will be compiled through webpack for offline verification`);
  }
} else {
  info(
    `Code.js:      ${mode === 'production' ? 'Minified (Terser), no comments' : 'Readable (not minified), no comments'}`
  );
  info(`Online tests: ${includeOnlineTests ? 'Included' : 'Excluded'}`);
}

step(1, TOTAL_STEPS, 'Cleaning dist directory...');

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
  ok('Cleaned dist/');
} else {
  ok('dist/ does not exist yet (will be created by Webpack)');
}

step(2, TOTAL_STEPS, `Running Webpack build (${webpackCmd})...`);

try {
  execSync(webpackCmd, { stdio: 'inherit', cwd: rootDir });
  ok('Webpack build completed');
} catch (_) {
  fail('Webpack build failed');
  process.exit(1);
}

if (!fs.existsSync(codeJsPath)) {
  fail('dist/Code.js was not produced by Webpack');
  process.exit(1);
}

{
  const dupes = fs
    .readdirSync(distDir)
    .filter((f) => f.startsWith('TEST___testOnline___') && f.endsWith('.gs'));
  if (dupes.length > 0) {
    dupes.forEach((f) => fs.unlinkSync(path.join(distDir, f)));

    // Also remove duplicate entries from test-file-map.json
    const testMapPath = path.join(distDir, 'test-file-map.json');
    if (fs.existsSync(testMapPath)) {
      try {
        const testMap = JSON.parse(fs.readFileSync(testMapPath, 'utf8'));
        dupes.forEach((f) => delete testMap[f]);
        fs.writeFileSync(testMapPath, JSON.stringify(testMap, null, 2));
      } catch (_) {
        // Ignore parse errors — test-file-map.json will be regenerated later if needed
      }
    }

    ok(`Removed ${dupes.length} duplicate test file(s) (TEST___testOnline___*.gs)`);
  }
}

step(3, TOTAL_STEPS, 'Copying appsscript.json...');

if (fs.existsSync(appsscriptSrc)) {
  fs.copyFileSync(appsscriptSrc, appsscriptDest);

  try {
    const manifest = JSON.parse(fs.readFileSync(appsscriptDest, 'utf8'));
    if (manifest.runtimeVersion === 'V8') {
      ok('Copied appsscript.json (runtimeVersion: V8)');
    } else {
      warn(
        `appsscript.json runtimeVersion is "${manifest.runtimeVersion || 'UNSET'}" — expected "V8"`
      );
    }
  } catch (e) {
    warn(`Could not parse appsscript.json for validation: ${e.message}`);
  }
} else {
  fail('appsscript.json not found at project root');
  process.exit(1);
}

step(4, TOTAL_STEPS, 'GAS V8 compatibility post-processing...');

let code = fs.readFileSync(codeJsPath, 'utf8');
const originalSize = Buffer.byteLength(code, 'utf8');
let patchCount = 0;
let warningCount = 0;

{
  const regex = /Object\.hasOwn\(/g;
  const matches = code.match(regex);
  if (matches) {
    code = code.replace(regex, 'Object.prototype.hasOwnProperty.call(');
    patchCount += matches.length;
    ok(`Replaced ${matches.length} instance(s) of Object.hasOwn() → Object.prototype.hasOwnProperty.call()`);
  } else {
    ok('No Object.hasOwn() found (already compatible)');
  }
}

{
  const regex = /\.replaceAll\(("[^"]*"|'[^']*'),\s*/g;
  const matches = code.match(regex);
  if (matches) {
    code = code.replace(
      /\.replaceAll\(("[^"]*"|'[^']*'),\s*("[^"]*"|'[^']*'|[^)]+)\)/g,
      '.split($1).join($2)'
    );
    patchCount += matches.length;
    ok(`Replaced ${matches.length} instance(s) of .replaceAll() → .split().join()`);
  } else {
    ok('No .replaceAll() with string literal found (already compatible)');
  }
}

{
  const target =
    '/\\p{Lu}?\\p{Ll}+|[0-9]+|\\p{Lu}+(?!\\p{Ll})|\\p{Emoji_Presentation}|\\p{Extended_Pictographic}|\\p{L}+/gu';
  if (code.includes(target)) {
    const replacement =
      "(function(){try{return new RegExp('\\\\p{Lu}?\\\\p{Ll}+|[0-9]+|\\\\p{Lu}+(?!\\\\p{Ll})|\\\\p{L}+','gu')}catch(e){return /[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g}})()";
    code = code.replace(target, replacement);
    patchCount++;
    ok('Replaced es-toolkit CASE_SPLIT_PATTERN regex with GAS-safe fallback');
  } else {
    ok('No es-toolkit CASE_SPLIT_PATTERN regex found (already compatible)');
  }
}

{
  const target = '"^(\\\\p{Extended_Pictographic}|\\\\p{Emoji_Component})+$"';
  if (code.includes(target)) {
    const replacement =
      '"^[\\\\u{1F600}-\\\\u{1F64F}\\\\u{1F300}-\\\\u{1F5FF}\\\\u{1F680}-\\\\u{1F6FF}\\\\u{1F900}-\\\\u{1F9FF}\\\\u{1FA00}-\\\\u{1FA6F}\\\\u{1FA70}-\\\\u{1FAFF}\\\\u{2600}-\\\\u{26FF}\\\\u{2700}-\\\\u{27BF}\\\\u{FE00}-\\\\u{FE0F}\\\\u{200D}\\\\u{20E3}\\\\u{E0020}-\\\\u{E007F}]+$"';
    code = code.replace(target, replacement);
    patchCount++;
    ok('Replaced Zod emoji regex with GAS-safe Unicode range fallback');
  } else {
    ok('No Zod emoji regex found (already compatible)');
  }
}

{
  const urlUsages = (code.match(/new URL\(/g) || []).length;
  if (urlUsages > 0) {
    const shim = [
      'if(typeof URL==="undefined"){',
      'var URL=function(u){',
      'if(typeof u!=="string")throw new TypeError("Invalid URL");',
      'var m=u.match(/^(([a-zA-Z][a-zA-Z0-9+.-]*):)?\\/\\/([^/?#]*)([^?#]*)(\\?[^#]*)?(#.*)?$/);',
      'if(!m)throw new TypeError("Invalid URL");',
      'this.protocol=(m[2]||"")+":";',
      'this.hostname=m[3]||"";',
      'this.host=this.hostname;',
      'this.pathname=m[4]||"/";',
      'this.search=m[5]||"";',
      'this.hash=m[6]||"";',
      'this.href=u;',
      'this.origin=this.protocol+"//"+this.hostname;',
      '};',
      '}'
    ].join('');

    code = shim + ';' + code;
    patchCount++;
    ok(`Injected URL constructor shim (${urlUsages} usage(s) of new URL() found)`);
  } else {
    ok('No new URL() found (no shim needed)');
  }
}

const scanPatterns = [
  {
    label: 'crypto.getRandomValues()',
    regex: /crypto\.getRandomValues\s*\(/g,
    reason: 'Not available in GAS. Use nanoid/non-secure or Utilities.getUuid().'
  },
  {
    label: 'structuredClone()',
    regex: /\bstructuredClone\s*\(/g,
    reason: 'ES2022 (Chrome 98+). Use cloneDeep() from es-toolkit or JSON parse/stringify.'
  },
  {
    label: 'Array.prototype.at()',
    regex: /\.at\s*\(\s*-?\d+\s*\)/g,
    reason: 'ES2022 (Chrome 92+). Use bracket notation or arr[arr.length - 1].'
  },
  {
    label: 'Array.prototype.findLast()',
    regex: /\.findLast\s*\(/g,
    reason: 'ES2023 (Chrome 97+). Use .slice().reverse().find() or a manual loop.'
  },
  {
    label: 'Array.prototype.findLastIndex()',
    regex: /\.findLastIndex\s*\(/g,
    reason: 'ES2023 (Chrome 97+). Use a manual loop from the end.'
  },
  {
    label: 'Promise.any()',
    regex: /Promise\.any\s*\(/g,
    reason: 'ES2021 (Chrome 85+). Not useful in GAS synchronous runtime anyway.'
  },
  {
    label: 'Logical assignment operators (??=, ||=, &&=)',
    regex: /(?:&&=|\|\|=|\?\?=)/g,
    reason: 'ES2021 (Chrome 85+). Use explicit assignment instead.'
  }
];

for (const { label, regex, reason } of scanPatterns) {
  const matches = code.match(regex);
  if (matches) {
    warn(`Found ${matches.length} instance(s) of ${c.bold}${label}${c.reset}`);
    info(`  Reason: ${reason}`);
    warningCount += matches.length;
  }
}

const GAS_FILE_SIZE_LIMIT = 6 * 1024 * 1024;
const GAS_FILE_SIZE_WARNING = 4 * 1024 * 1024;
const patchedSize = Buffer.byteLength(code, 'utf8');
const sizeKB = (patchedSize / 1024).toFixed(1);

if (patchedSize > GAS_FILE_SIZE_LIMIT) {
  fail(`Code.js is ${sizeKB} KB — exceeds GAS 6 MB per-file limit!`);
  warningCount++;
} else if (patchedSize > GAS_FILE_SIZE_WARNING) {
  warn(`Code.js is ${sizeKB} KB — approaching GAS 6 MB per-file limit`);
  warningCount++;
} else {
  ok(`Code.js size: ${sizeKB} KB (within GAS limits)`);
}

if (patchCount > 0) {
  fs.writeFileSync(codeJsPath, code, 'utf8');
  ok(`Wrote patched Code.js (${patchCount} fix(es) applied)`);
} else {
  ok('No patches needed — Code.js unchanged');
}

if (warningCount > 0) {
  warn(
    `${warningCount} compatibility warning(s) detected — review above for details`
  );
}

step(5, TOTAL_STEPS, 'Configuring deployment files...');

const testFiles = fs
  .readdirSync(distDir)
  .filter((f) => f.startsWith('TEST_') && f.endsWith('.gs'));

if (mode === 'production' || mode === 'testoffline' || !includeOnlineTests) {
  const labels = {
    production: 'Production mode',
    testoffline: 'Testoffline mode',
    testing: 'Testing mode (--online-tests=false)'
  };
  const label = labels[mode] || mode;
  info(`${label}: removing online test files...`);

  if (testFiles.length > 0) {
    testFiles.forEach((f) => fs.unlinkSync(path.join(distDir, f)));
    ok(`Removed ${testFiles.length} online test file(s)`);
  } else {
    ok('No online test files to remove');
  }

  const claspignore = `TEST_*.gs
**/__testOnline__/**
**/__tests__/**
*.test.js
*.spec.js
*.map
*.map.json
source-map-index.json
test-file-map.json
*.log
*.tmp
`;

  fs.writeFileSync(path.join(distDir, '.claspignore'), claspignore);
  ok('Created .claspignore (excludes tests and map files)');
} else {
  info('Testing mode: keeping online test files...');
  ok(`${testFiles.length} online test file(s) will be included`);

  const claspignore = `*.map
*.map.json
source-map-index.json
test-file-map.json
*.log
*.tmp
**/__tests__/**
`;

  fs.writeFileSync(path.join(distDir, '.claspignore'), claspignore);
  ok('Created .claspignore (includes online tests, excludes map files)');
}

step(6, TOTAL_STEPS, 'Generating source map index...');

{
  const sourceMapPath = path.join(distDir, 'Code.js.map');
  const testMapPath = path.join(distDir, 'test-file-map.json');
  const indexPath = path.join(distDir, 'source-map-index.json');

  const index = {
    version: 1,
    buildMode: mode,
    timestamp: new Date().toISOString(),
    patchesApplied: patchCount,
    warningCount: warningCount,
    note: patchCount > 0
      ? 'Code.js.map is generated by Webpack before V8 compatibility patches. Line numbers near patched areas (Object.hasOwn, replaceAll, URL shim, etc.) may have slight offsets.'
      : 'Code.js.map accurately maps to the final Code.js (no V8 patches were needed).',
    codeJs: {
      file: 'Code.js',
      sourceMapFile: null,
      sizeBytes: Buffer.byteLength(code, 'utf8'),
      sourceFiles: []
    },
    testFiles: {}
  };

  // Extract source file listing from Code.js.map
  if (fs.existsSync(sourceMapPath)) {
    try {
      const sourceMap = JSON.parse(fs.readFileSync(sourceMapPath, 'utf8'));
      index.codeJs.sourceMapFile = 'Code.js.map';
      if (sourceMap.sources && Array.isArray(sourceMap.sources)) {
        index.codeJs.sourceFiles = sourceMap.sources
          .map((s) => s.replace(/^webpack:\/\/gaslibraryfactory-monorepo\//, '').replace(/^\.\//, ''))
          .filter((s) => !s.startsWith('node_modules/') && s !== 'webpack/bootstrap' && !s.startsWith('webpack/'))
          .sort();
      }
      ok(`Parsed Code.js.map: ${index.codeJs.sourceFiles.length} source file(s) indexed`);
    } catch (e) {
      warn(`Could not parse Code.js.map: ${e.message}`);
    }
  } else {
    warn('Code.js.map not found — source map was not generated by Webpack');
  }

  // Load test file mappings from CopyOnlineTestsPlugin output
  if (fs.existsSync(testMapPath)) {
    try {
      index.testFiles = JSON.parse(fs.readFileSync(testMapPath, 'utf8'));
      ok(`Loaded test file mappings: ${Object.keys(index.testFiles).length} test file(s)`);
    } catch (e) {
      warn(`Could not parse test-file-map.json: ${e.message}`);
    }
  } else {
    ok('No test-file-map.json (no online test files copied)');
  }

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  ok(`Generated source-map-index.json`);
}

let offlineTestsPassed = false;

if (mode === 'testoffline') {
  step(7, TOTAL_STEPS, 'Running offline tests (unit + integration + bundle validation)...');

  let unitPassed = false;
  let integrationPassed = false;
  let bundlePassed = false;

  info('Running unit tests...');
  try {
    execSync('npx jest --config jest.config.cjs --reporters=summary --silent --no-stack-trace --no-cache', {
      stdio: 'inherit',
      cwd: rootDir
    });
    unitPassed = true;
    ok('Unit tests passed');
  } catch (_) {
    fail('Unit tests failed (see above for details)');
  }

  info('Running integration tests...');
  try {
    execSync('npx jest --config jest.integration.config.cjs --reporters=summary --silent --no-stack-trace --no-cache', {
      stdio: 'inherit',
      cwd: rootDir
    });
    integrationPassed = true;
    ok('Integration tests passed');
  } catch (_) {
    fail('Integration tests failed (see above for details)');
  }

  info('Running bundle validation tests...');
  try {
    execSync('npx jest --config jest.offline.config.cjs --reporters=summary --silent --no-stack-trace --no-cache', {
      stdio: 'inherit',
      cwd: rootDir
    });
    bundlePassed = true;
    ok('Bundle validation tests passed');
  } catch (_) {
    fail('Bundle validation tests failed (see above for details)');
  }

  offlineTestsPassed = unitPassed && integrationPassed && bundlePassed;
  if (offlineTestsPassed) {
    ok('All offline tests passed');
  } else {
    fail('Some offline tests failed');
  }
}

// ─── Offline Test Bundle Build (optional) ──────────────────────────────────────

let offlineTestBundleBuilt = false;

if (includeOfflineTests) {
  const bundleStep1 = mode === 'testoffline' ? 8 : 7;
  step(bundleStep1, TOTAL_STEPS, 'Generating offline test entry points...');

  try {
    execSync('node scripts/generate-offline-test-entry.cjs', {
      stdio: 'inherit',
      cwd: rootDir
    });
    ok('Offline test entry points generated');
  } catch (e) {
    fail(`Failed to generate offline test entries: ${e.message}`);
    // Don't exit - build is still valid without test bundle
  }

  const bundleStep2 = bundleStep1 + 1;
  step(bundleStep2, TOTAL_STEPS, 'Building offline test bundle (webpack)...');

  const testWebpackCmd = 'npx webpack --config webpack.offline-tests.config.cjs --mode production --env readable';

  try {
    execSync(testWebpackCmd, { stdio: 'inherit', cwd: rootDir });

    const testBundlePath = path.join(distDir, 'TEST_OFFLINE_Bundle.gs');
    if (fs.existsSync(testBundlePath)) {
      // Apply V8 compatibility patches to the test bundle too
      let testCode = fs.readFileSync(testBundlePath, 'utf8');
      let testPatchCount = 0;

      // Object.hasOwn
      {
        const regex = /Object\.hasOwn\(/g;
        const matches = testCode.match(regex);
        if (matches) {
          testCode = testCode.replace(regex, 'Object.prototype.hasOwnProperty.call(');
          testPatchCount += matches.length;
        }
      }

      // .replaceAll
      {
        const regex = /\.replaceAll\(("[^"]*"|'[^']*'),\s*/g;
        const matches = testCode.match(regex);
        if (matches) {
          testCode = testCode.replace(
            /\.replaceAll\(("[^"]*"|'[^']*'),\s*("[^"]*"|'[^']*'|[^)]+)\)/g,
            '.split($1).join($2)'
          );
          testPatchCount += matches.length;
        }
      }

      // CASE_SPLIT_PATTERN
      {
        const target =
          '/\\p{Lu}?\\p{Ll}+|[0-9]+|\\p{Lu}+(?!\\p{Ll})|\\p{Emoji_Presentation}|\\p{Extended_Pictographic}|\\p{L}+/gu';
        if (testCode.includes(target)) {
          const replacement =
            "(function(){try{return new RegExp('\\\\p{Lu}?\\\\p{Ll}+|[0-9]+|\\\\p{Lu}+(?!\\\\p{Ll})|\\\\p{L}+','gu')}catch(e){return /[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g}})()";
          testCode = testCode.replace(target, replacement);
          testPatchCount++;
        }
      }

      // Zod emoji regex
      {
        const target = '"^(\\\\p{Extended_Pictographic}|\\\\p{Emoji_Component})+$"';
        if (testCode.includes(target)) {
          const replacement =
            '"^[\\\\u{1F600}-\\\\u{1F64F}\\\\u{1F300}-\\\\u{1F5FF}\\\\u{1F680}-\\\\u{1F6FF}\\\\u{1F900}-\\\\u{1F9FF}\\\\u{1FA00}-\\\\u{1FA6F}\\\\u{1FA70}-\\\\u{1FAFF}\\\\u{2600}-\\\\u{26FF}\\\\u{2700}-\\\\u{27BF}\\\\u{FE00}-\\\\u{FE0F}\\\\u{200D}\\\\u{20E3}\\\\u{E0020}-\\\\u{E007F}]+$"';
          testCode = testCode.replace(target, replacement);
          testPatchCount++;
        }
      }

      // URL shim
      {
        const urlUsages = (testCode.match(/new URL\(/g) || []).length;
        if (urlUsages > 0) {
          const shim = [
            'if(typeof URL==="undefined"){',
            'var URL=function(u){',
            'if(typeof u!=="string")throw new TypeError("Invalid URL");',
            'var m=u.match(/^(([a-zA-Z][a-zA-Z0-9+.-]*):)?\\/\\/([^/?#]*)([^?#]*)(\\?[^#]*)?(#.*)?$/);',
            'if(!m)throw new TypeError("Invalid URL");',
            'this.protocol=(m[2]||"")+":";',
            'this.hostname=m[3]||"";',
            'this.host=this.hostname;',
            'this.pathname=m[4]||"/";',
            'this.search=m[5]||"";',
            'this.hash=m[6]||"";',
            'this.href=u;',
            'this.origin=this.protocol+"//"+this.hostname;',
            '};',
            '}'
          ].join('');
          testCode = shim + ';' + testCode;
          testPatchCount++;
        }
      }

      if (testPatchCount > 0) {
        fs.writeFileSync(testBundlePath, testCode, 'utf8');
        ok(`Applied ${testPatchCount} V8 compatibility patch(es) to test bundle`);
      }

      const bundleSizeKB = (Buffer.byteLength(testCode, 'utf8') / 1024).toFixed(1);
      ok(`Offline test bundle built: TEST_OFFLINE_Bundle.gs (${bundleSizeKB} KB)`);

      offlineTestBundleBuilt = true;

      // Load manifest for summary
      const manifestPath = path.join(distDir, '.offline-test-entries', 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          ok(`Test files compiled: ${manifest.totalTestFiles} across ${manifest.libraryCount} libraries`);
          for (const [libName, libInfo] of Object.entries(manifest.libraries)) {
            info(`  ${libName}: ${libInfo.testFileCount} test file(s) → ${libInfo.runnerFunction}()`);
          }
        } catch (_) {}
      }
    } else {
      fail('TEST_OFFLINE_Bundle.gs was not produced by Webpack');
    }
  } catch (e) {
    fail(`Offline test bundle build failed: ${e.message || 'see output above'}`);
  }

  // Test bundle is for offline verification only — not deployed via CLASP
  if (offlineTestBundleBuilt) {
    ok('Test bundle is for offline verification only (not deployed to GAS)');
  }
}

const summaryStep = includeOfflineTests ? TOTAL_STEPS : (mode === 'testoffline' ? 8 : 7);
step(summaryStep, TOTAL_STEPS, 'Build summary');

const finalFiles = fs
  .readdirSync(distDir)
  .filter((f) => fs.statSync(path.join(distDir, f)).isFile());

if (mode === 'testoffline') {
  heading(offlineTestsPassed ? 'Build & Test Complete — All Tests Passed' : 'Build Complete — Tests Failed');
} else {
  heading('Build Complete — Ready for Deployment');
}

info(`Mode:             ${c.bold}${mode.toUpperCase()}${c.reset}`);
info(`Output directory: dist/`);
info(`GAS patches:      ${patchCount > 0 ? `${patchCount} applied` : 'none needed'}`);
info(`Source maps:      Code.js.map + source-map-index.json (excluded from CLASP push)`);
if (warningCount > 0) {
  info(`Warnings:         ${c.yellow}${warningCount}${c.reset}`);
}
if (mode === 'testoffline') {
  info(
    `Offline tests:    ${offlineTestsPassed ? `${c.green}PASSED${c.reset}` : `${c.red}FAILED${c.reset}`}`
  );
  if (includeOfflineTests) {
    info(
      `Test bundle:      ${offlineTestBundleBuilt ? `${c.green}BUILT${c.reset} (TEST_OFFLINE_Bundle.gs)` : `${c.red}NOT BUILT${c.reset}`}`
    );
  }
}

log('');
info(`Files in dist/ (${finalFiles.length}):`);

let totalSizeBytes = 0;
finalFiles.forEach((file) => {
  const size = fs.statSync(path.join(distDir, file)).size;
  totalSizeBytes += size;
  const kb = (size / 1024).toFixed(2);
  log(`    ${file} ${c.dim}(${kb} KB)${c.reset}`);
});

const totalKB = (totalSizeBytes / 1024).toFixed(2);
log(`    ${c.dim}─────────────────────────────${c.reset}`);
log(`    ${c.bold}Total: ${totalKB} KB${c.reset}`);

log('');
if (mode === 'testoffline') {
  if (offlineTestsPassed) {
    info(`${c.green}The compiled bundle passed all offline validation tests.${c.reset}`);
    if (offlineTestBundleBuilt) {
      info(`${c.green}Offline test bundle compiled successfully (webpack verification passed).${c.reset}`);
    }
    info(`Next step: ${c.bold}clasp push${c.reset} (or run --mode=production for deployment)`);
  } else {
    info(`${c.red}Some offline tests failed. Review the output above.${c.reset}`);
  }
} else {
  info(`Next step: ${c.bold}clasp push${c.reset}`);
}
log(`${'='.repeat(80)}\n`);

if (mode === 'testoffline' && !offlineTestsPassed) {
  process.exit(1);
}
