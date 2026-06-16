<template>
  <MainContainer>
    <div class="master-linan-page">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-background">
          <div class="hero-pattern"></div>
        </div>
        <div class="hero-content">
          <div class="hero-main">
            <div class="hero-image">
              <el-avatar :size="250" :src="getAvatarUrl()">
                {{ masterInfo.name && masterInfo.name.charAt(0) || '李' }}
              </el-avatar>
              <div class="master-badge">
                <el-icon><Trophy /></el-icon>
                <span>省级非遗传承人</span>
              </div>
            </div>
            <div class="hero-text">
              <h1 class="master-name">{{ masterInfo.name }}</h1>
              <p class="master-subtitle">黑龙江漆艺传承的创新者</p>
              <p class="master-title">省级非物质文化遗产"国漆髹涂技艺"代表性传承人</p>
              <p class="master-region">
                <el-icon><Location /></el-icon>
                {{ masterInfo.region }}
              </p>
              <div class="master-stats">
                <div class="stat-item">
                  <span class="stat-number">10+</span>
                  <span class="stat-label">从业年限</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">36</span>
                  <span class="stat-label">道工序</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">叠彩</span>
                  <span class="stat-label">创新技法</span>
                </div>
              </div>
            </div>
          </div>
          <div class="hero-quote">
            <blockquote>
              "择一事，终一生。在漆艺这条路上，我愿用一辈子去钻研，去传承。"
            </blockquote>
          </div>
        </div>
      </div>

      <!-- 页面标题 -->
      <div class="page-title-section">
        <h1 class="page-main-title">李囡：黑龙江漆艺传承的创新者</h1>
        <p class="page-subtitle">省级非物质文化遗产"国漆髹涂技艺"代表性传承人</p>
      </div>

      <!-- 介绍内容 -->
      <div class="content-section">
        <div class="section-grid animate-fade-scale delay-200">
          <!-- 传承人简介 -->
          <div class="section-card intro-card">
            <div class="card-header">
              <div class="card-icon">
                <el-icon><Star /></el-icon>
              </div>
              <h2 class="section-title">传承人简介</h2>
            </div>
            <div class="bio-content">
              <p>
                <strong>李囡</strong>，黑龙江省哈尔滨市人，<strong>省级非物质文化遗产"国漆髹涂技艺"代表性传承人</strong>，二级漆艺师，中国工艺美术协会会员，黑龙江省民间文艺家协会会员。
              </p>
              <p>
                2019年回到家乡哈尔滨，决心在冰城播撒传统漆艺的种子，让这门古老工艺在东北焕发新生。
              </p>
              <p>
                <strong>家族渊源</strong>：祖父李兴是国家著名木器工匠、"五一"劳动奖章获得者，从小受其影响对工艺制作产生浓厚兴趣。
              </p>
              <p>
                <strong>军旅生涯</strong>：三年军旅生活磨炼了意志，为日后的艺术创作奠定了坚韧品格。
              </p>
              <p>
                <strong>专业学习</strong>：
              </p>
              <ul>
                <li>2014年赴福建拜国漆艺术名家周榕清教授为师，系统学习国漆髹涂技艺</li>
                <li>2019年参加"福州脱胎漆器髹饰技艺研修班"，深入研究传统漆艺</li>
                <li>复员后在北京学习古陶瓷和老家具修复，被大漆深邃华美的光泽所征服</li>
              </ul>
              <p>
                从复原青铜盾牌到创作亚冬会礼物《尔滨的雪》，这位深谙传统漆艺的手艺人，正让这门古老工艺在冰城大放光彩。他熬过"漆咬"研发"叠彩"自主开创全新技法，将大漆工艺拓展到更多材质，在哈尔滨现代应用职业学校建立了传统工艺传习馆，致力于传统漆艺的教育和传承。
              </p>
            </div>
          </div>

          <!-- 技艺特色 -->
          <div class="section-card skills-card">
            <div class="card-header">
              <div class="card-icon">
                <el-icon><MagicStick /></el-icon>
              </div>
              <h2 class="section-title">技艺特色</h2>
            </div>
            <div class="skills-grid">
              <div
                v-for="(skill, index) in skillTags"
                :key="index"
                class="skill-item"
              >
                <div class="skill-icon">
                  <el-icon><Award /></el-icon>
                </div>
                <span class="skill-text">{{ skill }}</span>
              </div>
            </div>
          </div>

          <!-- 代表作品 -->
          <div class="section-card works-card">
            <div class="card-header">
              <div class="card-icon">
                <el-icon><Trophy /></el-icon>
              </div>
              <h2 class="section-title">代表作品</h2>
            </div>
            <div class="works-grid">
              <div
                v-for="(work, index) in representativeWorks"
                :key="index"
                class="work-card"
              >
                <div class="work-icon">
                  <el-icon><Trophy /></el-icon>
                </div>
                <div class="work-content">
                  <h3 class="work-title">{{ work }}</h3>
                  <div class="work-year">2024</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 特别介绍 -->
        <div class="section highlight-section">
          <div class="highlight-header">
            <div class="card-icon">
              <el-icon><Time /></el-icon>
            </div>
            <h2 class="section-title">特别故事</h2>
          </div>
          <div class="highlight-grid">
            <!-- 个人简介 -->
            <div class="highlight-card full-width">
              <div class="highlight-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="highlight-text">
                <h3>个人简介</h3>
                <p>
                  李囡，黑龙江省哈尔滨市人，<strong>省级非物质文化遗产"国漆髹涂技艺"代表性传承人</strong>，二级漆艺师，中国工艺美术协会会员，黑龙江省民间文艺家协会会员。
                  2019年回到家乡哈尔滨，决心在冰城播撒传统漆艺的种子，让这门古老工艺在东北焕发新生。
                </p>
              </div>
            </div>

            <!-- 艺术背景与师承 -->
            <div class="highlight-card">
              <div class="highlight-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="highlight-text">
                <h3>艺术背景与师承</h3>
                <p>
                  <strong>家族渊源</strong>：祖父李兴是国家著名木器工匠、"五一"劳动奖章获得者，从小受其影响对工艺制作产生浓厚兴趣。<br/>
                  <strong>军旅生涯</strong>：三年军旅生活磨炼了意志，为日后的艺术创作奠定了坚韧品格。<br/>
                  <strong>专业学习</strong>：2014年赴福建拜国漆艺术名家周榕清教授为师，系统学习国漆髹涂技艺；2019年参加"福州脱胎漆器髹饰技艺研修班"，深入研究传统漆艺；复员后在北京学习古陶瓷和老家具修复，被大漆深邃华美的光泽所征服。
                </p>
              </div>
            </div>

            <!-- 《尔滨的雪》 -->
            <div class="highlight-card">
              <div class="highlight-icon">
                <el-icon><ColdDrink /></el-icon>
              </div>
              <div class="highlight-text">
                <h3>《尔滨的雪》——亚冬会官方礼物</h3>
                <p>
                  <strong>创作理念</strong>：将贝壳与漆艺结合，用天然贝壳表现冰的晶莹剔透，用传统髹涂技法绘制雪花。<br/>
                  <strong>工艺创新</strong>：团队观察显微镜下真实雪晶，捕捉六角冰棱细微差异，在贝壳内壁曲面上精细绘制。<br/>
                  <strong>艺术价值</strong>：成功将古老漆艺与哈尔滨冰雪文化融合，向世界传递冰城冬日神韵。
                </p>
              </div>
            </div>

            <!-- 叠彩漆艺技法 -->
            <div class="highlight-card">
              <div class="highlight-icon">
                <el-icon><MagicStick /></el-icon>
              </div>
              <div class="highlight-text">
                <h3>"叠彩漆艺"技法（国家专利认证）</h3>
                <p>
                  <strong>创新突破</strong>：发明不需胎骨支撑的漆艺技法，纯粹依靠大漆层层堆叠成型。<br/>
                  <strong>技术难度</strong>：最厚作品叠涂达200余层，制作周期长达一年以上，需精确控制温湿度和漆膜厚度。<br/>
                  <strong>艺术特色</strong>：截面呈现彩虹般渐变纹理，作品被福建省美术馆收藏，开创漆艺新方向。
                </p>
              </div>
            </div>

            <!-- 青铜盾牌复原 -->
            <div class="highlight-card">
              <div class="highlight-icon">
                <el-icon><Trophy /></el-icon>
              </div>
              <div class="highlight-text">
                <h3>复原历史作品《青铜盾牌》</h3>
                <p>
                  <strong>创作灵感</strong>：参观秦始皇兵马俑时被将军级仪仗盾牌震撼，决心用漆艺再现。<br/>
                  <strong>工艺创新</strong>：首创"钢线麻布法"——用8号钢线拗出骨架，麻布缝合覆盖，多层刮灰裱布；赴陕西采集黄土融入底漆，增强历史质感。<br/>
                  <strong>艺术效果</strong>：远看如青铜般厚重，触摸如皮革般温润，手持如纸胎般轻巧，完美复现远古威严。
                </p>
              </div>
            </div>

            <!-- 对黑龙江漆艺的贡献 -->
            <div class="highlight-card full-width">
              <div class="highlight-icon">
                <el-icon><Location /></el-icon>
              </div>
              <div class="highlight-text">
                <h3>对黑龙江漆艺的贡献</h3>
                
                <div class="contribution-item">
                  <h4>1️⃣ 适应北方气候的技术改良</h4>
                  <p><strong>攻克"漆艺北移"难题</strong>：</p>
                  <ul>
                    <li>针对黑龙江冬季寒冷干燥不适合大漆干燥的问题（大漆需20-30℃、湿度70%-80%才能正常干燥）</li>
                    <li>耗时三四年研究改良，通过熬制、提炼提高生漆精度，成功研发适合东北气候的专用大漆</li>
                    <li>这项创新使漆艺在非产漆区的黑龙江落地生根，开创了北方漆艺发展新路径</li>
                  </ul>
                </div>

                <div class="contribution-item">
                  <h4>2️⃣ 漆艺教育与传承体系建设</h4>
                  <p><strong>传习场所建设</strong>：</p>
                  <ul>
                    <li>在哈尔滨现代应用职业学校建立<strong>哈尔滨市第一家中职学校传统工艺传习馆</strong>（400㎡）</li>
                    <li>设置开放式工坊，展示漆艺全流程，可容纳20人同时实践</li>
                  </ul>
                  <p><strong>教育推广</strong>：</p>
                  <ul>
                    <li>担任哈尔滨师范大学、哈尔滨冰雪运动学校等多所院校客座教授和漆艺专家教师</li>
                    <li>定期开设漆艺课程和体验活动，培养年轻传承人，让"择一事，终一生"的工匠精神深入人心</li>
                  </ul>
                </div>

                <div class="contribution-item">
                  <h4>3️⃣ 艺术跨界与融合</h4>
                  <ul>
                    <li>将漆艺与现代生活结合，创作漆艺鼠标、手机壳、家具等现代生活用品</li>
                    <li>探索碳纤维与漆器结合，研发更轻更坚固的新型胎质</li>
                    <li>尝试将传统漆艺与东北冰雪文化、工业文明融合，打造具有地域特色的现代漆艺风格</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 荣誉与成就 -->
            <div class="highlight-card">
              <div class="highlight-icon">
                <el-icon><Award /></el-icon>
              </div>
              <div class="highlight-text">
                <h3>荣誉与成就</h3>
                <p>
                  • 2016年获"百花杯"中国工艺美术精品奖银奖<br/>
                  • 2017年获"百花杯"中国工艺美术精品奖金奖（最高奖项）<br/>
                  • 2019年获"金凤凰"创新产品设计大赛银奖<br/>
                  • 2023年获中国旅游商品大赛银奖<br/>
                  • 多件作品被黑龙江省民族博物馆、哈尔滨市朝鲜族民俗博物馆等专业机构收藏
                </p>
              </div>
            </div>

            <!-- 艺术理念与使命 -->
            <div class="highlight-card">
              <div class="highlight-icon">
                <el-icon><Time /></el-icon>
              </div>
              <div class="highlight-text">
                <h3>艺术理念与使命</h3>
                <p>
                  "即使在不产漆的哈尔滨，我也要让这门老手艺在这里生根发芽，开出具有东北特色的花朵。"
                </p>
                <p>
                  李囡不仅是传统漆艺的守护者，更是创新者。他将南方精湛的漆艺技法与东北的冰雪文化、工业文明相融合，形成了独特的"冰城漆艺"风格，为中国传统工艺注入了新的活力和地域特色，成为连接传统与现代、东方与西方的文化使者。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainContainer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { mastersAPI } from '../api/masters';
import { Location, Trophy, Star, Award, Time, MagicStick, ColdDrink, User } from '@element-plus/icons-vue';
import MainContainer from '../components/MainContainer.vue';

const route = useRoute();
const masterInfo = ref({
  name: '李囡',
  generation: '省级非遗传承人',
  region: '哈尔滨',
  bio: '',
  avatar_url: '',
  skill_tags: '',
  representative_works: ''
});

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI0Q4Qjg3NyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBmb250LXNpemU9IjgwIiBmaWxsPSIjNEEyQTIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5LiA5Y2XPC90ZXh0Pjwvc3ZnPg==';

// 获取头像URL，处理各种路径格式
const getAvatarUrl = () => {
  // 优先使用 public/images/masters/chenzaitian.jpg
  if (!masterInfo.value) return '/images/masters/chenzaitian.jpg';
  
  const avatarUrl = masterInfo.value.avatar_url;
  if (!avatarUrl) return '/images/masters/chenzaitian.jpg';
  
  // 如果已经是完整路径（以/开头），直接返回
  if (avatarUrl.startsWith('/')) {
    return avatarUrl;
  }
  
  // 如果是完整URL，直接返回
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  
  // 如果是uploads路径（没有斜杠），添加斜杠
  if (avatarUrl.startsWith('uploads/')) {
    return '/' + avatarUrl;
  }
  
  // 其他情况，添加斜杠
  return '/' + avatarUrl;
};

const skillTags = computed(() => {
  if (!masterInfo.value.skill_tags) return [];
  return masterInfo.value.skill_tags.split(',').map(t => t.trim());
});

const representativeWorks = computed(() => {
  if (!masterInfo.value.representative_works) return [];
  return masterInfo.value.representative_works.split('、').map(w => w.trim());
});

const formatBio = (bio) => {
  if (!bio) return '';
  return bio.split('。').filter(s => s.trim()).map(s => `<p>${s.trim()}。</p>`).join('');
};

const fetchMasterInfo = async () => {
  try {
    // 先尝试通过名字查找
    const res = await mastersAPI.getAll({ region: '哈尔滨' });
    const masters = res.data;
    const linan = masters.find(m => m.name === '李囡');
    if (linan) {
      masterInfo.value = linan;
    } else {
      // 如果找不到，使用默认信息
      masterInfo.value = {
        name: '李囡',
        generation: '省级非物质文化遗产"国漆髹涂技艺"代表性传承人',
        region: '哈尔滨',
        bio: '李囡，黑龙江省哈尔滨市人，省级非物质文化遗产"国漆髹涂技艺"代表性传承人，二级漆艺师，中国工艺美术协会会员，黑龙江省民间文艺家协会会员。2019年回到家乡哈尔滨，决心在冰城播撒传统漆艺的种子，让这门古老工艺在东北焕发新生。',
        avatar_url: '/images/masters/chenzaitian.jpg',
        skill_tags: '叠彩技法,冰雪文化,漆艺教育,创新传承,北方漆艺,漆艺北移',
        representative_works: '《尔滨的雪》（2025年亚冬会官方礼物）、《青铜盾牌复原》、"叠彩漆艺"技法（国家专利认证）'
      };
    }
  } catch (error) {
    console.error('获取传承人信息失败:', error);
  }
};

onMounted(() => {
  fetchMasterInfo();
});
</script>

<style lang="scss" scoped>
.master-linan-page {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  position: relative;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  padding: 80px 20px;
  border-radius: 20px;
  margin-bottom: 50px;
  overflow: hidden;
  min-height: 400px;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(216, 184, 119, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(216, 184, 119, 0.08) 0%, transparent 50%);
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  text-align: center;
}

.hero-main {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 40px;
  align-items: center;
  max-width: 1000px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

.hero-image {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.hero-image .el-avatar {
  border: 4px solid var(--color-accent-gold);
  box-shadow: 0 12px 40px rgba(163, 38, 42, 0.3);
}

.master-badge {
  background: var(--color-accent-gold);
  color: var(--color-secondary);
  padding: 8px 20px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.hero-text {
  text-align: left;

  @media (max-width: 768px) {
    text-align: center;
  }
}

.master-name {
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  font-family: 'KaiTi', '楷体', serif;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.master-subtitle {
  font-size: 1.3rem;
  color: var(--color-accent-gold);
  margin: 0 0 10px 0;
  font-weight: 600;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
  font-family: 'KaiTi', '楷体', serif;
}

.master-title {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 15px 0;
  font-weight: 400;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.master-region {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 25px 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

  .el-icon {
    font-size: 1.2rem;
  }
}

.master-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(216, 184, 119, 0.3);
  border-radius: 12px;
  padding: 20px 15px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--color-accent-gold);
  }
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-accent-gold);
  margin-bottom: 5px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.hero-quote {
  max-width: 600px;
  margin-top: 20px;

  blockquote {
    font-size: 1.3rem;
    font-style: italic;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.6;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
    border-left: 3px solid var(--color-accent-gold);
    padding-left: 20px;
    margin: 0;
    font-family: 'KaiTi', '楷体', serif;

    @media (max-width: 768px) {
      font-size: 1.1rem;
      padding-left: 15px;
    }
  }
}

.page-title-section {
  text-align: center;
  padding: 60px 20px 40px;
  margin: 40px 0 50px 0;
  background: #FFFFFF !important;
  border-radius: 20px;
  border: 2px solid #D8B877;
  position: relative;
  overflow: visible;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: block !important;
  width: 100%;
  visibility: visible !important;
  opacity: 1 !important;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #A3262A 0%, #D8B877 50%, #A3262A 100%);
    z-index: 1;
  }
}

.page-main-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #A3262A !important;
  margin: 0 0 15px 0;
  font-family: 'KaiTi', '楷体', serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1.3;
  display: block !important;
  position: relative;
  z-index: 2;
  visibility: visible !important;
  opacity: 1 !important;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 576px) {
    font-size: 1.6rem;
  }
}

.page-subtitle {
  font-size: 1.3rem;
  color: #2A2A2A !important;
  margin: 0;
  font-weight: 400;
  opacity: 1 !important;
  display: block !important;
  position: relative;
  z-index: 2;
  visibility: visible !important;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }

  @media (max-width: 576px) {
    font-size: 1rem;
  }
}

.content-section {
  margin-bottom: 50px;
}

.section-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
}

.section-card {
  background: #FFFFFF !important;
  border: 2px solid #4A2A20;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(163, 38, 42, 0.15);
    border-color: #D8B877;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.card-icon {
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

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0;
  font-family: 'KaiTi', '楷体', serif;
}

.bio-content {
  font-size: 1rem;
  line-height: 1.8;
  color: #2A2A2A !important;

  p {
    margin-bottom: 16px;
    color: #2A2A2A !important;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul {
    margin: 12px 0 16px 20px;
    padding-left: 0;
    list-style-type: none;

    li {
      position: relative;
      padding-left: 24px;
      margin-bottom: 8px;
      line-height: 1.6;
      color: #2A2A2A !important;

      &::before {
        content: '•';
        position: absolute;
        left: 0;
        color: #D8B877 !important;
        font-weight: bold;
        font-size: 1.2em;
      }
    }
  }

  strong {
    color: #A3262A !important;
    font-weight: 600;
  }
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(216, 184, 119, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(216, 184, 119, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(216, 184, 119, 0.15);
    transform: translateX(5px);
  }
}

.skill-icon {
  width: 40px;
  height: 40px;
  background: var(--color-accent-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary);
  font-size: 16px;
  flex-shrink: 0;
}

.skill-text {
  font-size: 1rem;
  color: var(--text-main);
  font-weight: 500;
}

.works-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.work-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(163, 38, 42, 0.05);
  border-radius: 12px;
  border-left: 4px solid var(--color-primary);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(163, 38, 42, 0.08);
    transform: translateX(8px);
    border-left-color: var(--color-accent-gold);
  }
}

.work-icon {
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

.work-content {
  flex: 1;
}

.work-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 6px 0;
  line-height: 1.4;
}

.work-year {
  font-size: 0.9rem;
  color: var(--text-secondary);
  background: rgba(216, 184, 119, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
}

.highlight-section {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, rgba(163, 38, 42, 0.03) 0%, rgba(216, 184, 119, 0.03) 100%);
  border: 1px solid rgba(163, 38, 42, 0.1);
  border-radius: 20px;
  padding: 40px;
  margin-top: 20px;
}

.highlight-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(216, 184, 119, 0.3);
}

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.highlight-card.full-width {
  grid-column: 1 / -1;
}

.highlight-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(216, 184, 119, 0.2);
  transition: all 0.3s ease;
  display: flex;
  gap: 20px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(163, 38, 42, 0.15);
    border-color: var(--color-accent-gold);
  }

  @media (max-width: 576px) {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
}

.highlight-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent-gold) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(163, 38, 42, 0.3);
}

.highlight-text {
  flex: 1;
}

.highlight-text h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 15px 0;
  font-family: 'KaiTi', '楷体', serif;

  @media (max-width: 576px) {
    font-size: 1.1rem;
  }
}

.highlight-text p {
  font-size: 1rem;
  line-height: 1.7;
  color: #2A2A2A !important;
  margin: 0 0 12px 0;
  text-align: justify;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.highlight-text h3 {
  color: #A3262A !important;
}

.highlight-text strong {
  color: #A3262A !important;
}

.contribution-item {
  margin-bottom: 30px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-primary);
    margin: 0 0 15px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(216, 184, 119, 0.3);
  }
  
  p {
    margin: 12px 0 8px 0;
    font-weight: 500;
    color: var(--text-main);
  }
  
  ul {
    margin: 8px 0 20px 20px;
    padding-left: 0;
    list-style-type: none;
    
    li {
      position: relative;
      padding-left: 24px;
      margin-bottom: 10px;
      line-height: 1.8;
      color: var(--text-main);
      
      &::before {
        content: '•';
        position: absolute;
        left: 0;
        color: var(--color-accent-gold);
        font-weight: bold;
        font-size: 1.2em;
      }
    }
  }
  
  strong {
    color: var(--color-primary);
    font-weight: 600;
  }
}
</style>

