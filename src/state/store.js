/**
 * Minimal immutable store.
 * - getState(): current state
 * - dispatch(action): reducer(prev, action) -> next
 * - subscribe(fn): called after each dispatch
 */

export const initialState = {
  calculators: {
    top: { expression: '', result: '', mode: 'editing', error: null },
    bottom: { expression: '', result: '', mode: 'editing', error: null },
  },
  settings: {
    transferMode: 'overwrite', // 'overwrite' | 'append'
    theme: 'dark', // 'light' | 'dark'
    haptics: true,
  },
};

export function createStore({ initialState, reducer }) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState() {
      return state;
    },
    dispatch(action) {
      const next = reducer(state, action);
      if (next !== state) {
        state = next;
        for (const fn of listeners) fn();
      }
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
