/**
 * formatNumber: clamp to ~12-16 significant digits, then trim noise.
 * Purpose: avoid long floating tails while keeping precision for typical calc.
 */

export function formatNumber(n) {
  if (!Number.isFinite(n)) return 'Error';
  if (Object.is(n, -0)) n = 0;

  const abs = Math.abs(n);
  const sig = abs >= 1e10 || (abs > 0 && abs < 1e-6) ? 16 : 14;

  // toPrecision may produce exponential; keep it (it's still readable), but trim zeros.
  let s = Number(n).toPrecision(sig);

  // Remove trailing zeros in decimals (including exponent forms like 1.23000e+5)
  if (s.includes('e')) {
    const [m, e] = s.split('e');
    s = trimDecimalZeros(m) + 'e' + e;
  } else {
    s = trimDecimalZeros(s);
  }

  return s;
}

function trimDecimalZeros(s) {
  if (!s.includes('.')) return s;
  s = s.replace(/0+$/, '');
  s = s.replace(/\.$/, '');
  return s;
}
