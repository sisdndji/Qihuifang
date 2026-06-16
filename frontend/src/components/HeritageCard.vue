<template>
  <div class="heritage-card card-lacquer" @click="handleClick">
    <div class="card-image" :style="{ backgroundImage: `url(${imageUrl || defaultImage})` }">
      <div class="card-badge">{{ level }}</div>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <div class="card-meta">
        <span class="meta-item">
          <el-icon><Location /></el-icon>
          {{ region }}
        </span>
        <span class="meta-item">
          <el-icon><Collection /></el-icon>
          {{ category }}
        </span>
      </div>
      <p class="card-intro">{{ intro }}</p>
    </div>
  </div>
</template>

<script setup>
import { Location, Collection } from '@element-plus/icons-vue';

const props = defineProps({
  title: String,
  category: String,
  region: String,
  level: String,
  imageUrl: String,
  intro: String,
  id: Number
});

const emit = defineEmits(['click']);

const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRDdDMEE1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM0QjQ2M0YiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpKflrabljLc8L3RleHQ+PC9zdmc+';

const handleClick = () => {
  if (props.id) {
    emit('click', props.id);
  }
};
</script>

<style lang="scss" scoped>
.heritage-card {
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
  background-color: var(--color-wood);
}

.card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--color-primary);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.card-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-intro {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>


