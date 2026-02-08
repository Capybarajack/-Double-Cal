<template>
  <div class="app" :data-theme="settings.theme">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings';

const settings = useSettingsStore();
</script>
