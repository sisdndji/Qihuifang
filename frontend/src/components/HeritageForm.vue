<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="项目名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入项目名称" />
    </el-form-item>

    <el-form-item label="类别" prop="category">
      <el-input v-model="form.category" placeholder="如：国漆髹涂技艺" />
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

    <el-form-item label="级别" prop="level">
      <el-select v-model="form.level" placeholder="请选择级别" style="width: 100%">
        <el-option label="国家级" value="国家级" />
        <el-option label="省级" value="省级" />
        <el-option label="市级" value="市级" />
      </el-select>
    </el-form-item>

    <el-form-item label="项目介绍" prop="intro">
      <el-input
        v-model="form.intro"
        type="textarea"
        :rows="4"
        placeholder="请输入项目详细介绍"
      />
    </el-form-item>

    <el-form-item label="图片URL">
      <el-input v-model="form.image_url" placeholder="请输入图片URL或上传后填写" />
      <div class="form-tip">提示：可在"图片上传"标签页上传图片后复制URL</div>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['submit', 'cancel']);

const formRef = ref(null);

const form = reactive({
  id: null,
  name: '',
  category: '',
  region: '',
  level: '',
  intro: '',
  image_url: ''
});

const rules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请输入类别', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择地区', trigger: 'change' }
  ],
  level: [
    { required: true, message: '请选择级别', trigger: 'change' }
  ],
  intro: [
    { required: true, message: '请输入项目介绍', trigger: 'blur' }
  ]
};

// 监听formData变化，更新表单
watch(() => props.formData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    Object.assign(form, {
      id: newVal.id || null,
      name: newVal.name || '',
      category: newVal.category || '',
      region: newVal.region || '',
      level: newVal.level || '',
      intro: newVal.intro || '',
      image_url: newVal.image_url || ''
    });
  } else {
    // 重置表单
    Object.assign(form, {
      id: null,
      name: '',
      category: '',
      region: '',
      level: '',
      intro: '',
      image_url: ''
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
</script>

<style lang="scss" scoped>
.form-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}
</style>

