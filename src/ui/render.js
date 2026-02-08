import { wireInteractions } from './dom.js';
import { isTransferPossible } from '../state/reducer.js';

function qs(root, sel) {
  return root.querySelector(sel);
}

function setText(el, text) {
  const next = text ?? '';
  if (el.textContent !== next) el.textContent = next;
}

function setAttr(el, name, value) {
  const next = value == null ? null : String(value);
  if (next == null) {
    if (el.hasAttribute(name)) el.removeAttribute(name);
  } else {
    if (el.getAttribute(name) !== next) el.setAttribute(name, next);
  }
}

function setDisabled(el, disabled) {
  if (el.disabled !== disabled) el.disabled = disabled;
}

export function createRenderer({ root, store }) {
  // One-time wiring
  if (!root.dataset.wired) {
    root.dataset.wired = '1';
    wireInteractions({ root, store });
  }

  // Remember: physical keyboard uses this active calc.
  if (!root.dataset.activeCalc) root.dataset.activeCalc = 'top';

  return function render() {
    const state = store.getState();

    // Theme
    document.documentElement.dataset.theme = state.settings.theme;

    // Calculators
    for (const id of ['top', 'bottom']) {
      const c = state.calculators[id];
      const exprEl = qs(root, `[data-field="${id}.expression"]`);
      const resultEl = qs(root, `[data-field="${id}.result"]`);
      const errEl = qs(root, `[data-field="${id}.error"]`);

      setText(exprEl, c.expression);
      setText(resultEl, c.mode === 'result' ? c.result : '');
      setText(errEl, c.error ? c.error : '');

      const calcEl = qs(root, `[data-calc="${id}"]`);
      setAttr(calcEl, 'data-mode', c.mode);
      setAttr(calcEl, 'data-error', c.error ? '1' : null);
    }

    // Settings controls
    const selTransfer = qs(root, '[data-setting="transferMode"]');
    if (selTransfer && selTransfer.value !== state.settings.transferMode) {
      selTransfer.value = state.settings.transferMode;
    }

    const selTheme = qs(root, '[data-setting="theme"]');
    if (selTheme && selTheme.value !== state.settings.theme) {
      selTheme.value = state.settings.theme;
    }

    const chkHaptics = qs(root, '[data-setting="haptics"]');
    if (chkHaptics && chkHaptics.checked !== state.settings.haptics) {
      chkHaptics.checked = state.settings.haptics;
    }

    // Transfer enabled state
    const canUp = isTransferPossible(state, 'bottom');
    const canDown = isTransferPossible(state, 'top');

    const upBtn = qs(root, '[data-transfer="bottom->top"]');
    const downBtn = qs(root, '[data-transfer="top->bottom"]');

    setDisabled(upBtn, !canUp);
    setDisabled(downBtn, !canDown);

    const hint = qs(root, '[data-transfer-hint]');
    if (!canUp && !canDown) {
      setText(hint, 'Compute something, then transfer.' );
    } else if (!canUp) {
      setText(hint, 'Bottom has nothing transferable.' );
    } else if (!canDown) {
      setText(hint, 'Top has nothing transferable.' );
    } else {
      setText(hint, 'Transfer uses result first; otherwise auto-compute.' );
    }
  };
}
