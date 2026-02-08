import { describe, it, expect } from 'vitest';
import { reducer } from '../src/state/reducer.js';
import { initialState } from '../src/state/store.js';

function s(patch) {
  return {
    ...initialState,
    ...patch,
  };
}

describe('transfer reducer', () => {
  it('uses result first when mode=result', () => {
    const state = s({
      calculators: {
        top: { expression: '1+2', result: '3', mode: 'result', error: null },
        bottom: { expression: '', result: '', mode: 'editing', error: null },
      },
      settings: { ...initialState.settings, transferMode: 'overwrite' },
    });

    const next = reducer(state, { type: 'TRANSFER', fromId: 'top', toId: 'bottom' });
    expect(next.calculators.bottom.expression).toBe('3');
    expect(next.calculators.bottom.mode).toBe('editing');
  });

  it('append mode appends to expression', () => {
    const state = s({
      calculators: {
        top: { expression: '9', result: '9', mode: 'result', error: null },
        bottom: { expression: '12+', result: '', mode: 'editing', error: null },
      },
      settings: { ...initialState.settings, transferMode: 'append' },
    });

    const next = reducer(state, { type: 'TRANSFER', fromId: 'top', toId: 'bottom' });
    expect(next.calculators.bottom.expression).toBe('12+9');
  });
});
