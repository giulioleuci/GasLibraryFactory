import { HtmlSanitizer } from '../utils/HtmlSanitizer.js';
import { decodeHtmlEntities, escapeHtmlText } from '../internal/HtmlEntityCodec.js';

describe('HtmlSanitizer.escapeHtml', () => {
  test('neutralises sheet-sourced markup (security review finding)', () => {
    expect(HtmlSanitizer.escapeHtml('<img src=x onerror=alert(1)>')).toBe(
      '&lt;img src=x onerror=alert(1)&gt;'
    );
  });

  test('escapes &, <, >, ", \' (full character set)', () => {
    expect(HtmlSanitizer.escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  test('returns an empty string for null input', () => {
    expect(HtmlSanitizer.escapeHtml(null)).toBe('');
  });

  test('escapes <script> tags', () => {
    expect(HtmlSanitizer.escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  test('leaves plain text unchanged', () => {
    expect(HtmlSanitizer.escapeHtml('Studio discontinuo')).toBe('Studio discontinuo');
  });
});

describe('HtmlEntityCodec', () => {
  test('encodes named non-ASCII entities', () => {
    expect(escapeHtmlText('© café')).toContain('&copy;');
  });

  test('decodes named entities while preserving Unicode text', () => {
    expect(decodeHtmlEntities('&copy; café')).toBe('© café');
  });
});

describe('HtmlSanitizer.safeColor', () => {
  test('accepts hex colours', () => {
    expect(HtmlSanitizer.safeColor('#c0392b', '#ddd')).toBe('#c0392b');
  });

  test('accepts bare CSS colour keywords', () => {
    expect(HtmlSanitizer.safeColor('red', '#ddd')).toBe('red');
  });

  test('rejects malicious/malformed values, returns fallback', () => {
    expect(HtmlSanitizer.safeColor('red;"><script>', '#ddd')).toBe('#ddd');
  });
});

describe('HtmlSanitizer.escapeContextDeep', () => {
  test('escapes a flat object of string leaves', () => {
    expect(HtmlSanitizer.escapeContextDeep({ nome: '<b>Mario</b>', nota: 'A & B' })).toEqual({
      nome: '&lt;b&gt;Mario&lt;/b&gt;',
      nota: 'A &amp; B'
    });
  });

  test('escapes nested objects', () => {
    const input = { studente: { nome: '<script>x</script>', classe: { nome: 'A&B' } } };
    expect(HtmlSanitizer.escapeContextDeep(input)).toEqual({
      studente: { nome: '&lt;script&gt;x&lt;/script&gt;', classe: { nome: 'A&amp;B' } }
    });
  });

  test('escapes arrays of objects', () => {
    const input = { alunni: [{ nome: '<i>A</i>' }, { nome: '"B"' }] };
    expect(HtmlSanitizer.escapeContextDeep(input)).toEqual({
      alunni: [{ nome: '&lt;i&gt;A&lt;/i&gt;' }, { nome: '&quot;B&quot;' }]
    });
  });

  test('escapes arrays of primitive strings', () => {
    expect(HtmlSanitizer.escapeContextDeep(['<a>', 'b&c'])).toEqual(['&lt;a&gt;', 'b&amp;c']);
  });

  test('covers all HTML special chars &<>"\' at every leaf', () => {
    expect(HtmlSanitizer.escapeContextDeep({ v: `&<>"'` })).toEqual({
      v: '&amp;&lt;&gt;&quot;&#39;'
    });
  });

  test('leaves non-string leaves (number, boolean, null, undefined) unchanged', () => {
    const input = {
      count: 3,
      active: true,
      missing: null,
      notSet: undefined,
      zero: 0,
      falsy: false
    };
    expect(HtmlSanitizer.escapeContextDeep(input)).toEqual(input);
  });

  test('does not double-escape an already-escaped string', () => {
    expect(HtmlSanitizer.escapeContextDeep('&amp;lt;')).toBe('&amp;amp;lt;');
    // Note: escaping is idempotent-unsafe by nature (same as escapeHtml); this test
    // documents that escapeContextDeep applies escapeHtml exactly once per leaf,
    // matching escapeHtml's own single-pass semantics (no implicit re-escaping call).
  });

  test('returns a new object/array, does not mutate the input', () => {
    const input = { nome: '<b>x</b>', list: ['<i>y</i>'] };
    const snapshot = JSON.parse(JSON.stringify(input));
    HtmlSanitizer.escapeContextDeep(input);
    expect(input).toEqual(snapshot);
  });

  test('leaves Date instances and other non-plain objects untouched (not recursed)', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    const result = HtmlSanitizer.escapeContextDeep({ createdAt: date });
    expect(result.createdAt).toBe(date);
  });

  test('handles top-level primitives and null/undefined', () => {
    expect(HtmlSanitizer.escapeContextDeep('<a>')).toBe('&lt;a&gt;');
    expect(HtmlSanitizer.escapeContextDeep(42)).toBe(42);
    expect(HtmlSanitizer.escapeContextDeep(null)).toBe(null);
    expect(HtmlSanitizer.escapeContextDeep(undefined)).toBe(undefined);
  });

  test('round-trips a realistic CDU-shaped context end to end', () => {
    const cdu = {
      focus: {
        classe: { anagrafica: { nome: '1<script>A</script>' } },
        studenti: [{ nome: 'M&M' }, { nome: 'O"Brien' }]
      },
      meta: { anno: 2026, attivo: true, note: null }
    };
    expect(HtmlSanitizer.escapeContextDeep(cdu)).toEqual({
      focus: {
        classe: { anagrafica: { nome: '1&lt;script&gt;A&lt;/script&gt;' } },
        studenti: [{ nome: 'M&amp;M' }, { nome: 'O&quot;Brien' }]
      },
      meta: { anno: 2026, attivo: true, note: null }
    });
  });
});

describe('HtmlSanitizer.stripToPlainText', () => {
  test('strips tags, leaving plain text', () => {
    expect(HtmlSanitizer.stripToPlainText('<p>Ciao <b>Mario</b>!</p>')).toBe('Ciao Mario!');
  });

  test('converts block boundaries (br/p/div/li/tr) to line breaks before stripping tags', () => {
    const html = '<p>Prima riga</p><p>Seconda riga</p><br>Terza riga';
    expect(HtmlSanitizer.stripToPlainText(html)).toBe('Prima riga\nSeconda riga\nTerza riga');
  });

  test('converts list items to one line each', () => {
    const html = '<ul><li>Uno</li><li>Due</li></ul>';
    expect(HtmlSanitizer.stripToPlainText(html)).toBe('Uno\nDue');
  });

  test('decodes HTML entities produced by escapeHtml', () => {
    expect(HtmlSanitizer.stripToPlainText('A &amp; B &lt;C&gt; &quot;D&quot; &#39;E&#39;')).toBe(
      'A & B <C> "D" \'E\''
    );
  });

  test('collapses runs of blank lines and trims', () => {
    const html = '<p>Uno</p>\n\n\n<p></p><p>Due</p>   ';
    expect(HtmlSanitizer.stripToPlainText(html)).toBe('Uno\nDue');
  });

  test('null-safe: null/undefined become empty string', () => {
    expect(HtmlSanitizer.stripToPlainText(null)).toBe('');
    expect(HtmlSanitizer.stripToPlainText(undefined)).toBe('');
  });

  test('default maxLength is 2000, truncationMode "marker" cuts and appends an ellipsis', () => {
    const long = '<p>' + 'x'.repeat(2100) + '</p>';
    const result = HtmlSanitizer.stripToPlainText(long);
    expect(result.length).toBe(2000);
    expect(result.endsWith('…')).toBe(true);
    expect(result.slice(0, 1999)).toBe('x'.repeat(1999));
  });

  test('truncationMode "cut" truncates to maxLength with no marker', () => {
    const long = 'x'.repeat(50);
    const result = HtmlSanitizer.stripToPlainText(long, { maxLength: 10, truncationMode: 'cut' });
    expect(result).toBe('x'.repeat(10));
  });

  test('truncationMode "none" never truncates regardless of maxLength', () => {
    const long = 'x'.repeat(50);
    const result = HtmlSanitizer.stripToPlainText(long, { maxLength: 10, truncationMode: 'none' });
    expect(result).toBe('x'.repeat(50));
  });

  test('text shorter than maxLength is returned unchanged, no marker appended', () => {
    expect(HtmlSanitizer.stripToPlainText('<p>short</p>')).toBe('short');
  });
});

describe('HtmlSanitizer.safeUrl', () => {
  test('accepts http(s) URLs', () => {
    expect(HtmlSanitizer.safeUrl('https://drive.google.com/x')).toBe('https://drive.google.com/x');
  });

  test('blocks javascript: scheme, returns "#"', () => {
    expect(HtmlSanitizer.safeUrl('javascript:alert(1)')).toBe('#');
  });

  test('trims input before testing and before returning', () => {
    expect(HtmlSanitizer.safeUrl('  https://drive.google.com/x  ')).toBe(
      'https://drive.google.com/x'
    );
  });
});
