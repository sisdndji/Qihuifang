<template>
  <div class="platform-stats-page" v-loading="loading">
    <!-- 页头 -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-text">
          <span class="page-tag">Platform Analytics</span>
          <h1 class="page-title">平台数据统计</h1>
          <p class="page-desc">实时查看平台用户规模与访问热度，数据仅在本后台可见</p>
        </div>
        <div class="header-actions">
          <span class="update-time" v-if="stats?.breakdown?.lastUpdated">
            <el-icon><Clock /></el-icon>
            更新于 {{ formatTime(stats.breakdown.lastUpdated) }}
          </span>
          <el-button type="primary" :loading="loading" @click="fetchStats">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </header>

    <!-- 核心指标 -->
    <section class="metrics-section">
      <div class="metric-card metric-users">
        <div class="metric-icon-wrap">
          <el-icon class="metric-icon"><User /></el-icon>
        </div>
        <div class="metric-body">
          <div class="metric-label">平台现有用户</div>
          <div class="metric-value">{{ stats?.userCountDisplay || '--' }}</div>
          <div class="metric-sub">注册用户 + 配置基数</div>
        </div>
        <div class="metric-decoration"></div>
      </div>

      <div class="metric-card metric-views">
        <div class="metric-icon-wrap">
          <el-icon class="metric-icon"><View /></el-icon>
        </div>
        <div class="metric-body">
          <div class="metric-label">平台浏览量</div>
          <div class="metric-value">
            {{ stats?.pageViewsDisplay || '--' }}
            <span class="metric-unit">次</span>
          </div>
          <div class="metric-sub">累计页面访问次数</div>
        </div>
        <div class="metric-decoration"></div>
      </div>
    </section>

    <!-- 数据图 -->
    <section class="breakdown-section">
      <h2 class="section-title">
        <el-icon><PieChart /></el-icon>
        数据图
      </h2>

      <div class="breakdown-grid">
        <div class="chart-card">
          <div class="chart-card-header">
            <span class="chart-card-title">用户数据</span>
            <span class="chart-card-total">展示总量 {{ stats?.userCountDisplay || '--' }}</span>
          </div>
          <div ref="userChartRef" class="chart-box"></div>
          <p class="chart-note">柱状图展示平台现有用户规模</p>
        </div>

        <div class="chart-card">
          <div class="chart-card-header">
            <span class="chart-card-title">浏览量数据</span>
            <span class="chart-card-total">展示总量 {{ stats?.pageViewsDisplay || '--' }} 次</span>
          </div>
          <div ref="pageViewChartRef" class="chart-box"></div>
          <p class="chart-note">柱状图展示平台累计浏览量</p>
        </div>
      </div>
    </section>

    <!-- 传承人地域分布 -->
    <section class="breakdown-section">
      <div class="section-header-row">
        <h2 class="section-title">
          <el-icon><MapLocation /></el-icon>
          传承人全国地域分布
        </h2>
        <el-button :loading="distributionLoading" @click="refreshDistribution">
          <el-icon><Refresh /></el-icon>
          爬虫更新分布
        </el-button>
      </div>
      <div class="distribution-summary" v-if="distributionSummary">
        <span>覆盖 <strong>{{ distributionSummary.provinceCount }}</strong> 个省份</span>
        <span>传承人合计 <strong>{{ distributionSummary.totalMasters }}</strong> 位</span>
        <span v-if="distributionSummary.topProvince">
          最多地区 <strong>{{ distributionSummary.topProvince.name }}</strong>（{{ distributionSummary.topProvince.value }} 位）
        </span>
        <span v-if="distributionSummary.lastUpdated" class="muted">
          更新于 {{ formatTime(distributionSummary.lastUpdated) }}
        </span>
      </div>
    </section>

    <!-- 统计规则 -->
    <section class="info-section">
      <div class="info-card config-card">
        <h3 class="info-title">
          <el-icon><Setting /></el-icon>
          统计规则说明
        </h3>
        <ul class="rule-list">
          <li>
            <span class="rule-key">用户基数</span>
            <span class="rule-val">{{ formatNum(stats?.breakdown?.userBase) }} 人</span>
          </li>
          <li>
            <span class="rule-key">浏览量基数</span>
            <span class="rule-val">{{ formatWan(stats?.breakdown?.pageViewBase) }} 次</span>
          </li>
          <li>
            <span class="rule-key">计数方式</span>
            <span class="rule-val">基数 + 实时增量</span>
          </li>
          <li>
            <span class="rule-key">配置位置</span>
            <span class="rule-val">backend/config/config.js</span>
          </li>
        </ul>
        <div class="config-tip">
          <el-icon><InfoFilled /></el-icon>
          如需调整初始基数，可修改配置文件或通过环境变量 PLATFORM_USER_BASE、PLATFORM_PAGEVIEW_BASE 设置
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import {
  User, View, Refresh, Clock, PieChart, Setting, InfoFilled, MapLocation
} from '@element-plus/icons-vue';
import { platformAPI } from '../../api/platform';
import { mastersAPI } from '../../api/masters';

const themeColors = {
  primary: '#A3262A',
  secondary: '#4A2A20',
  accentGold: '#D8B877'
};

const loading = ref(false);
const distributionLoading = ref(false);
const stats = ref(null);
const distributionSummary = ref(null);
const userChartRef = ref(null);
const pageViewChartRef = ref(null);

let userChart = null;
let pageViewChart = null;

const formatNum = (num) => {
  if (num == null) return '--';
  return Number(num).toLocaleString('zh-CN');
};

const formatWan = (num) => {
  if (num == null) return '--';
  if (num >= 10000) {
    const wan = num / 10000;
    return Number.isInteger(wan) ? `${wan}万` : `${parseFloat(wan.toFixed(1))}万`;
  }
  return formatNum(num);
};

const formatTime = (timeStr) => {
  if (!timeStr) return '--';
  const date = new Date(timeStr.includes('T') ? timeStr : timeStr.replace(' ', 'T') + 'Z');
  if (Number.isNaN(date.getTime())) return timeStr;
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const buildIncrementBarOption = ({ incrementLabel, incrementDisplay, incrementValue, totalDisplay, colors }) => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: () => `${incrementLabel}：${incrementDisplay}`
  },
  grid: {
    left: 24,
    right: 24,
    top: 36,
    bottom: 48,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: [incrementLabel],
    axisLine: { lineStyle: { color: '#D7C0A5' } },
    axisLabel: { color: themeColors.secondary, fontSize: 13, fontWeight: 600 }
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#F0EBE3', type: 'dashed' } },
    axisLabel: { color: '#6B665E' }
  },
  series: [
    {
      type: 'bar',
      barWidth: 56,
      data: [{
        value: incrementValue,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors[0] },
            { offset: 1, color: colors[1] }
          ])
        },
        label: {
          show: true,
          position: 'top',
          formatter: incrementDisplay,
          color: themeColors.secondary,
          fontSize: 18,
          fontWeight: 700,
          fontFamily: 'KaiTi, 楷体, serif'
        }
      }]
    }
  ],
  graphic: [
    {
      type: 'text',
      right: 20,
      top: 8,
      style: {
        text: `展示总量 ${totalDisplay}`,
        fill: '#6B665E',
        fontSize: 12
      }
    }
  ]
});

const renderCharts = () => {
  if (!stats.value) return;

  const { userCount, userCountDisplay, pageViews, pageViewsDisplay } = stats.value;

  if (userChart) {
    userChart.setOption(buildIncrementBarOption({
      incrementLabel: '注册用户',
      incrementDisplay: userCountDisplay,
      incrementValue: userCount ?? 0,
      totalDisplay: userCountDisplay,
      colors: [themeColors.primary, '#B83A3E']
    }), true);
    userChart.resize();
  }

  if (pageViewChart) {
    pageViewChart.setOption(buildIncrementBarOption({
      incrementLabel: '实际访问',
      incrementDisplay: pageViewsDisplay,
      incrementValue: pageViews ?? 0,
      totalDisplay: `${pageViewsDisplay} 次`,
      colors: [themeColors.accentGold, '#E6C690']
    }), true);
    pageViewChart.resize();
  }
};

const initCharts = async () => {
  await nextTick();
  if (userChartRef.value) {
    userChart = echarts.init(userChartRef.value);
  }
  if (pageViewChartRef.value) {
    pageViewChart = echarts.init(pageViewChartRef.value);
  }
  renderCharts();
};

const handleResize = () => {
  userChart?.resize();
  pageViewChart?.resize();
};

const fetchStats = async () => {
  loading.value = true;
  try {
    const res = await platformAPI.getStats();
    stats.value = res.data;
    await nextTick();
    renderCharts();
  } catch {
    ElMessage.error('获取平台统计失败');
  } finally {
    loading.value = false;
  }
};

const fetchDistributionSummary = async () => {
  try {
    const res = await mastersAPI.getDistribution();
    distributionSummary.value = res.data?.summary || null;
  } catch {
    distributionSummary.value = null;
  }
};

const refreshDistribution = async () => {
  distributionLoading.value = true;
  try {
    const res = await mastersAPI.refreshDistribution();
    distributionSummary.value = res.data?.summary || null;
    ElMessage.success('地域分布数据已通过爬虫更新');
  } catch {
    ElMessage.error('更新地域分布失败');
  } finally {
    distributionLoading.value = false;
  }
};

watch(stats, () => {
  renderCharts();
});

onMounted(async () => {
  await initCharts();
  await fetchStats();
  await fetchDistributionSummary();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  userChart?.dispose();
  pageViewChart?.dispose();
});
</script>

<style lang="scss" scoped>
.platform-stats-page {
  padding: 32px 36px 48px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}

.page-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-primary);
  background: rgba(163, 38, 42, 0.08);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 10px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-secondary);
  margin: 0 0 8px;
  font-family: 'KaiTi', '楷体', serif;
}

.page-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  max-width: 520px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.update-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 36px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.metric-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 28px;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(216, 184, 119, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(163, 38, 42, 0.1);
  }
}

.metric-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-users .metric-icon-wrap {
  background: linear-gradient(135deg, rgba(163, 38, 42, 0.12) 0%, rgba(163, 38, 42, 0.06) 100%);
  color: var(--color-primary);
}

.metric-views .metric-icon-wrap {
  background: linear-gradient(135deg, rgba(216, 184, 119, 0.25) 0%, rgba(216, 184, 119, 0.1) 100%);
  color: var(--color-accent-gold-dark);
}

.metric-icon {
  font-size: 28px;
}

.metric-body {
  flex: 1;
  position: relative;
  z-index: 1;
}

.metric-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.metric-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-secondary);
  font-family: 'KaiTi', '楷体', serif;
  line-height: 1.1;
}

.metric-unit {
  font-size: 18px;
  font-weight: 500;
  margin-left: 4px;
  color: var(--text-secondary);
}

.metric-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

.metric-decoration {
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.06;
}

.metric-users .metric-decoration {
  background: var(--color-primary);
}

.metric-views .metric-decoration {
  background: var(--color-accent-gold);
}

.breakdown-section {
  margin-bottom: 36px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.distribution-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px 24px;
  background: white;
  border-radius: 14px;
  border: 1px solid rgba(216, 184, 119, 0.15);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  font-size: 14px;
  color: var(--text-secondary);

  strong {
    color: var(--color-primary);
    font-weight: 600;
  }

  .muted {
    color: var(--text-muted);
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(216, 184, 119, 0.3);
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: white;
  border-radius: 14px;
  padding: 20px 20px 12px;
  border: 1px solid rgba(216, 184, 119, 0.15);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

.chart-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 4px;
}

.chart-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary);
}

.chart-card-total {
  font-size: 13px;
  color: var(--text-muted);
  background: var(--color-bg);
  padding: 4px 12px;
  border-radius: 20px;
}

.chart-box {
  width: 100%;
  height: 280px;
  min-width: 200px;
}

.chart-note {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  text-align: center;
  line-height: 1.6;
  padding-top: 4px;
}

.info-section {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.info-card {
  background: white;
  border-radius: 14px;
  padding: 24px;
  border: 1px solid rgba(216, 184, 119, 0.15);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

.info-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0 0 20px;
}

.preview-box {
  background: var(--color-bg);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--color-bg-dark);
}

.preview-footer-mock {
  text-align: center;
}

.preview-divider {
  height: 2px;
  background: var(--gradient-gold);
  margin-bottom: 16px;
  border-radius: 1px;
}

.preview-stats {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;

  strong {
    color: var(--color-primary);
    font-weight: 600;
  }
}

.preview-sep {
  margin: 0 12px;
  opacity: 0.4;
}

.preview-note {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.rule-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
}

.rule-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-bg-dark);
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }
}

.rule-key {
  color: var(--text-secondary);
}

.rule-val {
  color: var(--color-secondary);
  font-weight: 500;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.config-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  background: rgba(216, 184, 119, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  border-left: 3px solid var(--color-accent-gold);

  .el-icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--color-accent-gold-dark);
  }
}
</style>
