<template>
  <section class="panel" :data-active="active" @pointerdown="emit('activate')">
    <header class="panel__header">
      <div class="panel__title">{{ title }}</div>
      <div class="panel__meta">{{ id.toUpperCase() }}</div>
    </header>

    <Display
      :expression="c.expression"
      :result="c.result"
      :error="c.error"
      :mode="c.mode"
    />

    <Keypad @press="onPress" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Display from '~/components/Display.vue';
import Keypad from '~/components/Keypad.vue';
import { useCalcStore, type CalcId } from '~/stores/calc';

const props = defineProps<{
  id: CalcId;
  title: string;
  active: boolean;
}>();

const emit = defineEmits<{ (e: 'activate'): void }>();

const calc = useCalcStore();
const c = computed(() => calc.getCalc(props.id));

function onPress(token: string) {
  emit('activate');

  if (token === 'C') return calc.clear(props.id);
  if (token === '⌫') return calc.backspace(props.id);
  if (token === '=') return calc.evaluate(props.id);

  // Map display operators to engine tokens
  if (token === '×') return calc.input(props.id, '*');
  if (token === '÷') return calc.input(props.id, '/');

  return calc.input(props.id, token);
}
</script>
