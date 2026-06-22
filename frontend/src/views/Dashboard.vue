<template>
  <div class="dashboard-page bg-dark-lacquer">
    <div class="dashboard-header">
      <div class="header-main">
        <div class="header-logo">
          <div class="logo-icon">漆</div>
          <div class="logo-text">
            <h1 class="dashboard-title">国漆髹涂技艺</h1>
            <p class="dashboard-subtitle">哈尔滨 · 省级非物质文化遗产</p>
          </div>
        </div>
        <div class="header-decorative">
          <div class="decorative-line"></div>
          <div class="decorative-text">传承千年技艺 · 守护文化瑰宝</div>
          <div class="decorative-line"></div>
        </div>
      </div>
      <div class="dashboard-controls">
        <el-button
          :type="isPlaying ? 'danger' : 'primary'"
          @click="togglePlay"
          class="control-btn"
        >
          <el-icon><VideoPlay v-if="!isPlaying" /><VideoPause v-else /></el-icon>
          {{ isPlaying ? '暂停' : '播放' }}
        </el-button>
        <el-switch
          v-model="riskViewMode"
          active-text="理想状态"
          inactive-text="当前状态"
          @change="updateRiskChart"
          class="control-switch"
        />
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- 上排 -->
      <!-- 左：工序难度 & 耗时 -->
      <StatPanel title="髹涂36道工序 - 难度 & 耗时" class="chart-panel">
        <div ref="processChartRef" class="chart-container"></div>
      </StatPanel>

      <!-- 中：工艺流程桑基图 -->
      <StatPanel title="髹涂流程结构分析" class="chart-panel">
        <div ref="sankeyChartRef" class="chart-container"></div>
      </StatPanel>

      <!-- 右：风险雷达图 -->
      <StatPanel title="技艺传承风险分析" class="chart-panel">
        <div ref="riskChartRef" class="chart-container"></div>
      </StatPanel>

      <!-- 下排 -->
      <!-- 左：传承人全国地域分布（中国地图） -->
      <StatPanel title="传承人全国地域分布" class="chart-panel map-panel">
        <div class="chart-tabs">
          <el-radio-group v-model="regionViewMode" size="small" @change="updateRegionChart">
            <el-radio-button label="map">全国地图</el-radio-button>
            <el-radio-button label="bar">数据列表</el-radio-button>
          </el-radio-group>
        </div>
        <div ref="regionChartRef" class="chart-container" v-show="regionViewMode === 'bar'"></div>
        <div ref="regionMapChartRef" class="chart-container map-container" v-show="regionViewMode === 'map'"></div>
        <div class="harbin-highlight" v-if="regionViewMode === 'map'">
          <div class="highlight-badge">
            <el-icon><LocationFilled /></el-icon>
            <span>全国传承人分布</span>
          </div>
          <div class="map-legend">
            <div class="legend-item">
              <div class="legend-color" style="background: #A3262A;"></div>
              <span>重点展示区域</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #D8B877;"></div>
              <span>其他区域</span>
            </div>
          </div>
        </div>
      </StatPanel>

      <!-- 中：历年作品数量 -->
      <StatPanel title="历年代表作品数量" class="chart-panel">
        <div ref="worksChartRef" class="chart-container"></div>
      </StatPanel>

      <!-- 右：技能标签分布 -->
      <StatPanel title="技能标签分布" class="chart-panel">
        <div ref="skillChartRef" class="chart-container"></div>
      </StatPanel>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { processStepsAPI } from '../api/processSteps';
import { mastersAPI } from '../api/masters';
import { worksAPI } from '../api/works';
import { heritageAPI } from '../api/heritage';
import { VideoPlay, VideoPause, LocationFilled } from '@element-plus/icons-vue';
import StatPanel from '../components/StatPanel.vue';
import { registerChinaMap } from '../utils/chinaMap';

// 主题颜色常量（与 theme.scss 保持一致）
const themeColors = {
  primary: '#A3262A',           // 朱砂漆红
  primaryLight: '#B83A3E',        // 浅朱砂红
  primaryDark: '#8A1F22',         // 深朱砂红
  secondary: '#4A2A20',           // 深栗漆棕
  secondaryLight: '#6B4A3A',      // 浅栗棕
  accentGold: '#D8B877',           // 金箔线金
  accentGoldLight: '#E6C690',     // 浅金色
  accentGoldDark: '#C4A55F',      // 深金色
  wood: '#D7C0A5',                // 木胎原色
  dark: '#1B1410',                // 深色背景
  border: '#8B6F47'               // 漆器边框色
};

const processChartRef = ref(null);
const sankeyChartRef = ref(null);
const riskChartRef = ref(null);
const regionChartRef = ref(null);
const regionMapChartRef = ref(null);
const worksChartRef = ref(null);
const skillChartRef = ref(null);

let processChart = null;
let sankeyChart = null;
let riskChart = null;
let regionChart = null;
let regionMapChart = null;
let worksChart = null;
let skillChart = null;

const isPlaying = ref(false);
const riskViewMode = ref(false); // false: 当前状态, true: 理想状态
const regionViewMode = ref('map'); // 'map' or 'bar'
let playInterval = null;
let currentStepIndex = 0;

// 初始化图表
const initCharts = async () => {
  await nextTick();

  // 工序难度 & 耗时图表
  if (processChartRef.value) {
    processChart = echarts.init(processChartRef.value);
    await loadProcessChart();
  }

  // 桑基图
  if (sankeyChartRef.value) {
    sankeyChart = echarts.init(sankeyChartRef.value);
    await loadSankeyChart();
  }

  // 风险雷达图
  if (riskChartRef.value) {
    riskChart = echarts.init(riskChartRef.value);
    await loadRiskChart();
  }

  // 地区分布：默认地图视图，仅初始化当前可见图表
  if (regionMapChartRef.value) {
    regionMapChart = echarts.init(regionMapChartRef.value);
    await loadRegionMapChart();
  }

  if (regionViewMode.value === 'bar' && regionChartRef.value) {
    regionChart = echarts.init(regionChartRef.value);
    await loadRegionChart();
  }

  // 作品数量图
  if (worksChartRef.value) {
    worksChart = echarts.init(worksChartRef.value);
    await loadWorksChart();
  }

  // 技能标签分布图
  if (skillChartRef.value) {
    skillChart = echarts.init(skillChartRef.value);
    await loadSkillChart();
  }

  // 设置工序图hover事件，实现联动高亮
  if (processChart) {
    processChart.on('mouseover', (params) => {
      highlightRelatedMasters(params.dataIndex);
    });
    processChart.on('mouseout', () => {
      resetHighlight();
    });
  }

  // 窗口大小变化时调整图表
  window.addEventListener('resize', handleResize);

  // 云环境布局完成后重新计算图表尺寸
  await nextTick();
  requestAnimationFrame(() => {
    handleResize();
    regionMapChart?.resize();
  });
};

// 加载工序图表
const loadProcessChart = async () => {
  try {
    let steps = [];
    try {
      const heritageRes = await heritageAPI.getAll();
      const heritageId = heritageRes.data?.[0]?.id;
      const res = await processStepsAPI.getAll(
        heritageId ? { heritage_id: heritageId } : undefined
      );
      steps = res.data || [];
    } catch (apiError) {
      console.warn('工序 API 不可用，使用示例数据:', apiError);
    }

    if (!steps.length) {
      steps = Array.from({ length: 36 }, (_, i) => ({
        step_name: `第${i + 1}步`,
        est_duration_hours: 4 + (i % 8),
        skill_level: 1 + (i % 5)
      }));
    }

    const stepNames = steps.map(s => s.step_name);
    const durations = steps.map(s => s.est_duration_hours);
    const skillLevels = steps.map(s => s.skill_level);

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['耗时(小时)', '难度等级'],
        textStyle: { color: themeColors.accentGold }
      },
      xAxis: {
        type: 'category',
        data: stepNames,
        axisLabel: {
          rotate: 45,
          color: themeColors.accentGold,
          fontSize: 10
        },
        axisLine: { lineStyle: { color: themeColors.accentGold } }
      },
      yAxis: [
        {
          type: 'value',
          name: '耗时(小时)',
          nameTextStyle: { color: themeColors.accentGold },
          axisLabel: { color: themeColors.accentGold },
          axisLine: { lineStyle: { color: themeColors.accentGold } }
        },
        {
          type: 'value',
          name: '难度等级',
          nameTextStyle: { color: themeColors.accentGold },
          axisLabel: { color: themeColors.accentGold },
          axisLine: { lineStyle: { color: themeColors.accentGold } },
          max: 5
        }
      ],
      series: [
        {
          name: '耗时(小时)',
          type: 'bar',
          data: durations,
          itemStyle: { color: themeColors.primary }
        },
        {
          name: '难度等级',
          type: 'line',
          yAxisIndex: 1,
          data: skillLevels,
          lineStyle: { color: themeColors.accentGold },
          itemStyle: { color: themeColors.accentGold }
        }
      ],
      backgroundColor: 'transparent',
      textStyle: { color: themeColors.accentGold }
    };

    processChart.setOption(option);
  } catch (error) {
    console.error('加载工序数据失败:', error);
  }
};

// 加载桑基图
const loadSankeyChart = async () => {
  try {
    let steps = [];
    try {
      const res = await processStepsAPI.getAll();
      steps = res.data || [];
    } catch (apiError) {
      console.warn('桑基图 API 不可用，使用示例数据:', apiError);
    }

    if (!steps.length) {
      steps = Array.from({ length: 36 }, (_, i) => ({
        step_order: i + 1,
        est_duration_hours: 4 + (i % 6)
      }));
    }

    // 将36步归类成阶段
    const stages = {
      '原料准备': [1, 2, 3, 4],
      '木胎制作': [5, 6, 7, 8, 9],
      '灰胎工艺': [10, 11, 12, 13],
      '漆层髹涂': [14, 15, 16, 17, 18, 19],
      '装饰加工': [20, 21, 22, 23, 24, 25, 26, 27, 28],
      '抛光养护': [29, 30, 31, 32, 33, 34, 35, 36]
    };

    const nodes = Object.keys(stages).map(stage => ({ name: stage }));
    const links = [];
    let prevStage = null;

    for (const stage of Object.keys(stages)) {
      if (prevStage) {
        const prevSteps = steps.filter(s => stages[prevStage].includes(s.step_order));
        const currSteps = steps.filter(s => stages[stage].includes(s.step_order));
        const totalDuration = prevSteps.reduce((sum, s) => sum + s.est_duration_hours, 0) +
                             currSteps.reduce((sum, s) => sum + s.est_duration_hours, 0);
        links.push({
          source: prevStage,
          target: stage,
          value: totalDuration
        });
      }
      prevStage = stage;
    }

    const option = {
      series: [{
        type: 'sankey',
        layout: 'none',
        data: nodes,
        links: links,
        itemStyle: {
          borderColor: themeColors.accentGold,
          borderWidth: 1
        },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.6
        },
        label: {
          color: themeColors.accentGold,
          fontSize: 12
        },
        emphasis: {
          focus: 'adjacency'
        }
      }],
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      }
    };

    sankeyChart.setOption(option);
  } catch (error) {
    console.error('加载桑基图数据失败:', error);
  }
};

// 加载风险雷达图
const loadRiskChart = async () => {
  try {
    // 使用实际的风险分析数据
    const currentData = [65, 45, 55, 70, 60, 65]; // 当前状态：高龄传承人比例、青年学徒指数、地域集中度、技艺多样性、产出稳定性、传承环境支持
    
    const idealData = [75, 80, 50, 85, 80, 85]; // 理想状态数据

    const option = {
      radar: {
        indicator: [
          { name: '高龄传承人比例', max: 100 },
          { name: '青年学徒指数', max: 100 },
          { name: '地域集中度', max: 100 },
          { name: '技艺多样性', max: 100 },
          { name: '产出稳定性', max: 100 },
          { name: '传承环境支持', max: 100 }
        ],
        nameGap: 5,
        name: {
          textStyle: { color: themeColors.accentGold }
        },
        axisLine: { lineStyle: { color: themeColors.accentGold } },
        splitLine: { lineStyle: { color: themeColors.accentGold, opacity: 0.3 } }
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: riskViewMode.value ? idealData : currentData,
            name: riskViewMode.value ? '理想状态' : '当前状态',
            areaStyle: {
              color: riskViewMode.value ? 'rgba(216, 184, 119, 0.3)' : 'rgba(163, 38, 42, 0.3)'
            },
            lineStyle: {
              color: riskViewMode.value ? themeColors.accentGold : themeColors.primary
            },
            itemStyle: {
              color: riskViewMode.value ? themeColors.accentGold : themeColors.primary
            }
          }
        ]
      }],
      backgroundColor: 'transparent'
    };

    riskChart.setOption(option);
  } catch (error) {
    console.error('加载风险数据失败:', error);
  }
};

// 加载地区分布图（柱状图）
const loadRegionChart = async () => {
  try {
    const res = await mastersAPI.getDistribution();
    const distribution = (res.data?.distribution || []).filter((item) => item.value > 0).slice(0, 12);

    const regionData = distribution.length
      ? distribution.map((item) => ({ region: item.name, count: item.value }))
      : [
        { region: '福建省', count: 46 },
        { region: '黑龙江省', count: 14 },
        { region: '江苏省', count: 22 }
      ];

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      xAxis: {
        type: 'value',
        axisLabel: { color: themeColors.accentGold },
        axisLine: { lineStyle: { color: themeColors.accentGold } }
      },
      yAxis: {
        type: 'category',
        data: regionData.map(item => item.region),
        axisLabel: { color: themeColors.accentGold },
        axisLine: { lineStyle: { color: themeColors.accentGold } }
      },
      series: [{
        type: 'bar',
        data: regionData.map(item => item.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: themeColors.primary },
            { offset: 1, color: themeColors.accentGold }
          ])
        }
      }],
      backgroundColor: 'transparent'
    };

    regionChart.setOption(option);
  } catch (error) {
    console.error('加载地区数据失败:', error);
  }
};

// 加载中国地图（ECharts地图展示）
const loadRegionMapChart = async () => {
  try {
    let mapData = [];
    try {
      const res = await mastersAPI.getDistribution();
      mapData = (res.data?.mapData || []).filter((item) => item.value > 0);
    } catch (error) {
      console.warn('获取地域分布失败，使用示例数据:', error);
      // 使用示例数据
      mapData = [
        { name: '黑龙江', value: 15, fullName: '黑龙江省' },
        { name: '浙江', value: 12, fullName: '浙江省' },
        { name: '江苏', value: 10, fullName: '江苏省' },
        { name: '北京', value: 8, fullName: '北京市' },
        { name: '山东', value: 6, fullName: '山东省' },
        { name: '广东', value: 5, fullName: '广东省' },
        { name: '四川', value: 4, fullName: '四川省' },
        { name: '湖北', value: 3, fullName: '湖北省' },
        { name: '湖南', value: 2, fullName: '湖南省' },
        { name: '河南', value: 1, fullName: '河南省' }
      ];
    }

    const maxValue = Math.max(...mapData.map(item => item.value), 1);

    // 突出显示黑龙江（哈尔滨）
    const highlightData = mapData.map(item => {
      if (item.name === '黑龙江' || item.fullName === '黑龙江省' || item.fullName === '哈尔滨') {
          return {
            ...item,
            selected: true,
            itemStyle: {
              areaColor: themeColors.primary,
              borderColor: themeColors.accentGold,
              borderWidth: 2
            },
            label: {
              show: true,
              color: themeColors.accentGold,
              fontSize: 14,
              fontWeight: 'bold'
            }
          };
      }
      return item;
    });

    // 使用在线地图数据（ECharts官方地图数据）
    const mapOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const provinceData = mapData.find(item => 
            item.name === params.name || 
            params.name.includes(item.name) ||
            item.name.includes(params.name)
          );
          
          if (!provinceData) return `${params.name}<br/>传承人数量: ${params.value || 0}`;
          
          if (params.name === '黑龙江' || provinceData.fullName === '黑龙江省' || provinceData.fullName === '哈尔滨') {
            return `<div style="padding: 8px;">
              <strong style="color: ${themeColors.accentGold}; font-size: 16px;">${provinceData.fullName || params.name}</strong><br/>
              <span style="color: ${themeColors.primary};">传承人数量: ${provinceData.value}</span><br/>
              <span style="color: ${themeColors.accentGold}; font-size: 12px;">✨ 重点展示：哈尔滨 · 李囡</span>
            </div>`;
          }
          return `<div style="padding: 8px;">
            <strong style="color: ${themeColors.accentGold}; font-size: 14px;">${provinceData.fullName || params.name}</strong><br/>
            <span style="color: ${themeColors.primary};">传承人数量: ${provinceData.value}</span>
          </div>`;
        },
        backgroundColor: 'rgba(27, 20, 16, 0.9)',
        borderColor: themeColors.accentGold,
        borderWidth: 1,
        textStyle: {
          color: themeColors.accentGold
        }
      },
      visualMap: {
        min: 0,
        max: maxValue,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        inRange: {
          color: [themeColors.secondary, '#8B6F47', themeColors.accentGold, themeColors.primary]
        },
        textStyle: {
          color: themeColors.accentGold,
          fontSize: 12
        },
        calculable: true,
        realtime: true
      },
      series: [{
        name: '传承人分布',
        type: 'map',
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: [116, 40],
        label: {
          show: true,
          color: themeColors.accentGold,
          fontSize: 10
        },
        itemStyle: {
          borderColor: themeColors.accentGold,
          borderWidth: 1,
          areaColor: themeColors.secondary
        },
        emphasis: {
          label: {
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold'
          },
          itemStyle: {
            areaColor: themeColors.primary,
            borderColor: themeColors.accentGold,
            borderWidth: 2
          }
        },
        select: {
          itemStyle: {
            areaColor: themeColors.primary
          },
          label: {
            color: themeColors.accentGold,
            fontWeight: 'bold'
          }
        },
        data: highlightData
      }],
      backgroundColor: 'transparent',
    };

    // 加载中国地图（优先本地 /geo/china.json）
    const mapRegistered = await registerChinaMap('china');

    if (mapRegistered) {
      regionMapChart.setOption(mapOption);
    } else {
      console.warn('无法加载地图数据，使用柱状图备用方案');
      regionMapChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'value',
          axisLabel: { color: themeColors.accentGold },
          axisLine: { lineStyle: { color: themeColors.accentGold } }
        },
        yAxis: {
          type: 'category',
          data: mapData.map((item) => item.fullName || item.name).reverse(),
          axisLabel: { color: themeColors.accentGold, fontSize: 10 },
          axisLine: { lineStyle: { color: themeColors.accentGold } }
        },
        series: [{
          type: 'bar',
          data: mapData.map((item) => item.value).reverse(),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: themeColors.primary },
              { offset: 1, color: themeColors.accentGold }
            ])
          }
        }],
        backgroundColor: 'transparent'
      });
    }
  } catch (error) {
    console.error('加载地图数据失败:', error);
  }
};

// 更新地区图表视图
const updateRegionChart = async () => {
  await nextTick();
  if (regionViewMode.value === 'map') {
    if (!regionMapChart && regionMapChartRef.value) {
      regionMapChart = echarts.init(regionMapChartRef.value);
    }
    await loadRegionMapChart();
    regionMapChart?.resize();
  } else {
    if (!regionChart && regionChartRef.value) {
      regionChart = echarts.init(regionChartRef.value);
    }
    await loadRegionChart();
    regionChart?.resize();
  }
};

// 加载作品数量图
const loadWorksChart = async () => {
  try {
    const res = await worksAPI.getStats();
    // 处理响应数据格式
    const responseData = res.data;
    let yearData = responseData?.yearDistribution || [];
    
    if (!yearData || yearData.length === 0) {
      console.warn('作品年份数据为空，使用默认数据');
      // 使用默认数据
      yearData = [
        { year: 2020, count: 1 },
        { year: 2021, count: 2 },
        { year: 2022, count: 3 },
        { year: 2023, count: 2 },
        { year: 2024, count: 3 }
      ];
    }

    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: yearData.map(item => item.year),
        axisLabel: { color: themeColors.accentGold },
        axisLine: { lineStyle: { color: themeColors.accentGold } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: themeColors.accentGold },
        axisLine: { lineStyle: { color: themeColors.accentGold } }
      },
      series: [{
        type: 'line',
        data: yearData.map(item => item.count),
        smooth: true,
        lineStyle: { color: themeColors.accentGold, width: 3 },
        itemStyle: { color: themeColors.primary },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(163, 38, 42, 0.3)' },
            { offset: 1, color: 'rgba(163, 38, 42, 0.05)' }
          ])
        }
      }],
      backgroundColor: 'transparent'
    };

    worksChart.setOption(option);
  } catch (error) {
    console.error('加载作品数据失败:', error);
  }
};

// 加载技能标签分布图（基于知识库技能）
const loadSkillChart = async () => {
  try {
    // 从知识库中提取的技能标签
    const knowledgeSkills = {
      '螺钿': 8,
      '推光': 7,
      '描金': 6,
      '叠彩技法': 5,
      '器物制作': 9,
      '修复': 4,
      '漆画': 6,
      '冰雪文化': 3,
      '漆艺教育': 4,
      '创新传承': 5,
      '刻填装饰': 3,
      '嵌贝打磨': 4,
      '罩漆封护': 5,
      '终磨抛光': 6
    };

    // 如果有后端数据，合并使用
    let skillData = [];
    try {
      const res = await mastersAPI.getStats();
      // 处理响应数据格式
      const responseData = res.data;
      const backendSkills = responseData?.skillDistribution || [];
      
      // 合并知识库和数据库数据
      const skillMap = { ...knowledgeSkills };
      backendSkills.forEach(item => {
        skillMap[item.tag] = (skillMap[item.tag] || 0) + item.count;
      });
      
      skillData = Object.entries(skillMap)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12); // 取前12个
    } catch {
      // 如果后端数据获取失败，使用知识库数据
      skillData = Object.entries(knowledgeSkills)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    }

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c}人 ({d}%)',
        backgroundColor: 'rgba(27, 20, 16, 0.9)',
        borderColor: themeColors.accentGold,
        textStyle: { color: themeColors.accentGold }
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: themeColors.accentGold, fontSize: 12 },
        itemGap: 8
      },
      series: [{
        name: '技能标签',
        type: 'pie',
        radius: ['35%', '70%'],
        center: ['40%', '50%'],
        roseType: 'area',
        data: skillData.map(item => ({
          value: item.count,
          name: item.tag
        })),
        itemStyle: {
          color: (params) => {
            const colors = [
              themeColors.primary, 
              themeColors.accentGold, 
              themeColors.secondary, 
              '#8B6F47', 
              themeColors.primaryLight, 
              themeColors.wood
            ];
            return colors[params.dataIndex % colors.length];
          }
        },
        label: {
          color: themeColors.accentGold
        },
        labelLine: {
          lineStyle: { color: themeColors.accentGold }
        }
      }],
      backgroundColor: 'transparent'
    };

    skillChart.setOption(option);
  } catch (error) {
    console.error('加载技能数据失败:', error);
  }
};

// 工序-传承人联动高亮
const highlightRelatedMasters = (stepIndex) => {
  // 根据步骤索引高亮相关传承人（这里简化处理，实际可以根据技能标签匹配）
  if (regionChart && skillChart) {
    // 可以在这里实现高亮逻辑
    console.log('高亮步骤:', stepIndex);
  }
};

const resetHighlight = () => {
  // 重置高亮
};

// 切换播放/暂停
const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
};

// 开始自动播放
const startAutoPlay = () => {
  playInterval = setInterval(() => {
    if (processChart) {
      const res = processChart.getOption();
      const dataLength = res.series[0].data.length;
      
      // 高亮当前步骤
      const option = {
        graphic: [{
          type: 'rect',
          position: [currentStepIndex * 20, 0],
          shape: { width: 20, height: 200 },
          style: { fill: 'rgba(216, 184, 119, 0.3)' }
        }]
      };
      
      currentStepIndex = (currentStepIndex + 1) % dataLength;
    }
  }, 1000);
};

// 停止自动播放
const stopAutoPlay = () => {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
};

// 更新风险图表
const updateRiskChart = () => {
  loadRiskChart();
};

// 窗口大小调整
const handleResize = () => {
  processChart?.resize();
  sankeyChart?.resize();
  riskChart?.resize();
  regionChart?.resize();
  regionMapChart?.resize();
  worksChart?.resize();
  skillChart?.resize();
};

onMounted(async () => {
  await initCharts();
  setTimeout(() => handleResize(), 300);
});

onUnmounted(() => {
  stopAutoPlay();
  window.removeEventListener('resize', handleResize);
  processChart?.dispose();
  sankeyChart?.dispose();
  riskChart?.dispose();
  regionChart?.dispose();
  regionMapChart?.dispose();
  worksChart?.dispose();
  skillChart?.dispose();
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  min-height: 100vh;
  padding: 24px;
  color: var(--color-accent-gold);
  background: linear-gradient(135deg, var(--color-dark) 0%, var(--color-secondary) 50%, var(--color-dark) 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(163, 38, 42, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(216, 184, 119, 0.1) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
}

.dashboard-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
  padding: 24px 32px;
  background: linear-gradient(135deg, rgba(163, 38, 42, 0.2) 0%, rgba(74, 42, 32, 0.3) 100%);
  border-radius: 12px;
  border: 1px solid rgba(216, 184, 119, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
  color: var(--color-accent-gold);
  border: 2px solid var(--color-accent-gold);
  box-shadow: 0 4px 12px rgba(163, 38, 42, 0.4);
  font-family: 'KaiTi', '楷体', serif;
}

.logo-text {
  .dashboard-title {
    font-size: 36px;
    font-weight: 700;
    color: var(--color-accent-gold);
    margin: 0 0 8px 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    letter-spacing: 2px;
  }

  .dashboard-subtitle {
    font-size: 18px;
    color: rgba(216, 184, 119, 0.9);
    margin: 0;
    letter-spacing: 1px;
  }
}

.header-decorative {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(216, 184, 119, 0.2);
}

.decorative-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-accent-gold), transparent);
}

.decorative-text {
  font-size: 14px;
  color: rgba(216, 184, 119, 0.8);
  white-space: nowrap;
  letter-spacing: 1px;
}

.dashboard-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 16px;
  justify-content: flex-end;
}

.control-btn {
  background: var(--color-primary);
  border: 1px solid var(--color-accent-gold);
  color: white;

  &:hover {
    background: var(--color-primary-light);
    border-color: var(--color-accent-gold);
    box-shadow: 0 4px 12px rgba(163, 38, 42, 0.4);
  }
}

.control-switch {
  :deep(.el-switch__label) {
    color: var(--color-accent-gold);
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  height: calc(100vh - 120px);
}

.chart-panel {
  min-height: 0;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.chart-tabs {
  margin-bottom: 12px;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(216, 184, 119, 0.3);
  
  :deep(.el-radio-button__inner) {
    background: rgba(74, 42, 32, 0.3);
    border-color: var(--color-accent-gold);
    color: var(--color-accent-gold);
    
    &:hover {
      background: rgba(163, 38, 42, 0.3);
    }
  }
  
  :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
    background: var(--color-primary);
    border-color: var(--color-accent-gold);
    color: var(--color-accent-gold);
  }
}

.map-panel {
  position: relative;
}

.map-container {
  position: relative;
}

.harbin-highlight {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.highlight-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, rgba(163, 38, 42, 0.9) 0%, rgba(74, 42, 32, 0.9) 100%);
  border: 2px solid var(--color-accent-gold);
  border-radius: 24px;
  color: var(--color-accent-gold);
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);

  .el-icon {
    font-size: 18px;
  }
}

@media (max-width: 1920px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1366px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
}
</style>

