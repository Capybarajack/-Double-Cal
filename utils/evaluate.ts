import type { Token } from './parser';
import { parseToRpn } from './parser';

export type EvalResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

function fail(error: string): EvalResult {
  return { ok: false, error };
}

export function evalRpn(rpn: Token[]): EvalResult {
  const stack: number[] = [];

  for (const t of rpn) {
    if (t.kind === 'number') {
      stack.push(t.value);
      continue;
    }

    if (t.kind !== 'op') return fail('Invalid RPN');

    if (t.op === 'NEG') {
      if (stack.length < 1) return fail('Invalid expression');
      const a = stack.pop()!;
      stack.push(-a);
      continue;
    }

    // binary
    if (stack.length < 2) return fail('Invalid expression');
    const b = stack.pop()!;
    const a = stack.pop()!;

    if ((t.op === '/' || t.op === '%') && b === 0) return fail('Division by zero');

    switch (t.op) {
      case '+':
        stack.push(a + b);
        break;
      case '-':
        stack.push(a - b);
        break;
      case '*':
        stack.push(a * b);
        break;
      case '/':
        stack.push(a / b);
        break;
      case '%':
        stack.push(a % b);
        break;
    }
  }

  if (stack.length !== 1) return fail('Invalid expression');
  const value = stack[0]!;
  if (!Number.isFinite(value)) return fail('Invalid result');
  return { ok: true, value };
}

export function evaluateExpression(expr: string): EvalResult {
  const parsed = parseToRpn(expr);
  if (!parsed.ok) return fail(parsed.error);
  return evalRpn(parsed.rpn);
}
