You are implementing a Nuxt 3 (Vue 3) + TypeScript app named "Double-Cal".

GOAL
- Mobile-first twin calculator UI (Top + Bottom) on one page.
- Two calculators are independent except for explicit result transfer.
- Safe math engine: NO eval. Implement a small auditable expression parser/evaluator.
- Pinia for state management.
- Pure CSS (CSS variables). No large UI framework.
- Unit tests with Vitest: parser/evaluate + transfer overwrite/append.

REQUIRED FEATURE SPEC
1) UI: two calculator panels (top/bottom) each with:
- Display: expression (h-scroll, no wrap), result (bigger), error.
- Keypad: 0-9 . + - × ÷ % ( ) C ⌫ =
- Visual active feedback.
- Long-press ⌫ for repeat delete (setInterval).
- Keyboard support (desktop): digits, operators, Enter(=), Backspace(⌫), Escape(C), parentheses.
- Responsive: portrait => vertical stack with transfer controls between; landscape => horizontal split (recommended).

2) Transfer (core): center TransferControl with two arrow buttons:
- Send Top -> Bottom
- Send Bottom -> Top

Transfer rules (must implement exactly):
- Each calculator state: { expression: string; result: string; error: string|null; mode: 'editing'|'result' }
- When transferring, source value priority:
  a) If source.mode==='result' and source.result non-empty => transfer source.result
  b) Else if source.expression is valid & computable => silently compute and transfer formatted value (do NOT mutate source state)
  c) Else => transfer disabled and show short hint.
- Receiver behavior depends on settings.transferMode:
  - overwrite (default): receiver.expression=value; receiver.mode='editing'; receiver.result=''; receiver.error=null
  - append: if receiver.expression empty => set; else receiver.expression += value; receiver.mode='editing'; receiver.result=''; receiver.error=null

3) Calculator behavior:
- C: clear expression/result/error; mode='editing'
- ⌫ behavior (define consistently): if mode==='result', first move result back into expression and clear result, switch mode='editing', then delete 1 char.
- '=' evaluate: if valid => set result formatted and mode='result'; else set error='Error' and keep mode='editing'
- % is remainder operator (a % b), not percent.
- Continuous ops: after '=', pressing an operator should start new expression from result (e.g. "9+"). Pressing a digit starts a new expression.
- Decimals: allow leading dot like ".5".

Math engine:
- Support + - * / % ( ) decimals unary minus
- Precedence: parens > mul/div/mod > add/sub
- Error on invalid expression and division/mod by 0.
- formatNumber utility: show at most 12-16 significant digits, avoid floating tails, handle -0.

Settings panel:
- Button (⚙️) opens SettingsDrawer (modal/drawer)
- Settings store: transferMode ('overwrite'|'append'), theme ('light'|'dark'), haptics boolean.
- Theme: apply data-theme="dark" on root when dark.
- Optional: haptics via navigator.vibrate(10) on key press when enabled.

FILE STRUCTURE (must create these):
- pages/index.vue
- components/TwinCalcLayout.vue
- components/CalculatorPanel.vue
- components/Display.vue
- components/Keypad.vue
- components/TransferControl.vue
- components/SettingsDrawer.vue
- composables/useKeyboard.ts
- stores/calc.ts
- stores/settings.ts
- utils/parser.ts
- utils/evaluate.ts
- utils/format.ts
- utils/guards.ts
- tests/parser.spec.ts
- tests/evaluate.spec.ts
- tests/transfer.spec.ts

PROJECT SETUP
- Ensure Nuxt version is 3.x (not 4.x).
- Add @pinia/nuxt module.
- Add vitest config + npm scripts: "test" and "test:watch".
- Keep types correct, no TODO stubs.

DELIVERABLE
- Implement the full working app. Also ensure `npm test` passes.

Now implement by editing/creating files accordingly.