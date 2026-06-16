<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo">
        <h1>国漆髹涂技艺 · 非遗数字馆</h1>
      </div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/heritage" class="nav-item">髹涂技艺</router-link>
        <router-link to="/masters" class="nav-item">匠人传承</router-link>
        <el-dropdown>
          <span class="nav-item">
            传承人李囡
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push('/master/linan')">个人介绍</el-dropdown-item>
              <el-dropdown-item @click="$router.push('/master/linan/works')">作品展示</el-dropdown-item>
              <el-dropdown-item v-if="authStore.isAuthenticated" @click="$router.push('/team/linan')">团队管理</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <router-link to="/dashboard" class="nav-item">数据大屏</router-link>
        <el-dropdown v-if="authStore.isAuthenticated" @command="handleCommand">
          <span class="user-menu">
            <el-avatar :size="32" :src="userAvatar">
              {{ authStore.user?.displayName?.charAt(0) || 'U' }}
            </el-avatar>
            <span class="username">{{ authStore.user?.displayName || '用户' }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();
const authStore = useAuthStore();

const userAvatar = computed(() => {
  return authStore.user?.avatar || '';
});

const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout();
    router.push('/login');
  }
};
</script>

<style lang="scss" scoped>
.app-header {
  background: var(--color-secondary);
  color: white;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-accent-gold);
  margin: 0;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 15px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(216, 184, 119, 0.2);
    color: var(--color-accent-gold);
  }

  &.router-link-active {
    background: rgba(216, 184, 119, 0.3);
    color: var(--color-accent-gold);
  }
}

.dropdown-trigger {
  cursor: pointer;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(216, 184, 119, 0.2);
  }

  .username {
    font-size: 14px;
    color: white;
  }
}
</style>


