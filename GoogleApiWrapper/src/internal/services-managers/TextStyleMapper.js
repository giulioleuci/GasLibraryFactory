/**
 * @file GoogleApiWrapper/src/internal/services-managers/TextStyleMapper.js
 * @description Converts an Advanced Docs API TextStyle POJO (as captured by
 * DocumentContentExtractor at scan time) into the native DocumentApp.Attribute
 * object shape required by Text.setAttributes(). Native-only boundary (L2).
 */

export class TextStyleMapper {
  /**
   * @param {Object} textStyle Advanced-API TextStyle POJO, any subset of fields.
   * @returns {Object} Native DocumentApp.Attribute-keyed object; only fields present in `textStyle` are included.
   */
  static toNativeAttributes(textStyle) {
    if (!textStyle || typeof textStyle !== 'object') {
      return {};
    }
    const attrs = {};
    if (typeof textStyle.bold === 'boolean') {
      attrs[DocumentApp.Attribute.BOLD] = textStyle.bold;
    }
    if (typeof textStyle.italic === 'boolean') {
      attrs[DocumentApp.Attribute.ITALIC] = textStyle.italic;
    }
    if (typeof textStyle.underline === 'boolean') {
      attrs[DocumentApp.Attribute.UNDERLINE] = textStyle.underline;
    }
    if (typeof textStyle.strikethrough === 'boolean') {
      attrs[DocumentApp.Attribute.STRIKETHROUGH] = textStyle.strikethrough;
    }
    if (textStyle.fontSize && typeof textStyle.fontSize.magnitude === 'number') {
      attrs[DocumentApp.Attribute.FONT_SIZE] = textStyle.fontSize.magnitude;
    }
    if (textStyle.weightedFontFamily && textStyle.weightedFontFamily.fontFamily) {
      attrs[DocumentApp.Attribute.FONT_FAMILY] = textStyle.weightedFontFamily.fontFamily;
    }
    if (
      textStyle.foregroundColor &&
      textStyle.foregroundColor.color &&
      textStyle.foregroundColor.color.rgbColor
    ) {
      attrs[DocumentApp.Attribute.FOREGROUND_COLOR] = TextStyleMapper._rgbColorToHex(
        textStyle.foregroundColor.color.rgbColor
      );
    }
    return attrs;
  }

  /**
   * @param {Object} rgbColor {red?, green?, blue?} floats in [0,1]; missing channels default to 0.
   * @returns {string} '#rrggbb' hex color.
   * @private
   */
  static _rgbColorToHex(rgbColor) {
    const toHex = (component) => {
      const value = Math.round((component || 0) * 255);
      return value.toString(16).padStart(2, '0');
    };
    return `#${toHex(rgbColor.red)}${toHex(rgbColor.green)}${toHex(rgbColor.blue)}`;
  }
}
