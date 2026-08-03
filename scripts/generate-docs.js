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
  'GasProcessMonitorLib',
  'GasSchemaValidatorLib'
];

// This script lives in scripts/; the monorepo root is its parent directory.
const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'DOCS_LIBS');

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

// --- FALLBACK PARSER FOR TS / MODERN JSDOC SYNTAX ---

function extractDescriptionFromJsDoc(jsDoc) {
  if (!jsDoc) return '';
  let content = jsDoc.replace(/^\/\*\*\s*/, '').replace(/\s*\*\/$/, '');
  content = content
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, ''))
    .join('\n');
  const atTagIndex = content.search(/@\w+/);
  let description = atTagIndex > 0 ? content.substring(0, atTagIndex) : content;
  return description
    .replace(/@file\s+[^\n]+/g, '')
    .replace(/@description\s*/g, '')
    .replace(/@module\s+[^\n]+/g, '')
    .replace(/@version\s+[^\n]+/g, '')
    .trim();
}

function extractParamsFromJsDoc(jsDoc, rawParamsStr) {
  const params = [];
  if (jsDoc) {
    const paramRegex = /@param\s+(?:\{([^}]+)\}\s+)?(?:\[([^\]]+)\]|(\S+))/g;
    let m;
    while ((m = paramRegex.exec(jsDoc)) !== null) {
      const name = (m[2] || m[3] || '').split('=')[0].trim();
      if (name) {
        params.push({ name, type: m[1] ? { names: [m[1].trim()] } : undefined });
      }
    }
  }
  if (params.length === 0 && rawParamsStr && rawParamsStr.trim()) {
    rawParamsStr.split(',').forEach((p) => {
      const clean = p.trim().split('=')[0].trim();
      if (clean) params.push({ name: clean });
    });
  }
  return params;
}

function extractReturnsFromJsDoc(jsDoc) {
  if (!jsDoc) return [];
  const returnsMatch = jsDoc.match(/@returns?\s+(?:\{([^}]+)\})?/);
  if (returnsMatch) {
    return [{ type: returnsMatch[1] ? { names: [returnsMatch[1].trim()] } : undefined }];
  }
  return [];
}

function fallbackParseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dir = path.dirname(filePath);
  const filename = path.basename(filePath);
  const items = [];

  const classRegex = /(\/\*\*[\s\S]*?\*\/)?\s*(?:export\s+)?class\s+(\w+)/g;
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    const jsDoc = match[1] || '';
    const className = match[2];
    const desc = extractDescriptionFromJsDoc(jsDoc);

    items.push({
      kind: 'class',
      name: className,
      description: desc,
      classdesc: desc,
      comment: jsDoc || '/** Class definition */',
      meta: { path: dir, filename: filename }
    });

    const classStart = content.indexOf('{', match.index);
    if (classStart !== -1) {
      let braceCount = 0;
      let classEnd = classStart;
      let foundStart = false;

      for (let i = classStart; i < content.length; i++) {
        if (content[i] === '{') {
          braceCount++;
          foundStart = true;
        } else if (content[i] === '}') {
          braceCount--;
          if (foundStart && braceCount === 0) {
            classEnd = i;
            break;
          }
        }
      }

      const classBody = content.substring(classStart, classEnd + 1);
      const methodRegex = /(\/\*\*[\s\S]*?\*\/)?\s*(static\s+)?(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*\{/g;
      let mMatch;

      while ((mMatch = methodRegex.exec(classBody)) !== null) {
        const mJsDoc = mMatch[1] || '';
        const isStatic = !!mMatch[2];
        const methodName = mMatch[3];

        if (methodName === 'constructor' || methodName.startsWith('_') || methodName === 'get') {
          continue;
        }

        const params = extractParamsFromJsDoc(mJsDoc, mMatch[4]);
        const returns = extractReturnsFromJsDoc(mJsDoc);
        const mDesc = extractDescriptionFromJsDoc(mJsDoc);

        items.push({
          kind: 'function',
          name: methodName,
          memberof: className,
          scope: isStatic ? 'static' : 'instance',
          comment: mJsDoc || `/** Method ${methodName} */`,
          description: mDesc,
          meta: { path: dir, filename: filename },
          params: params,
          returns: returns
        });
      }
    }
  }

  return items;
}

// --- MAIN PROCESS ---

async function processLibrary(libName) {
  console.log(`[PROCESS] Analysing ${libName}...`);
  const libPath = path.join(ROOT_DIR, libName);

  if (!fs.existsSync(libPath)) {
    console.warn(`  [WARN] Directory not found: ${libPath}`);
    return;
  }

  const files = globSync(`${libPath}/**/*.{js,gs}`, {
    ignore: ['**/__tests__/**', '**/__testOnline__/**']
  });

  if (files.length === 0) {
    console.warn(`  [WARN] No .js or .gs files found in ${libName}`);
    return;
  }

  let data = [];
  try {
    data = await jsdocApi.explain({ files, cache: false });
  } catch (err) {
    console.warn(
      `  [WARN] JSDoc batch parsing failed for ${libName}. Fast fallback to regex parsing...`
    );
    for (const file of files) {
      const fallbackItems = fallbackParseFile(file);
      data.push(...fallbackItems);
    }
  }

  try {
    const validData = data.filter(
      (item) => !item.undocumented && (item.kind === 'class' || item.kind === 'function')
    );

    if (validData.length === 0) {
      console.warn(`  [WARN] JSDoc found no documented symbols in ${libName}`);
    }

    const markdownContent = generateMarkdown(libName, validData);

    const outputPath = path.join(OUTPUT_DIR, `${libName}.md`);
    fs.writeFileSync(outputPath, markdownContent);
    console.log(
      `  [SUCCESS] Generated docs for ${libName} -> ${path.relative(ROOT_DIR, outputPath)}`
    );
  } catch (err) {
    console.error(`  [ERROR] Failed to generate markdown for ${libName}:`, err.message);
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

