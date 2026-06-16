<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">管</div>
        <div class="brand-text">
          <span class="brand-title">管理后台</span>
          <span class="brand-sub">非遗数字馆</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <router-link to="/" class="back-link">
          <el-icon><HomeFilled /></el-icon>
          返回前台
        </router-link>
        <button type="button" class="logout-link" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出后台
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { FolderOpened, DataAnalysis, HomeFilled, SwitchButton } from '@element-plus/icons-vue';
import { useAuthStore } from '../store/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const navItems = [
  { path: '/admin', label: '内容管理', icon: FolderOpened, exact: true },
  { path: '/admin/platform-stats', label: '平台统计', icon: DataAnalysis, badge: '数据' }
];

const isActive = (path) => {
  const item = navItems.find((nav) => nav.path === path);
  if (item?.exact) {
    return route.path === path;
  }
  return route.path.startsWith(path);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/admin/login');
};
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  flex: 1;
  min-height: 100vh;
  background: var(--color-bg);
}

.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--color-secondary) 0%, #3a2218 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 28px 20px 24px;
  border-bottom: 1px solid rgba(216, 184, 119, 0.15);
}

.brand-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--gradient-gold);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  font-family: 'KaiTi', '楷体', serif;
  box-shadow: 0 4px 12px rgba(216, 184, 119, 0.3);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-accent-gold);
}

.brand-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  transition: all 0.25s ease;
  position: relative;

  &:hover {
    background: rgba(216, 184, 119, 0.12);
    color: var(--color-accent-gold);
  }

  &.active {
    background: rgba(163, 38, 42, 0.45);
    color: var(--color-accent-gold);
    box-shadow: inset 3px 0 0 var(--color-accent-gold);

    .nav-icon {
      color: var(--color-accent-gold);
    }
  }
}

.nav-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
}

.nav-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(216, 184, 119, 0.2);
  color: var(--color-accent-gold);
  border: 1px solid rgba(216, 184, 119, 0.3);
}

.sidebar-footer {
  padding: 16px 12px 24px;
  border-top: 1px solid rgba(216, 184, 119, 0.15);
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 13px;
  transition: all 0.25s ease;

  &:hover {
    color: var(--color-accent-gold);
    background: rgba(255, 255, 255, 0.06);
  }
}

.logout-link {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    color: #ffb4b4;
    background: rgba(163, 38, 42, 0.2);
  }
}

.admin-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .sidebar-brand {
    padding: 16px;
    border-bottom: none;
  }

  .sidebar-nav {
    flex-direction: row;
    flex: 1;
    padding: 8px;
    overflow-x: auto;
  }

  .nav-link {
    white-space: nowrap;
    padding: 8px 14px;
  }

  .sidebar-footer {
    border-top: none;
    padding: 8px 12px;
  }
}
</style>
