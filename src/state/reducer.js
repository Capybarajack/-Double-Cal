import { tryComputeExpression } from '../engine/helpers.js';
import { formatNumber } from '../engine/format.js';

function withCalc(state, id, patch) {
  return {
    ...state,
    calculators: {
      ...state.calculators,
      [id]: {
        ...state.calculators[id],
        ...patch,
      },
    },
  };
}

function normalizeOperatorToken(token) {
  if (token === '×') return '*';
  if (token === '÷') return '/';
  return token;
}

function isOperatorChar(ch) {
  return ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '%';
}

function canAutoCompute(calc) {
  if (!calc.expression) return false;
  const out = tryComputeExpression(calc.expression);
  return out.ok;
}

function computeOrError(calc) {
  const expr = calc.expression;
  const out = tryComputeExpression(expr);
  if (!out.ok) {
    return { ok: false, error: 'Error' };
  }
  return { ok: true, value: out.value };
}

/**
 * Key behaviors (kept consistent):
 * - BACKSPACE: if mode=result, first move result back into expression, then delete one char.
 * - INPUT_TOKEN after mode=result:
 *    - operator: continue from result
 *    - number/dot/paren: start new expression
 */
export function reducer(state, action) {
  switch (action.type) {
    case 'INPUT_TOKEN': {
      const { id } = action;
      let token = normalizeOperatorToken(action.token);
      const calc = state.calculators[id];

      // If we were showing a result, decide whether to continue or start fresh.
      if (calc.mode === 'result') {
        const isOp = token.length === 1 && isOperatorChar(token);
        const isOpenParen = token === '(';
        const isCloseParen = token === ')';
        const isDigitOrDot = /[0-9.]/.test(token);

        if (isOp || isCloseParen) {
          // Continue from result.
          const base = calc.result || '';
          return withCalc(state, id, {
            expression: base + token,
            mode: 'editing',
            result: '',
            error: null,
          });
        }

        if (isDigitOrDot || isOpenParen) {
          // Start new expression.
          return withCalc(state, id, {
            expression: token,
            mode: 'editing',
            result: '',
            error: null,
          });
        }
      }

      return withCalc(state, id, {
        expression: calc.expression + token,
        mode: 'editing',
        error: null,
      });
    }

    case 'CLEAR': {
      return withCalc(state, action.id, {
        expression: '',
        result: '',
        mode: 'editing',
        error: null,
      });
    }

    case 'BACKSPACE': {
      const { id } = action;
      const calc = state.calculators[id];

      // If in result mode, recall result into expression first (so user can edit it).
      let expr = calc.expression;
      if (calc.mode === 'result') {
        expr = calc.result || '';
      }

      if (!expr) {
        return withCalc(state, id, {
          expression: '',
          mode: 'editing',
          result: '',
          error: null,
        });
      }

      const nextExpr = expr.slice(0, -1);
      return withCalc(state, id, {
        expression: nextExpr,
        mode: 'editing',
        result: '',
        error: null,
      });
    }

    case 'EVALUATE': {
      const { id } = action;
      const calc = state.calculators[id];

      const sourceExpr = calc.mode === 'result' ? (calc.result || '') : calc.expression;
      const out = tryComputeExpression(sourceExpr);
      if (!out.ok) {
        return withCalc(state, id, {
          error: 'Error',
          mode: 'editing',
        });
      }

      return withCalc(state, id, {
        expression: sourceExpr,
        result: formatNumber(out.value),
        mode: 'result',
        error: null,
      });
    }

    case 'TRANSFER': {
      const { fromId, toId } = action;
      const from = state.calculators[fromId];
      const to = state.calculators[toId];

      // Determine transferable value.
      let value = '';
      if (from.mode === 'result' && from.result) {
        value = from.result;
      } else {
        const out = computeOrError(from);
        if (out.ok) value = formatNumber(out.value);
      }

      if (!value) return state;

      const mode = state.settings.transferMode;
      const nextExpression = mode === 'append' ? (to.expression + value) : value;

      return {
        ...state,
        calculators: {
          ...state.calculators,
          [toId]: {
            ...to,
            expression: nextExpression,
            result: '',
            mode: 'editing',
            error: null,
          },
        },
      };
    }

    case 'SET_SETTING': {
      const { key, value } = action;
      const next = {
        ...state,
        settings: {
          ...state.settings,
          [key]: value,
        },
      };
      return next;
    }

    default:
      return state;
  }
}

export function isTransferPossible(state, fromId) {
  const c = state.calculators[fromId];
  if (c.mode === 'result' && c.result) return true;
  return canAutoCompute(c);
}
