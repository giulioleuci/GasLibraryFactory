#!/usr/bin/env node

/**
 * RE-DESIGNED LLM DOC GENERATOR (ROBUST VERSION)
 * Uses: jsdoc-api (direct parsing), glob (file finding)
 *
 * Converted to ES Modules
 */

import fs from 'fs';
import path from 'path';
import jsdocApi from 'jsdoc-api';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
const LIBRARIES = [
  'ContextEngine',
  'CoreUtilsLib',
  'PipelineFramework',
  'DomainRepositoryLib',
  'GasDataImporter',
  'GasExpressionEngineLib',
  'GasOnlineTestFramework',
  'SheetDBLib',
  'GasResilienceLib',
  'GoogleApiWrapper',
  'JobRunnerLib',
  'WorkspaceTemplateEngine',
  'RoleResolutionLib',
  'ComposableContentLib',
  'GasProcessMonitorLib'
];

// This script lives in scripts/; the monorepo root is its parent directory.
const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'docs');

// --- HELPER FUNCTIONS ---

/**
 * Builds the simulated syntax for LLM usage
 */
function buildUsage(item) {
  const params = item.params ? item.params.map((p) => p.name).join(', ') : '';

  // Logic for Return values
  let returns = '';
  if (item.returns && item.returns.length > 0) {
    returns = 'const result = ';
  }

  // 1. Class Constructor
  if (item.kind === 'class') {
    return `const instance = new ${item.name}(${params});`;
  }

  // 2. Methods (Static or Instance)
  if (item.memberof) {
    const parentName = item.memberof;
    // Check if it is static
    if (item.scope === 'static') {
      return `${returns}${parentName}.${item.name}(${params});`;
    }
    // Instance method assumption
    const instanceName = parentName.charAt(0).toLowerCase() + parentName.slice(1);
    return `${returns}${instanceName}.${item.name}(${params});`;
  }

  // 3. Global Functions
  return `${returns}${item.name}(${params});`;
}

/**
 * Clean up raw JSDoc comment for markdown display
 */
function formatComment(comment) {
  if (!comment) {
    return '/** No comment available */';
  }
  return comment.trim();
}

/**
 * Generates Markdown content from parsed JSDoc data
 */
function generateMarkdown(libName, data) {
  let doc = `# API Reference: ${libName}\n\n`;

  // Filter relevant items
  const classes = data.filter((i) => i.kind === 'class');
  const functions = data.filter((i) => i.kind === 'function');

  // Separate Global Functions from Methods
  const globalFunctions = functions.filter((f) => !f.memberof);

  // --- CLASSES ---
  classes.forEach((cls) => {
    const relPath = path.relative(ROOT_DIR, path.join(cls.meta.path, cls.meta.filename));

    doc += `## CLASS: ${cls.name}\n`;
    doc += `**File Path:** \`${relPath}\`\n`;
    doc += `**Constructor Usage:** \`${buildUsage(cls)}\`\n`;
    doc += `**Description:** ${cls.classdesc || cls.description || 'N/A'}\n\n`;

    doc += `### Raw JSDoc Context:\n\`\`\`javascript\n${formatComment(cls.comment)}\n\`\`\`\n\n`;

    // Find methods for this class
    const methods = functions.filter((f) => f.memberof === cls.name);

    if (methods.length > 0) {
      doc += `### Methods of ${cls.name}\n\n`;
      methods.forEach((m) => {
        // Skip constructors inside methods list if JSDoc duplicated them
        if (m.kind === 'class') {
          return;
        }

        doc += `#### METHOD: ${cls.name}.${m.name}\n`;
        doc += `- **Scope:** ${m.scope || 'instance'}\n`;
        doc += `- **LLM Call Syntax:** \`${buildUsage(m)}\`\n`;
        doc += `- **Pure JSDoc:**\n\`\`\`javascript\n${formatComment(m.comment)}\n\`\`\`\n`;
        doc += `---\n`;
      });
    }
    doc += `<br>\n\n`;
  });

  // --- GLOBAL FUNCTIONS ---
  if (globalFunctions.length > 0) {
    doc += `## GLOBAL FUNCTIONS\n\n`;
    globalFunctions.forEach((g) => {
      const gPath = path.relative(ROOT_DIR, path.join(g.meta.path, g.meta.filename));
      doc += `### FUNCTION: ${g.name}\n`;
      doc += `- **Source:** \`${gPath}\`\n`;
      doc += `- **LLM Call Syntax:** \`${buildUsage(g)}\`\n`;
      doc += `- **Pure JSDoc:**\n\`\`\`javascript\n${formatComment(g.comment)}\n\`\`\`\n\n`;
      doc += `---\n`;
    });
  }

  return doc;
}

// --- MAIN PROCESS ---

async function processLibrary(libName) {
  console.log(`[PROCESS] Analysing ${libName}...`);
  const libPath = path.join(ROOT_DIR, libName);

  if (!fs.existsSync(libPath)) {
    console.warn(`  [WARN] Directory not found: ${libPath}`);
    return;
  }

  // 1. Find files using glob (handles .js and .gs recursively)
  // We explicitly search for .js and .gs
  const files = globSync(`${libPath}/**/*.{js,gs}`);

  if (files.length === 0) {
    console.warn(`  [WARN] No .js or .gs files found in ${libName}`);
    return;
  }

  try {
    // 2. Parse with jsdoc-api
    // We pass the files array directly so config patterns don't ignore .gs
    const data = await jsdocApi.explain({
      files: files,
      cache: false // Disable cache to ensure fresh reads
    });

    // 3. Filter out junk (undocumented code if necessary, or internal package objects)
    // Keeping everything that has a 'kind' is usually safer.
    const validData = data.filter(
      (item) => !item.undocumented && (item.kind === 'class' || item.kind === 'function')
    );

    if (validData.length === 0) {
      console.warn(`  [WARN] JSDoc found no documented symbols in ${libName}`);
    }

    // 4. Generate Content
    const markdownContent = generateMarkdown(libName, validData);

    // 5. Write to File
    const outputPath = path.join(OUTPUT_DIR, `${libName}.md`);
    fs.writeFileSync(outputPath, markdownContent);
    console.log(
      `  [SUCCESS] Generated docs for ${libName} -> ${path.relative(ROOT_DIR, outputPath)}`
    );
  } catch (err) {
    console.error(`  [ERROR] Failed to process ${libName}:`, err.message);
    if (err.cause) {
      console.error(err.cause);
    }
  }
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Starting JSDoc extraction for LLM Context...');

  for (const lib of LIBRARIES) {
    await processLibrary(lib);
  }

  console.log('\nDone.');
}

run();
