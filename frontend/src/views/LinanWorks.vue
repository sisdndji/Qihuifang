<template>
  <MainContainer>
    <div class="linan-works-page">
      <div class="page-header">
        <h1 class="page-title">李囡作品展示</h1>
        <p class="page-subtitle">传承人李囡的经典作品集</p>
      </div>

      <div class="works-gallery" v-loading="loading">
        <div
          v-for="work in works"
          :key="work.id"
          class="work-card card-lacquer"
          @click="handleWorkClick(work)"
        >
          <div class="work-image">
            <img
              :src="resolveMediaUrl(work.image_url) || defaultImage"
              :alt="work.title"
              @error="handleImageError"
            />
            <div class="work-overlay">
              <div class="work-info">
                <h3 class="work-title">{{ work.title }}</h3>
                <p class="work-year">{{ work.year }}年</p>
              </div>
            </div>
          </div>
          <div class="work-content">
            <div class="work-meta">
              <el-tag type="warning" size="small">{{ work.style }}</el-tag>
              <span class="work-region">{{ work.region }}</span>
            </div>
            <div class="work-tags" v-if="work.tags">
              <el-tag
                v-for="(tag, index) in work.tags.split(',')"
                :key="index"
                size="small"
                type="info"
                class="work-tag"
              >
                {{ tag.trim() }}
              </el-tag>
            </div>
            <p class="work-description">{{ work.description || '暂无描述' }}</p>
          </div>
        </div>
      </div>

      <div v-if="!loading && works.length === 0" class="empty-state">
        <el-empty description="暂无作品">
          <el-button type="primary" @click="fetchWorks">重新加载</el-button>
        </el-empty>
        <div class="empty-tip">
          <p>提示：如果数据库中没有作品，请联系管理员添加作品</p>
          <p>或删除 backend/heritage.db 文件后重启后端服务器以重新初始化数据库</p>
        </div>
      </div>

      <!-- 作品详情弹窗 -->
      <el-dialog
        v-model="detailVisible"
        :title="selectedWork?.title"
        width="800px"
      >
        <div v-if="selectedWork" class="work-detail">
          <div class="detail-image">
            <img
              :src="resolveMediaUrl(selectedWork.image_url) || defaultImage"
              :alt="selectedWork.title"
            />
          </div>
          <div class="detail-info">
            <div class="info-row">
              <span class="label">作品名称：</span>
              <span>{{ selectedWork.title }}</span>
            </div>
            <div class="info-row">
              <span class="label">创作年份：</span>
              <span>{{ selectedWork.year }}年</span>
            </div>
            <div class="info-row">
              <span class="label">作品风格：</span>
              <el-tag type="warning">{{ selectedWork.style }}</el-tag>
            </div>
            <div class="info-row">
              <span class="label">创作地区：</span>
              <span>{{ selectedWork.region }}</span>
            </div>
            <div class="info-row" v-if="selectedWork.tags">
              <span class="label">作品标签：</span>
              <div class="tags-container">
                <el-tag
                  v-for="(tag, index) in selectedWork.tags.split(',')"
                  :key="index"
                  size="small"
                  type="info"
                  class="detail-tag"
                >
                  {{ tag.trim() }}
                </el-tag>
              </div>
            </div>
            <div class="info-row" v-if="selectedWork.description">
              <span class="label">作品描述：</span>
              <p class="description-text">{{ selectedWork.description }}</p>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </MainContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { worksAPI } from '../api/works';
import MainContainer from '../components/MainContainer.vue';
import { resolveMediaUrl } from '../utils/media';

const loading = ref(false);
const works = ref([]);
const detailVisible = ref(false);
const selectedWork = ref(null);

const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRDdDMEE1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM0QjQ2M0YiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpKflrabljLc8L3RleHQ+PC9zdmc+';

const fetchWorks = async () => {
  loading.value = true;
  try {
    const res = await worksAPI.getLinanGallery();
    works.value = res.data?.works || [];
    if (works.value.length === 0) {
      console.warn('李囡作品为空，可运行 node scripts/crawlLinanWorks.js 同步');
    }
  } catch (error) {
    console.error('获取作品失败:', error);
    works.value = [];
  } finally {
    loading.value = false;
  }
};

const handleWorkClick = (work) => {
  selectedWork.value = work;
  detailVisible.value = true;
};

const handleImageError = (event) => {
  event.target.src = defaultImage;
};

onMounted(() => {
  fetchWorks();
});
</script>

<style lang="scss" scoped>
.linan-works-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
}

.works-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.work-card {
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(163, 38, 42, 0.3);
  }
}

.work-image {
  width: 100%;
  height: 240px;
  position: relative;
  overflow: hidden;
  background: var(--color-wood);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.1);
  }
}

.work-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.work-card:hover .work-overlay {
  transform: translateY(0);
}

.work-info {
  color: white;
}

.work-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.work-year {
  font-size: 14px;
  opacity: 0.9;
}

.work-content {
  padding: 16px;
}

.work-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.work-region {
  font-size: 13px;
  color: var(--text-secondary);
}

.work-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-tip {
  margin-top: 20px;
  padding: 16px;
  background: rgba(163, 38, 42, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(163, 38, 42, 0.3);
  
  p {
    margin: 8px 0;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
  }
}

.work-detail {
  .detail-image {
    width: 100%;
    margin-bottom: 24px;

    img {
      width: 100%;
      max-height: 400px;
      object-fit: contain;
      border-radius: 8px;
    }
  }

  .detail-info {
    .info-row {
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;

      .label {
        font-weight: 600;
        color: var(--color-primary);
        width: 100px;
        flex-shrink: 0;
      }

      .description-text {
        margin: 0;
        line-height: 1.8;
        color: var(--text-main);
      }

      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .detail-tag {
        font-size: 13px;
      }
    }
  }
}
</style>

