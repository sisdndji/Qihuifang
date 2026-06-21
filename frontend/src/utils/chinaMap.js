import * as echarts from 'echarts';
import bundledChinaGeoJson from '../assets/geo/china.json';

let cachedGeoJson = null;
let loadingPromise = null;

const CDN_GEO_SOURCES = [
  '/geo/china.json',
  'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
  'https://echarts.apache.org/examples/data/asset/geo/China.json'
];

function isValidGeoJson(json) {
  return json?.features?.length || json?.type === 'FeatureCollection';
}

async function loadFromNetwork(source) {
  const response = await fetch(source);
  if (!response.ok) return null;
  const json = await response.json();
  return isValidGeoJson(json) ? json : null;
}

/**
 * 加载并注册中国地图 GeoJSON
 * 优先使用打包内嵌的 china.json，避免云环境 CDN / 静态文件不可用
 */
export async function registerChinaMap(mapName = 'china') {
  if (echarts.getMap(mapName)) {
    return true;
  }

  if (cachedGeoJson) {
    echarts.registerMap(mapName, cachedGeoJson);
    return true;
  }

  if (!loadingPromise) {
    loadingPromise = (async () => {
      if (isValidGeoJson(bundledChinaGeoJson)) {
        return bundledChinaGeoJson;
      }

      for (const source of CDN_GEO_SOURCES) {
        try {
          const json = await loadFromNetwork(source);
          if (json) return json;
        } catch {
          // try next source
        }
      }
      return null;
    })();
  }

  const geoJson = await loadingPromise;
  if (!geoJson) {
    return false;
  }

  cachedGeoJson = geoJson;
  echarts.registerMap(mapName, geoJson);
  return true;
}
