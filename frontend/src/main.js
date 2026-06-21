import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import axiosInstance from './api/axiosInstance';
import { loadRuntimeConfig } from './config/api';
import './styles/globals.scss';

async function bootstrap() {
  const config = await loadRuntimeConfig();
  if (config.apiBaseUrl) {
    axiosInstance.defaults.baseURL = config.apiBaseUrl;
  }

  const app = createApp(App);
  const pinia = createPinia();

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }

  app.use(pinia);
  app.use(router);
  app.use(ElementPlus);
  app.mount('#app');
}

bootstrap();


