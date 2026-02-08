import { installLongpressBackspace } from '../features/longpress.js';
import { isTransferPossible } from '../state/reducer.js';
import { toast } from './toasts.js';

const KEYS = [
  ['C', '(', ')', '⌫'],
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '-'],
  ['0', '.', '%', '+'],
];

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v === false || v == null) continue;
    else node.setAttribute(k, String(v));
  }
  for (const child of children) {
    node.append(child);
  }
  return node;
}

function calcTemplate(id, label) {
  const root = el('section', {
    class: `calc calc--${id}`,
    'aria-label': `${label} calculator`,
    dataset: { calc: id },
  });

  const header = el('header', { class: 'calc__header' }, [
    el('div', { class: 'calc__title' }, [
      el('span', { class: 'calc__titleMark', 'aria-hidden': 'true' }),
      el('span', { class: 'calc__titleText' }, [label]),
    ]),
  ]);

  const display = el('div', { class: 'display', role: 'group', 'aria-label': `${label} display` }, [
    el('div', { class: 'display__exprWrap' }, [
      el('div', { class: 'display__expr', dataset: { field: `${id}.expression` }, tabindex: '0' }),
    ]),
    el('div', { class: 'display__meta' }, [
      el('div', { class: 'display__error', dataset: { field: `${id}.error` }, 'aria-live': 'polite' }),
      el('div', { class: 'display__result', dataset: { field: `${id}.result` }, 'aria-live': 'polite' }),
    ]),
  ]);

  const keypad = el('div', { class: 'keypad', role: 'group', 'aria-label': `${label} keypad` });

  // Make '=' a bold "lever" key spanning two rows (row4+row5) at the far right.
  const grid = el('div', { class: 'keys' });

  for (let r = 0; r < KEYS.length; r++) {
    for (let c = 0; c < 4; c++) {
      const k = KEYS[r][c];
      const btn = el('button', {
        class: `key key--${classifyKey(k)}`,
        type: 'button',
        dataset: { key: k, calc: id },
        'aria-label': k === '⌫' ? 'Backspace' : k,
      }, [
        el('span', { class: 'key__cap' }, [k]),
        el('span', { class: 'key__glint', 'aria-hidden': 'true' }),
      ]);
      grid.append(btn);
    }
  }

  const eq = el('button', {
    class: 'key key--equals',
    type: 'button',
    dataset: { key: '=', calc: id },
    'aria-label': 'Equals',
  }, [
    el('span', { class: 'key__cap' }, ['=']),
    el('span', { class: 'key__glint', 'aria-hidden': 'true' }),
  ]);

  keypad.append(grid, eq);

  root.append(header, display, keypad);
  return root;
}

function classifyKey(k) {
  if (k === 'C') return 'clear';
  if (k === '⌫') return 'back';
  if (k === '(' || k === ')') return 'paren';
  if (k === '÷' || k === '×' || k === '-' || k === '+' || k === '%') return 'op';
  if (k === '.') return 'dot';
  return 'num';
}

function transferTemplate() {
  return el('section', { class: 'transfer', 'aria-label': 'Transfer controls' }, [
    el('div', { class: 'transfer__rail', 'aria-hidden': 'true' }),

    el('button', {
      class: 'transfer__btn',
      type: 'button',
      dataset: { transfer: 'bottom->top' },
      'aria-label': 'Transfer bottom result to top',
    }, [
      el('span', { class: 'transfer__icon' }, ['↑']),
      el('span', { class: 'transfer__label' }, ['Bottom → Top']),
    ]),

    el('button', {
      class: 'transfer__btn',
      type: 'button',
      dataset: { transfer: 'top->bottom' },
      'aria-label': 'Transfer top result to bottom',
    }, [
      el('span', { class: 'transfer__icon' }, ['↓']),
      el('span', { class: 'transfer__label' }, ['Top → Bottom']),
    ]),

    el('div', { class: 'transfer__hint', dataset: { transferHint: '1' }, 'aria-live': 'polite' }),
  ]);
}

function settingsTemplate() {
  return el('section', { class: 'settings', 'aria-label': 'Settings' }, [
    el('button', {
      class: 'settings__gear',
      type: 'button',
      'aria-label': 'Open settings',
      dataset: { openSettings: '1' },
    }, ['⚙️']),

    el('dialog', { class: 'settings__dialog', dataset: { settingsDialog: '1' } }, [
      el('div', { class: 'settings__panel' }, [
        el('header', { class: 'settings__head' }, [
          el('div', { class: 'settings__title' }, ['Double‑Cal Settings']),
          el('button', {
            class: 'settings__close',
            type: 'button',
            dataset: { closeSettings: '1' },
            'aria-label': 'Close settings',
          }, ['Close']),
        ]),

        el('div', { class: 'settings__body' }, [
          fieldSelect('Transfer Mode', 'transferMode', [
            { value: 'overwrite', label: 'Overwrite (replace expression)' },
            { value: 'append', label: 'Append (add to expression end)' },
          ]),

          fieldSelect('Theme', 'theme', [
            { value: 'dark', label: 'Dark (Graphite Lab)' },
            { value: 'light', label: 'Light (Ivory Paper)' },
          ]),

          fieldToggle('Haptics', 'haptics', 'Use vibration on supported devices.'),
        ]),

        el('footer', { class: 'settings__foot' }, [
          el('div', { class: 'settings__note' }, ['Expression is parsed safely — no eval.']),
        ]),
      ]),
    ]),
  ]);
}

function fieldSelect(label, key, options) {
  const id = `set_${key}`;
  return el('div', { class: 'field' }, [
    el('label', { class: 'field__label', for: id }, [label]),
    el('div', { class: 'field__control' }, [
      el('select', { class: 'field__select', id, dataset: { setting: key } }, [
        ...options.map((o) => el('option', { value: o.value }, [o.label])),
      ]),
    ]),
  ]);
}

function fieldToggle(label, key, help) {
  const id = `set_${key}`;
  return el('div', { class: 'field field--toggle' }, [
    el('div', { class: 'field__row' }, [
      el('label', { class: 'field__label', for: id }, [label]),
      el('input', { class: 'field__toggle', id, type: 'checkbox', dataset: { setting: key } }),
    ]),
    el('div', { class: 'field__help' }, [help]),
  ]);
}

export function mountApp(root) {
  root.innerHTML = '';
  root.append(
    settingsTemplate(),
    el('div', { class: 'stage' }, [
      calcTemplate('top', 'Top'),
      transferTemplate(),
      calcTemplate('bottom', 'Bottom'),
    ]),
    el('div', { class: 'toasts', dataset: { toasts: '1' }, 'aria-live': 'polite' }),
  );

  // Click handling (event delegation)
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const key = btn.dataset.key;
    const calcId = btn.dataset.calc;

    if (btn.dataset.openSettings) {
      const dlg = root.querySelector('[data-settings-dialog]');
      dlg?.showModal();
      return;
    }
    if (btn.dataset.closeSettings) {
      const dlg = root.querySelector('[data-settings-dialog]');
      dlg?.close();
      return;
    }

    // Keyboard focus: mark which calc is "active" for physical keyboard.
    const calcEl = btn.closest('[data-calc]');
    if (calcEl) {
      root.dataset.activeCalc = calcEl.dataset.calc;
    }

    if (key && calcId) {
      root.dispatchEvent(
        new CustomEvent('doublecal:key', {
          bubbles: true,
          detail: { id: calcId, key },
        }),
      );
      return;
    }

    const transfer = btn.dataset.transfer;
    if (transfer) {
      root.dispatchEvent(
        new CustomEvent('doublecal:transfer', {
          bubbles: true,
          detail: { dir: transfer },
        }),
      );
    }
  });

  // Dialog backdrop click to close
  const dlg = root.querySelector('[data-settings-dialog]');
  dlg?.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();
  });

  // Long-press backspace
  installLongpressBackspace({ root });
}

export function wireInteractions({ root, store }) {
  // Settings controls
  root.addEventListener('change', (e) => {
    const el = e.target;
    if (!(el instanceof HTMLElement)) return;
    const key = el.dataset.setting;
    if (!key) return;

    if (el.tagName === 'SELECT') {
      store.dispatch({ type: 'SET_SETTING', key, value: el.value });
    } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      store.dispatch({ type: 'SET_SETTING', key, value: el.checked });
    }
  });

  root.addEventListener('doublecal:key', (e) => {
    const { id, key } = e.detail;

    if (key === 'C') return store.dispatch({ type: 'CLEAR', id });
    if (key === '⌫') return store.dispatch({ type: 'BACKSPACE', id });
    if (key === '=') return store.dispatch({ type: 'EVALUATE', id });

    store.dispatch({ type: 'INPUT_TOKEN', id, token: key });
  });

  root.addEventListener('doublecal:transfer', (e) => {
    const { dir } = e.detail;
    const state = store.getState();

    const fromId = dir === 'bottom->top' ? 'bottom' : 'top';
    const toId = dir === 'bottom->top' ? 'top' : 'bottom';

    if (!isTransferPossible(state, fromId)) {
      toast(root, 'Nothing to transfer.');
      return;
    }

    store.dispatch({ type: 'TRANSFER', fromId, toId });

    // Small feedback hint
    toast(root, `Transferred ${fromId} → ${toId}`);
  });
}
