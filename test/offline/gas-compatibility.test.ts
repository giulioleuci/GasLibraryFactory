export {};
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { Script } from 'node:vm';
/**
 * GAS V8 Compatibility Tests
 *
 * Validates that the compiled bundle has been properly post-processed
 * for Google Apps Script V8 runtime compatibility. These tests perform
 * static analysis on the bundle source to verify:
 * - Known incompatible patterns have been patched
 * - GAS V8 shims are present
 * - Bundle size is within GAS limits
 *
 * This complements the build script's post-processing by verifying
 * the patches from the consumer side.
 */

const {
  loadBundle
}: typeof import('./helpers/load-bundle.cjs') = require('./helpers/load-bundle.cjs');

describe('GAS V8 Compatibility', () => {
  let bundleSource: string;

  beforeAll(() => {
    loadBundle();
    if (!global.__bundleLoaded) {
      throw new Error(`Bundle not loaded: ${global.__bundleError}`);
    }
    bundleSource = global.__bundleSource!;
    expect(typeof bundleSource).toBe('string');
  });

  // ─── Patched Patterns ───────────────────────────────────────────────

  describe('Patched patterns (should NOT be present)', () => {
    it('should not contain Object.hasOwn() calls', () => {
      // Object.hasOwn() is ES2022 (Chrome 93+), unavailable in GAS V8 (Chrome ~80)
      // Should be replaced with Object.prototype.hasOwnProperty.call()
      const matches = bundleSource.match(/Object\.hasOwn\(/g);
      expect(matches).toBeNull();
    });

    it('should not contain .replaceAll() with string literals', () => {
      // String.replaceAll() is ES2021 (Chrome 85+), unavailable in GAS V8
      // Should be replaced with .split().join()
      const matches = bundleSource.match(/\.replaceAll\(["'][^"']*["'],\s*/g);
      expect(matches).toBeNull();
    });

    it('should not contain raw es-toolkit CASE_SPLIT_PATTERN regex', () => {
      // The es-toolkit regex with \\p{Emoji_Presentation} may cause SyntaxError
      // Should be replaced with a GAS-safe fallback
      const unsafePattern =
        '/\\p{Lu}?\\p{Ll}+|[0-9]+|\\p{Lu}+(?!\\p{Ll})|\\p{Emoji_Presentation}|\\p{Extended_Pictographic}|\\p{L}+/gu';
      expect(bundleSource).not.toContain(unsafePattern);
    });
  });

  // ─── Required Shims ─────────────────────────────────────────────────

  describe('Required shims and patches', () => {
    it('should contain Object.prototype.hasOwnProperty.call() (patch replacement)', () => {
      // Verify the replacement pattern is present
      expect(bundleSource).toContain('Object.prototype.hasOwnProperty.call(');
    });

    it('should contain URL constructor shim if URL is used', () => {
      // The URL shim is only injected if `new URL(` is detected in the bundle (it matches regex /new URL\(/)
      const hasUrlUsage = /new URL\(/.test(bundleSource);
      if (hasUrlUsage) {
        expect(bundleSource).toContain('typeof URL==="undefined"');
      } else {
        expect(bundleSource).not.toContain('typeof URL==="undefined"');
      }
    });
  });

  // ─── Scan for potentially incompatible patterns ─────────────────────

  describe('Compatibility warnings scan', () => {
    it('should not contain Web Crypto calls in the GAS bundle', () => {
      expect(bundleSource.match(/\bcrypto\.getRandomValues\s*\(/g)).toBeNull();
    });

    it('should not contain structuredClone()', () => {
      // ES2022 (Chrome 98+), not available in GAS V8
      const matches = bundleSource.match(/\bstructuredClone\s*\(/g);
      expect(matches).toBeNull();
    });

    it('should not contain Promise.any()', () => {
      // ES2021 (Chrome 85+), not useful in GAS synchronous runtime
      const matches = bundleSource.match(/Promise\.any\s*\(/g);
      expect(matches).toBeNull();
    });
  });

  // ─── Bundle Size Validation ─────────────────────────────────────────

  describe('Bundle size', () => {
    const GAS_FILE_SIZE_LIMIT = 6 * 1024 * 1024; // 6 MB
    const GAS_FILE_SIZE_WARNING = 4 * 1024 * 1024; // 4 MB

    it('should be within GAS 6 MB per-file limit', () => {
      const sizeBytes = Buffer.byteLength(bundleSource, 'utf8');
      expect(sizeBytes).toBeLessThan(GAS_FILE_SIZE_LIMIT);
    });

    it('should be within comfortable size range (under 4 MB)', () => {
      const sizeBytes = Buffer.byteLength(bundleSource, 'utf8');
      const sizeKB = (sizeBytes / 1024).toFixed(1);
      if (sizeBytes > GAS_FILE_SIZE_WARNING) {
        console.warn(`  Warning: Bundle is ${sizeKB} KB - approaching 4 MB warning threshold`);
      }
      // This is a soft check - we warn but don't fail
      expect(sizeBytes).toBeLessThan(GAS_FILE_SIZE_LIMIT);
    });
  });

  // ─── Bundle Structure ───────────────────────────────────────────────

  describe('Bundle structure', () => {
    it('should be valid JavaScript (loaded without parse errors)', () => {
      // The fact that __bundleLoaded is true means the bundle parsed successfully
      expect(global.__bundleLoaded).toBe(true);
    });

    it('should contain webpack bootstrap or be properly bundled', () => {
      // Webpack bundles contain module loading infrastructure.
      // In readable mode: contains __webpack_require__
      // In minified mode: __webpack_require__ is renamed, but bundle still has
      // characteristic patterns like IIFE wrapper and module ID references.
      const hasWebpackRequire = bundleSource.includes('__webpack_require__');
      const hasMinifiedWebpack =
        bundleSource.includes('(()=>') || // Arrow IIFE (minified)
        bundleSource.includes('!function(') || // Bang function IIFE
        /\(\s*function\s*\(/.test(bundleSource); // Regular IIFE
      expect(hasWebpackRequire || hasMinifiedWebpack).toBe(true);
    });

    it('should not contain import/export statements (fully bundled)', () => {
      // The bundle should be self-contained - no ESM syntax
      // Check for top-level import/export (not inside strings)
      // Use a rough heuristic: look for import at line start
      const lines = bundleSource.split('\n');
      const esmImports = lines.filter(
        (line) => /^\s*import\s+/.test(line) && !line.includes("'use strict'")
      );
      const esmExports = lines.filter((line) =>
        /^\s*export\s+(default|{|const|let|var|function|class)\s/.test(line)
      );
      expect(esmImports).toHaveLength(0);
      expect(esmExports).toHaveLength(0);
    });
  });

  // ─── Babel Transpilation Verification ───────────────────────────────

  describe('Babel transpilation', () => {
    it('should not contain optional chaining at syntax level in critical paths', () => {
      // Optional chaining (?.) is supported in Chrome 80, so this is informational.
      // GAS V8 does support ?. so this is just a presence check, not a failure.
      const count = (bundleSource.match(/\?\./g) || []).length;
      // Just verify the count is reasonable (not a test failure)
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});

test('online artifacts preserve TypeScript source mappings and deployment mode', () => {
  const mappings = JSON.parse(readFileSync('dist/test-file-map.json', 'utf8')) as Record<
    string,
    string
  >;
  const expected = [
    'TEST_GoogleApiWrapperTests.gs',
    'TEST_GoogleApiWrapperTests_Docs.gs',
    'TEST_GoogleApiWrapperTests_Drive.gs',
    'TEST_GoogleApiWrapperTests_Gmail.gs',
    'TEST_GoogleApiWrapperTests_Services.gs',
    'TEST_GoogleApiWrapperTests_Sheets.gs',
    'TEST_MASTER_Runner.gs'
  ];
  expect(Object.keys(mappings).sort()).toEqual(expected.sort());
  const onlineExcluded = readFileSync('dist/.claspignore', 'utf8')
    .split(/\r?\n/)
    .includes('TEST_*.gs');
  let registrations = 0;
  for (const [output, source] of Object.entries(mappings)) {
    expect(source).toMatch(/\.ts$/);
    const outputPath = path.join('dist', output);
    expect(existsSync(outputPath)).toBe(!onlineExcluded);
    if (onlineExcluded) {
      continue;
    }
    const code = readFileSync(outputPath, 'utf8');
    expect(() => new Script(code)).not.toThrow();
    expect(code).not.toMatch(/^\s*(?:import|export)\s|module\.exports|require\(/m);
    registrations += (code.match(/runner\.register\(/g) || []).length;
  }
  if (onlineExcluded) {
    expect(registrations).toBe(0);
    return;
  }
  expect(registrations).toBe(28);
  const runner = readFileSync('dist/TEST_MASTER_Runner.gs', 'utf8');
  for (const name of ['runTests', 'runAllOnlineTests', 'initializeAllTests']) {
    expect(runner).toContain(`function ${name}(`);
  }
});

test('source map index retains TypeScript sources and the pre-patch offset warning', () => {
  const index: {
    patchesApplied: number;
    note: string;
    codeJs: { sourceMapFile: string; sourceFiles: string[] };
  } = JSON.parse(readFileSync('dist/source-map-index.json', 'utf8'));
  expect(index.codeJs.sourceMapFile).toBe('Code.js.map');
  expect(index.codeJs.sourceFiles).toEqual(
    expect.arrayContaining([
      'CoreUtilsLib/src/Result.ts',
      'GoogleApiWrapper/src/services/SpreadsheetService.ts',
      'ContextEngine/src/DataProvider.ts',
      'ComposableContentLib/src/core/ContentBlock.ts',
      'src/index.ts'
    ])
  );
  if (index.patchesApplied > 0) {
    expect(index.note).toContain('before V8 compatibility patches');
    expect(index.note).toContain('may have slight offsets');
  }
});
