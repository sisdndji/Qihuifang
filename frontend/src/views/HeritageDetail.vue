<template>
  <MainContainer>
    <div class="heritage-detail-page" v-loading="loading">
      <div v-if="heritage" class="detail-content">
        <!-- 顶部大图 -->
        <div class="detail-header">
          <div
            class="header-image"
            :style="{ backgroundImage: `url(${resolveMediaUrl(heritage.image_url) || defaultImage})` }"
          >
            <div class="header-overlay">
              <h1 class="header-title">{{ heritage.name }}</h1>
              <div class="header-meta">
                <el-tag type="warning" size="large">{{ heritage.level }}</el-tag>
                <span class="meta-item">
                  <el-icon><Location /></el-icon>
                  {{ heritage.region }}
                </span>
                <span class="meta-item">
                  <el-icon><Collection /></el-icon>
                  {{ heritage.category }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 项目介绍 -->
        <div class="detail-section card-lacquer">
          <h2 class="section-title">项目介绍</h2>
          <p class="section-content">{{ heritage.intro }}</p>
        </div>

        <!-- 统计信息 -->
        <div v-if="heritage.stats" class="detail-stats">
          <div class="stat-item">
            <div class="stat-value">{{ heritage.stats.stepCount }}</div>
            <div class="stat-label">工序数量</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ heritage.stats.avgSkillLevel }}</div>
            <div class="stat-label">平均难度</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ Math.round(heritage.stats.totalDuration) }}h</div>
            <div class="stat-label">总耗时</div>
          </div>
        </div>

        <!-- 髹涂工艺时间线 -->
        <div class="detail-section" v-if="processSteps.length > 0">
          <h2 class="section-title">髹涂三十六道工艺</h2>
          <ProcessTimeline :steps="processSteps" :show-more="false" />
        </div>

        <!-- 关联传承人 -->
        <div class="detail-section" v-if="relatedMasters.length > 0">
          <h2 class="section-title">相关传承人</h2>
          <div class="masters-grid">
            <MasterCard
              v-for="master in relatedMasters"
              :key="master.id"
              :id="master.id"
              :name="master.name"
              :generation="master.generation"
              :region="master.region"
              :bio="master.bio"
              :avatar-url="master.avatar_url"
              :skill-tags="master.skill_tags"
            />
          </div>
        </div>

        <!-- 留言讨论区 -->
        <CommentSection :heritage-id="heritage.id" />
      </div>
    </div>
  </MainContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { heritageAPI } from '../api/heritage';
import { processStepsAPI } from '../api/processSteps';
import { mastersAPI } from '../api/masters';
import { Location, Collection } from '@element-plus/icons-vue';
import MainContainer from '../components/MainContainer.vue';
import ProcessTimeline from '../components/ProcessTimeline.vue';
import CommentSection from '../components/CommentSection.vue';
import MasterCard from '../components/MasterCard.vue';
import { resolveMediaUrl } from '../utils/media';

const route = useRoute();

const loading = ref(false);
const heritage = ref(null);
const processSteps = ref([]);
const relatedMasters = ref([]);

const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0E1MjYyQSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaXoOWbvuaXoOWbvuaXoOWbvjwvdGV4dD48L3N2Zz4=';

const fetchHeritage = async () => {
  loading.value = true;
  try {
    const res = await heritageAPI.getById(route.params.id);
    heritage.value = res.data;
  } catch (error) {
    console.error('获取项目详情失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchProcessSteps = async () => {
  try {
    const res = await processStepsAPI.getAll({ heritage_id: route.params.id });
    processSteps.value = res.data;
  } catch (error) {
    console.error('获取工序失败:', error);
  }
};

const fetchRelatedMasters = async () => {
  try {
    const res = await mastersAPI.getAll({ heritage_id: route.params.id });
    relatedMasters.value = res.data;
  } catch (error) {
    console.error('获取传承人失败:', error);
  }
};

onMounted(() => {
  fetchHeritage();
  fetchProcessSteps();
  fetchRelatedMasters();
});
</script>

<style lang="scss" scoped>
.heritage-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.detail-header {
  margin-bottom: 40px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.header-image {
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  background-color: var(--color-primary);
  position: relative;
}

.header-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 40px;
  color: white;
}

.header-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.detail-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-accent-gold);
}

.section-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-main);
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.stat-item {
  background: var(--color-wood);
  border: 2px solid var(--color-secondary);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.masters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
</style>


