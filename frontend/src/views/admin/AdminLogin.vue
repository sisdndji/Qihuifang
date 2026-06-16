<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-badge">管理后台</div>
        <h1 class="login-title">非遗数字馆 · 后台登录</h1>
        <p class="login-desc">此入口仅供管理员使用，与前台展示站相互独立</p>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="管理员用户名"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              prefix-icon="Lock"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              进入管理后台
            </el-button>
          </el-form-item>
        </el-form>
        <router-link to="/" class="back-link">返回前台展示站</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { authAPI } from '../../api/auth';
import { ElMessage } from 'element-plus';

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

      if (!authStore.isAdmin) {
        authStore.logout();
        ElMessage.error('该账号无管理员权限');
        return;
      }

      ElMessage.success('登录成功');
      router.push('/admin');
    } catch (error) {
      ElMessage.error(error.response?.data?.error || '登录失败');
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style lang="scss" scoped>
.admin-login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2a1a15 0%, #1a100c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 100%;
  max-width: 440px;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--color-accent-gold), var(--color-primary), var(--color-accent-gold));
    border-radius: 12px 12px 0 0;
  }
}

.login-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  background: rgba(163, 38, 42, 0.08);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0 0 8px;
}

.login-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 24px;
  line-height: 1.6;
}

.login-form {
  margin-top: 8px;
}

.login-button {
  width: 100%;
  background: var(--color-primary);
  border: none;

  &:hover {
    background: #b8373a;
  }
}

.back-link {
  display: block;
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;

  &:hover {
    color: var(--color-primary);
  }
}
</style>
