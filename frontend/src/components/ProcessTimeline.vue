<template>
  <div class="process-timeline">
    <h3 class="timeline-title">髹涂工艺流程图</h3>
    <div class="timeline-container">
      <div
        v-for="(step, index) in displayedSteps"
        :key="step.id"
        class="timeline-item"
        :class="{ 'active': index === activeIndex }"
      >
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="step-header">
            <span class="step-order">第{{ step.step_order }}步</span>
            <span class="step-name">{{ step.step_name }}</span>
          </div>
          <p class="step-desc">{{ step.short_desc }}</p>
          <div class="step-meta">
            <span class="meta-badge duration">耗时: {{ step.est_duration_hours }}h</span>
            <span class="meta-badge level" :class="`level-${step.skill_level}`">
              难度: {{ step.skill_level }}/5
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showMore && steps.length > displayedCount" class="timeline-more">
      <el-button type="primary" @click="showAll">查看完整工艺</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  steps: {
    type: Array,
    default: () => []
  },
  showMore: {
    type: Boolean,
    default: true
  },
  maxDisplay: {
    type: Number,
    default: 6
  }
});

const activeIndex = ref(0);
const showAllSteps = ref(false);

const displayedCount = computed(() => {
  return showAllSteps.value ? props.steps.length : props.maxDisplay;
});

const displayedSteps = computed(() => {
  return props.steps.slice(0, displayedCount.value);
});

const showAll = () => {
  showAllSteps.value = true;
};
</script>

<style lang="scss" scoped>
.process-timeline {
  background: var(--color-wood);
  border: 2px solid var(--color-secondary);
  border-radius: 8px;
  padding: 24px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--color-accent-gold), transparent);
  }
}

.timeline-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 24px;
  text-align: center;
}

.timeline-container {
  position: relative;
  padding-left: 30px;

  &::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--color-secondary);
  }
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
  padding-left: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  &.active .timeline-dot {
    background: var(--color-accent-gold);
    box-shadow: 0 0 12px rgba(216, 184, 119, 0.6);
  }
}

.timeline-dot {
  position: absolute;
  left: -22px;
  top: 8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-secondary);
  border: 3px solid var(--color-wood);
  transition: all 0.3s ease;
}

.timeline-content {
  background: white;
  padding: 16px;
  border-radius: 6px;
  border-left: 3px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.step-order {
  background: var(--color-primary);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.step-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
}

.step-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.step-meta {
  display: flex;
  gap: 8px;
}

.meta-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;

  &.duration {
    background: rgba(163, 38, 42, 0.1);
    color: var(--color-primary);
  }

  &.level {
    background: rgba(74, 42, 32, 0.1);
    color: var(--color-secondary);

    &.level-5 {
      background: rgba(163, 38, 42, 0.2);
    }
    &.level-4 {
      background: rgba(163, 38, 42, 0.15);
    }
  }
}

.timeline-more {
  text-align: center;
  margin-top: 24px;
}
</style>


