/**
 * Evaluate RPN produced by toRpn().
 * Throws on invalid expression or division by 0.
 */

export function evaluateRpn(rpn) {
  const stack = [];

  for (const t of rpn) {
    if (t.type === 'number') {
      stack.push(t.value);
      continue;
    }

    if (t.type === 'op') {
      if (t.value === 'u-') {
        if (stack.length < 1) throw new Error('Invalid');
        const a = stack.pop();
        const v = -a;
        if (!Number.isFinite(v)) throw new Error('Invalid');
        stack.push(v);
        continue;
      }

      if (stack.length < 2) throw new Error('Invalid');
      const b = stack.pop();
      const a = stack.pop();

      let v;
      switch (t.value) {
        case '+':
          v = a + b;
          break;
        case '-':
          v = a - b;
          break;
        case '*':
          v = a * b;
          break;
        case '/':
          if (b === 0) throw new Error('Div0');
          v = a / b;
          break;
        case '%':
          if (b === 0) throw new Error('Div0');
          v = a % b;
          break;
        default:
          throw new Error('Unknown operator');
      }

      if (!Number.isFinite(v)) throw new Error('Invalid');
      stack.push(v);
      continue;
    }

    throw new Error('Invalid');
  }

  if (stack.length !== 1) throw new Error('Invalid');
  return stack[0];
}
