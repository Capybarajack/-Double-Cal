let toastTimer = null;

export function toast(root, message) {
  const host = root.querySelector('[data-toasts]');
  if (!host) return;

  host.textContent = '';
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  host.append(t);

  // restart animation
  t.animate(
    [
      { transform: 'translateY(6px)', opacity: 0 },
      { transform: 'translateY(0px)', opacity: 1, offset: 0.2 },
      { transform: 'translateY(0px)', opacity: 1, offset: 0.8 },
      { transform: 'translateY(-4px)', opacity: 0 },
    ],
    { duration: 1600, easing: 'cubic-bezier(.2,.9,.2,1)' },
  );

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    host.textContent = '';
  }, 1700);
}
