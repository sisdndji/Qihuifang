<template>
  <MainContainer>
    <div class="heritage-list-page">
      <h1 class="page-title">髹涂技艺</h1>
      
      <div class="page-content">
        <!-- 筛选面板 -->
        <div class="filter-panel card-lacquer">
          <h3 class="filter-title">筛选条件</h3>
          <el-form :model="filters" label-width="80px">
            <el-form-item label="类别">
              <el-select v-model="filters.category" placeholder="全部" clearable>
                <el-option label="国漆髹涂技艺" value="国漆髹涂技艺" />
                <el-option label="漆画创作" value="漆画创作" />
              </el-select>
            </el-form-item>
            <el-form-item label="地区">
              <el-select v-model="filters.region" placeholder="全部" clearable>
                <el-option label="福州" value="福州" />
                <el-option label="扬州" value="扬州" />
                <el-option label="成都" value="成都" />
                <el-option label="景德镇" value="景德镇" />
                <el-option label="厦门" value="厦门" />
                <el-option label="重庆" value="重庆" />
              </el-select>
            </el-form-item>
            <el-form-item label="级别">
              <el-select v-model="filters.level" placeholder="全部" clearable>
                <el-option label="国家级" value="国家级" />
                <el-option label="省级" value="省级" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 项目列表 -->
        <div class="heritage-list">
          <div v-loading="loading" class="heritage-grid">
            <HeritageCard
              v-for="item in heritageItems"
              :key="item.id"
              :id="item.id"
              :title="item.name"
              :category="item.category"
              :region="item.region"
              :level="item.level"
              :image-url="item.image_url"
              :intro="item.intro"
              @click="handleHeritageClick"
            />
          </div>
          <div v-if="!loading && heritageItems.length === 0" class="empty-state">
            <p>暂无数据</p>
          </div>
        </div>
      </div>
    </div>
  </MainContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { heritageAPI } from '../api/heritage';
import MainContainer from '../components/MainContainer.vue';
import HeritageCard from '../components/HeritageCard.vue';

const router = useRouter();

const loading = ref(false);
const heritageItems = ref([]);

const filters = reactive({
  category: '',
  region: '',
  level: ''
});

const fetchHeritage = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.region) params.region = filters.region;
    if (filters.level) params.level = filters.level;

    const res = await heritageAPI.getAll(params);
    heritageItems.value = res.data;
  } catch (error) {
    console.error('获取非遗项目失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  fetchHeritage();
};

const handleReset = () => {
  filters.category = '';
  filters.region = '';
  filters.level = '';
  fetchHeritage();
};

const handleHeritageClick = (id) => {
  router.push(`/heritage/${id}`);
};

onMounted(() => {
  fetchHeritage();
});
</script>

<style lang="scss" scoped>
.heritage-list-page {
  .page-title {
    font-size: 32px;
    font-weight: 600;
    color: var(--color-primary);
    text-align: center;
    margin-bottom: 40px;
  }
}

.page-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.filter-panel {
  height: fit-content;
  position: sticky;
  top: 80px;
}

.filter-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 20px;
}

.heritage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}
</style>

