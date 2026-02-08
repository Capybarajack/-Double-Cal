/**
 * Long-press backspace for continuous deletion.
 * We emit the same custom event as click, repeatedly.
 */

export function installLongpressBackspace({ root }) {
  let interval = null;
  let activeBtn = null;

  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    activeBtn = null;
  }

  root.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.key !== '⌫') return;

    activeBtn = btn;

    // Initial delay then repeat.
    const { calc } = btn.dataset;
    const fire = () => {
      root.dispatchEvent(
        new CustomEvent('doublecal:key', {
          bubbles: true,
          detail: { id: calc, key: '⌫' },
        }),
      );
    };

    // Fire once immediately (click already does, but pointerdown is earlier and consistent)
    fire();

    const delay = 260;
    window.setTimeout(() => {
      if (activeBtn !== btn) return;
      interval = window.setInterval(fire, 55);
    }, delay);

    // Avoid the later click doubling
    btn.addEventListener('click', preventOnce, { once: true, capture: true });
    function preventOnce(ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  });

  root.addEventListener('pointerup', stop);
  root.addEventListener('pointercancel', stop);
  root.addEventListener('pointerleave', stop);
}
