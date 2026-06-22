<template>
  <div class="home-page">
    <!-- Video Hero Banner -->
    <section class="hero-banner">
      <video class="hero-video" autoplay muted loop playsinline>
        <source src="/videos/home-video.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-main">
          <h1 class="hero-title">国漆之光</h1>
          <h2 class="hero-subtitle">千年髹涂技艺的温度</h2>
          <p class="hero-description">以漆为肌，以木为骨，三十六道髹涂，承一器之美</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" class="btn-explore" @click="$router.push('/heritage')">
              <el-icon><VideoPlay /></el-icon>
              浏览髹涂工艺
            </el-button>
            <el-button size="large" class="btn-masters" @click="$router.push('/masters/linan')">
              <el-icon><User /></el-icon>
              认识李囡传承人
            </el-button>
          </div>
        </div>
        <div class="hero-featured">
          <div class="featured-item">
            <div class="featured-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="featured-text">
              <h3>省级传承人</h3>
              <p>李囡 · 哈尔滨</p>
            </div>
          </div>
          <div class="featured-item">
            <div class="featured-icon">
              <el-icon><MagicStick /></el-icon>
            </div>
            <div class="featured-text">
              <h3>创新技法</h3>
              <p>"叠彩"漆艺</p>
            </div>
          </div>
          <div class="featured-item">
            <div class="featured-icon">
              <el-icon><ColdDrink /></el-icon>
            </div>
            <div class="featured-text">
              <h3>冰雪文化</h3>
              <p>《尔滨的雪》</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <MainContainer>
      <!-- 传承人专题区 -->
      <section class="section featured-master-section">
        <div class="section-header">
          <div class="section-label">Featured Master</div>
          <h2 class="section-title-main">传承人专题</h2>
          <p class="section-subtitle">省级非物质文化遗产传承人</p>
        </div>
        
        <div class="featured-master-card">
          <div class="master-visual">
            <div class="master-image-wrapper">
              <img :src="linanAvatarUrl" alt="李囡" class="master-image" />
              <div class="master-image-overlay"></div>
              <div class="master-badge-floating">
                <el-icon><Trophy /></el-icon>
                <span>省级传承人</span>
              </div>
            </div>
            <div class="master-stats">
              <div class="stat-item">
                <div class="stat-number">10+</div>
                <div class="stat-label">从业年限</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-number">36</div>
                <div class="stat-label">道工序</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-number">叠彩</div>
                <div class="stat-label">创新技法</div>
              </div>
            </div>
          </div>

          <div class="master-content">
            <div class="master-header">
              <h2 class="master-name">李囡</h2>
              <p class="master-title">国漆髹涂技艺传承人 · 哈尔滨</p>
            </div>
            
            <div class="master-bio">
              <p class="bio-intro">
                李囡，黑龙江省哈尔滨市人，<strong>省级非物质文化遗产"国漆髹涂技艺"代表性传承人</strong>，二级漆艺师。
              </p>
              <p class="bio-text">
                2019年回到家乡哈尔滨，决心在冰城播撒传统漆艺的种子。他自主开创"叠彩"技法（国家专利认证），
                为2025年亚冬会创作《尔滨的雪》官方礼物，成功将古老漆艺与哈尔滨冰雪文化融合。
              </p>
              <p class="bio-text">
                他攻克"漆艺北移"难题，研发适合东北气候的专用大漆，在哈尔滨现代应用职业学校建立传统工艺传习馆，
                致力于培养年轻传承人，让千年漆艺在东北焕发新生。
              </p>
            </div>

            <div class="master-actions">
              <el-button type="primary" size="large" @click="$router.push('/masters/linan')" class="btn-master-detail">
                <el-icon><User /></el-icon>
                了解传承人故事
              </el-button>
              <el-button size="large" @click="$router.push('/masters/linan')" class="btn-master-works">
                <el-icon><Picture /></el-icon>
                查看作品集
              </el-button>
            </div>
          </div>
        </div>

        <div class="master-works-section">
          <h3 class="works-title">代表作品</h3>
          <div class="master-works-grid">
            <div class="work-card" v-for="work in featuredWorks" :key="work.id">
              <div class="work-image-container">
                <img :src="resolveMediaUrl(work.image)" :alt="work.title" class="work-image" />
                <div class="work-overlay-new">
                  <div class="work-info">
                    <h4 class="work-title">{{ work.title }}</h4>
                    <span class="work-year">{{ work.year }}</span>
                  </div>
                  <div class="work-action">
                    <el-icon><ZoomIn /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 精选项目区 -->
      <section class="section animate-slide-up delay-200">
        <h2 class="section-title">国漆髹涂技艺</h2>
        <div class="heritage-grid" v-loading="loading">
          <HeritageCard
            v-for="item in heritageItems"
            :key="item.id"
            :id="item.id"
            :title="item.name"
            :category="item.category"
            :region="item.region"
            :level="item.level"
            :image-url="item.image_url"
            :intro="item.intro"
            @click="handleHeritageClick"
          />
        </div>
      </section>

      <!-- 传承人地域分布入口 -->
      <section class="section distribution-section">
        <div class="distribution-card" @click="$router.push('/masters/distribution')">
          <div class="distribution-icon">
            <el-icon><MapLocation /></el-icon>
          </div>
          <div class="distribution-content">
            <h2 class="distribution-title">传承人全国地域分布</h2>
            <p class="distribution-desc">查看国漆髹涂技艺传承人在全国各地区的分布情况，了解传承人地域分布统计</p>
            <div class="distribution-stats">
              <span class="stat-badge" v-if="distributionSummary.totalMasters">全国 {{ distributionSummary.totalMasters }} 位传承人</span>
              <span class="stat-badge" v-if="distributionSummary.provinceCount">覆盖 {{ distributionSummary.provinceCount }} 个省份</span>
              <span class="stat-badge" v-if="distributionSummary.topProvince">最多：{{ distributionSummary.topProvince.name }}</span>
            </div>
          </div>
          <div class="distribution-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </section>

      <!-- 匠人推荐区 -->
      <section class="section">
        <h2 class="section-title">传承人风采</h2>
        <div class="masters-grid" v-loading="loadingMasters">
          <MasterCard
            v-for="master in masters"
            :key="master.id"
            :id="master.id"
            :name="master.name"
            :generation="master.generation"
            :region="master.region"
            :bio="master.bio"
            :avatar-url="master.avatar_url"
            :skill-tags="master.skill_tags"
            @click="handleMasterClick"
          />
        </div>
      </section>

      <!-- 工艺路径预览区 -->
      <section class="section" v-if="processSteps.length > 0">
        <h2 class="section-title">工艺路径预览</h2>
        <ProcessTimeline :steps="processSteps" :max-display="6" />
      </section>
    </MainContainer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { VideoPlay, User, Trophy, MagicStick, ColdDrink, MapLocation, ArrowRight, Picture, ZoomIn } from '@element-plus/icons-vue';
import { heritageAPI } from '../api/heritage';
import { mastersAPI } from '../api/masters';
import { processStepsAPI } from '../api/processSteps';
import MainContainer from '../components/MainContainer.vue';
import HeritageCard from '../components/HeritageCard.vue';
import MasterCard from '../components/MasterCard.vue';
import ProcessTimeline from '../components/ProcessTimeline.vue';
import { resolveMediaUrl } from '../utils/media';

const router = useRouter();

const loading = ref(false);
const loadingMasters = ref(false);
const heritageItems = ref([]);
const masters = ref([]);
const processSteps = ref([]);
const linanMaster = ref(null);
const LINAN_AVATAR = '/6.jpg';
const linanAvatarUrl = computed(() => LINAN_AVATAR);
const distributionSummary = ref({
  totalMasters: 0,
  provinceCount: 0,
  topProvince: null
});

const featuredWorks = ref([
  {
    id: 1,
    title: '《尔滨的雪》',
    year: '2024',
    image: '/Picture/0.webp'
  },
  {
    id: 2,
    title: '青铜盾牌复原',
    year: '2023',
    image: '/Picture/2.webp'
  },
  {
    id: 3,
    title: '千层髹涂冰雕主题漆盘',
    year: '2024',
    image: '/Picture/1.webp' // 使用现有图片作为占位
  }
]);

const fetchHeritage = async () => {
  loading.value = true;
  try {
    const res = await heritageAPI.getAll();
    heritageItems.value = res.data.slice(0, 3);
  } catch (error) {
    console.error('获取非遗项目失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchMasters = async () => {
  loadingMasters.value = true;
  try {
    const res = await mastersAPI.getAll();
    masters.value = res.data.slice(0, 6);
    linanMaster.value = res.data.find((m) => m.name === '李囡') || null;
  } catch (error) {
    console.error('获取传承人失败:', error);
  } finally {
    loadingMasters.value = false;
  }
};

const fetchProcessSteps = async () => {
  try {
    const res = await processStepsAPI.getAll();
    processSteps.value = res.data;
  } catch (error) {
    console.error('获取工序失败:', error);
  }
};

const handleHeritageClick = (id) => {
  router.push(`/heritage/${id}`);
};

const handleMasterClick = (id) => {
  // 可以跳转到传承人详情页或显示详情弹窗
  console.log('查看传承人:', id);
};

const fetchDistributionSummary = async () => {
  try {
    const res = await mastersAPI.getDistribution();
    if (res.data?.summary) {
      distributionSummary.value = res.data.summary;
    }
  } catch (error) {
    console.error('获取地域分布摘要失败:', error);
  }
};

onMounted(() => {
  fetchHeritage();
  fetchMasters();
  fetchProcessSteps();
  fetchDistributionSummary();
});
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
}

.hero-banner {
  position: relative;
  height: 100vh;
  min-height: 600px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(74, 42, 32, 0.7) 0%,
    rgba(163, 38, 42, 0.8) 50%,
    rgba(74, 42, 32, 0.7) 100%
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;
  text-align: center;
}

.hero-main {
  animation: fadeInUp 1.2s ease-out;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 700;
  color: white;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
  font-family: 'KaiTi', '楷体', serif;
}

.hero-subtitle {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  color: var(--color-accent-gold);
  margin: 0 0 20px 0;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
  font-weight: 300;
  letter-spacing: 1px;
}

.hero-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 40px 0;
  max-width: 600px;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-explore, .btn-masters {
  background: rgba(216, 184, 119, 0.9);
  color: var(--color-secondary);
  border: 2px solid var(--color-accent-gold);
  padding: 16px 32px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: var(--color-accent-gold);
    color: var(--color-secondary);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(216, 184, 119, 0.4);
  }

  .el-icon {
    margin-right: 8px;
  }
}

.btn-masters {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
}

.hero-featured {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  max-width: 800px;
  width: 100%;
  animation: fadeInUp 1.5s ease-out 0.3s both;
}

.featured-item {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(216, 184, 119, 0.3);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--color-accent-gold);
  }
}

.featured-icon {
  width: 50px;
  height: 50px;
  background: var(--color-accent-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary);
  font-size: 20px;
  flex-shrink: 0;
}

.featured-text {
  text-align: left;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    margin: 0 0 4px 0;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }

  p {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section {
  margin-bottom: 60px;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 30px;
  text-align: center;
  position: relative;
  padding-bottom: 15px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: var(--color-accent-gold);
  }
}

.heritage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.masters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

// 传承人专题样式 - 全新设计
.featured-master-section {
  margin-bottom: 100px;
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
  
  .section-label {
    display: inline-block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-accent-gold);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 12px;
    padding: 6px 16px;
    background: rgba(216, 184, 119, 0.1);
    border-radius: 20px;
  }

  .section-title-main {
    font-size: 3rem;
    font-weight: 700;
    color: var(--color-primary);
    margin: 0 0 12px 0;
    font-family: 'KaiTi', '楷体', serif;
    
    @media (max-width: 768px) {
      font-size: 2.2rem;
    }
  }

  .section-subtitle {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin: 0;
  }
}

.featured-master-card {
  background: var(--color-surface);
  border-radius: 32px;
  padding: 60px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(216, 184, 119, 0.2);
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 60px;
  margin-bottom: 60px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent-gold) 50%, var(--color-primary) 100%);
  }

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 40px 30px;
  }

  @media (max-width: 768px) {
    padding: 30px 20px;
    border-radius: 24px;
  }
}

.master-visual {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.master-image-wrapper {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  aspect-ratio: 1;
  box-shadow: 0 20px 60px rgba(163, 38, 42, 0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-8px);
  }

  .master-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .master-image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
  }
}

.master-badge-floating {
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--color-accent-gold);
  color: var(--color-secondary);
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(216, 184, 119, 0.4);
  z-index: 2;
  backdrop-filter: blur(10px);
}

.master-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: linear-gradient(135deg, rgba(163, 38, 42, 0.05) 0%, rgba(216, 184, 119, 0.05) 100%);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(216, 184, 119, 0.2);

  .stat-item {
    text-align: center;
    flex: 1;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 6px;
    font-family: 'KaiTi', '楷体', serif;
  }

  .stat-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background: rgba(216, 184, 119, 0.3);
  }
}

.master-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.master-header {
  margin-bottom: 30px;

  .master-name {
    font-size: 3.5rem;
    font-weight: 700;
    color: var(--color-primary);
    margin: 0 0 12px 0;
    font-family: 'KaiTi', '楷体', serif;
    line-height: 1.1;

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }

  .master-title {
    font-size: 1.3rem;
    color: var(--color-secondary);
    margin: 0;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.master-bio {
  flex: 1;
  margin-bottom: 30px;

  .bio-intro {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--text-main);
    margin: 0 0 16px 0;
    font-weight: 500;

    strong {
      color: var(--color-primary);
      font-weight: 700;
    }
  }

  .bio-text {
    font-size: 1rem;
    line-height: 1.8;
    color: var(--text-main);
    margin: 0 0 16px 0;
    text-align: justify;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.master-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.btn-master-detail {
  background: var(--color-primary);
  color: white;
  border: 2px solid var(--color-primary);
  border-radius: 30px;
  padding: 14px 32px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 180px;

  &:hover {
    background: var(--color-secondary);
    border-color: var(--color-secondary);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(163, 38, 42, 0.4);
  }

  .el-icon {
    margin-right: 8px;
  }
}

.btn-master-works {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: 30px;
  padding: 14px 32px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 180px;

  &:hover {
    background: var(--color-primary);
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(163, 38, 42, 0.4);
  }

  .el-icon {
    margin-right: 8px;
  }
}

.master-works-section {
  margin-top: 60px;

  .works-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-primary);
    margin: 0 0 30px 0;
    text-align: center;
    font-family: 'KaiTi', '楷体', serif;
    position: relative;
    padding-bottom: 20px;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: var(--color-accent-gold);
    }
  }
}

.master-works-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.work-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 4/3;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  background: var(--color-surface);

  &:hover {
    transform: translateY(-12px);
    box-shadow: 0 20px 60px rgba(163, 38, 42, 0.25);

    .work-overlay-new {
      opacity: 1;
    }

    .work-image {
      transform: scale(1.1);
    }
  }
}

.work-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.work-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.work-overlay-new {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(163, 38, 42, 0.9) 0%,
    rgba(74, 42, 32, 0.9) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  opacity: 0;
  transition: all 0.4s ease;
  backdrop-filter: blur(2px);
}

.work-info {
  .work-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: white;
    margin: 0 0 8px 0;
    font-family: 'KaiTi', '楷体', serif;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .work-year {
    display: inline-block;
    font-size: 0.9rem;
    color: var(--color-accent-gold);
    background: rgba(216, 184, 119, 0.2);
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: 600;
  }
}

.work-action {
  align-self: flex-end;
  width: 48px;
  height: 48px;
  background: var(--color-accent-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary);
  font-size: 20px;
  transition: all 0.3s ease;

  .work-card:hover & {
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 4px 16px rgba(216, 184, 119, 0.5);
  }
}

// 传承人地域分布入口卡片
.distribution-section {
  margin-bottom: 60px;
}

.distribution-card {
  background: linear-gradient(135deg, rgba(163, 38, 42, 0.1) 0%, rgba(216, 184, 119, 0.1) 100%);
  border: 2px solid var(--color-accent-gold);
  border-radius: 20px;
  padding: 40px;
  display: flex;
  align-items: center;
  gap: 30px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(216, 184, 119, 0.2), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 20px 60px var(--color-shadow),
      0 8px 20px var(--color-shadow-gold),
      0 0 30px rgba(216, 184, 119, 0.3);
    border-color: var(--color-primary);

    &::before {
      left: 100%;
    }

    .distribution-arrow {
      transform: translateX(10px);
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
  }
}

.distribution-icon {
  width: 80px;
  height: 80px;
  background: var(--gradient-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary);
  font-size: 40px;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(216, 184, 119, 0.4);
  transition: all 0.3s ease;

  .distribution-card:hover & {
    transform: rotate(360deg) scale(1.1);
    box-shadow: 0 12px 32px rgba(216, 184, 119, 0.6);
  }
}

.distribution-content {
  flex: 1;
}

.distribution-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 12px 0;
  font-family: 'KaiTi', '楷体', serif;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
}

.distribution-desc {
  font-size: 1.1rem;
  color: var(--text-main);
  line-height: 1.6;
  margin: 0 0 20px 0;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

.distribution-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-badge {
  background: var(--color-accent-gold);
  color: var(--color-secondary);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(216, 184, 119, 0.3);
  transition: all 0.3s ease;

  .distribution-card:hover & {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(216, 184, 119, 0.4);
  }
}

.distribution-arrow {
  width: 50px;
  height: 50px;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(163, 38, 42, 0.3);

  .distribution-card:hover & {
    background: var(--color-secondary);
    box-shadow: 0 6px 20px rgba(74, 42, 32, 0.4);
  }
}
</style>


