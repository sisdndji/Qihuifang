/**
 * API 基础地址
 * - 本地开发：/api，走 Vite 代理
 * - Railway 生产：server.mjs 反向代理 /api，同样使用 /api
 * - 也可构建时设置 VITE_API_BASE_URL 直连后端
 */
const raw = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_BASE_URL = raw.replace(/\/$/, '');

/** 后端站点根地址（用于 /uploads 等跨域静态资源） */
const explicitOrigin = (import.meta.env.VITE_API_ORIGIN || '').replace(/\/$/, '');
export const API_ORIGIN = explicitOrigin
  || (API_BASE_URL.startsWith('http') ? API_BASE_URL.replace(/\/api\/?$/, '') : '');

export const uploadUrl = `${API_BASE_URL}/upload`;

/**
 * 运行时加载部署配置（server.mjs 提供的 /app-config.json）
 * 用于直连后端部署时动态获取 API 地址
 */
let runtimeConfig = null;

export async function loadRuntimeConfig() {
  if (runtimeConfig) return runtimeConfig;

  if (import.meta.env.DEV) {
    runtimeConfig = { apiBaseUrl: API_BASE_URL, apiOrigin: API_ORIGIN };
    return runtimeConfig;
  }

  try {
    const res = await fetch('/app-config.json', { cache: 'no-store' });
    if (res.ok) {
      runtimeConfig = await res.json();
      return runtimeConfig;
    }
  } catch {
    // 无代理服务时使用构建时配置
  }

  runtimeConfig = { apiBaseUrl: API_BASE_URL, apiOrigin: API_ORIGIN };
  return runtimeConfig;
}

export function getEffectiveApiBaseUrl() {
  return runtimeConfig?.apiBaseUrl || API_BASE_URL;
}

export function getEffectiveApiOrigin() {
  return runtimeConfig?.apiOrigin || API_ORIGIN;
}
