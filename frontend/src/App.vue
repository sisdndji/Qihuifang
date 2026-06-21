<template>
  <div id="app">
    <AppHeader v-if="showHeader" />
    <main class="app-main">
      <router-view />
    </main>
    <AppFooter v-if="showFooter" />
    <ChatBot v-if="showHeader" />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import ChatBot from './components/ChatBot.vue';
import { platformAPI } from './api/platform';

const route = useRoute();

const isAdminRoute = computed(() => route.path.startsWith('/admin'));
const isAuthPage = computed(() => route.name === 'Login' || route.name === 'Register');

const showHeader = computed(() => !isAuthPage.value && !isAdminRoute.value);
const showFooter = computed(() => !isAuthPage.value && !isAdminRoute.value);

watch(
  () => route.fullPath,
  async () => {
    if (!isAuthPage.value && !isAdminRoute.value) {
      try {
        await platformAPI.trackVisit();
      } catch {
        // 访问量记录失败不影响页面展示
      }
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>


