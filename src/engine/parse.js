/**
 * Parser: Shunting-yard -> RPN
 * Handles unary minus by converting '-' into 'u-' when it appears in a "prefix" position:
 * - beginning of expression
 * - after an operator
 * - after '('
 */

import { tokenize } from './tokenize.js';

const PREC = {
  'u-': 3,
  '*': 2,
  '/': 2,
  '%': 2,
  '+': 1,
  '-': 1,
};

const RIGHT_ASSOC = new Set(['u-']);

function isOp(t) {
  return t && t.type === 'op';
}

function isParen(t, v) {
  return t && t.type === 'paren' && t.value === v;
}

export function toRpn(expression) {
  const tokens = tokenize(expression);
  const output = [];
  const stack = [];

  let prev = null;

  for (let idx = 0; idx < tokens.length; idx++) {
    const t = tokens[idx];

    if (t.type === 'number') {
      output.push(t);
      prev = t;
      continue;
    }

    if (t.type === 'paren') {
      if (t.value === '(') {
        stack.push(t);
        prev = t;
        continue;
      }

      // ')'
      while (stack.length && !isParen(stack[stack.length - 1], '(')) {
        output.push(stack.pop());
      }
      if (!stack.length) throw new Error('Mismatched parens');
      stack.pop(); // remove '('
      prev = t;
      continue;
    }

    if (t.type === 'op') {
      let op = t.value;

      // Detect unary minus
      const prevIsPrefix =
        prev === null ||
        (prev.type === 'op') ||
        isParen(prev, '(');

      if (op === '-' && prevIsPrefix) {
        op = 'u-';
      }

      const opToken = { type: 'op', value: op };

      while (stack.length) {
        const top = stack[stack.length - 1];
        if (!isOp(top)) break;

        const pTop = PREC[top.value];
        const pCur = PREC[op];
        if (pTop == null || pCur == null) throw new Error('Unknown operator');

        const shouldPop = RIGHT_ASSOC.has(op) ? pTop > pCur : pTop >= pCur;
        if (!shouldPop) break;

        output.push(stack.pop());
      }

      stack.push(opToken);
      prev = opToken;
      continue;
    }

    throw new Error('Unknown token');
  }

  while (stack.length) {
    const top = stack.pop();
    if (top.type === 'paren') throw new Error('Mismatched parens');
    output.push(top);
  }

  return output;
}
