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
 *   node scripts/generate-simplified-docs.cjs           # Simplified output (signatures only)
 *   node scripts/generate-simplified-docs.cjs --verbose # Include method descriptions (no examples)
 */

// Parse command line arguments
const VERBOSE_MODE = process.argv.includes('--verbose') || process.argv.includes('-v');

const fs = require('fs');
const path = require('path');

/**
 * Recursively finds all .js files in a directory, excluding test directories
 * @param {string} dir - Directory to search
 * @param {Array<string>} files - Accumulator for files
 * @returns {Array<string>} - Array of file paths
 */
function findJsFiles(dir, files = []) {
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
      findJsFiles(fullPath, files);
    } else if (
      stat.isFile() &&
      item.endsWith('.js') &&
      !item.endsWith('.test.js') &&
      !item.endsWith('.spec.js')
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
  'JobRunnerLib',
  'PipelineFramework',
  'ContextEngine',
  'GasDataImporter',
  'DomainRepositoryLib',
  'GasOnlineTestFramework',
  'GasProcessMonitorLib'
];

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs', 'API_REFERENCE.md');

/**
 * Extracts JSDoc block from file content
 * @param {string} content - File content
 * @returns {string|null} - JSDoc block or null
 */
function extractFileJsDoc(content) {
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
function extractDescription(jsDoc) {
  if (!jsDoc) return '';

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
function extractParams(jsDoc) {
  if (!jsDoc) return [];

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
function extractReturns(jsDoc) {
  if (!jsDoc) return null;

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
function extractMethodDescription(jsDoc) {
  if (!jsDoc) return '';

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

/**
 * Parses a class from file content
 * @param {string} content - File content
 * @param {string} filePath - File path for reference
 * @returns {Array<Object>} - Array of class info objects
 */
function parseClasses(content, filePath) {
  const classes = [];

  // Match class declarations with preceding JSDoc
  const classRegex = /\/\*\*[\s\S]*?\*\/\s*(?:export\s+)?class\s+(\w+)/g;
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const className = match[1];
    const jsDocEnd = fullMatch.lastIndexOf('*/');
    const jsDoc = fullMatch.substring(0, jsDocEnd + 2);

    const classInfo = {
      name: className,
      description: extractDescription(jsDoc),
      filePath: filePath,
      constructor: null,
      methods: [],
      staticMethods: []
    };

    // Find class body to search for constructor
    const classBodyStart = content.indexOf('{', match.index);
    if (classBodyStart !== -1) {
      // Find the constructor within the class body
      const constructorWithJsDocRegex = /\/\*\*[\s\S]*?\*\/\s*constructor\s*\([^)]*\)/;
      const plainConstructorRegex = /constructor\s*\([^)]*\)/;

      // Search in the content after the class declaration
      const classContent = content.substring(classBodyStart);

      // Try to find constructor with JSDoc first
      const constructorWithJsDocMatch = constructorWithJsDocRegex.exec(classContent);
      if (constructorWithJsDocMatch) {
        const jsDoc = constructorWithJsDocMatch[0].match(/\/\*\*[\s\S]*?\*\//)?.[0] || '';
        const params = extractParams(jsDoc);

        classInfo.constructor = {
          params: params,
          signature: `new ${className}(${params.map((p) => `${p.name}: ${p.type}`).join(', ')})`
        };
      } else {
        // No JSDoc, just find constructor
        const plainMatch = plainConstructorRegex.exec(classContent);
        if (plainMatch) {
          classInfo.constructor = {
            params: [],
            signature: `new ${className}()`
          };
        }
      }
    }

    classes.push(classInfo);
  }

  return classes;
}

/**
 * Parses methods from a class in file content
 * @param {string} content - File content
 * @param {string} className - Name of the class to find methods for
 * @returns {Array<Object>} - Array of method info objects
 */
function parseMethods(content, className) {
  const methods = [];
  const staticMethods = [];

  // Find the class body
  const classStart = content.search(new RegExp(`class\\s+${className}\\s*(?:extends\\s+\\w+\\s*)?\\{`));
  if (classStart === -1) return { methods, staticMethods };

  // Find matching closing brace for class
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

  // Match methods with JSDoc (excluding private methods starting with _)
  const methodRegex = /\/\*\*[\s\S]*?\*\/\s*(static\s+)?(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*\{/g;
  let match;

  while ((match = methodRegex.exec(classBody)) !== null) {
    const fullMatch = match[0];
    const isStatic = !!match[1];
    const methodName = match[2];
    const rawParams = match[3];

    // Skip constructor, private methods, and getters
    if (methodName === 'constructor' || methodName.startsWith('_') || methodName === 'get') {
      continue;
    }

    const jsDocEnd = fullMatch.lastIndexOf('*/');
    const jsDoc = fullMatch.substring(0, jsDocEnd + 2);

    const params = extractParams(jsDoc);
    const returns = extractReturns(jsDoc);
    const description = VERBOSE_MODE ? extractMethodDescription(jsDoc) : '';

    // Build signature
    const paramSignature = params.map((p) => `${p.name}: ${p.type}`).join(', ');
    const returnType = returns ? returns.type : 'void';

    const methodInfo = {
      name: methodName,
      isStatic: isStatic,
      params: params,
      returns: returns,
      signature: `${methodName}(${paramSignature}): ${returnType}`,
      description: description
    };

    if (isStatic) {
      staticMethods.push(methodInfo);
    } else {
      methods.push(methodInfo);
    }
  }

  return { methods, staticMethods };
}

/**
 * Gets library description from index.js JSDoc or README.md
 * @param {string} libPath - Path to library directory
 * @returns {string} - Library description
 */
function getLibraryDescription(libPath) {
  // Try index.js first
  const indexPath = path.join(libPath, 'index.js');
  if (fs.existsSync(indexPath)) {
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
        if (foundTitle) break; // Stop at next heading
        foundTitle = true;
        continue;
      }
      if (foundTitle && line.trim()) {
        description += line + ' ';
        if (description.length > 200) break;
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
function processLibrary(libName) {
  console.log(`Processing ${libName}...`);

  const libPath = path.join(ROOT_DIR, libName);
  if (!fs.existsSync(libPath)) {
    console.warn(`  Warning: Directory not found: ${libPath}`);
    return null;
  }

  // Find all .js files, excluding tests
  const files = findJsFiles(libPath);

  if (files.length === 0) {
    console.warn(`  Warning: No source files found in ${libName}`);
    return null;
  }

  const libDoc = {
    name: libName,
    description: getLibraryDescription(libPath),
    classes: []
  };

  // Process each file
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(ROOT_DIR, file);

    // Parse classes
    const classes = parseClasses(content, relativePath);

    for (const classInfo of classes) {
      // Parse methods for this class
      const { methods, staticMethods } = parseMethods(content, classInfo.name);
      classInfo.methods = methods;
      classInfo.staticMethods = staticMethods;

      // Only add classes that have meaningful content
      if (classInfo.name && !classInfo.name.startsWith('_')) {
        libDoc.classes.push(classInfo);
      }
    }
  }

  console.log(`  Found ${libDoc.classes.length} classes`);
  return libDoc;
}

/**
 * Generates markdown documentation from library docs
 * @param {Array<Object>} libraries - Array of library documentation objects
 * @returns {string} - Markdown content
 */
function generateMarkdown(libraries) {
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
    if (!lib) continue;
    md += `- [${lib.name}](#${lib.name.toLowerCase()})\n`;
  }
  md += '\n---\n\n';

  // Library documentation
  for (const lib of libraries) {
    if (!lib) continue;

    md += `## ${lib.name}\n\n`;
    md += `${lib.description}\n\n`;

    if (lib.classes.length === 0) {
      md += '*No documented classes found.*\n\n';
      md += '---\n\n';
      continue;
    }

    for (const cls of lib.classes) {
      md += `### ${cls.name}\n\n`;

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
        md += `**Static Methods:**\n\n`;
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
        md += `**Methods:**\n\n`;
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
function main() {
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
    const libDoc = processLibrary(libName);
    if (libDoc) {
      libraries.push(libDoc);
    }
  }

  // Generate markdown
  const markdown = generateMarkdown(libraries);

  // Write output file
  fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');

  console.log('');
  console.log('='.repeat(60));
  console.log(`Documentation generated: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log(`Total libraries processed: ${libraries.length}`);
  console.log(`Total classes documented: ${libraries.reduce((sum, lib) => sum + (lib ? lib.classes.length : 0), 0)}`);
  console.log('='.repeat(60));
}

// Run
main();
