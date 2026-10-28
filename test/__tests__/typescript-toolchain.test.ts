import { testing as sheetTesting } from '@SheetDBLib';
import { EnhancedTestRunner } from '@GasOnlineTestFramework';
import {
  describe as collectSuite,
  it as collectTest,
  beforeEach as collectBefore,
  afterEach as collectAfter,
  resetTestRegistry,
  runCollectedTests
} from '../offline-bundle/JestCompat.js';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import path from 'node:path';
import { transformSync } from '@babel/core';
import type { Configuration } from 'webpack';
import type { Doclet } from 'jsdoc-api';
import ts from 'typescript';

const repository = path.resolve('.');
const projects = [
  'tsconfig.json',
  'tsconfig.test.json',
  'tsconfig.tools.json',
  'tsconfig.online.json',
  'tsconfig.declarations.json',
  'tsconfig.consumer.json'
];
const libraries = [
  'ComposableContentLib',
  'ContextEngine',
  'CoreUtilsLib',
  'DomainRepositoryLib',
  'GasDataImporter',
  'GasExpressionEngineLib',
  'GasOnlineTestFramework',
  'GasResilienceLib',
  'GasSchemaValidatorLib',
  'GoogleApiWrapper',
  'JobRunnerLib',
  'PipelineFramework',
  'RoleResolutionLib',
  'SheetDBLib',
  'WorkspaceTemplateEngine'
];
const nativeConfigs = new Set([
  'babel.config.cjs',
  'eslint.config.js',
  'jest.config.cjs',
  'jest.integration.config.cjs',
  'jest.offline.config.cjs',
  'webpack.config.cjs',
  'webpack.offline-tests.config.cjs'
]);

function compilerProject(file: string): ts.ParsedCommandLine {
  const result = ts.readConfigFile(path.join(repository, file), ts.sys.readFile);
  if (result.error) {
    throw new Error(ts.flattenDiagnosticMessageText(result.error.messageText, '\n'));
  }
  const parsed = ts.parseJsonConfigFileContent(
    result.config,
    ts.sys,
    repository,
    undefined,
    path.join(repository, file)
  );
  expect(parsed.errors).toEqual([]);
  return parsed;
}

function maintainedSources(): string[] {
  return ts.sys.readDirectory(
    repository,
    ['.ts', '.cts', '.mts', '.tsx', '.js', '.cjs', '.mjs', '.jsx', '.gs'],
    [
      '**/node_modules/**',
      '**/dist/**',
      '**/.cache/**',
      '**/.git/**',
      '**/.superpowers/**',
      '**/coverage/**',
      '**/GLF_OLD/**',
      '**/.agents/**',
      '**/.codex/**'
    ]
  );
}

test('every maintained source belongs to a completed compiler project', () => {
  const inputs = new Set(
    projects.flatMap((file) => {
      const project = compilerProject(file);
      return ts
        .createProgram(project.fileNames, project.options)
        .getSourceFiles()
        .map((source) => path.resolve(source.fileName));
    })
  );
  expect(
    maintainedSources().filter(
      (file) =>
        !nativeConfigs.has(path.relative(repository, file)) && !inputs.has(path.resolve(file))
    )
  ).toEqual([]);
});

test('completed compiler projects retain strict checking and disable JavaScript inputs', () => {
  for (const file of projects) {
    const { options } = compilerProject(file);
    expect({ project: file, strict: options.strict, allowJs: options.allowJs }).toEqual({
      project: file,
      strict: true,
      allowJs: false
    });
  }
});

test('handwritten JavaScript remains limited to the native configuration entry points', () => {
  expect(
    maintainedSources()
      .map((file) => path.relative(repository, file))
      .filter((file) => /\.(?:[cm]?jsx?|gs)$/.test(file) && !nativeConfigs.has(file))
  ).toEqual([]);
});

test('all fifteen public barrels have generated declaration roots', () => {
  const project = compilerProject('tsconfig.declarations.json');
  expect(libraries).toHaveLength(15);
  expect(project.options.declaration).toBe(true);
  expect(project.options.emitDeclarationOnly).toBe(true);
  for (const library of libraries) {
    const barrel = path.join(repository, library, 'index.ts');
    expect(project.fileNames).toContain(barrel);
    const declaration = path.join(repository, '.cache/types', library, 'index.d.ts');
    expect(ts.getOutputFileNames(project, barrel, !ts.sys.useCaseSensitiveFileNames)).toContain(
      declaration
    );
    // Run build:types before this suite; missing delivery roots must fail CI.
    expect(existsSync(declaration)).toBe(true);
    const parsed = ts.createSourceFile(
      declaration,
      readFileSync(declaration, 'utf8'),
      ts.ScriptTarget.Latest
    );
    expect(parsed.statements.some(ts.isExportDeclaration)).toBe(true);
  }
});

test('Jest retains the normalized original suite discovery', () => {
  const output = execFileSync(
    process.execPath,
    [
      path.join(repository, 'node_modules/jest/bin/jest.js'),
      '--config',
      'jest.config.cjs',
      '--listTests',
      '--json',
      '--runInBand'
    ],
    { cwd: repository, encoding: 'utf8' }
  );
  const discovered: string[] = JSON.parse(output);
  const original = discovered
    .map((file) => path.relative(repository, file).split(path.sep).join('/'))
    .filter((file) => file !== 'test/__tests__/typescript-toolchain.test.ts')
    .map((file) => file.replace(/\.[cm]?[jt]sx?$/, ''))
    .sort();
  // Pin the saved pre-migration discovery, excluding this new tooling suite.
  // New/deleted/renamed suites require an explicitly reviewed fixture update.
  expect(original).toHaveLength(212);
  expect(createHash('sha256').update(original.join('\n')).digest('hex')).toBe(
    '84cd4e3fee1498112b2a82dce18efd32a2fdbe5a7a76acb371396c5072a5246a'
  );
});

test('real documentation parsing restores tags to their owning methods', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'glf-doclet-'));
  try {
    const first = path.join(root, 'One.ts');
    const second = path.join(root, 'Two.ts');
    const comment = (type: string) =>
      `/** Read a value.\n * @param {${type}} value Input.\n * @returns {${type}} Output.\n */`;
    writeFileSync(
      first,
      `/** First class. */\nexport class First {\n${comment('string')}\none(value: string): string { /** branch */ if (value) { return value; } /** retry */ try { return value; } catch { return value; } }\n${comment('number')}\ntwo(value: number): number { return value; }\n/** Count values. @returns {number} */\nget size(): number { return 2; }\n/** Static count. @returns {number} */\nstatic get LIMIT(): number { return 3; }\n}`
    );
    writeFileSync(
      second,
      `/** Second class. */\nexport class Second {\n${comment('boolean')}\nthree(value: boolean): boolean { return value; }\n}`
    );
    const { documentationData } = createRequire(path.join(repository, 'package.json'))(
      path.join(repository, '.cache/ts-tools/scripts/documentation-source.cjs')
    ) as { documentationData(files: string[], root: string): Promise<Doclet[]> };
    const data = await documentationData([first, second], root);
    expect(
      data
        .filter((item) => item.kind === 'class')
        .map((item) => item.name)
        .sort()
    ).toEqual(['First', 'Second']);
    expect(
      data
        .filter((item) => item.kind === 'member')
        .map((item) => `${item.memberof}.${item.name}`)
        .sort()
    ).toEqual(['First.LIMIT', 'First.size']);
    const methods = data.filter((item) => item.kind === 'function' && item.memberof);
    expect(methods.map((item) => `${item.memberof}.${item.name}`).sort()).toEqual([
      'First.one',
      'First.two',
      'Second.three'
    ]);
    for (const [owner, name, type, file] of [
      ['First', 'one', 'string', first],
      ['First', 'two', 'number', first],
      ['Second', 'three', 'boolean', second]
    ]) {
      const method = methods.find((item) => item.memberof === owner && item.name === name)!;
      expect(method.comment).toContain(`@param {${type}} value`);
      expect(method.comment).toContain(`@returns {${type}}`);
      expect(path.join(method.meta.path, method.meta.filename)).toBe(file);
    }
    expect(data.filter((item) => item.name === 'if' || item.name === 'catch')).toEqual([]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('documentation erases TypeScript while retaining JSDoc and source-relative paths', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'glf-docs-'));
  try {
    const file = path.join(root, 'CoreUtilsLib/Probe.ts');
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(
      file,
      '/** Probe documentation. */\nexport class Probe<T> { declare erased: T; /** Read value. */ read(value: T): T { return value; } }'
    );
    const { documentationSource, parserComment } = createRequire(path.resolve('package.json'))(
      path.resolve('.cache/ts-tools/scripts/documentation-source.cjs')
    ) as {
      documentationSource(file: string, root: string): string;
      parserComment(comment: string): string;
    };
    const output = documentationSource(file, root);
    const code = readFileSync(output, 'utf8');
    expect(output).toBe(path.join(root, '.cache/jsdoc/CoreUtilsLib/Probe.js'));
    expect(code).toContain('/** Probe documentation. */');
    expect(code).toContain('/** Read value. */');
    expect(code).not.toMatch(/<T>|declare|: T/);
    expect(
      parserComment('/** @param {{value?: "}", read: () => number}} [options] description */')
    ).toBe('/** @param {*} [options] description */');
    expect(parserComment('/** @returns {Array<{\n * value: string\n * }>} Rows. */')).toBe(
      '/** @returns {*}\n\n Rows. */'
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('compiled webpack configuration resolves the repository from another working directory', () => {
  const root = path.resolve('.');
  const configPath = path.join(root, 'webpack.config.cjs');
  const module = { exports: undefined as unknown };
  runInNewContext(readFileSync(configPath, 'utf8'), {
    require: createRequire(configPath),
    __dirname: root,
    process: { cwd: () => tmpdir() },
    module
  });
  const configure = module.exports as (env: { readable: boolean }, argv: object) => Configuration;
  const configuration = configure({ readable: true }, {});
  expect(configuration.context).toBe(root);
  expect(configuration.entry).toBe(path.join(root, 'src/index.ts'));
  expect(configuration.output!.path).toBe(path.join(root, 'dist'));
});

test('GAS Babel target erases declare fields before class transformation', () => {
  const result = transformSync(
    'class Probe { declare erased: string; value = 123; } new Probe();',
    {
      filename: 'probe.ts',
      presets: [
        [
          '@babel/preset-env',
          { targets: { chrome: '80' }, include: ['transform-class-properties'] }
        ]
      ]
    }
  );
  expect(Object.keys(runInNewContext(result!.code!))).toEqual(['value']);
});

test('offline discovery includes TypeScript tests and GasSchemaValidatorLib', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'glf-discovery-'));
  try {
    const tests = path.join(root, 'GasSchemaValidatorLib/src/__tests__');
    mkdirSync(tests, { recursive: true });
    writeFileSync(path.join(tests, 'probe.test.ts'), "test('probe', () => {});\n");
    runInNewContext(
      readFileSync('.cache/ts-tools/scripts/generate-offline-test-entry.cjs', 'utf8'),
      {
        require,
        __dirname: path.join(root, '.cache/ts-tools/scripts'),
        exports: {},
        process: { argv: [] },
        console: { log() {} }
      }
    );
    const manifest = JSON.parse(
      readFileSync(path.join(root, 'dist/.offline-test-entries/manifest.json'), 'utf8')
    );
    expect(manifest.libraries.GasSchemaValidatorLib.testFiles).toEqual([
      'GasSchemaValidatorLib/src/__tests__/probe.test.ts'
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('offline compatibility runs collected tests with the maintained GAS runner', () => {
  resetTestRegistry();
  const calls: string[] = [];
  collectSuite('probe', () => {
    collectBefore(() => calls.push('before'));
    collectAfter(() => calls.push('after'));
    collectTest('runs', () => calls.push('test'));
    collectTest.skip('skipped');
  });
  const result = runCollectedTests('probe', EnhancedTestRunner);
  expect(result).toMatchObject({ passed: 1, failed: 0, skipped: 1 });
  expect(calls).toEqual(['before', 'test', 'after']);
  resetTestRegistry();
});

test('SheetDB SDK tables support the indexed query protocol', () => {
  const table = new sheetTesting.TableServiceMock<{ id: string; name: string }>('People').setData([
    { id: 'p1', name: 'A' }
  ]);
  table._indices.name = new Map([['A', [0]]]);
  const db = new sheetTesting.DatabaseServiceMock<{ id: string; name: string }>();
  db.tables.People = table;
  expect(db.select().from('People').where('name', '=', 'A').execute()).toEqual([
    { id: 'p1', name: 'A' }
  ]);
});
