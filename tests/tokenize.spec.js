import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/engine/tokenize.js';

describe('tokenize', () => {
  it('tokenizes numbers and operators', () => {
    const t = tokenize('(1+2)*3');
    expect(t.map((x) => x.type)).toEqual(['paren','number','op','number','paren','op','number']);
    expect(t.filter((x) => x.type === 'op').map((x) => x.value)).toEqual(['+','*']);
  });

  it('supports decimals', () => {
    const t = tokenize('0.5+.25');
    expect(t[0].value).toBe(0.5);
    expect(t[2].value).toBe(0.25);
  });

  it('rejects invalid characters', () => {
    expect(() => tokenize('1a+2')).toThrow();
  });
});
