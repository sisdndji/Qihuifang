<template>
  <div class="distribution-page">
    <div class="decoration dec-1"></div>
    <div class="decoration dec-2"></div>
    <div class="overlay" v-if="showDetail" @click="closeDetail"></div>
    
    <div class="detail-panel" v-if="showDetail">
      <div class="detail-header">
        <h2 class="detail-title">{{ selectedProvince?.name }}传承人详情</h2>
        <button class="close-btn" @click="closeDetail">×</button>
      </div>
      <div class="detail-content">
        <div class="detail-item">
          <div class="detail-label">传承人数量</div>
          <div class="detail-value">{{ selectedProvince?.value || 0 }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">占全国比例</div>
          <div class="detail-value">{{ selectedPercentage }}%</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">全国排名</div>
          <div class="detail-value">第{{ selectedRank }}位</div>
          <div class="detail-rank">全国领先</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">代表传承人</div>
          <div class="detail-value">{{ selectedProvince?.representative || '暂无' }}</div>
        </div>
        <div class="detail-examples" v-if="selectedProvince?.examples?.length">
          <div class="examples-title">代表性传承人</div>
          <div class="examples-list">
            <div class="example-tag" v-for="(example, index) in selectedProvince.examples" :key="index">
              {{ example }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="container">
      <div class="header glow">
        <h1 class="title">传承人全国地域分布</h1>
        <p class="subtitle">本可视化展示国漆髹涂技艺传承人在全国各地区的分布情况，数据来源于公开报道爬虫采集与本站传承人数据库</p>
      </div>
      
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-label">统计地区数量</div>
          <div class="stat-value">{{ distributionData.length }}</div>
          <div class="stat-desc">含所有省级行政区</div>
          <div class="ranking-tag">省级行政区全覆盖</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">传承人总数</div>
          <div class="stat-value">{{ totalMasters }}</div>
          <div class="stat-desc">国漆髹涂技艺传承人</div>
          <div class="ranking-tag">涵盖全国各地区</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">传承人最多地区</div>
          <div class="stat-value">{{ topProvince?.name || '暂无' }}</div>
          <div class="top-province" v-if="topProvince">
            <div class="medal">1</div>
            <div class="info">
              <div class="name">{{ topProvince.name }}</div>
              <div class="count">{{ topProvince.value }}位传承人</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard">
        <div class="chart-container">
          <div class="chart-header">
            <h2 class="chart-title">
              <el-icon><DataAnalysis /></el-icon>
              各地区传承人数量排名
            </h2>
          </div>
          <div ref="barChartRef" class="chart"></div>
          <div class="legend">
            <div class="legend-item" v-for="(item, index) in legendItems" :key="index">
              <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
        
        <div class="chart-container">
          <div class="chart-header">
            <h2 class="chart-title">
              <el-icon><MapLocation /></el-icon>
              全国传承人分布地图
            </h2>
          </div>
          <div ref="mapChartRef" class="chart"></div>
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color" style="background-color: #d73027;"></div>
              <span>高密度区域</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #abd9e9;"></div>
              <span>低密度区域</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>数据来源：{{ dataSource }} | 统计时间：{{ statsYear }}年 | 最后更新：{{ lastUpdated || '—' }}</p>
        <p>注：本数据包含<span class="highlight">国漆髹涂技艺传承人</span>，涵盖全国各地区分布情况</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import * as echarts from 'echarts';
import { DataAnalysis, MapLocation } from '@element-plus/icons-vue';
import { mastersAPI } from '../api/masters';
import { registerChinaMap } from '../utils/chinaMap';

const barChartRef = ref(null);
const mapChartRef = ref(null);
let barChart = null;
let mapChart = null;

const showDetail = ref(false);
const selectedProvince = ref(null);
const distributionData = ref([]);
const dataSource = ref('公开资料爬虫 + 本站数据库');
const lastUpdated = ref('');
const statsYear = new Date().getFullYear();

const fetchMastersData = async () => {
  try {
    const res = await mastersAPI.getDistribution();
    const payload = res.data || {};
    distributionData.value = payload.distribution || [];
    dataSource.value = payload.summary?.dataSource || dataSource.value;
    lastUpdated.value = payload.summary?.lastUpdated
      ? new Date(payload.summary.lastUpdated).toLocaleString('zh-CN')
      : '';
    initCharts();
  } catch (error) {
    console.error('获取地域分布失败:', error);
    distributionData.value = getDefaultData();
    initCharts();
  }
};

// 默认示例数据
const getDefaultData = () => {
  return [
    { name: '黑龙江省', value: 15, examples: ['李囡', '张师傅', '王师傅'], representative: '李囡' },
    { name: '浙江省', value: 12, examples: ['陈师傅', '刘师傅'], representative: '陈师傅' },
    { name: '江苏省', value: 10, examples: ['赵师傅'], representative: '赵师傅' },
    { name: '北京市', value: 8, examples: ['钱师傅'], representative: '钱师傅' },
    { name: '山东省', value: 6, examples: ['孙师傅'], representative: '孙师傅' },
    { name: '广东省', value: 5, examples: ['周师傅'], representative: '周师傅' },
    { name: '四川省', value: 4, examples: ['吴师傅'], representative: '吴师傅' },
    { name: '湖北省', value: 3, examples: ['郑师傅'], representative: '郑师傅' },
    { name: '湖南省', value: 2, examples: ['王师傅'], representative: '王师傅' },
    { name: '河南省', value: 1, examples: ['李师傅'], representative: '李师傅' }
  ];
};

const totalMasters = computed(() => {
  return distributionData.value.reduce((sum, item) => sum + (item.value || 0), 0);
});

const topProvince = computed(() => {
  const active = distributionData.value.filter((item) => item.value > 0);
  return active.length > 0 ? active[0] : null;
});

const selectedPercentage = computed(() => {
  if (!selectedProvince.value || totalMasters.value === 0) return '0.00';
  return ((selectedProvince.value.value / totalMasters.value) * 100).toFixed(2);
});

const selectedRank = computed(() => {
  if (!selectedProvince.value) return 0;
  return distributionData.value.findIndex(item => item.name === selectedProvince.value.name) + 1;
});

const legendItems = computed(() => {
  const max = Math.max(...distributionData.value.map(item => item.value), 1);
  return [
    { color: '#4fc3f7', label: `${Math.ceil(max * 0.8)}+位` },
    { color: '#29b6f6', label: `${Math.ceil(max * 0.6)}-${Math.ceil(max * 0.8)}位` },
    { color: '#03a9f4', label: `${Math.ceil(max * 0.4)}-${Math.ceil(max * 0.6)}位` },
    { color: '#039be5', label: `${Math.ceil(max * 0.2)}-${Math.ceil(max * 0.4)}位` },
    { color: '#0288d1', label: `1-${Math.ceil(max * 0.2)}位` },
    { color: '#0277bd', label: '0位' }
  ];
});

const initCharts = async () => {
  if (!barChartRef.value || !mapChartRef.value) return;
  
  barChart = echarts.init(barChartRef.value);
  mapChart = echarts.init(mapChartRef.value);
  
  const maxValue = Math.max(...distributionData.value.map(item => item.value), 1);
  
  // 柱状图配置
  const barOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const item = params[0];
        const provinceData = distributionData.value[item.dataIndex];
        const percentage = totalMasters.value > 0 
          ? ((item.value / totalMasters.value) * 100).toFixed(2) 
          : '0.00';
        let examples = provinceData.examples.slice(0, 3).join('、');
        if (provinceData.examples.length > 3) examples += '等';
        
        return `<div class="map-tip">
          <h3>${item.name}</h3>
          <div>传承人数量: <span class="value">${item.value}</span></div>
          <div>占全国比例: <span class="value">${percentage}%</span></div>
          <div>全国排名: <span class="rank">${item.dataIndex + 1}位</span></div>
          <div>代表传承人: <span class="value">${examples || '暂无'}</span></div>
        </div>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '传承人数量',
      nameTextStyle: {
        color: '#90a4ae',
        fontSize: 16,
        padding: [10, 0, 0, 0]
      },
      axisLabel: {
        color: '#e0f7fa',
        fontSize: 14
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: distributionData.value.map(item => item.name),
      axisLabel: {
        color: '#e0f7fa',
        interval: 0,
        fontSize: 14
      },
      axisTick: {
        show: false
      }
    },
    series: [{
      name: '传承人数量',
      type: 'bar',
      data: distributionData.value.map(item => item.value),
      itemStyle: {
        color: (params) => {
          const value = params.value;
          const max = maxValue;
          if (value >= max * 0.8) return '#4fc3f7';
          if (value >= max * 0.6) return '#29b6f6';
          if (value >= max * 0.4) return '#03a9f4';
          if (value >= max * 0.2) return '#039be5';
          if (value > 0) return '#0288d1';
          return '#0277bd';
        },
        borderRadius: [0, 10, 10, 0],
        shadowBlur: 10,
        shadowColor: 'rgba(79, 195, 247, 0.5)'
      },
      label: {
        show: true,
        position: 'right',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        formatter: '{c}'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowColor: 'rgba(79, 195, 247, 0.8)'
        }
      }
    }],
    dataZoom: [{
      type: 'slider',
      show: true,
      yAxisIndex: 0,
      start: 0,
      end: 50,
      bottom: 20,
      height: 20,
      textStyle: {
        color: '#e0f7fa'
      },
      handleSize: 20,
      handleStyle: {
        color: '#4fc3f7'
      }
    }]
  };
  
  barChart.setOption(barOption);
  
  const mapRegistered = await registerChinaMap('china');
  if (!mapRegistered) {
    console.error('地图数据加载失败');
    window.addEventListener('resize', handleResize);
    return;
  }

  const mapOption = {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const provinceData = distributionData.value.find(item => {
              const mapName = params.name;
              const dataName = item.name.replace('特别行政区', '').replace('自治区', '').replace('省', '').replace('市', '');
              return mapName.includes(dataName) || dataName.includes(mapName);
            });
            
            if (!provinceData) return '';
            
            const rank = distributionData.value.findIndex(item => item.name === provinceData.name) + 1;
            const percentage = totalMasters.value > 0 
              ? ((provinceData.value / totalMasters.value) * 100).toFixed(2) 
              : '0.00';
            let examples = provinceData.examples.slice(0, 2).join('、');
            if (provinceData.examples.length > 2) examples += '等';
            
            return `<div class="map-tip">
              <h3>${provinceData.name}</h3>
              <div>传承人数量: <span class="value">${provinceData.value}</span></div>
              <div>占全国比例: <span class="value">${percentage}%</span></div>
              <div>全国排名: <span class="rank">${rank}位</span></div>
              <div>代表传承人: <span class="value">${examples || '暂无'}</span></div>
              <div style="margin-top:8px;color:#bbdefb;font-size:13px">点击查看详情</div>
            </div>`;
          }
        },
        visualMap: {
          min: 0,
          max: maxValue,
          text: ['高', '低'],
          realtime: false,
          calculable: true,
          inRange: {
            color: ['#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#fee090', '#fdae61', '#f46d43', '#d73027']
          },
          textStyle: {
            color: '#e0f7fa',
            fontSize: 14
          },
          left: 'left',
          bottom: '5%'
        },
        series: [{
          name: '传承人数量',
          type: 'map',
          map: 'china',
          roam: true,
          zoom: 1.2,
          emphasis: {
            label: {
              show: true,
              color: '#fff',
              fontWeight: 'bold'
            },
            itemStyle: {
              areaColor: '#ff7c7c'
            }
          },
          data: distributionData.value.map(item => ({
            name: item.mapName || item.name.replace('特别行政区', '').replace('自治区', '').replace('省', '').replace('市', ''),
            value: item.value,
            fullName: item.name
          })),
          label: {
            show: true,
            fontSize: 12,
            color: '#333',
            fontWeight: 'bold'
          },
          itemStyle: {
            borderColor: 'rgba(0, 0, 0, 0.3)',
            borderWidth: 1
          },
          emphasis: {
            itemStyle: {
              areaColor: '#ffeb3b',
              borderWidth: 2,
              borderColor: '#ff9800'
            }
          }
        }]
      };
      
      mapChart.setOption(mapOption);
      
      // 添加地图点击事件
      mapChart.on('click', (params) => {
        const provinceName = params.data ? params.data.fullName : '';
        if (provinceName) {
          const provinceData = distributionData.value.find(item => item.name === provinceName);
          if (provinceData) {
            selectedProvince.value = provinceData;
            showDetail.value = true;
          }
        }
      });

  // 响应窗口大小变化
  window.addEventListener('resize', handleResize);
};

const handleResize = () => {
  if (barChart) barChart.resize();
  if (mapChart) mapChart.resize();
};

const closeDetail = () => {
  showDetail.value = false;
  selectedProvince.value = null;
};

onMounted(() => {
  fetchMastersData();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (barChart) barChart.dispose();
  if (mapChart) mapChart.dispose();
});
</script>

<style lang="scss" scoped>
.distribution-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0c1b33, #1a2a6c, #2c3e50);
  color: #fff;
  padding: 20px;
  overflow-x: hidden;
  position: relative;
  
  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="none" width="100" height="100"/><path d="M0,0 L100,100 M100,0 L0,100" stroke="rgba(79, 195, 247, 0.05)" stroke-width="1"/></svg>');
    z-index: 0;
    opacity: 0.3;
    pointer-events: none;
  }
}

.decoration {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  filter: blur(30px);
  z-index: 0;
  pointer-events: none;
}

.dec-1 {
  top: 10%;
  left: 5%;
  background: radial-gradient(circle, rgba(79, 195, 247, 0.2) 0%, transparent 70%);
}

.dec-2 {
  bottom: 10%;
  right: 5%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
}

.container {
  max-width: 1800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.header {
  text-align: center;
  padding: 30px 0;
  margin-bottom: 30px;
  position: relative;
  background: rgba(13, 30, 61, 0.4);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 10, 30, 0.4);
  border: 1px solid rgba(79, 195, 247, 0.2);
  backdrop-filter: blur(5px);
}

.title {
  font-size: 52px;
  font-weight: 800;
  margin-bottom: 15px;
  letter-spacing: 3px;
  background: linear-gradient(90deg, #4fc3f7, #29b6f6, #03a9f4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(79, 195, 247, 0.3);
  position: relative;
  display: inline-block;
  
  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 4px;
    background: linear-gradient(90deg, transparent, #4fc3f7, transparent);
  }
}

.subtitle {
  font-size: 22px;
  color: #bbdefb;
  max-width: 900px;
  margin: 0 auto;
  line-height: 1.8;
  font-weight: 300;
  letter-spacing: 1px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-bottom: 40px;
}

.stat-card {
  background: linear-gradient(145deg, rgba(13, 30, 61, 0.7), rgba(25, 55, 109, 0.7));
  border-radius: 18px;
  padding: 35px 25px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 10, 30, 0.4);
  border: 1px solid rgba(79, 195, 247, 0.2);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #4fc3f7, #03a9f4);
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 35px rgba(0, 30, 90, 0.6);
    border: 1px solid rgba(79, 195, 247, 0.4);
  }
}

.stat-value {
  font-size: 56px;
  font-weight: 800;
  margin: 20px 0;
  color: #4fc3f7;
  text-shadow: 0 0 15px rgba(79, 195, 247, 0.6);
  letter-spacing: 2px;
}

.stat-label {
  font-size: 22px;
  color: #bbdefb;
  margin-bottom: 15px;
  font-weight: 400;
}

.stat-desc {
  font-size: 18px;
  color: #90a4ae;
  font-weight: 300;
}

.ranking-tag {
  background: linear-gradient(90deg, #ff9800, #ff5722);
  color: #fff;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 600;
  display: inline-block;
  margin-top: 10px;
}

.top-province {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  padding: 15px;
  background: rgba(79, 195, 247, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(79, 195, 247, 0.3);
}

.medal {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ffd700, #ff9800);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin-right: 15px;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.info {
  text-align: left;
}

.name {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
}

.count {
  font-size: 20px;
  color: #bbdefb;
}

.dashboard {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 30px;
  margin-bottom: 40px;
}

.chart-container {
  background: rgba(13, 30, 61, 0.5);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 12px 40px rgba(0, 15, 40, 0.5);
  border: 1px solid rgba(79, 195, 247, 0.3);
  transition: all 0.4s ease;
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  height: 700px;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 50px rgba(0, 30, 90, 0.7);
    border: 1px solid rgba(79, 195, 247, 0.5);
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.chart-title {
  font-size: 28px;
  font-weight: 600;
  color: #4fc3f7;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart {
  flex: 1;
  width: 100%;
}

.legend {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #bbdefb;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 8px;
}

.footer {
  text-align: center;
  padding: 30px;
  color: #90a4ae;
  font-size: 18px;
  margin-top: 20px;
  background: rgba(13, 30, 61, 0.4);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 10, 30, 0.4);
  border: 1px solid rgba(79, 195, 247, 0.2);
  backdrop-filter: blur(5px);
}

.highlight {
  color: #4fc3f7;
  font-weight: 600;
}

.glow {
  animation: glowEffect 3s infinite alternate;
}

@keyframes glowEffect {
  0% {
    box-shadow: 0 0 5px rgba(79, 195, 247, 0.5);
  }
  100% {
    box-shadow: 0 0 20px rgba(79, 195, 247, 0.8), 0 0 30px rgba(79, 195, 247, 0.6);
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 99;
}

.detail-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(13, 30, 61, 0.95);
  border: 2px solid #4fc3f7;
  border-radius: 15px;
  padding: 30px;
  width: 80%;
  max-width: 600px;
  z-index: 100;
  box-shadow: 0 0 40px rgba(79, 195, 247, 0.6);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.detail-title {
  font-size: 28px;
  color: #4fc3f7;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: #bbdefb;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    color: #ff5252;
    transform: scale(1.2);
  }
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-label {
  color: #bbdefb;
  margin-bottom: 5px;
  font-size: 16px;
}

.detail-value {
  font-size: 22px;
  font-weight: 600;
  color: #ffd700;
}

.detail-rank {
  display: inline-block;
  background: linear-gradient(135deg, #ff9800, #ff5722);
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: 600;
  margin-top: 5px;
}

.detail-examples {
  grid-column: span 2;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.examples-title {
  color: #4fc3f7;
  margin-bottom: 10px;
  font-size: 18px;
}

.examples-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.example-tag {
  background: rgba(79, 195, 247, 0.2);
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
}

@media (max-width: 1400px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-container {
    height: 600px;
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .title {
    font-size: 36px;
  }
  
  .subtitle {
    font-size: 18px;
  }
  
  .stat-value {
    font-size: 42px;
  }
}
</style>

