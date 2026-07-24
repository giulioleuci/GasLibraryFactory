import { TextStyleMapper } from '../TextStyleMapper';

describe('TextStyleMapper', () => {
  beforeEach(() => {
    global.DocumentApp = {
      Attribute: {
        BOLD: 'BOLD',
        ITALIC: 'ITALIC',
        UNDERLINE: 'UNDERLINE',
        STRIKETHROUGH: 'STRIKETHROUGH',
        FONT_SIZE: 'FONT_SIZE',
        FONT_FAMILY: 'FONT_FAMILY',
        FOREGROUND_COLOR: 'FOREGROUND_COLOR'
      }
    };
  });

  it('returns an empty object for null/undefined/non-object input', () => {
    expect(TextStyleMapper.toNativeAttributes(null)).toEqual({});
    expect(TextStyleMapper.toNativeAttributes(undefined)).toEqual({});
    expect(TextStyleMapper.toNativeAttributes('not an object')).toEqual({});
  });

  it('maps bold/italic/underline/strikethrough booleans', () => {
    const result = TextStyleMapper.toNativeAttributes({
      bold: true,
      italic: false,
      underline: true,
      strikethrough: false
    });
    expect(result).toEqual({
      BOLD: true,
      ITALIC: false,
      UNDERLINE: true,
      STRIKETHROUGH: false
    });
  });

  it('maps fontSize.magnitude to FONT_SIZE', () => {
    const result = TextStyleMapper.toNativeAttributes({ fontSize: { magnitude: 14, unit: 'PT' } });
    expect(result).toEqual({ FONT_SIZE: 14 });
  });

  it('maps weightedFontFamily.fontFamily to FONT_FAMILY', () => {
    const result = TextStyleMapper.toNativeAttributes({
      weightedFontFamily: { fontFamily: 'Arial', weight: 400 }
    });
    expect(result).toEqual({ FONT_FAMILY: 'Arial' });
  });

  it('maps foregroundColor rgbColor to a hex FOREGROUND_COLOR', () => {
    const result = TextStyleMapper.toNativeAttributes({
      foregroundColor: { color: { rgbColor: { red: 1, green: 0, blue: 0 } } }
    });
    expect(result).toEqual({ FOREGROUND_COLOR: '#ff0000' });
  });

  it('handles a missing color channel as 0', () => {
    const result = TextStyleMapper.toNativeAttributes({
      foregroundColor: { color: { rgbColor: { red: 0, blue: 1 } } }
    });
    expect(result).toEqual({ FOREGROUND_COLOR: '#0000ff' });
  });

  it('combines multiple fields in one call', () => {
    const result = TextStyleMapper.toNativeAttributes({
      bold: true,
      fontSize: { magnitude: 18 },
      foregroundColor: { color: { rgbColor: { red: 0, green: 0.5, blue: 0 } } }
    });
    expect(result).toEqual({ BOLD: true, FONT_SIZE: 18, FOREGROUND_COLOR: '#008000' });
  });

  it('omits fields absent from the source style', () => {
    const result = TextStyleMapper.toNativeAttributes({ bold: true });
    expect(Object.keys(result)).toEqual(['BOLD']);
  });
});
