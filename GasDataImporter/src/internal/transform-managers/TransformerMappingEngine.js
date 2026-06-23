/**
 * @file GasDataImporter/src/transform/managers/TransformerMappingEngine.js
 * @description Manager for column mapping and calculated fields structure.
 */

import { TransformError } from '../errors/TransformError.js';

export class TransformerMappingEngine {
  constructor(facade) {
    this.facade = facade;
    this._logger = facade._logger;
    this._expressionEngine = facade._expressionEngine;
  }

  /**
   * Transforms row attributes according to the provided mapping schema, renaming source columns to target identifiers.
   * @private
   * @param {Object} sourceRow raw input record.
   * @param {Object} mapping field renaming rules.
   * @returns {Object} mapped record state.
   */
  _applyMapping(sourceRow, mapping) {
    const mappedRow = {};
    if (!mapping || Object.keys(mapping).length === 0) {
      return { ...sourceRow };
    }

    for (const [sourceCol, destCol] of Object.entries(mapping)) {
      if (Object.prototype.hasOwnProperty.call(sourceRow, sourceCol)) {
        mappedRow[destCol] = sourceRow[sourceCol];
      } else {
        mappedRow[destCol] = null;
        this._logger.warn(
          `[Transformer] Source column "${sourceCol}" not found in row, setting "${destCol}" to null`
        );
      }
    }

    for (const [key, value] of Object.entries(sourceRow)) {
      if (!Object.prototype.hasOwnProperty.call(mapping, key) && !Object.prototype.hasOwnProperty.call(mappedRow, key)) {
        mappedRow[key] = value;
      }
    }
    return mappedRow;
  }

  /**
   * Evaluates computed field expressions, managing dependency resolution and topological execution order.
   * @private
   * @param {Object} row current record state.
   * @param {Object} calculated map of field names to logic expressions.
   * @returns {Object} record state updated with computed values.
   * @throws {TransformError} If a circular dependency is detected or evaluation fails.
   */
  _applyCalculated(row, calculated) {
    if (!calculated || Object.keys(calculated).length === 0) {
      return row;
    }

    const result = { ...row };
    const dependencies = this._buildDependencyGraph(calculated);
    const executionOrder = this._topologicalSort(dependencies);

    for (const fieldName of executionOrder) {
      const expression = calculated[fieldName];
      try {
        result[fieldName] = this.facade._evaluateExpression(expression, result);
      } catch (error) {
        this._logger.error(
          `[Transformer] Failed to calculate field "${fieldName}": ${error.message}`
        );
        throw new TransformError(
          `Failed to calculate field "${fieldName}": ${error.message}`,
          'CALCULATED_FIELD_ERROR',
          { fieldName, expression, row, originalError: error.message }
        );
      }
    }
    return result;
  }

  _buildDependencyGraph(calculated) {
    const graph = new Map();
    for (const [fieldName, expression] of Object.entries(calculated)) {
      const dependencies = this.facade._extractPlaceholders(expression);
      graph.set(fieldName, new Set(dependencies));
    }
    return graph;
  }

  _extractPlaceholders(expression) {
    if (!expression || typeof expression !== 'string') return [];
    const placeholders = [];
    const regex = /\{\{([^}]+)\}\}/g;
    let match;
    while ((match = regex.exec(expression)) !== null) {
      const placeholder = match[1].trim();
      const fieldName = placeholder.split('.')[0].split('|')[0].trim();
      if (fieldName && !placeholders.includes(fieldName)) {
        placeholders.push(fieldName);
      }
    }
    return placeholders;
  }

  _topologicalSort(graph) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (node, path = []) => {
      if (visited.has(node)) return;
      if (visiting.has(node)) {
        const cycle = [...path, node].join(' -> ');
        throw new TransformError(
          `Circular dependency detected in calculated fields: ${cycle}`,
          'CIRCULAR_DEPENDENCY',
          { cycle, path: [...path, node] }
        );
      }
      visiting.add(node);
      const dependencies = graph.get(node) || new Set();
      for (const dep of dependencies) {
        if (graph.has(dep)) visit(dep, [...path, node]);
      }
      visiting.delete(node);
      visited.add(node);
      sorted.push(node);
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) visit(node, []);
    }
    return sorted;
  }

  _evaluateExpression(expression, context) {
    if (!expression) return null;
    if (this._expressionEngine) {
      try {
        return this._expressionEngine.evaluate(expression, context);
      } catch (error) {
        this._logger.warn(
          `[Transformer] ExpressionEngine evaluation failed, falling back to template substitution: ${error.message}`
        );
      }
    }
    return this.facade._simpleTemplateSubstitution(expression, context);
  }

  _simpleTemplateSubstitution(template, context) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      const value = context[trimmedKey];
      return value !== undefined && value !== null ? String(value) : '';
    });
  }
}
