import { describe, it, expect } from 'vitest';
import { toRpn } from '../src/engine/parse.js';
import { evaluateRpn } from '../src/engine/evaluate.js';

describe('evaluate', () => {
  it('computes basic expressions', () => {
    expect(evaluateRpn(toRpn('1+2*3'))).toBe(7);
    expect(evaluateRpn(toRpn('(1+2)*3'))).toBe(9);
  });

  it('supports modulo', () => {
    expect(evaluateRpn(toRpn('10%4'))).toBe(2);
  });

  it('errors on division by 0', () => {
    expect(() => evaluateRpn(toRpn('1/0'))).toThrow();
    expect(() => evaluateRpn(toRpn('1%0'))).toThrow();
  });

  it('errors on invalid sequences', () => {
    expect(() => evaluateRpn(toRpn('1++2'))).toThrow();
  });
});
