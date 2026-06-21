<template>
  <div class="auth-page">
    <aside class="auth-brand" aria-label="品牌介绍">
      <div class="auth-brand__bg">
        <div class="auth-brand__orb auth-brand__orb--1"></div>
        <div class="auth-brand__orb auth-brand__orb--2"></div>
        <div class="auth-brand__ring"></div>
        <div class="auth-brand__pattern"></div>
      </div>

      <div class="auth-brand__content">
        <div class="auth-brand__badge">
          <span class="auth-brand__badge-dot"></span>
          国家级非物质文化遗产
        </div>

        <h1 class="auth-brand__title">
          <span class="auth-brand__title-main">国漆髹涂技艺</span>
          <span class="auth-brand__title-sub">非遗数字馆</span>
        </h1>

        <p class="auth-brand__quote">以漆为肌，以木为骨<br />三十六道髹涂，承一器之美</p>

        <div class="auth-brand__features">
          <div
            v-for="item in features"
            :key="item.label"
            class="auth-brand__feature"
          >
            <div class="auth-brand__feature-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="auth-brand__feature-text">
              <strong>{{ item.label }}</strong>
              <span>{{ item.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <main class="auth-main" :class="{ 'auth-main--register': variant === 'register' }">
      <div
        class="auth-card auth-card--animate"
        :class="{
          'auth-card--wide': variant === 'register',
          'auth-card--register': variant === 'register'
        }"
      >
        <header class="auth-header" :class="{ 'auth-header--compact': variant === 'register' }">
          <div class="auth-emblem" :class="{ 'auth-emblem--register': variant === 'register' }" aria-hidden="true">
            <span>{{ emblem }}</span>
          </div>
          <h2 class="auth-title">{{ title }}</h2>
          <p v-if="subtitle" class="auth-subtitle">{{ subtitle }}</p>
          <slot name="header-extra" />
        </header>

        <slot />

        <template v-if="$slots.footer">
          <div class="auth-divider"><span>或</span></div>
          <footer class="auth-footer">
            <slot name="footer" />
          </footer>
        </template>
      </div>

      <p class="auth-copyright">{{ copyright }}</p>
    </main>
  </div>
</template>

<script setup>
import { AUTH_BRAND_FEATURES, AUTH_COPYRIGHT } from '../constants/authBrand';

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  emblem: { type: String, default: '漆' },
  variant: { type: String, default: 'login' },
  features: { type: Array, default: () => AUTH_BRAND_FEATURES },
  copyright: { type: String, default: AUTH_COPYRIGHT }
});
</script>

<style lang="scss">
@import '../styles/auth.scss';
</style>
