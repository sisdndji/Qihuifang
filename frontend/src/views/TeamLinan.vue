<template>
  <MainContainer>
    <div class="team-linan-page">
      <div class="page-header">
        <h1 class="page-title">团队与李囡</h1>
        <p class="page-subtitle">传承人李囡及其团队作品管理</p>
      </div>

      <div class="page-content">
        <!-- 左侧：视频播放区域 -->
        <div class="left-section">
          <div class="video-section card-lacquer">
            <h2 class="section-title">传承人视频</h2>
            <div class="video-container">
              <video
                ref="videoRef"
                :src="videoUrl"
                controls
                class="video-player"
                @error="handleVideoError"
              >
                您的浏览器不支持视频播放
              </video>
              <div class="video-info">
                <p class="video-title">李囡 · 国漆髹涂技艺传承</p>
                <p class="video-desc">了解传承人李囡的技艺传承之路</p>
              </div>
            </div>
          </div>

          <!-- 传承人信息卡片 -->
          <div class="master-info-card card-lacquer">
            <div class="master-avatar-section">
              <el-avatar :size="120" :src="getAvatarUrl()">
                {{ masterInfo.name && masterInfo.name.charAt(0) || '李' }}
              </el-avatar>
              <h3 class="master-name">{{ masterInfo.name }}</h3>
              <p class="master-title">{{ masterInfo.generation }}</p>
            </div>
            <div class="master-stats">
              <div class="stat-item">
                <div class="stat-value">{{ works.length }}</div>
                <div class="stat-label">作品数量</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ skillTags.length }}</div>
                <div class="stat-label">技能标签</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：作品管理区域 -->
        <div class="right-section">
          <div class="works-management card-lacquer">
            <div class="management-header">
              <h2 class="section-title">作品管理</h2>
              <el-button type="primary" @click="handleAddWork">
                <el-icon><Plus /></el-icon>
                新增作品
              </el-button>
            </div>

            <div class="works-table" v-loading="loading">
              <el-table :data="works" border style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column label="作品图片" width="100">
                  <template #default="{ row }">
                    <el-image
                      :src="row.image_url || defaultImage"
                      :preview-src-list="[row.image_url || defaultImage]"
                      fit="cover"
                      style="width: 60px; height: 60px; border-radius: 4px;"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="title" label="作品名称" min-width="150" />
                <el-table-column prop="year" label="年份" width="100" />
                <el-table-column prop="style" label="风格" width="120" />
                <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
                <el-table-column label="操作" width="180" fixed="right">
                  <template #default="{ row }">
                    <el-button size="small" type="primary" @click="handleEditWork(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDeleteWork(row.id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>

      <!-- 作品表单弹窗 -->
      <el-dialog
        v-model="formVisible"
        :title="formTitle"
        width="700px"
        :close-on-click-modal="false"
      >
        <WorkForm
          :form-data="formData"
          @submit="handleFormSubmit"
          @cancel="formVisible = false"
        />
      </el-dialog>
    </div>
  </MainContainer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { worksAPI } from '../api/works';
import { mastersAPI } from '../api/masters';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import MainContainer from '../components/MainContainer.vue';
import WorkForm from '../components/WorkForm.vue';

const loading = ref(false);
const works = ref([]);
const masterInfo = ref({});
const formVisible = ref(false);
const formTitle = ref('');
const formData = ref({});
const videoRef = ref(null);
const videoUrl = '/videos/home-video.mp4';

const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRDdDMEE1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM0QjQ2M0YiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpKflrabljLc8L3RleHQ+PC9zdmc+';

const skillTags = computed(() => {
  if (!masterInfo.value.skill_tags) return [];
  return masterInfo.value.skill_tags.split(',').map(t => t.trim());
});

const fetchMasterInfo = async () => {
  try {
    const res = await mastersAPI.getAll({ region: '哈尔滨' });
    const linan = res.data.find(m => m.name === '李囡');
    if (linan) {
      masterInfo.value = linan;
      await fetchWorks(linan.id);
    }
  } catch (error) {
    console.error('获取传承人信息失败:', error);
  }
};

const fetchWorks = async (masterId) => {
  loading.value = true;
  try {
    const res = await worksAPI.getAll({ master_id: masterId });
    works.value = res.data;
  } catch (error) {
    ElMessage.error('获取作品失败');
  } finally {
    loading.value = false;
  }
};

const handleAddWork = () => {
  formData.value = {
    master_id: masterInfo.value.id,
    heritage_id: masterInfo.value.main_heritage_id || null
  };
  formTitle.value = '新增作品';
  formVisible.value = true;
};

const handleEditWork = (row) => {
  formData.value = { ...row };
  formTitle.value = '编辑作品';
  formVisible.value = true;
};

const handleDeleteWork = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个作品吗？', '提示', { type: 'warning' });
    await worksAPI.delete(id);
    ElMessage.success('删除成功');
    await fetchWorks(masterInfo.value.id);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const handleFormSubmit = async (data) => {
  try {
    if (data.id) {
      await worksAPI.update(data.id, data);
      ElMessage.success('更新成功');
    } else {
      await worksAPI.create(data);
      ElMessage.success('创建成功');
    }
    formVisible.value = false;
    await fetchWorks(masterInfo.value.id);
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const handleVideoError = () => {
  console.warn('视频加载失败');
};

// 获取头像URL，处理各种路径格式
const getAvatarUrl = () => {
  // 优先使用 public/images/masters/chenzaitian.jpg
  if (!masterInfo.value) return '/images/masters/chenzaitian.jpg';
  
  const avatarUrl = masterInfo.value.avatar_url;
  if (!avatarUrl) return '/images/masters/chenzaitian.jpg';
  
  // 如果已经是完整路径（以/开头），直接返回
  if (avatarUrl.startsWith('/')) {
    return avatarUrl;
  }
  
  // 如果是完整URL，直接返回
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // 如果是uploads路径（没有斜杠），添加斜杠
  if (avatarUrl.startsWith('uploads/')) {
    return '/' + avatarUrl;
  }
  
  // 其他情况，添加斜杠
  return '/' + avatarUrl;
};

onMounted(() => {
  fetchMasterInfo();
});
</script>

<style lang="scss" scoped>
.team-linan-page {
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

.page-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.left-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.video-section {
  padding: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-accent-gold);
}

.video-container {
  .video-player {
    width: 100%;
    border-radius: 8px;
    background: #000;
  }

  .video-info {
    margin-top: 16px;

    .video-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-primary);
      margin-bottom: 8px;
    }

    .video-desc {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0;
    }
  }
}

.master-info-card {
  padding: 24px;
  text-align: center;
}

.master-avatar-section {
  margin-bottom: 24px;

  .master-name {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-primary);
    margin: 16px 0 8px 0;
  }

  .master-title {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0;
  }
}

.master-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(216, 184, 119, 0.3);
}

.stat-item {
  text-align: center;

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
}

.works-management {
  padding: 24px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.works-table {
  :deep(.el-image) {
    cursor: pointer;
  }
}
</style>

