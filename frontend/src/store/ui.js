import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const loading = ref(false);
  const theme = ref('light');

  function setLoading(value) {
    loading.value = value;
  }

  function setTheme(value) {
    theme.value = value;
  }

  return {
    loading,
    theme,
    setLoading,
    setTheme
  };
});


