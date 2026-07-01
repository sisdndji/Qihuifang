<template>
  <MainContainer>
    <div class="master-linan-page">
      <!-- Hero -->
      <section class="hero-section">
        <div class="hero-bg">
          <div class="hero-pattern"></div>
          <div class="hero-orb hero-orb--1"></div>
          <div class="hero-orb hero-orb--2"></div>
        </div>

        <div class="hero-inner">
          <div class="hero-portrait">
            <div class="portrait-ring">
              <el-avatar :size="220" :src="avatarUrl" fit="cover">
                {{ masterInfo.name?.charAt(0) || '李' }}
              </el-avatar>
            </div>
            <span class="hero-badge">
              <el-icon><Trophy /></el-icon>
              省级非遗传承人
            </span>
          </div>

          <div class="hero-info">
            <p class="hero-eyebrow">国漆髹涂技艺 · 黑龙江代表</p>
            <h1 class="hero-name">{{ masterInfo.name }}</h1>
            <p class="hero-role">{{ masterInfo.generation || '省级非物质文化遗产代表性传承人' }}</p>
            <p class="hero-location">
              <el-icon><Location /></el-icon>
              {{ masterInfo.region || '哈尔滨' }}
            </p>

            <div class="hero-metrics">
              <div v-for="m in metrics" :key="m.label" class="metric-item">
                <strong>{{ m.value }}</strong>
                <span>{{ m.label }}</span>
              </div>
            </div>

            <div class="hero-actions">
              <el-button type="primary" size="large" @click="$router.push('/master/linan/works')">
                浏览代表作品
              </el-button>
              <el-button size="large" plain class="hero-btn-ghost" @click="scrollTo('timeline')">
                了解传承之路
              </el-button>
            </div>
          </div>
        </div>

        <blockquote class="hero-quote">
          「择一事，终一生。在漆艺这条路上，我愿用一辈子去钻研，去传承。」
        </blockquote>
      </section>

      <!-- 传承时间线 -->
      <section id="timeline" class="section timeline-section card-lacquer">
        <header class="section-head">
          <span class="section-label">Heritage Journey</span>
          <h2 class="section-title">传承之路</h2>
        </header>
        <div class="timeline">
          <div v-for="(item, index) in timeline" :key="item.year" class="timeline-item">
            <div class="timeline-dot" :class="{ 'timeline-dot--highlight': item.highlight }">
              <span>{{ item.year }}</span>
            </div>
            <div class="timeline-body">
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
            </div>
            <div v-if="index < timeline.length - 1" class="timeline-line"></div>
          </div>
        </div>
      </section>

      <!-- 简介 + 技艺 -->
      <div class="dual-grid">
        <section class="section intro-section card-lacquer">
          <header class="section-head">
            <span class="section-label">Biography</span>
            <h2 class="section-title">传承人简介</h2>
          </header>
          <div class="bio-text">
            <p v-for="(para, i) in bioParagraphs" :key="i">{{ para }}</p>
          </div>
        </section>

        <section class="section skills-section card-lacquer">
          <header class="section-head">
            <span class="section-label">Craftsmanship</span>
            <h2 class="section-title">技艺特色</h2>
          </header>
          <div class="skills-cloud">
            <span v-for="tag in skillTags" :key="tag" class="skill-tag">{{ tag }}</span>
          </div>
          <ul class="skill-highlights">
            <li v-for="item in skillHighlights" :key="item.title">
              <el-icon><Medal /></el-icon>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.desc }}</p>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <!-- 代表作品 -->
      <section class="section works-section">
        <header class="section-head section-head--center">
          <span class="section-label">Masterpieces</span>
          <h2 class="section-title">代表作品</h2>
          <p class="section-desc">将北方冰雪文化融入千年髹涂技艺</p>
        </header>

        <div v-loading="worksLoading" class="works-grid">
          <article
            v-for="work in featuredWorks"
            :key="work.id || work.title"
            class="work-card card-lacquer"
            @click="$router.push('/master/linan/works')"
          >
            <div class="work-card__img">
              <img :src="resolveMediaUrl(work.image_url) || defaultWorkImage" :alt="work.title" />
            </div>
            <div class="work-card__body">
              <h3>{{ work.title }}</h3>
              <div class="work-card__meta">
                <el-tag size="small" type="warning">{{ work.style || '漆艺作品' }}</el-tag>
                <span>{{ work.year }}年</span>
              </div>
              <p>{{ work.description || '暂无描述' }}</p>
            </div>
          </article>
        </div>

        <div v-if="!worksLoading && !featuredWorks.length" class="works-empty">
          <p>暂无作品数据，请稍后查看</p>
        </div>
      </section>

      <!-- 特别故事 -->
      <section class="section stories-section">
        <header class="section-head section-head--center">
          <span class="section-label">Stories</span>
          <h2 class="section-title">特别故事</h2>
        </header>
        <div class="stories-grid">
          <article v-for="story in stories" :key="story.title" class="story-card card-lacquer">
            <div class="story-card__icon" :style="{ background: story.color }">
              <el-icon><component :is="story.icon" /></el-icon>
            </div>
            <h3>{{ story.title }}</h3>
            <p>{{ story.desc }}</p>
          </article>
        </div>
      </section>

      <!-- 荣誉 -->
      <section class="section honors-section card-lacquer">
        <header class="section-head">
          <span class="section-label">Honors</span>
          <h2 class="section-title">荣誉与成就</h2>
        </header>
        <div class="honors-grid">
          <div v-for="honor in honors" :key="honor" class="honor-item">
            <el-icon><Trophy /></el-icon>
            <span>{{ honor }}</span>
          </div>
        </div>
      </section>
    </div>
  </MainContainer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { mastersAPI } from '../api/masters';
import { worksAPI } from '../api/works';
import {
  Location, Trophy, Medal, MagicStick, ColdDrink, Star, Collection
} from '@element-plus/icons-vue';
import MainContainer from '../components/MainContainer.vue';
import { resolveMediaUrl, MASTER_AVATAR_URL } from '../utils/media';

const masterInfo = ref({
  name: '李囡',
  generation: '省级非遗传承人',
  region: '哈尔滨',
  bio: '',
  avatar_url: '',
  skill_tags: '',
  representative_works: ''
});

const featuredWorks = ref([]);
const worksLoading = ref(false);

const defaultWorkImage =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRDdDMEE1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM0QjQ2M0YiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpKflrabljLc8L3RleHQ+PC9zdmc+';

const avatarUrl = computed(() => resolveMediaUrl(masterInfo.value?.avatar_url) || MASTER_AVATAR_URL);

const skillTags = computed(() => {
  const tags = masterInfo.value.skill_tags;
  if (!tags) return ['叠彩技法', '冰雪文化', '漆艺教育', '创新传承', '北方漆艺'];
  return tags.split(',').map((t) => t.trim()).filter(Boolean);
});

const bioParagraphs = computed(() => {
  const bio = masterInfo.value.bio;
  if (!bio) {
    return [
      '李囡，黑龙江省哈尔滨市人，省级非物质文化遗产「国漆髹涂技艺」代表性传承人，二级漆艺师，中国工艺美术协会会员。',
      '2019年回到家乡哈尔滨，在冰城播撒传统漆艺的种子。他自主开创「叠彩」技法，将大漆工艺拓展到更多材质，让古老工艺在东北焕发新生。'
    ];
  }
  return bio.split('。').map((s) => s.trim()).filter(Boolean).map((s) => `${s}。`);
});

const metrics = [
  { value: '10+', label: '从业年限' },
  { value: '36', label: '道工序' },
  { value: '叠彩', label: '创新技法' }
];

const timeline = [
  { year: '2014', title: '拜师学艺', desc: '赴福建拜国漆艺术名家周榕清教授为师，系统学习国漆髹涂技艺。', highlight: false },
  { year: '2017', title: '百花杯金奖', desc: '获「百花杯」中国工艺美术精品奖金奖，技艺获国家级认可。', highlight: false },
  { year: '2019', title: '回乡传承', desc: '回到家乡哈尔滨，参加福州脱胎漆器髹饰技艺研修班，决心在冰城扎根。', highlight: true },
  { year: '2024', title: '《尔滨的雪》', desc: '为亚冬会创作官方礼物，将冰雪文化与漆艺完美融合。', highlight: true },
  { year: '至今', title: '漆艺北移', desc: '攻克北方气候难题，建立传习馆，培养年轻传承人。', highlight: false }
];

const skillHighlights = [
  { title: '叠彩漆艺', desc: '国家专利认证技法，不需胎骨支撑，漆层堆叠成型。' },
  { title: '漆艺北移', desc: '改良大漆配方，攻克黑龙江干燥气候下的髹涂难题。' },
  { title: '教育传承', desc: '在哈尔滨现代应用职业学校建立传统工艺传习馆。' }
];

const stories = [
  {
    icon: ColdDrink,
    color: 'linear-gradient(135deg, #4A90D9, #7EC8E3)',
    title: '《尔滨的雪》',
    desc: '亚冬会官方礼物。以天然贝壳表现冰的晶莹，用髹涂技法绘制雪花，传递冰城冬日神韵。'
  },
  {
    icon: MagicStick,
    color: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-gold))',
    title: '叠彩漆艺技法',
    desc: '最厚作品叠涂 200 余层，截面呈现彩虹渐变纹理，开创漆艺新方向。'
  },
  {
    icon: Collection,
    color: 'linear-gradient(135deg, #8B6F47, #C4A55F)',
    title: '青铜盾牌复原',
    desc: '首创「钢线麻布法」复原历史器物，远看如青铜、触手温润、手持轻巧。'
  },
  {
    icon: Star,
    color: 'linear-gradient(135deg, var(--color-secondary), #6B4A3A)',
    title: '冰城漆艺',
    desc: '将南方精湛漆艺与东北冰雪文化、工业文明融合，形成独特地域风格。'
  }
];

const honors = [
  '2016年「百花杯」中国工艺美术精品奖银奖',
  '2017年「百花杯」中国工艺美术精品奖金奖',
  '2019年「金凤凰」创新产品设计大赛银奖',
  '2023年中国旅游商品大赛银奖',
  '作品入藏黑龙江省民族博物馆等机构'
];

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const fetchMasterInfo = async () => {
  try {
    const res = await mastersAPI.getAll({ region: '哈尔滨' });
    const linan = res.data?.find((m) => m.name === '李囡');
    if (linan) masterInfo.value = linan;
  } catch (error) {
    console.error('获取传承人信息失败:', error);
  }
};

const fetchWorks = async () => {
  worksLoading.value = true;
  try {
    const mastersRes = await mastersAPI.getAll({ region: '哈尔滨' });
    const linan = mastersRes.data?.find((m) => m.name === '李囡');
    if (linan) {
      const worksRes = await worksAPI.getAll({ master_id: linan.id });
      featuredWorks.value = (worksRes.data || []).slice(0, 6);
    }
  } catch (error) {
    console.error('获取作品失败:', error);
  } finally {
    worksLoading.value = false;
  }
};

onMounted(() => {
  fetchMasterInfo();
  fetchWorks();
});
</script>

<style lang="scss" scoped>
.master-linan-page {
  max-width: 1140px;
  margin: 0 auto;
  padding-bottom: 60px;
}

// ── Hero ──────────────────────────
.hero-section {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 48px;
  padding: clamp(40px, 6vw, 64px) clamp(20px, 4vw, 48px) clamp(32px, 5vw, 48px);
  background: linear-gradient(145deg, #1b1410 0%, var(--color-secondary) 50%, var(--color-primary-dark) 100%);
  color: white;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D8B877' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/svg%3E");
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.35;

  &--1 {
    width: 280px;
    height: 280px;
    background: var(--color-primary);
    top: -60px;
    right: -40px;
  }

  &--2 {
    width: 200px;
    height: 200px;
    background: var(--color-accent-gold);
    bottom: -40px;
    left: -20px;
  }
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: clamp(24px, 5vw, 48px);
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

.hero-portrait {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.portrait-ring {
  padding: 5px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent-gold), var(--color-primary));

  :deep(.el-avatar) {
    border: 4px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
  }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: rgba(216, 184, 119, 0.2);
  border: 1px solid rgba(216, 184, 119, 0.4);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-accent-gold);
}

.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 8px;
}

.hero-name {
  font-family: 'KaiTi', '楷体', serif;
  font-size: clamp(2.4rem, 6vw, 3.5rem);
  font-weight: 700;
  margin: 0 0 8px;
  background: linear-gradient(135deg, #fff 20%, var(--color-accent-gold) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-role {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 12px;
  line-height: 1.5;
}

.hero-location {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 24px;
}

.hero-metrics {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
}

.metric-item {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(216, 184, 119, 0.2);
  border-radius: 12px;
  text-align: center;
  min-width: 80px;

  strong {
    display: block;
    font-size: 1.4rem;
    color: var(--color-accent-gold);
    margin-bottom: 2px;
  }

  span {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
}

.hero-btn-ghost {
  color: white !important;
  border-color: rgba(216, 184, 119, 0.5) !important;
  background: rgba(255, 255, 255, 0.06) !important;

  &:hover {
    border-color: var(--color-accent-gold) !important;
    background: rgba(216, 184, 119, 0.15) !important;
  }
}

.hero-quote {
  position: relative;
  z-index: 1;
  margin: clamp(28px, 4vw, 40px) auto 0;
  max-width: 640px;
  padding-left: 20px;
  border-left: 3px solid var(--color-accent-gold);
  font-family: 'KaiTi', '楷体', serif;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  font-style: italic;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;

  @media (min-width: 769px) {
    text-align: left;
  }
}

// ── Sections ──────────────────────────
.section {
  margin-bottom: 40px;
}

.section-head {
  margin-bottom: 28px;

  &--center {
    text-align: center;
  }
}

.section-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-accent-gold-dark);
  margin-bottom: 6px;
}

.section-title {
  font-family: 'KaiTi', '楷体', serif;
  font-size: clamp(1.5rem, 3vw, 1.9rem);
  color: var(--color-primary);
  margin: 0;
}

.section-desc {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--text-muted);
}

// ── Timeline ──────────────────────────
.timeline {
  display: grid;
  gap: 0;
  position: relative;
}

.timeline-item {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 20px;
  padding-bottom: 28px;
  position: relative;

  @media (max-width: 576px) {
    grid-template-columns: 72px 1fr;
    gap: 12px;
  }
}

.timeline-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-bg-dark);
  border: 2px solid var(--color-border-light);
  font-weight: 700;
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 auto;
  position: relative;
  z-index: 1;

  &--highlight {
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
    border-color: var(--color-accent-gold);
    color: white;
    box-shadow: 0 4px 16px rgba(163, 38, 42, 0.25);
  }
}

.timeline-line {
  position: absolute;
  left: 50px;
  top: 72px;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--color-accent-gold), transparent);
  transform: translateX(-50%);

  @media (max-width: 576px) {
    left: 36px;
  }
}

.timeline-body {
  padding-top: 12px;

  h3 {
    font-size: 16px;
    color: var(--color-primary);
    margin: 0 0 6px;
  }

  p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.7;
    margin: 0;
  }
}

// ── Dual grid ──────────────────────────
.dual-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.bio-text p {
  font-size: 15px;
  line-height: 1.85;
  color: var(--text-secondary);
  margin: 0 0 14px;
  text-indent: 2em;

  &:last-child {
    margin-bottom: 0;
  }
}

.skills-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.skill-tag {
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(216, 184, 119, 0.15), rgba(163, 38, 42, 0.08));
  border: 1px solid rgba(216, 184, 119, 0.3);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-secondary);
}

.skill-highlights {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;

  li {
    display: flex;
    gap: 12px;
    align-items: flex-start;

    .el-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(163, 38, 42, 0.08);
      border-radius: 8px;
      color: var(--color-primary);
      font-size: 16px;
    }

    strong {
      display: block;
      font-size: 14px;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    p {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 0;
    }
  }
}

// ── Works ──────────────────────────
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  min-height: 120px;
}

.work-card {
  cursor: pointer;
  overflow: hidden;
  padding: 0 !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-6px);
  }

  &__img {
    height: 180px;
    overflow: hidden;
    background: var(--color-bg-dark);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
  }

  &:hover &__img img {
    transform: scale(1.05);
  }

  &__body {
    padding: 20px;

    h3 {
      font-size: 16px;
      color: var(--color-primary);
      margin: 0 0 10px;
    }

    p {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 10px 0 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-muted);
  }
}

.works-empty {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

// ── Stories ──────────────────────────
.stories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.story-card {
  padding: 28px !important;

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 22px;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 16px;
    color: var(--color-primary);
    margin: 0 0 10px;
  }

  p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.7;
    margin: 0;
  }
}

// ── Honors ──────────────────────────
.honors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.honor-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--color-bg-light);
  border-radius: 10px;
  border-left: 3px solid var(--color-accent-gold);
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;

  .el-icon {
    color: var(--color-primary);
    font-size: 18px;
    flex-shrink: 0;
  }
}
</style>
