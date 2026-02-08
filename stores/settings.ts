import { defineStore } from 'pinia';

export type TransferMode = 'overwrite' | 'append';
export type ThemeMode = 'light' | 'dark';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    transferMode: 'overwrite' as TransferMode,
    theme: 'light' as ThemeMode,
    haptics: false
  }),
  actions: {
    setTransferMode(mode: TransferMode) {
      this.transferMode = mode;
    },
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
    },
    setTheme(theme: ThemeMode) {
      this.theme = theme;
    },
    setHaptics(value: boolean) {
      this.haptics = value;
    }
  }
});
