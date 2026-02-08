export type BinaryOperator = '+' | '-' | '*' | '/' | '%';
export type UnaryOperator = 'NEG';
export type Operator = BinaryOperator | UnaryOperator;

export const BINARY_OPERATORS: readonly BinaryOperator[] = ['+', '-', '*', '/', '%'] as const;

export function isBinaryOperator(ch: string): ch is BinaryOperator {
  return (BINARY_OPERATORS as readonly string[]).includes(ch);
}

export function isWhitespace(ch: string): boolean {
  return ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r';
}

export function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

export function isParen(ch: string): ch is '(' | ')' {
  return ch === '(' || ch === ')';
}

export function precedence(op: Operator): number {
  // Higher number = higher precedence.
  if (op === 'NEG') return 3;
  if (op === '*' || op === '/' || op === '%') return 2;
  return 1;
}

export function isLeftAssociative(op: Operator): boolean {
  // Unary NEG is right-associative by convention.
  return op !== 'NEG';
}
