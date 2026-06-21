import { API_ORIGIN } from '../config/api';

/**
 * 将数据库中的图片路径解析为可访问的 URL。
 *
 * - /uploads/* 由后端存储，生产环境经 server.mjs 代理或走 API 域名
 * - /Picture、/masters、/works 等由 frontend/public 静态资源提供
 * - http(s):// 与 data: 原样返回
 */
export function resolveMediaUrl(url) {
  if (!url) return '';

  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) {
    return url;
  }

  const path = url.startsWith('/') ? url : `/${url}`;

  if (path.startsWith('/uploads/')) {
    return API_ORIGIN ? `${API_ORIGIN}${path}` : path;
  }

  return path;
}
