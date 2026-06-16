<template>
  <MainContainer>
    <div class="masters-page">
      <h1 class="page-title">匠人传承</h1>
      <p class="page-intro">传承千年髹涂技艺，守护非遗文化瑰宝</p>

      <!-- 筛选条件 -->
      <div class="filter-section card-lacquer">
        <el-form :inline="true" :model="filters">
          <el-form-item label="地区">
            <el-select v-model="filters.region" placeholder="全部" clearable style="width: 150px">
              <el-option label="福州" value="福州" />
              <el-option label="扬州" value="扬州" />
              <el-option label="成都" value="成都" />
              <el-option label="景德镇" value="景德镇" />
              <el-option label="厦门" value="厦门" />
              <el-option label="重庆" value="重庆" />
            </el-select>
          </el-form-item>
          <el-form-item label="技能标签">
            <el-select v-model="filters.skill_tag" placeholder="全部" clearable style="width: 150px">
              <el-option label="螺钿" value="螺钿" />
              <el-option label="推光" value="推光" />
              <el-option label="描金" value="描金" />
              <el-option label="修复" value="修复" />
              <el-option label="器物制作" value="器物制作" />
              <el-option label="漆画创作" value="漆画创作" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 传承人列表 -->
      <div class="masters-list" v-loading="loading">
        <div class="masters-grid">
          <MasterCard
            v-for="master in masters"
            :key="master.id"
            :id="master.id"
            :name="master.name"
            :generation="master.generation"
            :region="master.region"
            :bio="master.bio"
            :avatar-url="master.avatar_url"
            :skill-tags="master.skill_tags"
            @click="handleMasterClick"
          />
        </div>
        <div v-if="!loading && masters.length === 0" class="empty-state">
          <p>暂无数据</p>
        </div>
      </div>

      <!-- 传承人详情弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="selectedMaster?.name"
        width="600px"
      >
        <div v-if="selectedMaster" class="master-detail">
          <div class="detail-row">
            <span class="label">代际：</span>
            <span>{{ selectedMaster.generation }}</span>
          </div>
          <div class="detail-row">
            <span class="label">地区：</span>
            <span>{{ selectedMaster.region }}</span>
          </div>
          <div class="detail-row" v-if="selectedMaster.skill_tags">
            <span class="label">技能标签：</span>
            <div class="tags">
              <el-tag
                v-for="(tag, index) in selectedMaster.skill_tags.split(',')"
                :key="index"
                type="warning"
                style="margin-right: 8px"
              >
                {{ tag.trim() }}
              </el-tag>
            </div>
          </div>
          <div class="detail-row">
            <span class="label">简介：</span>
            <p class="bio-text">{{ selectedMaster.bio }}</p>
          </div>
          <div class="detail-row" v-if="selectedMaster.representative_works">
            <span class="label">代表作品：</span>
            <p>{{ selectedMaster.representative_works }}</p>
          </div>
        </div>
      </el-dialog>
    </div>
  </MainContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { mastersAPI } from '../api/masters';
import MainContainer from '../components/MainContainer.vue';
import MasterCard from '../components/MasterCard.vue';

const loading = ref(false);
const masters = ref([]);
const dialogVisible = ref(false);
const selectedMaster = ref(null);

const filters = reactive({
  region: '',
  skill_tag: ''
});

const fetchMasters = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.region) params.region = filters.region;
    if (filters.skill_tag) params.skill_tag = filters.skill_tag;

    const res = await mastersAPI.getAll(params);
    masters.value = res.data;
  } catch (error) {
    console.error('获取传承人失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  fetchMasters();
};

const handleReset = () => {
  filters.region = '';
  filters.skill_tag = '';
  fetchMasters();
};

const handleMasterClick = async (id) => {
  try {
    const res = await mastersAPI.getById(id);
    selectedMaster.value = res.data;
    dialogVisible.value = true;
  } catch (error) {
    console.error('获取传承人详情失败:', error);
  }
};

onMounted(() => {
  fetchMasters();
});
</script>

<style lang="scss" scoped>
.masters-page {
  .page-title {
    font-size: 32px;
    font-weight: 600;
    color: var(--color-primary);
    text-align: center;
    margin-bottom: 12px;
  }

  .page-intro {
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: 40px;
    font-size: 16px;
  }
}

.filter-section {
  margin-bottom: 30px;
  padding: 20px;
}

.masters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.master-detail {
  .detail-row {
    margin-bottom: 20px;

    .label {
      font-weight: 600;
      color: var(--color-primary);
      display: inline-block;
      width: 100px;
    }

    .bio-text {
      margin-top: 8px;
      line-height: 1.8;
      color: var(--text-main);
    }

    .tags {
      display: inline-block;
    }
  }
}
</style>


