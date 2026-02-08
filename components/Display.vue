<template>
  <div class="display" :data-mode="mode" :data-error="!!error">
    <div class="display__expr" ref="exprEl" aria-label="Expression">
      <span v-if="expression" class="display__exprText">{{ expression }}</span>
      <span v-else class="display__placeholder">0</span>
    </div>

    <div class="display__result" aria-label="Result">
      <span v-if="error" class="display__error">Error</span>
      <span v-else-if="mode === 'result' && result" class="display__value">{{ result }}</span>
      <span v-else class="display__ghost">&nbsp;</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUpdated, ref } from 'vue';
import type { CalcMode } from '~/stores/calc';

const props = defineProps<{
  expression: string;
  result: string;
  error: string | null;
  mode: CalcMode;
}>();

const exprEl = ref<HTMLElement | null>(null);

// Auto-scroll expression to the end while typing.
onUpdated(() => {
  if (!exprEl.value) return;
  exprEl.value.scrollLeft = exprEl.value.scrollWidth;
});
</script>
