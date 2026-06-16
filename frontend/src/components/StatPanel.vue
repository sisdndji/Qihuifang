<template>
  <div class="stat-panel">
    <div class="panel-header">
      <h3 class="panel-title">{{ title }}</h3>
    </div>
    <div class="panel-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String
});
</script>

<style lang="scss" scoped>
.stat-panel {
  background: rgba(27, 20, 16, 0.8);
  border: 1px solid rgba(216, 184, 119, 0.3);
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  border-bottom: 1px solid rgba(216, 184, 119, 0.3);
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-accent-gold);
  margin: 0;
}

.panel-content {
  flex: 1;
}
</style>


