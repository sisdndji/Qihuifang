<template>
  <div class="admin-panel">
    <header class="panel-header">
      <h1 class="page-title">内容管理</h1>
      <p class="page-desc">管理非遗项目、传承人、作品及图片资源</p>
    </header>

    <el-tabs v-model="activeTab" class="admin-tabs">
        <!-- 非遗项目管理 -->
        <el-tab-pane label="非遗项目管理" name="heritage">
          <div class="admin-section">
            <div class="section-header">
              <el-button type="primary" @click="handleHeritageAdd">新增项目</el-button>
            </div>
            <el-table :data="heritageList" border style="width: 100%" v-loading="loadingHeritage">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="名称" min-width="200" />
              <el-table-column prop="category" label="类别" width="150" />
              <el-table-column prop="region" label="地区" width="100" />
              <el-table-column prop="level" label="级别" width="100" />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" type="primary" @click="handleHeritageEdit(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleHeritageDelete(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 传承人管理 -->
        <el-tab-pane label="传承人管理" name="masters">
          <div class="admin-section">
            <div class="section-header">
              <el-button type="primary" @click="handleMasterAdd">新增传承人</el-button>
            </div>
            <el-table :data="mastersList" border style="width: 100%" v-loading="loadingMasters">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="姓名" width="120" />
              <el-table-column prop="generation" label="代际" width="150" />
              <el-table-column prop="region" label="地区" width="100" />
              <el-table-column prop="skill_tags" label="技能标签" min-width="200" show-overflow-tooltip />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" type="primary" @click="handleMasterEdit(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleMasterDelete(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 作品管理 -->
        <el-tab-pane label="作品管理" name="works">
          <div class="admin-section">
            <div class="section-header">
              <el-button type="primary" @click="handleWorkAdd">新增作品</el-button>
            </div>
            <el-table :data="worksList" border style="width: 100%" v-loading="loadingWorks">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="title" label="标题" min-width="200" />
              <el-table-column prop="year" label="年份" width="100" />
              <el-table-column prop="style" label="风格" width="120" />
              <el-table-column prop="region" label="地区" width="100" />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" type="primary" @click="handleWorkEdit(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleWorkDelete(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 图片上传 -->
        <el-tab-pane label="图片上传" name="upload">
          <div class="admin-section">
            <el-upload
              class="upload-demo"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 5MB</div>
              </template>
            </el-upload>
            <div v-if="uploadedUrl" class="upload-result">
              <p>上传成功！请复制下方路径填入表单（数据库存相对路径即可）：</p>
              <el-input v-model="uploadedUrl" readonly />
              <div v-if="uploadPreviewUrl" class="upload-preview">
                <img :src="uploadPreviewUrl" alt="上传预览" @error="previewError = true" />
                <p v-if="previewError" class="upload-preview-tip">预览失败时请确认已配置 PUBLIC_BASE_URL / VITE_API_BASE_URL</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 表单弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="700px"
        :close-on-click-modal="false"
      >
        <HeritageForm
          v-if="dialogComponent === 'HeritageForm'"
          :form-data="formData"
          @submit="handleFormSubmit"
          @cancel="dialogVisible = false"
        />
        <MasterForm
          v-else-if="dialogComponent === 'MasterForm'"
          :form-data="formData"
          @submit="handleFormSubmit"
          @cancel="dialogVisible = false"
        />
        <WorkForm
          v-else-if="dialogComponent === 'WorkForm'"
          :form-data="formData"
          @submit="handleFormSubmit"
          @cancel="dialogVisible = false"
        />
      </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../store/auth';
import { heritageAPI } from '../api/heritage';
import { mastersAPI } from '../api/masters';
import { worksAPI } from '../api/works';
import { uploadAPI } from '../api/upload';
import { ElMessage, ElMessageBox } from 'element-plus';
import HeritageForm from '../components/HeritageForm.vue';
import MasterForm from '../components/MasterForm.vue';
import WorkForm from '../components/WorkForm.vue';
import axiosInstance from '../api/axiosInstance';
import { uploadUrl as apiUploadUrl } from '../config/api';
import { resolveMediaUrl } from '../utils/media';

const authStore = useAuthStore();

const activeTab = ref('heritage');
const heritageList = ref([]);
const mastersList = ref([]);
const worksList = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const dialogComponent = ref(null);
const formData = ref({});
const uploadedUrl = ref('');
const uploadPreviewUrl = ref('');
const previewError = ref(false);
const loadingHeritage = ref(false);
const loadingMasters = ref(false);
const loadingWorks = ref(false);

const uploadUrl = computed(() => apiUploadUrl);
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`
}));

// 获取数据
const fetchHeritage = async () => {
  loadingHeritage.value = true;
  try {
    const res = await heritageAPI.getAll();
    heritageList.value = res.data;
  } catch (error) {
    ElMessage.error('获取数据失败');
  } finally {
    loadingHeritage.value = false;
  }
};

const fetchMasters = async () => {
  loadingMasters.value = true;
  try {
    const res = await mastersAPI.getAll();
    mastersList.value = res.data;
  } catch (error) {
    ElMessage.error('获取数据失败');
  } finally {
    loadingMasters.value = false;
  }
};

const fetchWorks = async () => {
  loadingWorks.value = true;
  try {
    const res = await worksAPI.getAll();
    worksList.value = res.data;
  } catch (error) {
    ElMessage.error('获取数据失败');
  } finally {
    loadingWorks.value = false;
  }
};

// Heritage 操作
const handleHeritageAdd = () => {
  formData.value = {};
  dialogTitle.value = '新增非遗项目';
  dialogComponent.value = 'HeritageForm';
  dialogVisible.value = true;
};

const handleHeritageEdit = (row) => {
  formData.value = { ...row };
  dialogTitle.value = '编辑非遗项目';
  dialogComponent.value = 'HeritageForm';
  dialogVisible.value = true;
};

const handleHeritageDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除吗？', '提示', { type: 'warning' });
    await heritageAPI.delete(id);
    ElMessage.success('删除成功');
    fetchHeritage();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// Master 操作
const handleMasterAdd = () => {
  formData.value = {};
  dialogTitle.value = '新增传承人';
  dialogComponent.value = 'MasterForm';
  dialogVisible.value = true;
};

const handleMasterEdit = (row) => {
  formData.value = { ...row };
  dialogTitle.value = '编辑传承人';
  dialogComponent.value = 'MasterForm';
  dialogVisible.value = true;
};

const handleMasterDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除吗？', '提示', { type: 'warning' });
    await mastersAPI.delete(id);
    ElMessage.success('删除成功');
    fetchMasters();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// Work 操作
const handleWorkAdd = () => {
  formData.value = {};
  dialogTitle.value = '新增作品';
  dialogComponent.value = 'WorkForm';
  dialogVisible.value = true;
};

const handleWorkEdit = (row) => {
  formData.value = { ...row };
  dialogTitle.value = '编辑作品';
  dialogComponent.value = 'WorkForm';
  dialogVisible.value = true;
};

const handleWorkDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除吗？', '提示', { type: 'warning' });
    await worksAPI.delete(id);
    ElMessage.success('删除成功');
    fetchWorks();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 表单提交
const handleFormSubmit = async (data) => {
  try {
    if (dialogComponent.value === 'HeritageForm') {
      if (data.id) {
        await heritageAPI.update(data.id, data);
      } else {
        await heritageAPI.create(data);
      }
      ElMessage.success('操作成功');
      fetchHeritage();
    } else if (dialogComponent.value === 'MasterForm') {
      if (data.id) {
        await mastersAPI.update(data.id, data);
      } else {
        await mastersAPI.create(data);
      }
      ElMessage.success('操作成功');
      fetchMasters();
    } else if (dialogComponent.value === 'WorkForm') {
      if (data.id) {
        await worksAPI.update(data.id, data);
      } else {
        await worksAPI.create(data);
      }
      ElMessage.success('操作成功');
      fetchWorks();
    }
    dialogVisible.value = false;
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

// 上传
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！');
    return false;
  }
  return true;
};

const handleUploadSuccess = (response) => {
  uploadedUrl.value = response.path || response.url;
  uploadPreviewUrl.value = resolveMediaUrl(uploadedUrl.value);
  previewError.value = false;
  ElMessage.success('上传成功！');
};

const handleUploadError = () => {
  ElMessage.error('上传失败！');
};

onMounted(() => {
  fetchHeritage();
  fetchMasters();
  fetchWorks();
});
</script>

<style lang="scss" scoped>
.admin-panel {
  padding: 32px 36px 48px;
  max-width: 1200px;
  margin: 0 auto;
}

.panel-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-secondary);
  margin: 0 0 8px;
  font-family: 'KaiTi', '楷体', serif;
}

.page-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.admin-tabs {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.admin-section {
  .section-header {
    margin-bottom: 20px;
  }
}

.upload-result {
  margin-top: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;

  p {
    margin-bottom: 8px;
    color: var(--text-secondary);
  }
}

.upload-preview {
  margin-top: 12px;
  text-align: center;

  img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    border: 1px solid var(--color-border-light);
    object-fit: contain;
  }
}

.upload-preview-tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-primary);
}
</style>


