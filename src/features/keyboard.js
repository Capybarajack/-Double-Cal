import { toast } from '../ui/toasts.js';

function normalizeKey(e) {
  const k = e.key;
  if (k === 'Enter') return '=';
  if (k === 'Backspace') return '⌫';
  if (k === 'Escape') return 'C';

  if (k === '*') return '×';
  if (k === '/') return '÷';

  // Allow direct operators + digits + dot + parens + percent
  if (/^[0-9]$/.test(k)) return k;
  if (k === '.' || k === '+' || k === '-' || k === '%' || k === '(' || k === ')') return k;

  return null;
}

export function installKeyboard({ root, store }) {
  // Default active calc is set in renderer; keep a fallback.
  if (!root.dataset.activeCalc) root.dataset.activeCalc = 'top';

  // Update active calc when user clicks/taps inside a calculator area.
  root.addEventListener('pointerdown', (e) => {
    const calc = e.target.closest?.('[data-calc]');
    if (calc?.dataset?.calc) root.dataset.activeCalc = calc.dataset.calc;
  });

  window.addEventListener('keydown', (e) => {
    // Don’t steal keys when dialog is open.
    const dlg = root.querySelector('[data-settings-dialog]');
    if (dlg?.open) return;

    const mapped = normalizeKey(e);
    if (!mapped) return;

    const id = root.dataset.activeCalc || 'top';

    // Prevent browser navigation/backspace etc.
    e.preventDefault();

    // Light haptics (if enabled)
    const { settings } = store.getState();
    if (settings.haptics && navigator.vibrate) {
      // Subtle; we don't want to feel like a toy.
      navigator.vibrate(10);
    }

    if (mapped === 'C') store.dispatch({ type: 'CLEAR', id });
    else if (mapped === '⌫') store.dispatch({ type: 'BACKSPACE', id });
    else if (mapped === '=') store.dispatch({ type: 'EVALUATE', id });
    else store.dispatch({ type: 'INPUT_TOKEN', id, token: mapped });

    // Small reminder when user starts typing without tapping which panel
    if (!root.dataset.activeCalcTouched) {
      root.dataset.activeCalcTouched = '1';
      toast(root, `Keyboard → ${id}`);
    }
  });
}
