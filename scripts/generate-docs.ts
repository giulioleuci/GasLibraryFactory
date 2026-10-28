#!/usr/bin/env node

/**
 * RE-DESIGNED LLM DOC GENERATOR (ROBUST VERSION)
 * Uses: jsdoc-api (direct parsing), glob (file finding)
 *
 * Converted to ES Modules
 */

import fs from 'fs';
import path from 'path';
import type { Doclet } from 'jsdoc-api';
import { documentationData } from './documentation-source.cjs';
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
  'GasSchemaValidatorLib'
];

// Compiled tools retain scripts/ under .cache/ts-tools/.
const ROOT_DIR = path.resolve(__dirname, '../../..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'DOCS_LIBS');

// --- HELPER FUNCTIONS ---

/**
 * Builds the simulated syntax for LLM usage
 */
function buildUsage(item: Doclet) {
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
    if (item.kind === 'member') {
      const target =
        item.scope === 'static'
          ? parentName
          : parentName.charAt(0).toLowerCase() + parentName.slice(1);
      return `const result = ${target}.${item.name};`;
    }
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
function formatComment(comment: string | undefined) {
  if (!comment) {
    return '/** No comment available */';
  }
  return comment.trim();
}

/**
 * Generates Markdown content from parsed JSDoc data
 */
function generateMarkdown(libName: string, data: Doclet[]) {
  let doc = `# API Reference: ${libName}\n\n`;

  // Filter relevant items
  const classes = data.filter((i) => i.kind === 'class');
  const functions = data.filter((i) => i.kind === 'function');
  const members = data.filter((i) => i.kind === 'function' || i.kind === 'member');

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
    const methods = members.filter(
      (f) =>
        f.memberof === cls.name &&
        f.meta.path === cls.meta.path &&
        f.meta.filename === cls.meta.filename
    );

    if (methods.length > 0) {
      doc += `### Methods and properties of ${cls.name}\n\n`;
      methods.forEach((m) => {
        doc += `#### ${m.kind === 'member' ? 'PROPERTY' : 'METHOD'}: ${cls.name}.${m.name}\n`;
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

async function processLibrary(libName: string) {
  console.log(`[PROCESS] Analysing ${libName}...`);
  const libPath = path.join(ROOT_DIR, libName);

  if (!fs.existsSync(libPath)) {
    throw new Error(`Library directory not found: ${libPath}`);
  }

  const files = globSync(`${libPath}/**/*.ts`, {
    ignore: ['**/__tests__/**', '**/__testOnline__/**', '**/*.d.ts']
  });

  if (files.length === 0) {
    throw new Error(`No TypeScript source files found in ${libName}`);
  }

  const validData = await documentationData(files, ROOT_DIR);

  try {
    if (validData.length === 0) {
      throw new Error(`JSDoc found no source symbols in ${libName}`);
    }

    const markdownContent = generateMarkdown(libName, validData);

    const outputPath = path.join(OUTPUT_DIR, `${libName}.md`);
    fs.writeFileSync(outputPath, markdownContent);
    console.log(
      `  [SUCCESS] Generated docs for ${libName} -> ${path.relative(ROOT_DIR, outputPath)}`
    );
  } catch (err) {
    console.error(`  [ERROR] Failed to generate markdown for ${libName}:`, (err as Error).message);
    process.exitCode = 1;
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

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
