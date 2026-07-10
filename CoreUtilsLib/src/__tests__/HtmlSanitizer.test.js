import { HtmlSanitizer } from '../utils/HtmlSanitizer.js';

describe('HtmlSanitizer.escapeHtml', () => {
  test('neutralises sheet-sourced markup (security review finding)', () => {
    expect(HtmlSanitizer.escapeHtml('<img src=x onerror=alert(1)>')).toBe(
      '&lt;img src=x onerror=alert(1)&gt;'
    );
  });

  test('escapes &, <, >, ", \' (full character set)', () => {
    expect(HtmlSanitizer.escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
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
