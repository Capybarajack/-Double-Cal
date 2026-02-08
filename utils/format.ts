const DEFAULT_SIG_FIGS = 14;

/**
 * Format a JS number into a calculator-friendly string.
 * - Limits significant figures to avoid long floating tails (e.g. 0.3000000004)
 * - Normalizes -0 to 0
 */
export function formatNumber(value: number, sigFigs: number = DEFAULT_SIG_FIGS): string {
  if (!Number.isFinite(value)) return 'Error';
  // Normalize -0
  if (Object.is(value, -0)) value = 0;

  const abs = Math.abs(value);
  // Use toPrecision for significant-digit control.
  // For very large/small numbers, this may produce scientific notation; that's acceptable.
  const raw = abs === 0 ? '0' : value.toPrecision(sigFigs);

  // Remove trailing zeros in decimal form (but keep scientific as-is).
  if (raw.includes('e') || raw.includes('E')) return raw.replace('E', 'e');

  // Trim trailing zeros after decimal and possible trailing dot.
  return raw.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}
