import { describe, it, expect } from 'vitest';
import { toRpn } from '../src/engine/parse.js';
import { evaluateRpn } from '../src/engine/evaluate.js';

describe('parse', () => {
  it('respects precedence and parens', () => {
    const rpn = toRpn('(1+2)*3');
    const v = evaluateRpn(rpn);
    expect(v).toBe(9);
  });

  it('handles unary minus', () => {
    expect(evaluateRpn(toRpn('-2*3'))).toBe(-6);
    expect(evaluateRpn(toRpn('(-2)*3'))).toBe(-6);
    expect(evaluateRpn(toRpn('1+-2'))).toBe(-1);
  });

  it('rejects mismatched parens', () => {
    expect(() => toRpn('(1+2')).toThrow();
  });
});
