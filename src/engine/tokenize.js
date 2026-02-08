/**
 * Tokenizer: numbers, operators, parentheses.
 * No eval. Whitespace ignored.
 *
 * Supported tokens:
 * - { type:'number', value:number, raw:string }
 * - { type:'op', value:'+'|'-'|'*'|'/'|'%' }
 * - { type:'paren', value:'(' | ')' }
 */

const OPS = new Set(['+', '-', '*', '/', '%']);

export function tokenize(input) {
  const s = String(input ?? '');
  const tokens = [];
  let i = 0;

  while (i < s.length) {
    const ch = s[i];

    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i++;
      continue;
    }

    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i++;
      continue;
    }

    if (OPS.has(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }

    // Number: digits with optional single dot. (.5 allowed, 12. allowed)
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      let raw = '';
      let dotCount = 0;

      while (i < s.length) {
        const c = s[i];
        if (c === '.') {
          dotCount++;
          if (dotCount > 1) break;
          raw += c;
          i++;
          continue;
        }
        if (c >= '0' && c <= '9') {
          raw += c;
          i++;
          continue;
        }
        break;
      }

      // raw may be '.' only -> invalid
      if (raw === '.' || raw === '') {
        throw new Error('Invalid number');
      }

      const value = Number(raw);
      if (!Number.isFinite(value)) throw new Error('Invalid number');

      tokens.push({ type: 'number', value, raw });
      continue;
    }

    throw new Error(`Invalid character: ${ch}`);
  }

  return tokens;
}
