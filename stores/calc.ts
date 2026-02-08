import { defineStore } from 'pinia';
import { evaluateExpression } from '~/utils/evaluate';
import { formatNumber } from '~/utils/format';
import { isBinaryOperator } from '~/utils/guards';
import { useSettingsStore } from './settings';

export type CalcId = 'top' | 'bottom';
export type CalcMode = 'editing' | 'result';

export interface CalcState {
  expression: string;
  result: string;
  error: string | null;
  mode: CalcMode;
}

function emptyCalcState(): CalcState {
  return { expression: '', result: '', error: null, mode: 'editing' };
}

function isOperatorToken(token: string): boolean {
  return token.length === 1 && isBinaryOperator(token);
}

export const useCalcStore = defineStore('calc', {
  state: () => ({
    calculators: {
      top: emptyCalcState(),
      bottom: emptyCalcState()
    } as Record<CalcId, CalcState>,

    // Small UX hint area used by TransferControl
    hint: '' as string
  }),
  getters: {
    getCalc: (state) => {
      return (id: CalcId) => state.calculators[id];
    }
  },
  actions: {
    setExpression(id: CalcId, value: string) {
      const c = this.calculators[id];
      c.expression = value;
      c.error = null;
      c.mode = 'editing';
      c.result = '';
    },

    clear(id: CalcId) {
      this.calculators[id] = emptyCalcState();
    },

    backspace(id: CalcId) {
      const c = this.calculators[id];

      // Rule: if mode === result, move result into expression, clear result, switch to editing,
      // then delete one char (lets user edit the last result).
      if (c.mode === 'result') {
        c.expression = c.result;
        c.result = '';
        c.mode = 'editing';
      }

      c.error = null;
      if (!c.expression) return;
      c.expression = c.expression.slice(0, -1);
    },

    input(id: CalcId, token: string) {
      const c = this.calculators[id];

      // If we were showing an error, any input clears it.
      if (c.error) c.error = null;

      // If currently in result mode:
      if (c.mode === 'result') {
        if (isOperatorToken(token)) {
          // Continue calculation: start from result.
          c.expression = c.result + token;
          c.result = '';
          c.mode = 'editing';
        } else {
          // Start new expression.
          c.expression = token;
          c.result = '';
          c.mode = 'editing';
        }
        return;
      }

      // Editing mode: append token.
      c.expression += token;
    },

    evaluate(id: CalcId) {
      const c = this.calculators[id];
      c.error = null;

      const expr = c.expression.trim();
      if (!expr) return;

      const res = evaluateExpression(expr);
      if (!res.ok) {
        c.error = 'Error';
        c.result = '';
        // Keep editing mode so user can fix.
        c.mode = 'editing';
        return;
      }

      c.result = formatNumber(res.value);
      c.mode = 'result';
    },

    /**
     * Returns a transferable value string from a calculator.
     * Priority:
     * 1) if mode=result and result exists => that
     * 2) else silently evaluate expression (does not mutate source)
     */
    getTransferValue(fromId: CalcId): { ok: true; value: string } | { ok: false; reason: string } {
      const c = this.calculators[fromId];
      if (c.mode === 'result' && c.result) return { ok: true, value: c.result };

      const expr = c.expression.trim();
      if (!expr) return { ok: false, reason: 'No expression' };

      const res = evaluateExpression(expr);
      if (!res.ok) return { ok: false, reason: 'Invalid expression' };

      return { ok: true, value: formatNumber(res.value) };
    },

    transfer(fromId: CalcId, toId: CalcId): { ok: true } | { ok: false; reason: string } {
      const settings = useSettingsStore();
      const valRes = this.getTransferValue(fromId);
      if (!valRes.ok) {
        this.hint = valRes.reason;
        return { ok: false, reason: valRes.reason };
      }

      const receiver = this.calculators[toId];
      const value = valRes.value;

      receiver.error = null;
      receiver.mode = 'editing';
      receiver.result = '';

      if (settings.transferMode === 'overwrite') {
        receiver.expression = value;
      } else {
        receiver.expression = receiver.expression ? receiver.expression + value : value;
      }

      this.hint = '';
      return { ok: true };
    }
  }
});
