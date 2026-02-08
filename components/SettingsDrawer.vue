<template>
  <Teleport to="body">
    <div v-if="open" class="drawer" role="dialog" aria-modal="true" aria-label="Settings">
      <button class="drawer__backdrop" type="button" @click="emit('close')" aria-label="Close settings" />

      <div class="drawer__panel">
        <header class="drawer__header">
          <div class="drawer__title">Settings</div>
          <button class="icon-btn" type="button" @click="emit('close')" aria-label="Close settings">✕</button>
        </header>

        <section class="drawer__section">
          <div class="drawer__label">Transfer mode</div>
          <label class="radio">
            <input
              type="radio"
              name="transfer"
              value="overwrite"
              :checked="settings.transferMode === 'overwrite'"
              @change="settings.setTransferMode('overwrite')"
            />
            <span>Overwrite (default)</span>
          </label>
          <label class="radio">
            <input
              type="radio"
              name="transfer"
              value="append"
              :checked="settings.transferMode === 'append'"
              @change="settings.setTransferMode('append')"
            />
            <span>Append</span>
          </label>
        </section>

        <section class="drawer__section">
          <div class="drawer__label">Theme</div>
          <div class="row">
            <button
              class="seg"
              type="button"
              :data-active="settings.theme === 'light'"
              @click="settings.setTheme('light')"
            >
              Light
            </button>
            <button
              class="seg"
              type="button"
              :data-active="settings.theme === 'dark'"
              @click="settings.setTheme('dark')"
            >
              Dark
            </button>
          </div>
        </section>

        <section class="drawer__section">
          <div class="drawer__label">Haptics</div>
          <label class="switch">
            <input type="checkbox" :checked="settings.haptics" @change="toggleHaptics" />
            <span class="switch__ui" aria-hidden="true" />
            <span class="switch__text">Vibrate on key press</span>
          </label>
          <div class="drawer__help">Requires a device/browser that supports <code>navigator.vibrate</code>.</div>
        </section>

        <footer class="drawer__footer">
          <div class="drawer__footerNote">Double-Cal • Nuxt 3 • Pinia • no eval</div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings';

defineProps<{ open: boolean }>();

const emit = defineEmits<{ (e: 'close'): void }>();

const settings = useSettingsStore();

function toggleHaptics(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  settings.setHaptics(checked);
}
</script>
