<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="divider-gold"></div>
      <div class="platform-stats" v-if="stats">
        <span class="stat-item">平台用户 <strong>{{ stats.userCountDisplay }}</strong></span>
        <span class="stat-divider">|</span>
        <span class="stat-item">浏览量 <strong>{{ stats.pageViewsDisplay }}</strong> 次</span>
      </div>
      <p class="footer-text">国家级非物质文化遗产 · 国漆髹涂技艺（示意）</p>
      <p class="footer-text-small">本网站为学习与展示用途</p>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { platformAPI } from '../api/platform';

const stats = ref(null);

onMounted(async () => {
  try {
    const res = await platformAPI.getStats();
    stats.value = res.data;
  } catch (error) {
    console.error('获取平台统计失败:', error);
  }
});
</script>

<style lang="scss" scoped>
.app-footer {
  background: var(--color-bg);
  padding: 30px 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.platform-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin: 16px 0 8px;
  flex-wrap: wrap;
  color: var(--text-secondary);
  font-size: 14px;

  strong {
    color: var(--color-primary);
    font-weight: 600;
  }
}

.stat-divider {
  opacity: 0.4;
}

.footer-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 10px 0;
}

.footer-text-small {
  color: var(--text-secondary);
  font-size: 12px;
  opacity: 0.7;
  margin: 5px 0;
}
</style>


