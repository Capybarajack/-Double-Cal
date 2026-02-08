<template>
  <div class="transfer" role="group" aria-label="Transfer controls">
    <button
      class="transfer__btn"
      type="button"
      :disabled="!canTopToBottom.ok"
      @click="emit('transfer', { from: 'top', to: 'bottom' })"
      aria-label="Send top result to bottom"
    >
      ↓
      <span class="transfer__btnLabel">Top → Bottom</span>
    </button>

    <div class="transfer__hint" aria-live="polite">
      <span v-if="hintText">{{ hintText }}</span>
      <span v-else class="transfer__hintGhost">&nbsp;</span>
    </div>

    <button
      class="transfer__btn"
      type="button"
      :disabled="!canBottomToTop.ok"
      @click="emit('transfer', { from: 'bottom', to: 'top' })"
      aria-label="Send bottom result to top"
    >
      ↑
      <span class="transfer__btnLabel">Bottom → Top</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCalcStore, type CalcId } from '~/stores/calc';

defineProps<{ activeFrom: CalcId }>();

const emit = defineEmits<{ (e: 'transfer', payload: { from: CalcId; to: CalcId }): void }>();

const calc = useCalcStore();

const canTopToBottom = computed(() => calc.getTransferValue('top'));
const canBottomToTop = computed(() => calc.getTransferValue('bottom'));

const hintText = computed(() => {
  // Prefer showing the first disabled reason, otherwise store hint (from last attempted transfer)
  if (!canTopToBottom.value.ok) return canTopToBottom.value.reason;
  if (!canBottomToTop.value.ok) return canBottomToTop.value.reason;
  return calc.hint;
});
</script>
