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
const isLoginRoute = computed(() => route.name === 'Login');

const showHeader = computed(() => !isLoginRoute.value && !isAdminRoute.value);
const showFooter = computed(() => !isLoginRoute.value && !isAdminRoute.value);

watch(
  () => route.fullPath,
  () => {
    if (!isLoginRoute.value && !isAdminRoute.value) {
      platformAPI.trackVisit().catch(() => {});
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


