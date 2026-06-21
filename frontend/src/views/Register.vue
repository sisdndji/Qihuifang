<template>
  <AuthLayout
    variant="register"
    emblem="册"
    title="加入非遗数字馆"
    subtitle="创建账号，开启千年髹涂技艺的探索之旅"
    :features="REGISTER_BRAND_FEATURES"
  >
    <template #header-extra>
      <div class="auth-register-benefits">
        <span
          v-for="item in REGISTER_BENEFITS"
          :key="item.text"
          class="auth-register-benefit"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          {{ item.text }}
        </span>
      </div>
    </template>

    <div class="auth-register-steps" aria-label="注册进度">
      <div
        class="auth-register-step"
        :class="{
          'auth-register-step--active': currentStep === 1,
          'auth-register-step--done': currentStep > 1
        }"
      >
        <span class="auth-register-step__num">1</span>
        <span class="auth-register-step__label">账号信息</span>
      </div>
      <div
        class="auth-register-step"
        :class="{
          'auth-register-step--active': currentStep === 2,
          'auth-register-step--done': currentStep > 2
        }"
      >
        <span class="auth-register-step__num">2</span>
        <span class="auth-register-step__label">安全设置</span>
      </div>
      <div
        class="auth-register-step"
        :class="{ 'auth-register-step--active': currentStep === 3 }"
      >
        <span class="auth-register-step__num">3</span>
        <span class="auth-register-step__label">完成注册</span>
      </div>
    </div>

    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="rules"
      class="auth-form auth-form--register"
      @submit.prevent="handleRegister"
    >
      <div class="auth-form-section">
        <p class="auth-form-section__title">基本信息</p>
        <div class="auth-form-grid">
          <el-form-item prop="username">
            <label class="auth-field-label" for="register-username">用户名</label>
            <el-input
              id="register-username"
              v-model="registerForm.username"
              placeholder="字母、数字或下划线"
              size="large"
              class="auth-field-input"
              autocomplete="username"
              @focus="currentStep = 1"
            >
              <template #prefix>
                <el-icon class="auth-field-icon"><User /></el-icon>
              </template>
            </el-input>
            <div class="auth-field-meta">
              <span
                v-if="usernameHint"
                class="auth-field-hint"
                :class="usernameValid ? 'auth-field-hint--ok' : 'auth-field-hint--warn'"
              >
                <el-icon v-if="usernameValid"><CircleCheck /></el-icon>
                {{ usernameHint }}
              </span>
              <span v-else class="auth-field-hint">3-20 个字符</span>
            </div>
          </el-form-item>

          <el-form-item prop="displayName">
            <label class="auth-field-label" for="register-display-name">
              显示名称
              <span class="auth-field-optional">选填</span>
            </label>
            <el-input
              id="register-display-name"
              v-model="registerForm.displayName"
              placeholder="默认同用户名"
              size="large"
              class="auth-field-input"
              autocomplete="nickname"
              @focus="currentStep = 1"
            >
              <template #prefix>
                <el-icon class="auth-field-icon"><Avatar /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>
      </div>

      <div class="auth-form-section">
        <p class="auth-form-section__title">安全设置</p>

        <el-form-item prop="password">
          <label class="auth-field-label" for="register-password">登录密码</label>
          <el-input
            id="register-password"
            v-model="registerForm.password"
            type="password"
            placeholder="至少 6 位，建议包含字母与数字"
            size="large"
            class="auth-field-input"
            show-password
            autocomplete="new-password"
            @focus="currentStep = 2"
          >
            <template #prefix>
              <el-icon class="auth-field-icon"><Lock /></el-icon>
            </template>
          </el-input>
          <div v-if="registerForm.password" class="auth-password-strength">
            <div class="auth-password-strength__bar">
              <span
                v-for="i in 4"
                :key="i"
                class="auth-password-strength__segment"
                :class="i <= passwordStrength.level ? `auth-password-strength__segment--${passwordStrength.level}` : ''"
              />
            </div>
            <p class="auth-password-strength__label">
              密码强度：<strong :class="`level-${passwordStrength.level}`">{{ passwordStrength.label }}</strong>
            </p>
          </div>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <label class="auth-field-label" for="register-confirm-password">确认密码</label>
          <el-input
            id="register-confirm-password"
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="再次输入密码"
            size="large"
            class="auth-field-input"
            show-password
            autocomplete="new-password"
            @focus="currentStep = 2"
            @keyup.enter="handleRegister"
          >
            <template #prefix>
              <el-icon class="auth-field-icon"><Lock /></el-icon>
            </template>
          </el-input>
          <div v-if="registerForm.confirmPassword" class="auth-field-meta">
            <span
              class="auth-field-hint"
              :class="passwordsMatch ? 'auth-field-hint--ok' : 'auth-field-hint--warn'"
            >
              <el-icon v-if="passwordsMatch"><CircleCheck /></el-icon>
              {{ passwordsMatch ? '两次密码一致' : '两次密码不一致' }}
            </span>
          </div>
        </el-form-item>
      </div>

      <div class="auth-register-agree">
        <el-checkbox v-model="agreed" @change="currentStep = agreed ? 3 : 2" />
        <span class="auth-register-agree__text">
          我已阅读并同意平台服务条款，注册即表示愿意探索与传承国漆髹涂非遗文化
        </span>
      </div>

      <el-form-item class="auth-submit-item">
        <el-button
          type="primary"
          size="large"
          class="auth-button auth-button--register"
          :class="{ 'is-disabled': !agreed }"
          :loading="loading"
          :disabled="!agreed"
          native-type="submit"
          @click="handleRegister"
        >
          {{ loading ? '注册中…' : '完成注册' }}
        </el-button>
      </el-form-item>
    </el-form>

    <template #footer>
      已有账号？
      <router-link to="/login" class="auth-link">立即登录</router-link>
    </template>
  </AuthLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { authAPI } from '../api/auth';
import { ElMessage } from 'element-plus';
import { User, Lock, Avatar, CircleCheck } from '@element-plus/icons-vue';
import AuthLayout from '../layouts/AuthLayout.vue';
import { REGISTER_BRAND_FEATURES, REGISTER_BENEFITS } from '../constants/authBrand';

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

const router = useRouter();
const authStore = useAuthStore();

const registerFormRef = ref(null);
const loading = ref(false);
const agreed = ref(false);
const currentStep = ref(1);

const registerForm = reactive({
  username: '',
  displayName: '',
  password: '',
  confirmPassword: ''
});

const usernameValid = computed(() => USERNAME_PATTERN.test(registerForm.username));

const usernameHint = computed(() => {
  const { username } = registerForm;
  if (!username) return '';
  if (usernameValid.value) return '格式正确';
  if (username.length < 3) return '至少 3 个字符';
  if (username.length > 20) return '不超过 20 个字符';
  return '仅支持字母、数字、下划线';
});

const passwordsMatch = computed(
  () => registerForm.confirmPassword && registerForm.password === registerForm.confirmPassword
);

const passwordStrength = computed(() => {
  const pwd = registerForm.password;
  if (!pwd) return { level: 0, label: '' };

  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 8) score++;
  if (/[a-zA-Z]/.test(pwd) && /\d/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd) || pwd.length >= 12) score++;

  const map = [
    { level: 0, label: '' },
    { level: 1, label: '弱' },
    { level: 2, label: '一般' },
    { level: 3, label: '良好' },
    { level: 4, label: '强' }
  ];

  return map[score];
});

const validateConfirmPassword = (_rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: USERNAME_PATTERN, message: '用户名须为 3-20 位字母、数字或下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

const handleRegister = async () => {
  if (!agreed.value) {
    ElMessage.warning('请先阅读并同意服务条款');
    return;
  }

  if (!registerFormRef.value) return;

  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    currentStep.value = 3;

    try {
      const res = await authAPI.register(
        registerForm.username,
        registerForm.password,
        registerForm.displayName || undefined
      );
      authStore.login(res.data.token, res.data.user);
      ElMessage.success('注册成功，欢迎加入！');
      router.push('/');
    } catch (error) {
      currentStep.value = 2;
      ElMessage.error(error.response?.data?.error || '注册失败');
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style lang="scss" scoped>
.auth-field-optional {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 6px;
  padding: 1px 6px;
  background: var(--color-bg-dark);
  border-radius: 4px;
}

.auth-form--register {
  :deep(.el-form-item) {
    margin-bottom: clamp(14px, 2.5vw, 18px);
  }
}
</style>
