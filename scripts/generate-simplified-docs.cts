#!/usr/bin/env node

/**
 * Simplified Documentation Generator for GasLibraryFactory
 *
 * Generates simplified API documentation for all libraries in the monorepo.
 * Excludes test files (both __tests__ and __testOnline__).
 *
 * Output format for each library:
 * - Library description (from JSDoc or README)
 * - For each class: description and initialization (constructor signature)
 * - For each method: name, signature (params), and return type
 *
 * Usage:
 *   node .cache/ts-tools/scripts/generate-simplified-docs.cjs           # Simplified output (signatures only)
 *   node .cache/ts-tools/scripts/generate-simplified-docs.cjs --verbose # Include method descriptions (no examples)
 */

// Parse command line arguments
const VERBOSE_MODE = process.argv.includes('--verbose') || process.argv.includes('-v');

import fs = require('node:fs');
import path = require('node:path');
import { documentationData } from './documentation-source.cjs';
import type { Doclet } from 'jsdoc-api';

interface Parameter {
  name: string;
  type: string;
}
interface ConstructorInfo {
  params: Parameter[];
  signature: string;
}
interface MethodInfo {
  name: string;
  isStatic: boolean;
  params: Parameter[];
  returns: { type: string } | null;
  signature: string;
  description: string;
}
interface ClassInfo {
  name: string;
  description: string;
  filePath: string;
  constructor: ConstructorInfo | null;
  methods: MethodInfo[];
  staticMethods: MethodInfo[];
}
interface LibraryDoc {
  name: string;
  description: string;
  classes: ClassInfo[];
}

/**
 * Recursively finds all TypeScript source files in a directory, excluding test directories
 * @param {string} dir - Directory to search
 * @param {Array<string>} files - Accumulator for files
 * @returns {Array<string>} - Array of file paths
 */
function findSourceFiles(dir: string, files: string[] = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip test directories and node_modules
      if (
        item === '__tests__' ||
        item === '__testOnline__' ||
        item === 'node_modules' ||
        item === 'dist'
      ) {
        continue;
      }
      findSourceFiles(fullPath, files);
    } else if (
      stat.isFile() &&
      item.endsWith('.ts') &&
      !item.endsWith('.d.ts') &&
      !item.endsWith('.test.ts') &&
      !item.endsWith('.spec.ts')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// Configuration
const LIBRARIES = [
  'CoreUtilsLib',
  'GasResilienceLib',
  'GoogleApiWrapper',
  'WorkspaceTemplateEngine',
  'GasExpressionEngineLib',
  'SheetDBLib',
  'RoleResolutionLib',
  'ComposableContentLib',
  'GasProcessMonitorLib',
  'JobRunnerLib',
  'PipelineFramework',
  'ContextEngine',
  'GasDataImporter',
  'DomainRepositoryLib',
  'GasOnlineTestFramework',
  'GasSchemaValidatorLib'
];

const ROOT_DIR = path.resolve(__dirname, '../../..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs', 'API_REFERENCE.md');

/**
 * Extracts JSDoc block from file content
 * @param {string} content - File content
 * @returns {string|null} - JSDoc block or null
 */
function extractFileJsDoc(content: string) {
  const jsDocMatch = content.match(/^\/\*\*[\s\S]*?\*\//);
  if (jsDocMatch) {
    return jsDocMatch[0];
  }
  return null;
}

/**
 * Parses JSDoc to extract description (first paragraph before @tags)
 * @param {string} jsDoc - JSDoc comment block
 * @returns {string} - Description text
 */
function extractDescription(jsDoc: string | null) {
  if (!jsDoc) {
    return '';
  }

  // Remove /** and */
  let content = jsDoc.replace(/^\/\*\*\s*/, '').replace(/\s*\*\/$/, '');

  // Remove leading asterisks from each line
  content = content
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, ''))
    .join('\n');

  // Extract description (text before first @tag)
  const atTagIndex = content.search(/@\w+/);
  let description = atTagIndex > 0 ? content.substring(0, atTagIndex) : content;

  // Clean up the description
  description = description
    .replace(/@file\s+[^\n]+/g, '')
    .replace(/@description\s*/g, '')
    .replace(/@module\s+[^\n]+/g, '')
    .replace(/@version\s+[^\n]+/g, '')
    .trim();

  // Take first paragraph only (up to double newline or first markdown header)
  const firstParagraphEnd = description.search(/\n\s*\n|\n##|\n\*\*/);
  if (firstParagraphEnd > 0) {
    description = description.substring(0, firstParagraphEnd);
  }

  return description.trim();
}

/**
 * Extracts @param tags from JSDoc
 * @param {string} jsDoc - JSDoc comment block
 * @returns {Array<{name: string, type: string, description: string}>}
 */
function extractParams(jsDoc: string | null) {
  if (!jsDoc) {
    return [];
  }

  const params = [];
  const paramRegex = /@param\s+\{([^}]+)\}\s+(?:\[([^\]]+)\]|(\S+))(?:\s*-?\s*(.*))?/g;
  let match;

  while ((match = paramRegex.exec(jsDoc)) !== null) {
    const type = match[1].trim();
    const name = (match[2] || match[3] || '').trim();
    params.push({ name, type });
  }

  return params;
}

/**
 * Extracts @returns tag from JSDoc
 * @param {string} jsDoc - JSDoc comment block
 * @returns {{type: string}|null}
 */
function extractReturns(jsDoc: string | null) {
  if (!jsDoc) {
    return null;
  }

  const returnsMatch = jsDoc.match(/@returns?\s+\{([^}]+)\}/);
  if (returnsMatch) {
    return { type: returnsMatch[1].trim() };
  }
  return null;
}

/**
 * Extracts method description from JSDoc, excluding @example blocks
 * @param {string} jsDoc - JSDoc comment block
 * @returns {string} - Method description without examples
 */
function extractMethodDescription(jsDoc: string | null) {
  if (!jsDoc) {
    return '';
  }

  // Remove /** and */
  let content = jsDoc.replace(/^\/\*\*\s*/, '').replace(/\s*\*\/$/, '');

  // Remove leading asterisks from each line
  content = content
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, ''))
    .join('\n');

  // Remove @example blocks (including their content until next @tag or end)
  content = content.replace(/@example[\s\S]*?(?=@\w+|$)/g, '');

  // Extract description (text before first @tag)
  const atTagIndex = content.search(/@\w+/);
  let description = atTagIndex > 0 ? content.substring(0, atTagIndex) : content;

  // Clean up the description - remove common JSDoc tags that might remain
  description = description
    .replace(/@\w+[^\n]*/g, '') // Remove any remaining @tags
    .trim();

  // Normalize whitespace - collapse multiple newlines to single, trim lines
  description = description
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(' ');

  return description;
}

// JSDoc establishes the symbol; original comments retain their displayed parameter types.
function classDocumentation(item: Doclet, data: Doclet[], rootDir: string): ClassInfo {
  const params = extractParams(item.comment || null);
  const methods = data
    .filter(
      (method) =>
        (method.kind === 'function' || method.kind === 'member') &&
        method.memberof === item.name &&
        method.meta.path === item.meta.path &&
        method.meta.filename === item.meta.filename
    )
    .map((method): MethodInfo => {
      const params = extractParams(method.comment || null);
      const returns = extractReturns(method.comment || null);
      return {
        name: method.name,
        isStatic: method.scope === 'static',
        params,
        returns,
        signature:
          method.kind === 'member'
            ? `${method.name}: ${returns ? returns.type : 'unknown'}`
            : `${method.name}(${params.map((param) => `${param.name}: ${param.type}`).join(', ')}): ${returns ? returns.type : 'void'}`,
        description: VERBOSE_MODE ? extractMethodDescription(method.comment || null) : ''
      };
    });
  return {
    name: item.name,
    description: item.classdesc || item.description || '',
    filePath: path.relative(rootDir, path.join(item.meta.path, item.meta.filename)),
    constructor: {
      params,
      signature: `new ${item.name}(${params.map((param) => `${param.name}: ${param.type}`).join(', ')})`
    },
    methods: methods.filter((method) => !method.isStatic),
    staticMethods: methods.filter((method) => method.isStatic)
  };
}

/**
 * Gets library description from index.ts JSDoc or README.md
 * @param {string} libPath - Path to library directory
 * @returns {string} - Library description
 */
function getLibraryDescription(libPath: string) {
  // Try the typed barrel first
  const indexPath = path.join(libPath, 'index.ts');
  if (indexPath && fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    const jsDoc = extractFileJsDoc(content);
    if (jsDoc) {
      const description = extractDescription(jsDoc);
      if (description && description.length > 20) {
        return description;
      }
    }
  }

  // Fall back to README.md
  const readmePath = path.join(libPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf8');
    // Extract first paragraph after the title
    const lines = content.split('\n');
    let description = '';
    let foundTitle = false;

    for (const line of lines) {
      if (line.startsWith('#')) {
        if (foundTitle) {
          break;
        } // Stop at next heading
        foundTitle = true;
        continue;
      }
      if (foundTitle && line.trim()) {
        description += line + ' ';
        if (description.length > 200) {
          break;
        }
      }
    }

    return description.trim() || 'No description available.';
  }

  return 'No description available.';
}

/**
 * Processes a single library and returns documentation
 * @param {string} libName - Library name
 * @returns {Object} - Library documentation object
 */
async function processLibrary(libName: string) {
  console.log(`Processing ${libName}...`);

  const libPath = path.join(ROOT_DIR, libName);
  if (!fs.existsSync(libPath)) {
    throw new Error(`Library directory not found: ${libPath}`);
  }

  // Parse all maintained source files, excluding tests.
  const files = findSourceFiles(libPath);

  if (files.length === 0) {
    throw new Error(`No TypeScript sources found in ${libName}`);
  }

  const libDoc: LibraryDoc = {
    name: libName,
    description: getLibraryDescription(libPath),
    classes: []
  };

  const data = await documentationData(files, ROOT_DIR);
  libDoc.classes = data
    .filter((item) => item.kind === 'class')
    .map((item) => classDocumentation(item, data, ROOT_DIR));

  console.log(`  Found ${libDoc.classes.length} classes`);
  return libDoc;
}

/**
 * Generates markdown documentation from library docs
 * @param {Array<Object>} libraries - Array of library documentation objects
 * @returns {string} - Markdown content
 */
function generateMarkdown(libraries: (LibraryDoc | null)[]) {
  let md = '# GasLibraryFactory API Reference\n\n';
  if (VERBOSE_MODE) {
    md += '> Detailed API documentation with method descriptions. Auto-generated.\n\n';
  } else {
    md += '> Simplified API documentation for all libraries. Auto-generated.\n\n';
  }
  md += '---\n\n';

  // Table of Contents
  md += '## Table of Contents\n\n';
  for (const lib of libraries) {
    if (!lib) {
      continue;
    }
    md += `- [${lib.name}](#${lib.name.toLowerCase()})\n`;
  }
  md += '\n---\n\n';

  // Library documentation
  for (const lib of libraries) {
    if (!lib) {
      continue;
    }

    md += `## ${lib.name}\n\n`;
    md += `${lib.description}\n\n`;

    if (lib.classes.length === 0) {
      md += '*No documented classes found.*\n\n';
      md += '---\n\n';
      continue;
    }

    for (const cls of lib.classes) {
      md += `### ${cls.name}\n\n`;
      md += `**Source:** \`${cls.filePath}\`\n\n`;

      if (cls.description) {
        md += `${cls.description}\n\n`;
      }

      // Constructor / Initialization
      if (cls.constructor) {
        md += `**Initialization:**\n`;
        md += '```javascript\n';
        md += `${cls.constructor.signature}\n`;
        md += '```\n\n';
      }

      // Static Methods
      if (cls.staticMethods.length > 0) {
        md += `**Static methods and properties:**\n\n`;
        if (VERBOSE_MODE) {
          for (const method of cls.staticMethods) {
            md += `- \`${method.signature}\`\n`;
            if (method.description) {
              md += `  > ${method.description}\n`;
            }
            md += '\n';
          }
        } else {
          md += '| Method | Signature |\n';
          md += '|--------|----------|\n';
          for (const method of cls.staticMethods) {
            md += `| \`${method.name}\` | \`${method.signature}\` |\n`;
          }
          md += '\n';
        }
      }

      // Instance Methods
      if (cls.methods.length > 0) {
        md += `**Methods and properties:**\n\n`;
        if (VERBOSE_MODE) {
          for (const method of cls.methods) {
            md += `- \`${method.signature}\`\n`;
            if (method.description) {
              md += `  > ${method.description}\n`;
            }
            md += '\n';
          }
        } else {
          md += '| Method | Signature |\n';
          md += '|--------|----------|\n';
          for (const method of cls.methods) {
            md += `| \`${method.name}\` | \`${method.signature}\` |\n`;
          }
          md += '\n';
        }
      }

      md += '\n';
    }

    md += '---\n\n';
  }

  return md;
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Simplified Documentation Generator for GasLibraryFactory');
  console.log('='.repeat(60));
  if (VERBOSE_MODE) {
    console.log('Mode: VERBOSE (including method descriptions, excluding examples)');
  } else {
    console.log('Mode: SIMPLIFIED (signatures only)');
    console.log('Tip: Use --verbose flag to include method descriptions');
  }
  console.log('');

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Process all libraries
  const libraries = [];
  for (const libName of LIBRARIES) {
    const libDoc = await processLibrary(libName);
    if (libDoc) {
      libraries.push(libDoc);
    }
  }

  // Generate markdown
  const markdown = generateMarkdown(libraries);

  // Write output file
  fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');

  // Also write one standalone document for every library.
  for (const lib of libraries) {
    const libraryOutput = path.join(outputDir, `${lib.name}.md`);
    fs.writeFileSync(libraryOutput, generateMarkdown([lib]), 'utf8');
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`Documentation generated: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log(`Individual library files generated: ${libraries.length}`);
  console.log(`Total libraries processed: ${libraries.length}`);
  console.log(
    `Total classes documented: ${libraries.reduce((sum, lib) => sum + (lib ? lib.classes.length : 0), 0)}`
  );
  console.log('='.repeat(60));
}

// Run
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
