/**
 * Bundle Loading Helper for Offline Tests
 *
 * This module provides a function to load the compiled dist/Code.js bundle
 * into the Node.js global scope. It handles:
 * - Reading the bundle file
 * - Protecting and restoring critical Node.js globals (process, Buffer, etc.)
 * - Executing the bundle via vm.runInThisContext
 * - Setting global flags for test assertions
 *
 * Each test file should call loadBundle() in its top-level beforeAll().
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Save the ORIGINAL Node.js objects at module load time,
// BEFORE any bundle loading can occur.
const ORIGINAL_PROCESS = process;
const ORIGINAL_BUFFER = Buffer;
const ORIGINAL_CONSOLE = console;

let bundleLoadAttempted = false;

/**
 * Load the compiled bundle into global scope.
 * Safe to call multiple times - subsequent calls are no-ops.
 */
function loadBundle() {
  // Only load once across all test files
  if (bundleLoadAttempted) {
    return;
  }
  bundleLoadAttempted = true;

  const bundlePath = path.resolve(__dirname, '../../../dist/Code.js');

  // Check if bundle exists
  if (!fs.existsSync(bundlePath)) {
    global.__bundleError = `Bundle not found at ${bundlePath}. Run 'npm run build' first.`;
    global.__bundleLoaded = false;
    return;
  }

  try {
    // Read the bundle source
    let bundleCode = fs.readFileSync(bundlePath, 'utf-8');
    global.__bundleSource = bundleCode;

    // CRITICAL: The bundle contains gas-webpack-plugin code that assigns to global:
    //   __webpack_require__.g.process = __webpack_exports__.process;
    // This overwrites Node.js process with Zod's process function.
    // We rename these assignments to avoid collision with Node.js built-ins.
    bundleCode = bundleCode
      // Rename the global process assignment to zodProcess
      .replace(
        /__webpack_require__\.g\.process\s*=\s*__webpack_exports__\.process/g,
        '__webpack_require__.g.zodProcess = __webpack_exports__.process'
      )
      // Also handle any function process() declarations that gas-webpack-plugin creates
      .replace(/^function process\(\)/gm, 'function zodProcess()');

    // Execute the modified bundle in the global context
    // This populates global.* with all library exports via Object.assign(global, ...)
    // Using indirect eval to ensure the code runs in global scope
    const indirectEval = eval;
    indirectEval(bundleCode);

    // Ensure Node.js built-ins are still intact
    global.process = ORIGINAL_PROCESS;
    global.Buffer = ORIGINAL_BUFFER;
    global.console = ORIGINAL_CONSOLE;

    global.__bundleLoaded = true;
    global.__bundleError = null;
  } catch (error) {
    // Restore Node.js process even on error
    global.process = ORIGINAL_PROCESS;
    global.Buffer = ORIGINAL_BUFFER;
    global.console = ORIGINAL_CONSOLE;

    global.__bundleLoaded = false;
    global.__bundleError = error.message;
    ORIGINAL_CONSOLE.error('Failed to load bundle:', error.message);
    throw error;
  }
}

module.exports = { loadBundle };
