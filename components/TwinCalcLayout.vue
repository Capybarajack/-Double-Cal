<template>
  <main class="layout">
    <header class="topbar">
      <div class="brand">
        <div class="brand__dot" aria-hidden="true" />
        <div class="brand__title">
          <div class="brand__name">Double-Cal</div>
          <div class="brand__tag">twin calculator</div>
        </div>
      </div>

      <button class="icon-btn" type="button" @click="settingsOpen = true" aria-label="Open settings">
        ⚙️
      </button>
    </header>

    <section class="grid" :data-orientation="orientation">
      <CalculatorPanel id="top" title="Top" :active="activeId === 'top'" @activate="activeId = 'top'" />

      <TransferControl
        class="transfer"
        :active-from="activeId"
        @transfer="onTransfer"
      />

      <CalculatorPanel id="bottom" title="Bottom" :active="activeId === 'bottom'" @activate="activeId = 'bottom'" />
    </section>

    <SettingsDrawer :open="settingsOpen" @close="settingsOpen = false" />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CalculatorPanel from '~/components/CalculatorPanel.vue';
import TransferControl from '~/components/TransferControl.vue';
import SettingsDrawer from '~/components/SettingsDrawer.vue';
import { useKeyboard, type KeyAction } from '~/composables/useKeyboard';
import { useCalcStore, type CalcId } from '~/stores/calc';

const calc = useCalcStore();

const settingsOpen = ref(false);
const activeId = ref<CalcId>('top');

const orientation = computed(() => {
  // Simple heuristic; CSS handles layout.
  if (!import.meta.client) return 'portrait';
  return window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';
});

function dispatchKey(action: KeyAction) {
  const id = activeId.value;
  if (action.kind === 'input') calc.input(id, action.token);
  if (action.kind === 'backspace') calc.backspace(id);
  if (action.kind === 'clear') calc.clear(id);
  if (action.kind === 'evaluate') calc.evaluate(id);
}

useKeyboard(dispatchKey);

function onTransfer(payload: { from: CalcId; to: CalcId }) {
  // Make receiver active so user can continue immediately.
  activeId.value = payload.to;
  calc.transfer(payload.from, payload.to);
}
</script>
