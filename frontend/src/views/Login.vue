<template>
  <AuthLayout title="欢迎回来" subtitle="登录账号，探索千年髹涂技艺之美">
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="rules"
      class="auth-form"
      @submit.prevent="handleLogin"
    >
      <el-form-item prop="username">
        <label class="auth-field-label" for="login-username">用户名</label>
        <el-input
          id="login-username"
          v-model="loginForm.username"
          placeholder="请输入用户名"
          size="large"
          class="auth-field-input"
          autocomplete="username"
        >
          <template #prefix>
            <el-icon class="auth-field-icon"><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <label class="auth-field-label" for="login-password">密码</label>
        <el-input
          id="login-password"
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          size="large"
          class="auth-field-input"
          show-password
          autocomplete="current-password"
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <el-icon class="auth-field-icon"><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item class="auth-submit-item">
        <el-button
          type="primary"
          size="large"
          class="auth-button"
          :loading="loading"
          native-type="submit"
          @click="handleLogin"
        >
          {{ loading ? '登录中…' : '登 录' }}
        </el-button>
      </el-form-item>
    </el-form>

    <template #footer>
      还没有账号？
      <router-link to="/register" class="auth-link">立即注册</router-link>
    </template>
  </AuthLayout>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { authAPI } from '../api/auth';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import AuthLayout from '../layouts/AuthLayout.vue';

const router = useRouter();
const authStore = useAuthStore();

const loginFormRef = ref(null);
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: ''
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      const res = await authAPI.login(loginForm.username, loginForm.password);
      authStore.login(res.data.token, res.data.user);
      ElMessage.success('登录成功');
      router.push('/');
    } catch (error) {
      ElMessage.error(error.response?.data?.error || '登录失败');
    } finally {
      loading.value = false;
    }
  });
};
</script>
