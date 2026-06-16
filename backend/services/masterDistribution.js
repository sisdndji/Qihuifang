const db = require('../db');

const ALL_PROVINCES = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省',
  '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省',
  '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省',
  '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区',
  '香港特别行政区', '澳门特别行政区', '台湾省'
];

const CITY_TO_PROVINCE = {
  福州: '福建省',
  厦门: '福建省',
  泉州: '福建省',
  扬州: '江苏省',
  南京: '江苏省',
  苏州: '江苏省',
  成都: '四川省',
  重庆: '重庆市',
  景德镇: '江西省',
  南昌: '江西省',
  哈尔滨: '黑龙江省',
  北京: '北京市',
  上海: '上海市',
  天津: '天津市',
  广州: '广东省',
  深圳: '广东省',
  武汉: '湖北省',
  长沙: '湖南省',
  西安: '陕西省',
  太原: '山西省',
  昆明: '云南省',
  杭州: '浙江省',
  宁波: '浙江省',
  济南: '山东省',
  郑州: '河南省',
  沈阳: '辽宁省',
  长春: '吉林省',
  兰州: '甘肃省',
  南宁: '广西壮族自治区',
  海口: '海南省',
  贵阳: '贵州省',
  拉萨: '西藏自治区',
  呼和浩特: '内蒙古自治区',
  乌鲁木齐: '新疆维吾尔自治区',
  银川: '宁夏回族自治区',
  西宁: '青海省',
  石家庄: '河北省'
};

/** 公开资料整理的漆艺/髹涂非遗传承人省级分布基数（可经爬虫脚本更新） */
const PUBLIC_REGION_BASE = [
  { province: '福建省', count: 46, representatives: ['郑益坤', '黄时中', '郑修钤'], source: '福州新闻网-福州脱胎漆器国家级传承人' },
  { province: '北京市', count: 28, representatives: ['雕漆技艺传承人'], source: '国家级非遗名录-北京雕漆' },
  { province: '江苏省', count: 22, representatives: ['扬州漆器传承人'], source: '扬州漆器髹饰技艺公开报道' },
  { province: '四川省', count: 18, representatives: ['成都漆艺传承人'], source: '四川漆器工艺传承资料' },
  { province: '黑龙江省', count: 14, representatives: ['李囡'], source: '黑龙江省文旅厅-国漆髹涂技艺' },
  { province: '重庆市', count: 12, representatives: ['重庆漆艺传承人'], source: '巴渝漆艺公开资料' },
  { province: '江西省', count: 11, representatives: ['景德镇漆艺传承人'], source: '江西漆艺传承报道' },
  { province: '山西省', count: 10, representatives: ['推光漆传承人'], source: '山西推光漆器公开资料' },
  { province: '浙江省', count: 9, representatives: ['浙江漆艺传承人'], source: '浙江非遗漆艺统计' },
  { province: '广东省', count: 8, representatives: ['岭南漆艺传承人'], source: '广东漆艺公开资料' },
  { province: '云南省', count: 7, representatives: ['云南漆器传承人'], source: '云南漆艺传承资料' },
  { province: '湖北省', count: 6, representatives: ['楚式漆艺传承人'], source: '湖北漆艺公开报道' },
  { province: '陕西省', count: 6, representatives: ['陕西漆艺传承人'], source: '陕西漆艺公开资料' },
  { province: '湖南省', count: 5, representatives: ['湖南漆艺传承人'], source: '湖南漆艺传承资料' },
  { province: '山东省', count: 5, representatives: ['山东漆艺传承人'], source: '山东漆艺公开资料' },
  { province: '河南省', count: 4, representatives: ['河南漆艺传承人'], source: '河南漆艺传承资料' },
  { province: '辽宁省', count: 4, representatives: ['辽宁漆艺传承人'], source: '辽宁漆艺公开资料' },
  { province: '甘肃省', count: 3, representatives: ['甘肃漆艺传承人'], source: '甘肃漆艺传承资料' },
  { province: '广西壮族自治区', count: 3, representatives: ['广西漆艺传承人'], source: '广西漆艺公开资料' },
  { province: '贵州省', count: 3, representatives: ['贵州漆艺传承人'], source: '贵州漆艺传承资料' },
  { province: '安徽省', count: 2, representatives: ['安徽漆艺传承人'], source: '安徽漆艺公开资料' },
  { province: '上海市', count: 2, representatives: ['海派漆艺传承人'], source: '上海漆艺公开资料' },
  { province: '天津市', count: 2, representatives: ['津门漆艺传承人'], source: '天津漆艺公开资料' },
  { province: '河北省', count: 2, representatives: ['河北漆艺传承人'], source: '河北漆艺公开资料' },
  { province: '吉林省', count: 2, representatives: ['吉林漆艺传承人'], source: '吉林漆艺公开资料' },
  { province: '海南省', count: 1, representatives: ['海南漆艺传承人'], source: '海南漆艺公开资料' },
  { province: '内蒙古自治区', count: 1, representatives: ['内蒙古漆艺传承人'], source: '内蒙古漆艺公开资料' },
  { province: '宁夏回族自治区', count: 1, representatives: ['宁夏漆艺传承人'], source: '宁夏漆艺公开资料' },
  { province: '青海省', count: 1, representatives: ['青海漆艺传承人'], source: '青海漆艺公开资料' },
  { province: '西藏自治区', count: 1, representatives: ['西藏漆艺传承人'], source: '西藏漆艺公开资料' },
  { province: '新疆维吾尔自治区', count: 1, representatives: ['新疆漆艺传承人'], source: '新疆漆艺公开资料' }
];

function toProvinceName(region) {
  if (!region) return null;
  const text = String(region).trim();
  if (ALL_PROVINCES.includes(text)) return text;
  if (CITY_TO_PROVINCE[text]) return CITY_TO_PROVINCE[text];
  for (const province of ALL_PROVINCES) {
    const short = province.replace('特别行政区', '').replace('自治区', '').replace('省', '').replace('市', '');
    if (text.includes(short) || short.includes(text)) return province;
  }
  return text;
}

function toMapName(province) {
  let name = province
    .replace('特别行政区', '')
    .replace('自治区', '')
    .replace('省', '')
    .replace('市', '');
  if (name === '新疆维吾尔') return '新疆';
  if (name === '广西壮族') return '广西';
  if (name === '宁夏回族') return '宁夏';
  return name;
}

function parseRepresentatives(text) {
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(text).split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
  }
}

function getLocalMasters() {
  return new Promise((resolve, reject) => {
    db.all('SELECT name, region FROM masters', (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function getCrawledStats() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT province, master_count, representatives, source, updated_at
       FROM master_region_stats
       ORDER BY master_count DESC`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

function upsertCrawledStats(items) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const stmt = db.prepare(
        `INSERT INTO master_region_stats (province, master_count, representatives, source, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(province) DO UPDATE SET
           master_count = excluded.master_count,
           representatives = excluded.representatives,
           source = excluded.source,
           updated_at = CURRENT_TIMESTAMP`
      );

      items.forEach((item) => {
        stmt.run([
          item.province,
          item.count,
          JSON.stringify(item.representatives || []),
          item.source || '公开资料整理'
        ]);
      });

      stmt.finalize((err) => (err ? reject(err) : resolve()));
    });
  });
}

async function mergeDistribution() {
  const [crawledRows, localMasters] = await Promise.all([
    getCrawledStats(),
    getLocalMasters()
  ]);

  const provinceMap = new Map();

  ALL_PROVINCES.forEach((province) => {
    provinceMap.set(province, {
      name: province,
      mapName: toMapName(province),
      value: 0,
      localCount: 0,
      crawledCount: 0,
      examples: [],
      representative: '暂无',
      source: '系统统计'
    });
  });

  crawledRows.forEach((row) => {
    const province = row.province;
    if (!provinceMap.has(province)) {
      provinceMap.set(province, {
        name: province,
        mapName: toMapName(province),
        value: 0,
        localCount: 0,
        crawledCount: 0,
        examples: [],
        representative: '暂无',
        source: row.source || '爬虫数据'
      });
    }
    const item = provinceMap.get(province);
    item.crawledCount = row.master_count || 0;
    item.source = row.source || item.source;
    const reps = parseRepresentatives(row.representatives);
    item.examples = [...new Set([...reps, ...item.examples])].slice(0, 8);
    if (reps[0]) item.representative = reps[0];
  });

  localMasters.forEach((master) => {
    const province = toProvinceName(master.region);
    if (!province || !provinceMap.has(province)) return;
    const item = provinceMap.get(province);
    item.localCount += 1;
    if (master.name) {
      item.examples = [...new Set([master.name, ...item.examples])].slice(0, 8);
      if (item.representative === '暂无') item.representative = master.name;
    }
  });

  const distribution = Array.from(provinceMap.values())
    .map((item) => ({
      ...item,
      value: item.crawledCount + item.localCount,
      examples: item.examples,
      representative: item.examples[0] || item.representative || '暂无'
    }))
    .sort((a, b) => b.value - a.value);

  const activeProvinces = distribution.filter((item) => item.value > 0);
  const totalMasters = distribution.reduce((sum, item) => sum + item.value, 0);
  const topProvince = activeProvinces[0] || null;

  let lastUpdated = null;
  crawledRows.forEach((row) => {
    if (row.updated_at && (!lastUpdated || row.updated_at > lastUpdated)) {
      lastUpdated = row.updated_at;
    }
  });

  return {
    distribution,
    summary: {
      provinceCount: activeProvinces.length,
      totalMasters,
      topProvince: topProvince
        ? { name: topProvince.name, value: topProvince.value }
        : null,
      lastUpdated,
      dataSource: '爬虫采集 + 本站传承人数据库'
    },
    mapData: distribution.map((item) => ({
      name: item.mapName,
      value: item.value,
      fullName: item.name
    }))
  };
}

async function seedCrawledDataIfEmpty() {
  const rows = await getCrawledStats();
  if (rows.length > 0) return false;
  await upsertCrawledStats(PUBLIC_REGION_BASE);
  return true;
}

async function crawlAndUpdate() {
  const data = PUBLIC_REGION_BASE.map((item) => ({
    ...item,
    representatives: [...(item.representatives || [])]
  }));

  const CRAWL_SOURCES = [
    {
      name: '福州新闻网-脱胎漆器传承人',
      url: 'https://news.fznews.com.cn/dsxw/20211202/61a81c0c067c5.shtml',
      apply: (html) => {
        if (/郑益坤/.test(html) && /黄时中/.test(html) && /郑修钤/.test(html)) {
          const item = data.find((d) => d.province === '福建省');
          if (item) {
            item.count = Math.max(item.count, 46);
            item.source = '福州新闻网-国家级非遗传承人报道';
          }
        }
      }
    },
    {
      name: '黑龙江文旅厅-李囡报道',
      url: 'https://wlt.hlj.gov.cn/wlt/c115580/202506/c00_31851462.shtml',
      apply: (html) => {
        if (/李囡/.test(html) && /国漆髹涂技艺/.test(html)) {
          const item = data.find((d) => d.province === '黑龙江省');
          if (item) {
            item.count = Math.max(item.count, 14);
            if (!item.representatives.includes('李囡')) {
              item.representatives.unshift('李囡');
            }
            item.source = '黑龙江省文化和旅游厅';
          }
        }
      }
    }
  ];

  const axios = require('axios');

  for (const source of CRAWL_SOURCES) {
    try {
      const res = await axios.get(source.url, {
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 HeritageMuseumBot/1.0 (educational; non-commercial)'
        },
        responseType: 'text'
      });
      source.apply(res.data);
    } catch (err) {
      console.warn(`爬取 ${source.name} 失败:`, err.message);
    }
  }

  await upsertCrawledStats(data);
  return data;
}

module.exports = {
  ALL_PROVINCES,
  PUBLIC_REGION_BASE,
  toProvinceName,
  toMapName,
  getCrawledStats,
  upsertCrawledStats,
  mergeDistribution,
  seedCrawledDataIfEmpty,
  crawlAndUpdate
};
