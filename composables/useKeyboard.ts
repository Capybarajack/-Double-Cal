import { onBeforeUnmount, onMounted } from 'vue';

export type KeyAction =
  | { kind: 'input'; token: string }
  | { kind: 'backspace' }
  | { kind: 'clear' }
  | { kind: 'evaluate' };

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (el.isContentEditable) return true;
  return false;
}

function mapKey(e: KeyboardEvent): KeyAction | null {
  const k = e.key;

  if (k >= '0' && k <= '9') return { kind: 'input', token: k };
  if (k === '.') return { kind: 'input', token: '.' };

  // Operators
  if (k === '+' || k === '-' || k === '*' || k === '/' || k === '%') return { kind: 'input', token: k };

  // Parentheses
  if (k === '(' || k === ')') return { kind: 'input', token: k };

  if (k === 'Enter' || k === '=') return { kind: 'evaluate' };
  if (k === 'Backspace') return { kind: 'backspace' };
  if (k === 'Escape') return { kind: 'clear' };

  return null;
}

/**
 * Register global keyboard controls.
 * Provide a handler that dispatches to the currently active calculator.
 */
export function useKeyboard(handler: (action: KeyAction) => void) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (isEditableTarget(e.target)) return;

    const action = mapKey(e);
    if (!action) return;

    // Prevent browser navigation (Backspace) and form submits.
    e.preventDefault();
    handler(action);
  };

  onMounted(() => window.addEventListener('keydown', onKeyDown));
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown));
}
