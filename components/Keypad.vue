<template>
  <div class="keypad" role="group" aria-label="Calculator keypad">
    <button
      v-for="k in keys"
      :key="k.id"
      class="key"
      type="button"
      :class="k.kind"
      @click="press(k.emit)"
      @pointerdown="onPointerDown(k)"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <span class="key__label">{{ k.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { useSettingsStore } from '~/stores/settings';

type KeyDef = {
  id: string;
  label: string;
  emit: string;
  kind?: 'op' | 'fn' | 'eq';
};

const emit = defineEmits<{ (e: 'press', token: string): void }>();
const settings = useSettingsStore();

const keys: KeyDef[] = [
  { id: 'c', label: 'C', emit: 'C', kind: 'fn' },
  { id: 'lp', label: '(', emit: '(' },
  { id: 'rp', label: ')', emit: ')' },
  { id: 'bs', label: '⌫', emit: '⌫', kind: 'fn' },

  { id: '7', label: '7', emit: '7' },
  { id: '8', label: '8', emit: '8' },
  { id: '9', label: '9', emit: '9' },
  { id: 'div', label: '÷', emit: '÷', kind: 'op' },

  { id: '4', label: '4', emit: '4' },
  { id: '5', label: '5', emit: '5' },
  { id: '6', label: '6', emit: '6' },
  { id: 'mul', label: '×', emit: '×', kind: 'op' },

  { id: '1', label: '1', emit: '1' },
  { id: '2', label: '2', emit: '2' },
  { id: '3', label: '3', emit: '3' },
  { id: 'sub', label: '−', emit: '-', kind: 'op' },

  { id: '0', label: '0', emit: '0' },
  { id: 'dot', label: '.', emit: '.' },
  { id: 'mod', label: '%', emit: '%', kind: 'op' },
  { id: 'add', label: '+', emit: '+', kind: 'op' },

  { id: 'eq', label: '=', emit: '=', kind: 'eq' }
];

const repeatTimer = ref<number | null>(null);
const repeatDelayTimer = ref<number | null>(null);

function vibrate() {
  if (!settings.haptics) return;
  if (!import.meta.client) return;
  if (!('vibrate' in navigator)) return;
  navigator.vibrate(10);
}

function press(token: string) {
  vibrate();
  emit('press', token);
}

function clearTimers() {
  if (repeatTimer.value != null) window.clearInterval(repeatTimer.value);
  if (repeatDelayTimer.value != null) window.clearTimeout(repeatDelayTimer.value);
  repeatTimer.value = null;
  repeatDelayTimer.value = null;
}

function onPointerDown(k: KeyDef) {
  // Long-press delete to repeat
  if (k.emit !== '⌫') return;

  clearTimers();
  // Start repeating after a short delay
  repeatDelayTimer.value = window.setTimeout(() => {
    repeatTimer.value = window.setInterval(() => press('⌫'), 60);
  }, 350);
}

function onPointerUp() {
  clearTimers();
}

onBeforeUnmount(() => clearTimers());
</script>
