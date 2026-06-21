<template>
  <div class="master-card card-lacquer" @click="handleClick">
    <div class="card-avatar">
      <el-avatar :size="80" :src="resolvedAvatarUrl" fit="cover">
        {{ name.charAt(0) }}
      </el-avatar>
    </div>
    <div class="card-content">
      <h3 class="card-name">{{ name }}</h3>
      <p class="card-generation">{{ generation }}</p>
      <div class="card-region">
        <el-icon><Location /></el-icon>
        {{ region }}
      </div>
      <div class="card-tags" v-if="skillTags">
        <el-tag
          v-for="(tag, index) in skillTagsArray"
          :key="index"
          size="small"
          type="warning"
          class="skill-tag"
        >
          {{ tag }}
        </el-tag>
      </div>
      <p class="card-bio" v-if="bio">{{ bioShort }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Location } from '@element-plus/icons-vue';
import { resolveMediaUrl } from '../utils/media';

const props = defineProps({
  name: String,
  generation: String,
  region: String,
  bio: String,
  avatarUrl: String,
  skillTags: String,
  id: Number
});

const emit = defineEmits(['click']);

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNEOEI4NzciLz48dGV4dCB4PSI1MCUiIHk9IjU1JSIgZm9udC1zaXplPSIzMCIgZmlsbD0iIzRBMkEyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaXoDwvdGV4dD48L3N2Zz4=';

const resolvedAvatarUrl = computed(() => resolveMediaUrl(props.avatarUrl) || defaultAvatar);

const skillTagsArray = computed(() => {
  if (!props.skillTags) return [];
  return props.skillTags.split(',').map(t => t.trim()).slice(0, 3);
});

const bioShort = computed(() => {
  if (!props.bio) return '';
  return props.bio.length > 80 ? props.bio.substring(0, 80) + '...' : props.bio;
});

const handleClick = () => {
  if (props.id) {
    emit('click', props.id);
  }
};
</script>

<style lang="scss" scoped>
.master-card {
  cursor: pointer;
  text-align: center;
  padding: 24px;
}

.card-avatar {
  margin-bottom: 16px;
}

.card-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.card-generation {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.card-region {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-bottom: 12px;
}

.skill-tag {
  background: var(--color-accent-gold);
  border: none;
  color: var(--color-secondary);
}

.card-bio {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  text-align: left;
  margin-top: 12px;
}
</style>


