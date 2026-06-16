<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="作品标题" prop="title">
      <el-input v-model="form.title" placeholder="请输入作品标题" />
    </el-form-item>

    <el-form-item label="年份" prop="year">
      <el-input-number
        v-model="form.year"
        :min="1900"
        :max="2100"
        placeholder="请输入年份"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="风格" prop="style">
      <el-input v-model="form.style" placeholder="如：螺钿重器、描金文盘、现代漆画" />
    </el-form-item>

    <el-form-item label="地区" prop="region">
      <el-select v-model="form.region" placeholder="请选择地区" style="width: 100%">
        <el-option label="哈尔滨" value="哈尔滨" />
        <el-option label="福州" value="福州" />
        <el-option label="扬州" value="扬州" />
        <el-option label="成都" value="成都" />
        <el-option label="景德镇" value="景德镇" />
        <el-option label="厦门" value="厦门" />
        <el-option label="重庆" value="重庆" />
      </el-select>
    </el-form-item>

    <el-form-item label="作品描述" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="4"
        placeholder="请输入作品描述"
      />
    </el-form-item>

    <el-form-item label="作品标签">
      <el-input
        v-model="form.tags"
        placeholder="用逗号分隔，如：螺钿,描金,叠彩技法"
      />
      <div class="form-tip">多个标签用逗号分隔，如：螺钿,描金,叠彩技法,冰雪文化</div>
    </el-form-item>

    <el-form-item label="图片URL">
      <el-input v-model="form.image_url" placeholder="请输入图片URL或上传后填写" />
      <div class="form-tip">提示：可在"图片上传"标签页上传图片后复制URL</div>
    </el-form-item>

    <el-form-item label="关联传承人">
      <el-select
        v-model="form.master_id"
        placeholder="请选择传承人（可选）"
        clearable
        filterable
        style="width: 100%"
      >
        <el-option
          v-for="item in masterOptions"
          :key="item.id"
          :label="`${item.name} (${item.region})`"
          :value="item.id"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="关联项目" prop="heritage_id">
      <el-select
        v-model="form.heritage_id"
        placeholder="请选择非遗项目"
        style="width: 100%"
      >
        <el-option
          v-for="item in heritageOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { heritageAPI } from '../api/heritage';
import { mastersAPI } from '../api/masters';

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['submit', 'cancel']);

const formRef = ref(null);
const heritageOptions = ref([]);
const masterOptions = ref([]);

const form = reactive({
  id: null,
  title: '',
  year: new Date().getFullYear(),
  style: '',
  region: '',
  description: '',
  tags: '',
  image_url: '',
  master_id: null,
  heritage_id: null
});

const rules = {
  title: [
    { required: true, message: '请输入作品标题', trigger: 'blur' }
  ],
  year: [
    { required: true, message: '请输入年份', trigger: 'blur' }
  ],
  style: [
    { required: true, message: '请输入风格', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择地区', trigger: 'change' }
  ],
  heritage_id: [
    { required: true, message: '请选择关联项目', trigger: 'change' }
  ]
};

// 获取选项数据
const fetchOptions = async () => {
  try {
    const [heritageRes, mastersRes] = await Promise.all([
      heritageAPI.getAll(),
      mastersAPI.getAll()
    ]);
    heritageOptions.value = heritageRes.data;
    masterOptions.value = mastersRes.data;
  } catch (error) {
    console.error('获取选项数据失败:', error);
  }
};

// 监听formData变化，更新表单
watch(() => props.formData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    Object.assign(form, {
      id: newVal.id || null,
      title: newVal.title || '',
      year: newVal.year || new Date().getFullYear(),
      style: newVal.style || '',
      region: newVal.region || '',
      description: newVal.description || '',
      image_url: newVal.image_url || '',
      master_id: newVal.master_id || null,
      heritage_id: newVal.heritage_id || null
    });
  } else {
    // 重置表单
    Object.assign(form, {
      id: null,
      title: '',
      year: new Date().getFullYear(),
      style: '',
      region: '',
      description: '',
      tags: '',
      image_url: '',
      master_id: null,
      heritage_id: null
    });
  }
}, { immediate: true, deep: true });

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...form });
    } else {
      ElMessage.error('请填写完整信息');
    }
  });
};

const handleCancel = () => {
  emit('cancel');
};

onMounted(() => {
  fetchOptions();
});
</script>

<style lang="scss" scoped>
.form-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}
</style>

