/**
 * @file ComposableContentLib/src/core/EmptyBehavior.js
 * @description Enums for block empty behavior and container types.
 * @version 1.0.0
 */

/**
 * EmptyBehavior - Defines what happens when a block is empty.
 *
 * @readonly
 * @enum {string}
 */
export const EmptyBehavior = Object.freeze({
  /** Hide the block completely */
  HIDE: 'HIDE',

  /** Show a placeholder message */
  SHOW_PLACEHOLDER: 'SHOW_PLACEHOLDER',

  /** Show the block with empty content */
  SHOW_EMPTY: 'SHOW_EMPTY'
});

/**
 * ContainerType - Defines the visual container for a block.
 *
 * @readonly
 * @enum {string}
 */
export const ContainerType = Object.freeze({
  /** No container wrapper */
  NONE: 'NONE',

  /** Simple box container */
  BOX: 'BOX',

  /** Card-style container */
  CARD: 'CARD',

  /** Section with header */
  SECTION: 'SECTION'
});

/**
 * OutputFormat - Supported output formats.
 *
 * @readonly
 * @enum {string}
 */
export const OutputFormat = Object.freeze({
  /** HTML output */
  HTML: 'html',

  /** Markdown output */
  MARKDOWN: 'markdown',

  /** Plain text output */
  TEXT: 'text'
});

/**
 * @description Validates if a string strictly matches an EmptyBehavior enum value.
 * @param {string} value Value to evaluate.
 * @returns {boolean} True if present in EmptyBehavior.
 */
export function isValidEmptyBehavior(value) {
  return Object.values(EmptyBehavior).includes(value);
}

/**
 * @description Validates and normalizes a string against ContainerType enum values.
 * @param {string} value Value to evaluate (case-insensitive).
 * @returns {boolean} True if matched.
 */
export function isValidContainerType(value) {
  if (typeof value !== 'string') return false;
  return Object.values(ContainerType).includes(value.toUpperCase());
}

/**
 * @description Validates if a string strictly matches an OutputFormat enum value.
 * @param {string} value Value to evaluate.
 * @returns {boolean} True if present in OutputFormat.
 */
export function isValidOutputFormat(value) {
  return Object.values(OutputFormat).includes(value);
}
