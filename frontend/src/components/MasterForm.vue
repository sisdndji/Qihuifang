<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="姓名" prop="name">
      <el-input v-model="form.name" placeholder="请输入传承人姓名" />
    </el-form-item>

    <el-form-item label="代际" prop="generation">
      <el-input v-model="form.generation" placeholder="如：第四代传承人、省级非遗传承人" />
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

    <el-form-item label="简介" prop="bio">
      <el-input
        v-model="form.bio"
        type="textarea"
        :rows="6"
        placeholder="请输入传承人详细介绍（4-6句）"
      />
    </el-form-item>

    <el-form-item label="技能标签">
      <el-input
        v-model="form.skill_tags"
        placeholder="用逗号分隔，如：螺钿,推光,器物制作"
      />
      <div class="form-tip">多个标签用逗号分隔</div>
    </el-form-item>

    <el-form-item label="代表作品">
      <el-input
        v-model="form.representative_works"
        type="textarea"
        :rows="2"
        placeholder="请输入代表作品，用顿号或逗号分隔"
      />
    </el-form-item>

    <el-form-item label="头像URL">
      <el-input v-model="form.avatar_url" placeholder="请输入头像URL或上传后填写" />
      <div class="form-tip">提示：可在"图片上传"标签页上传图片后复制URL</div>
    </el-form-item>

    <el-form-item label="关联项目">
      <el-select
        v-model="form.main_heritage_id"
        placeholder="请选择主要关联的非遗项目"
        clearable
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

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['submit', 'cancel']);

const formRef = ref(null);
const heritageOptions = ref([]);

const form = reactive({
  id: null,
  name: '',
  generation: '',
  region: '',
  bio: '',
  skill_tags: '',
  representative_works: '',
  avatar_url: '',
  main_heritage_id: null
});

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  generation: [
    { required: true, message: '请输入代际', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择地区', trigger: 'change' }
  ],
  bio: [
    { required: true, message: '请输入简介', trigger: 'blur' }
  ]
};

// 获取非遗项目列表
const fetchHeritageOptions = async () => {
  try {
    const res = await heritageAPI.getAll();
    heritageOptions.value = res.data;
  } catch (error) {
    console.error('获取非遗项目列表失败:', error);
  }
};

// 监听formData变化，更新表单
watch(() => props.formData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    Object.assign(form, {
      id: newVal.id || null,
      name: newVal.name || '',
      generation: newVal.generation || '',
      region: newVal.region || '',
      bio: newVal.bio || '',
      skill_tags: newVal.skill_tags || '',
      representative_works: newVal.representative_works || '',
      avatar_url: newVal.avatar_url || '',
      main_heritage_id: newVal.main_heritage_id || null
    });
  } else {
    // 重置表单
    Object.assign(form, {
      id: null,
      name: '',
      generation: '',
      region: '',
      bio: '',
      skill_tags: '',
      representative_works: '',
      avatar_url: '',
      main_heritage_id: null
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
  fetchHeritageOptions();
});
</script>

<style lang="scss" scoped>
.form-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}
</style>

