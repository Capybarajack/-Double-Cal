import { toRpn } from './parse.js';
import { evaluateRpn } from './evaluate.js';

export function tryComputeExpression(expression) {
  try {
    const rpn = toRpn(expression);
    const value = evaluateRpn(rpn);
    return { ok: true, value };
  } catch {
    return { ok: false };
  }
}
