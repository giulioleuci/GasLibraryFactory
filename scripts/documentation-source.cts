import fs = require('node:fs');
import path = require('node:path');
import { parseSync, transformFileSync } from '@babel/core';
import {
  isClassDeclaration,
  isClassMethod,
  isIdentifier,
  isStringLiteral,
  traverseFast
} from '@babel/types';
import jsdocApi from 'jsdoc-api';
import type { Doclet } from 'jsdoc-api';

// JSDoc's type grammar predates TS record/arrow types; raw comments remain in the docs.
export function parserComment(comment: string): string {
  const tags =
    /@(param|returns?|type|typedef|property|extends|implements|enum|this|throws|yields?|satisfies)\s+\{/g;
  let output = '';
  let cursor = 0;
  while (tags.exec(comment)) {
    const start = tags.lastIndex - 1;
    let depth = 1;
    let quote = '';
    let end = tags.lastIndex;
    for (; end < comment.length && depth > 0; end++) {
      const character = comment[end];
      if (quote) {
        if (character === '\\') {
          end++;
        } else if (character === quote) {
          quote = '';
        }
      } else if (character === '"' || character === "'" || character === '`') {
        quote = character;
      } else if (character === '{') {
        depth++;
      } else if (character === '}') {
        depth--;
      }
    }
    output +=
      comment.slice(cursor, start) +
      '{*}' +
      (comment.slice(start, end).match(/\n/g) || []).join('');
    cursor = end;
    tags.lastIndex = end;
  }
  return output + comment.slice(cursor);
}

// JSDoc accepts JavaScript; erase types without running the runtime transforms.
export function documentationSource(file: string, rootDir: string): string {
  const output = path
    .join(rootDir, '.cache/jsdoc', path.relative(rootDir, file))
    .replace(/\.ts$/, '.js');
  const result = transformFileSync(file, {
    babelrc: false,
    configFile: false,
    presets: file.endsWith('.ts')
      ? [[require.resolve('@babel/preset-typescript'), { allowDeclareFields: true }]]
      : [],
    comments: true,
    retainLines: true
  });
  if (!result?.code) {
    throw new Error(`No JavaScript emitted for documentation: ${file}`);
  }
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, result.code.replace(/\/\*\*[\s\S]*?\*\//g, parserComment));
  return output;
}

function symbolKey(file: string, kind: string, name: string, memberof = '', scope = '') {
  return [file, kind, memberof, scope, name].join(':');
}

// Inspect the emitted JavaScript AST, so examples and nested if/catch blocks cannot become symbols.
function sourceSymbols(file: string, original: string): Map<string, string> {
  const ast = parseSync(fs.readFileSync(file, 'utf8'), {
    filename: file,
    babelrc: false,
    configFile: false
  });
  if (!ast) {
    throw new Error(`No AST available for documentation: ${original}`);
  }
  const symbols = new Map<string, string>();
  traverseFast(ast, (node) => {
    if (!isClassDeclaration(node) || !node.id) {
      return;
    }
    const owner = node.id.name;
    symbols.set(symbolKey(original, 'class', owner), owner);
    for (const method of node.body.body) {
      if (
        !isClassMethod(method) ||
        method.kind === 'constructor' ||
        !(isIdentifier(method.key) || isStringLiteral(method.key))
      ) {
        continue;
      }
      const name = isIdentifier(method.key) ? method.key.name : method.key.value;
      const scope = method.static ? 'static' : 'instance';
      const kind = method.kind === 'method' ? 'function' : 'member';
      symbols.set(symbolKey(original, kind, name, owner, scope), `${owner}.${name}`);
    }
  });
  return symbols;
}

// Both generators use real JSDoc output and restore the source comments after parsing.
export async function documentationData(files: string[], rootDir: string): Promise<Doclet[]> {
  const sources = new Map(
    files.map((file) => [path.resolve(documentationSource(file, rootDir)), path.resolve(file)])
  );
  const expected = new Map<string, string>();
  const comments = new Map<string, { parsed: string; raw: string; line: number }[]>();
  const normalize = (comment: string) => comment.replace(/^[ \t]+/gm, '').trim();
  for (const [emitted, original] of sources) {
    for (const [key, name] of sourceSymbols(emitted, original)) {
      expected.set(key, `${original}: ${name}`);
    }
    const source = fs.readFileSync(original, 'utf8');
    comments.set(
      original,
      [...source.matchAll(/\/\*\*[\s\S]*?\*\//g)].map((match) => ({
        parsed: normalize(parserComment(match[0])),
        raw: match[0],
        line: source.slice(0, match.index).split('\n').length
      }))
    );
  }

  const data = await jsdocApi.explain({ files: [...sources.keys()], cache: false });
  const symbols = new Map<string, Doclet>();
  for (const item of data) {
    if (!item.meta) {
      continue;
    }
    const original = sources.get(path.resolve(item.meta.path, item.meta.filename));
    if (!original) {
      continue;
    }
    if (item.comment) {
      const candidates = (comments.get(original) || []).filter(
        (comment) => comment.parsed === normalize(item.comment!)
      );
      const line = item.meta.lineno ?? Number.POSITIVE_INFINITY;
      const preceding = candidates.filter((candidate) => candidate.line <= line);
      const comment = preceding[preceding.length - 1];
      if (comment) {
        item.comment = comment.raw;
      }
    }
    item.meta.path = path.dirname(original);
    item.meta.filename = path.basename(original);
    const key = symbolKey(
      original,
      item.kind,
      item.name,
      item.kind === 'class' ? '' : item.memberof,
      item.kind === 'class' ? '' : item.scope
    );
    const isClass = item.kind === 'class' && item.memberof !== item.name;
    const isMethod = (item.kind === 'function' || item.kind === 'member') && !!item.memberof;
    const isGlobal = item.kind === 'function' && !item.memberof && !item.undocumented;
    if (!(((isClass || isMethod) && expected.has(key)) || isGlobal)) {
      continue;
    }
    if (!symbols.has(key) || item.comment) {
      symbols.set(key, item);
    }
  }
  const missing = [...expected].filter(([key]) => !symbols.has(key)).map(([, name]) => name);
  if (missing.length > 0) {
    throw new Error(`JSDoc omitted ${missing.length} source symbols:\n${missing.join('\n')}`);
  }
  return [...symbols.values()];
}
