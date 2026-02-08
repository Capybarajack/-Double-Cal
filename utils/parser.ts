import { isBinaryOperator, isDigit, isParen, isWhitespace, isLeftAssociative, precedence, type Operator } from './guards';

export type Token =
  | { kind: 'number'; value: number; raw: string }
  | { kind: 'op'; op: Operator }
  | { kind: 'paren'; value: '(' | ')' };

export type ParseResult =
  | { ok: true; rpn: Token[] }
  | { ok: false; error: string };

/**
 * Tokenize an expression. Supports decimals and leading dot (e.g. .5).
 * Also detects unary minus and emits it as op 'NEG'.
 */
export function tokenize(expr: string): ParseResult {
  const tokens: Token[] = [];
  const s = expr;
  let i = 0;

  const pushError = (error: string): ParseResult => ({ ok: false, error });

  const prevToken = (): Token | undefined => tokens[tokens.length - 1];

  while (i < s.length) {
    const ch = s[i]!;
    if (isWhitespace(ch)) {
      i++;
      continue;
    }

    // Parentheses
    if (isParen(ch)) {
      tokens.push({ kind: 'paren', value: ch });
      i++;
      continue;
    }

    // Number: digit(s) possibly with dot, or leading dot
    if (isDigit(ch) || ch === '.') {
      let start = i;
      let hasDot = false;

      if (ch === '.') {
        hasDot = true;
        i++;
        // require at least one digit after leading dot
        if (i >= s.length || !isDigit(s[i]!)) return pushError('Invalid number');
      }

      while (i < s.length) {
        const c = s[i]!;
        if (isDigit(c)) {
          i++;
          continue;
        }
        if (c === '.') {
          if (hasDot) return pushError('Invalid number');
          hasDot = true;
          i++;
          continue;
        }
        break;
      }

      const raw = s.slice(start, i);
      const value = Number(raw);
      if (!Number.isFinite(value)) return pushError('Invalid number');
      tokens.push({ kind: 'number', value, raw });
      continue;
    }

    // Operator
    if (isBinaryOperator(ch)) {
      // Detect unary minus
      if (ch === '-') {
        const prev = prevToken();
        const isUnary =
          !prev ||
          (prev.kind === 'op') ||
          (prev.kind === 'paren' && prev.value === '(');
        if (isUnary) {
          tokens.push({ kind: 'op', op: 'NEG' });
          i++;
          continue;
        }
      }

      tokens.push({ kind: 'op', op: ch });
      i++;
      continue;
    }

    return pushError(`Unexpected character: ${ch}`);
  }

  return { ok: true, rpn: tokens };
}

/**
 * Parse tokens into Reverse Polish Notation (RPN) using shunting-yard.
 * Returns RPN tokens containing numbers and operators only.
 */
export function parseToRpn(expr: string): ParseResult {
  const tokRes = tokenize(expr);
  if (!tokRes.ok) return tokRes;

  const input = tokRes.rpn; // temporary: tokenize returns tokens in .rpn field

  const output: Token[] = [];
  const stack: Token[] = [];

  let expectOperand = true;

  const fail = (error: string): ParseResult => ({ ok: false, error });

  for (const t of input) {
    if (t.kind === 'number') {
      output.push(t);
      expectOperand = false;
      continue;
    }

    if (t.kind === 'paren') {
      if (t.value === '(') {
        stack.push(t);
        expectOperand = true;
      } else {
        // ')'
        if (expectOperand) return fail('Invalid expression');
        let found = false;
        while (stack.length) {
          const top = stack.pop()!;
          if (top.kind === 'paren' && top.value === '(') {
            found = true;
            break;
          }
          output.push(top);
        }
        if (!found) return fail('Mismatched parentheses');
        expectOperand = false;
      }
      continue;
    }

    if (t.kind === 'op') {
      // Unary NEG is allowed when expecting operand; others are not.
      if (expectOperand) {
        if (t.op !== 'NEG') return fail('Invalid expression');
      } else {
        // If we just had operand or ')', binary operator is ok, NEG is not expected.
        if (t.op === 'NEG') return fail('Invalid expression');
      }

      while (stack.length) {
        const top = stack[stack.length - 1]!;
        if (top.kind !== 'op') break;

        const o1 = t.op;
        const o2 = top.op;
        const p1 = precedence(o1);
        const p2 = precedence(o2);

        const shouldPop = isLeftAssociative(o1) ? p1 <= p2 : p1 < p2;
        if (!shouldPop) break;
        output.push(stack.pop()!);
      }

      stack.push(t);
      expectOperand = true;
      continue;
    }
  }

  if (expectOperand && output.length > 0) return fail('Invalid expression');

  while (stack.length) {
    const top = stack.pop()!;
    if (top.kind === 'paren') return fail('Mismatched parentheses');
    output.push(top);
  }

  return { ok: true, rpn: output };
}
