import './styles/main.css';

import { createStore } from './state/store.js';
import { reducer } from './state/reducer.js';
import { initialState } from './state/store.js';
import { mountApp } from './ui/dom.js';
import { createRenderer } from './ui/render.js';
import { installKeyboard } from './features/keyboard.js';

const store = createStore({ initialState, reducer });
const root = document.querySelector('#app');

mountApp(root);

const render = createRenderer({ root, store });
render();
const unsubscribe = store.subscribe(render);

installKeyboard({ root, store });

// Apply persisted settings (theme/haptics/transferMode)
try {
  const raw = localStorage.getItem('doublecal.settings');
  if (raw) {
    const settings = JSON.parse(raw);
    for (const [key, value] of Object.entries(settings)) {
      store.dispatch({ type: 'SET_SETTING', key, value });
    }
  }
} catch {
  // ignore
}

// Persist settings changes
let lastSettingsJson = JSON.stringify(store.getState().settings);
store.subscribe(() => {
  const next = store.getState().settings;
  const json = JSON.stringify(next);
  if (json !== lastSettingsJson) {
    lastSettingsJson = json;
    try {
      localStorage.setItem('doublecal.settings', json);
    } catch {
      // ignore
    }
  }
});

// Clean up on HMR
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    unsubscribe();
  });
}
