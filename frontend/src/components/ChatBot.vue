<template>
  <div class="chatbot-container" :class="{ 'chatbot-open': isOpen }">
    <div class="chatbot-toggle" @click="toggleChat">
      <template v-if="!isOpen">
        <img 
          v-if="!imageError" 
          src="/icon-chat.png" 
          alt="问答助手" 
          class="chat-icon"
          @error="handleImageError"
          @load="imageError = false"
        />
        <div v-else class="chat-icon-fallback">问</div>
      </template>
      <el-icon v-else class="close-icon"><Close /></el-icon>
    </div>

    <div class="chatbot-window" v-show="isOpen">
      <div class="chatbot-header">
        <h3>非遗问答助手 · 小毛</h3>
        <p>关于国漆髹涂技艺，有什么想了解的吗？</p>
      </div>

      <div class="chatbot-messages" ref="messagesRef">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="{ 'message-user': message.role === 'user', 'message-bot': message.role === 'bot' }"
        >
          <div class="message-avatar" v-if="message.role === 'bot'">
            <el-avatar :size="32" :src="botAvatar">小毛</el-avatar>
          </div>
          <div class="message-content">
            <div class="message-text" v-if="message.content && message.content.trim()" v-html="formatMessage(message.content)"></div>
            <div class="message-text message-empty" v-else>消息加载中...</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
          <div class="message-avatar" v-if="message.role === 'user'">
            <el-avatar :size="32">我</el-avatar>
          </div>
        </div>
        <div v-if="loading" class="message message-bot">
          <div class="message-avatar">
            <el-avatar :size="32" :src="botAvatar">小毛</el-avatar>
          </div>
          <div class="message-content">
            <div class="message-text typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chatbot-input">
        <el-input
          v-model="inputMessage"
          placeholder="输入您的问题..."
          @keyup.enter="sendMessage"
          :disabled="loading"
        >
          <template #append>
            <el-button @click="sendMessage" :loading="loading" :disabled="!inputMessage.trim()">
              <el-icon><Promotion /></el-icon>
            </el-button>
          </template>
        </el-input>
        <div class="quick-questions">
          <el-tag
            v-for="(question, index) in quickQuestions"
            :key="index"
            @click="sendQuickQuestion(question)"
            class="quick-tag"
            size="small"
          >
            {{ question }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue';
import { ChatDotRound, Close, Promotion } from '@element-plus/icons-vue';
import { sendChatMessage, checkHealth } from '@/api/chatbot';
import { ElMessage } from 'element-plus';

const isOpen = ref(false);
const inputMessage = ref('');
const messages = ref([
  {
    role: 'bot',
    content: '您好！我是小毛，非遗问答助手，专门为您解答关于国漆髹涂技艺的问题。请问有什么可以帮助您的吗？',
    timestamp: new Date()
  }
]);
const loading = ref(false);
const messagesRef = ref(null);
const imageError = ref(false);
const apiAvailable = ref(false);

// 可爱的小猫头像SVG（小毛）- 微笑表情
const botAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNBMzI2MkEiLz48Y2lyY2xlIGN4PSIxMSIgY3k9IjEyIiByPSIyLjUiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iMjEiIGN5PSIxMiIgcj0iMi41IiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjExIiBjeT0iMTIiIHI9IjEuMiIgZmlsbD0iIzRBMkEyMCIvPjxjaXJjbGUgY3g9IjIxIiBjeT0iMTIiIHI9IjEuMiIgZmlsbD0iIzRBMkEyMCIvPjxwYXRoIGQ9Ik0gMTAgMTggUSAxMCAxOCAxNiAyMCAgUTIyIDE4IDIyIDE4IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';

const quickQuestions = [
  '什么是国漆髹涂技艺？',
  '36道工序有哪些？',
  '李囡是谁？',
  '浩亮是谁？',
  '漆器制作需要多长时间？',
  '如何学习髹涂技艺？'
];

// 知识库
const knowledgeBase = {
  '什么是国漆髹涂技艺': '国漆髹涂技艺是中华传统工艺的瑰宝，以天然大漆为原料，经过三十六道精细工序，将木胎转化为精美绝伦的漆器。这项技艺历史悠久，工艺复杂，需要精湛的技艺和丰富的经验。',
  '36道工序': '髹涂技艺包含36道工序，主要包括：选漆树、割漆、滤杂、熟漆调配、选材、开料、木胎成型、阴干养胎、刮磨找平、灰胎配制、打底布、批刮灰胎、打磨灰胎、刷漆打底、晾置干燥、复髹上漆、磨漆找平、再髹罩漆、推光打磨、纹样设计、稿样转描、描金勾线、贴金箔、罩金护漆、刻填装饰、螺钿镶嵌、嵌贝打磨、罩漆封护、终磨抛光、检视修补、题款落章、内外清理、最终养护、封存入库、展陈布置、日常保养。',
  '李囡': '李囡，黑龙江省哈尔滨市人，省级非物质文化遗产"国漆髹涂技艺"代表性传承人，二级漆艺师，中国工艺美术协会会员，黑龙江省民间文艺家协会会员。2019年回到家乡哈尔滨，决心在冰城播撒传统漆艺的种子。家族渊源：祖父李兴是国家著名木器工匠、"五一"劳动奖章获得者。专业学习：2014年赴福建拜国漆艺术名家周榕清教授为师，系统学习国漆髹涂技艺；2019年参加"福州脱胎漆器髹饰技艺研修班"。代表作品：1.《尔滨的雪》（2025年亚冬会官方礼物）- 将贝壳与漆艺结合，用天然贝壳表现冰的晶莹剔透，用传统髹涂技法绘制雪花；2."叠彩漆艺"技法（国家专利认证）- 发明不需胎骨支撑的漆艺技法，最厚作品叠涂达200余层，制作周期长达一年以上；3.复原历史作品《青铜盾牌》- 首创"钢线麻布法"，远看如青铜般厚重，触摸如皮革般温润，手持如纸胎般轻巧。对黑龙江漆艺的贡献：1.攻克"漆艺北移"难题，耗时三四年研究改良，成功研发适合东北气候的专用大漆；2.在哈尔滨现代应用职业学校建立哈尔滨市第一家中职学校传统工艺传习馆（400㎡），担任多所院校客座教授；3.将传统漆艺与东北冰雪文化、工业文明融合，打造具有地域特色的现代漆艺风格。荣誉：2016年"百花杯"银奖，2017年"百花杯"金奖（最高奖项），2019年"金凤凰"银奖，2023年中国旅游商品大赛银奖。艺术理念："即使在不产漆的哈尔滨，我也要让这门老手艺在这里生根发芽，开出具有东北特色的花朵。"',
  '漆器制作需要多长时间': '漆器制作时间因作品大小和复杂程度而异。一般来说，一件简单的漆器需要数周到数月，而复杂的作品可能需要半年到一年甚至更长时间。36道工序中，仅阴干养胎就需要约30天，每层漆的干燥也需要数天到数周。',
  '如何学习髹涂技艺': '学习髹涂技艺需要：1. 找到有经验的传承人或师傅；2. 从基础工序开始，循序渐进；3. 需要耐心和恒心，因为工艺复杂；4. 实践操作，亲手制作；5. 了解大漆特性，注意安全（可能过敏）。可以联系当地的传承人或相关机构了解学习机会。',
  '大漆过敏': '大漆过敏俗称"漆咬"，是学习漆艺的必经之路。症状包括皮肤红肿、起疹、奇痒等。一般需要1-2周时间适应，期间可用浓茶水清洗患处。熬过过敏期后，身体会对大漆产生耐受性。',
  '叠彩技法': '叠彩技法是李囡研发的创新技法（国家专利认证），将大漆工艺拓展到更多材质。这种技法发明不需胎骨支撑的漆艺技法，纯粹依靠大漆层层堆叠成型。最厚作品叠涂达200余层，制作周期长达一年以上，需精确控制温湿度和漆膜厚度。截面呈现彩虹般渐变纹理，作品被福建省美术馆收藏，开创漆艺新方向。追求多重感官体验：远看有青铜金属般的深邃厚重感，摸上去像皮具般温润柔韧，拿起来如纸胎般轻巧。',
  '《尔滨的雪》': '《尔滨的雪》是李囡为2025年哈尔滨亚洲冬季运动会创作的官方礼物。创作理念：将贝壳与漆艺结合，用天然贝壳表现冰的晶莹剔透，用传统髹涂技法绘制雪花。工艺创新：团队观察显微镜下真实雪晶，捕捉六角冰棱细微差异，在贝壳内壁曲面上精细绘制。艺术价值：成功将古老漆艺与哈尔滨冰雪文化融合，向世界传递冰城冬日神韵。',
  '青铜盾牌': '《青铜盾牌》是李囡复原的历史作品。创作灵感：参观秦始皇兵马俑时被将军级仪仗盾牌震撼，决心用漆艺再现。工艺创新：首创"钢线麻布法"——用8号钢线拗出骨架，麻布缝合覆盖，多层刮灰裱布；赴陕西采集黄土融入底漆，增强历史质感。艺术效果：远看如青铜般厚重，触摸如皮革般温润，手持如纸胎般轻巧，完美复现远古威严。',
  '漆艺北移': '李囡攻克了"漆艺北移"难题。针对黑龙江冬季寒冷干燥不适合大漆干燥的问题（大漆需20-30℃、湿度70%-80%才能正常干燥），耗时三四年研究改良，通过熬制、提炼提高生漆精度，成功研发适合东北气候的专用大漆。这项创新使漆艺在非产漆区的黑龙江落地生根，开创了北方漆艺发展新路径。',
  '传统工艺传习馆': '李囡在哈尔滨现代应用职业学校建立了哈尔滨市第一家中职学校传统工艺传习馆（400㎡）。设置开放式工坊，展示漆艺全流程，可容纳20人同时实践。李囡担任哈尔滨师范大学、哈尔滨冰雪运动学校等多所院校客座教授和漆艺专家教师，定期开设漆艺课程和体验活动，培养年轻传承人，让"择一事，终一生"的工匠精神深入人心。',
  '刘浩亮': '刘浩亮，男，2004年生，黑龙江哈尔滨人，哈尔滨理工大学经济与管理学院2023级信息管理与信息系统专业(信息23-2班)本科生，中共预备党员，现任校创客协会会长、信息23-2班班长。学业与荣誉：国家励志奖学金、校一等奖学金；省三好学生、校三好学生、校优秀共青团干部、校先进班级(班长)；以第一作者发表学术论文1篇，授权外观设计专利1项，计算机软件著作权1项；主持/参与国家级大学生创业训练项目2项，获国家级、省级竞赛奖励20余项。国漆传承项目：2025年大学生新文科实践创新大赛全国银奖项目"漆创兴龙——国漆髹涂技艺传承与创新发展"负责人，开创哈理工在该赛事的历史突破。项目聚焦黑龙江省级非物质文化遗产"国漆髹涂技艺"的保护与创新，将传统漆艺与现代数字技术结合，设计面向年轻人的漆艺文创产品，建立"漆艺+旅游"模式。与漆艺传承的深度链接：参与省级非遗传承人李囡的漆艺传承项目，担任《爱漆艺——国漆髹涂技艺非遗传承与创新发展》国家级大创项目负责人，学习传统漆艺制作工艺，参与《尔滨的雪》等作品创作，助力李囡在哈尔滨建立的漆艺传承基地建设。未来展望：计划将漆艺创新项目落地转化，打造具有龙江特色的漆艺品牌；关注数字技术与传统文化遗产保护的融合研究；希望通过自己的努力，让更多年轻人了解、喜爱并参与非遗保护。',
  '漆创兴龙': '"漆创兴龙——国漆髹涂技艺传承与创新发展"是刘浩亮负责的2025年大学生新文科实践创新大赛全国银奖项目，开创哈理工在该赛事的历史突破。项目聚焦黑龙江省级非物质文化遗产"国漆髹涂技艺"的保护与创新，探索传统工艺与现代商业的融合路径。创新点：1.将传统漆艺与现代数字技术结合，开发线上展示与销售平台；2.设计面向年轻人的漆艺文创产品，推动非遗"破圈"；3.建立"漆艺+旅游"模式，促进地方文化产业发展。项目指导教师：经济与管理学院杨彩霞副教授(管理学博士，校创客协会发起人)。项目影响：获全国总决赛银奖，实现哈理工在该赛事国家级现场赛的零突破，项目成果获多家媒体报道，提升了黑龙江非遗文化的知名度。',
  '哈尔滨理工大学创客协会': '哈尔滨理工大学创客协会由经济与管理学院杨彩霞副教授发起，现任会长为刘浩亮。协会定位：依托"三创赛"(全国大学生电子商务创新创意及创业挑战赛)和服务外包大赛等平台，通过"政产学研用"联合培养模式，强化创新意识、锻炼创业能力。组织架构：下设竞赛部、宣传部、项目部、培训部和人事部，为会员提供全链条创新创业服务。活动开展：组织优秀学长经验分享会、漆艺非遗宣传活动、承办校"三创赛"和服务外包大赛、组织企业实训等。',
  '杨彩霞': '杨彩霞，哈尔滨理工大学经济与管理学院副教授，管理学博士，校创客协会发起人，刘浩亮"漆创兴龙"项目的指导教师。'
};

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return;

  const userMessage = inputMessage.value.trim();
  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  });

  inputMessage.value = '';
  loading.value = true;

  await nextTick();
  scrollToBottom();

  try {
    // 构建对话历史（只包含最近的对话，避免上下文过长）
    const recentHistory = messages.value
      .slice(-10) // 只取最近10条消息
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'bot',
        content: msg.content
      }));

    // 调用后端 LLM API
    const response = await sendChatMessage(userMessage, recentHistory);
    
    if (response.success && response.message) {
      messages.value.push({
        role: 'bot',
        content: response.message,
        timestamp: new Date()
      });
      apiAvailable.value = true;
    } else {
      throw new Error('AI回复为空');
    }
  } catch (error) {
    console.error('AI回复失败:', error);
    
    // API 不可用时回退到本地知识库
    let fallbackResponse = null;
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      fallbackResponse = '抱歉，AI 响应超时，请稍后重试。\n\n同时，我可以基于知识库回答：国漆髹涂技艺、36道工序、传承人（李囡、刘浩亮等）、作品介绍等问题。';
      const knowledgeResponse = getResponse(userMessage);
      if (knowledgeResponse?.trim()) {
        fallbackResponse = knowledgeResponse + '\n\n（当前使用本地知识库，AI API 响应超时）';
      }
    } else if (error.response?.status === 503 || error.code === 'ECONNREFUSED') {
      fallbackResponse = getResponse(userMessage);
      apiAvailable.value = false;
      
      if (!fallbackResponse?.trim()) {
        const code = error.response?.data?.code;
        if (code === 'LLM_NOT_CONFIGURED') {
          fallbackResponse = 'AI 服务尚未配置。请在 backend/.env 中设置 LLM_API_KEY。\n\n我可以基于知识库回答常见问题，请尝试：什么是国漆髹涂技艺、李囡是谁、36道工序等。';
        } else {
          fallbackResponse = '抱歉，AI 服务暂时不可用，请检查 API 配置与网络连接。\n\n我可以基于知识库回答：国漆髹涂技艺、36道工序、传承人信息、作品介绍等问题。';
        }
      } else {
        fallbackResponse += '\n\n（当前使用本地知识库模式）';
      }
    } else {
      // 其他错误，尝试使用知识库
      fallbackResponse = getResponse(userMessage);
      if (!fallbackResponse || !fallbackResponse.trim()) {
        fallbackResponse = '抱歉，我暂时无法回答这个问题。您可以尝试询问：什么是国漆髹涂技艺、36道工序、传承人信息、漆器制作流程等问题。';
      }
    }
    
    messages.value.push({
      role: 'bot',
      content: fallbackResponse,
      timestamp: new Date()
    });
    
    // 显示错误提示（仅对服务不可用的情况）
    if (error.response?.status === 503) {
      ElMessage.warning('AI API 不可用，已切换到本地知识库');
    }
  } finally {
    loading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

const sendQuickQuestion = (question) => {
  inputMessage.value = question;
  sendMessage();
};

const getResponse = (question) => {
  const lowerQuestion = question.toLowerCase();
  
  // 关键词匹配（支持部分匹配）
  for (const [key, value] of Object.entries(knowledgeBase)) {
    const lowerKey = key.toLowerCase();
    // 完全匹配或包含关键词
    if (lowerQuestion === lowerKey || 
        lowerQuestion.includes(lowerKey) || 
        question.includes(key) ||
        lowerKey.includes(lowerQuestion)) {
      return value;
    }
  }
  
  // 特殊关键词匹配
  if (lowerQuestion.includes('刘浩亮') || lowerQuestion.includes('浩亮')) {
    return knowledgeBase['刘浩亮'];
  }
  if (lowerQuestion.includes('漆创兴龙') || lowerQuestion.includes('漆创')) {
    return knowledgeBase['漆创兴龙'];
  }
  if (lowerQuestion.includes('创客协会') || lowerQuestion.includes('哈理工创客')) {
    return knowledgeBase['哈尔滨理工大学创客协会'];
  }
  if (lowerQuestion.includes('杨彩霞')) {
    return knowledgeBase['杨彩霞'];
  }

  // 默认回复
  if (lowerQuestion.includes('你好') || lowerQuestion.includes('您好') || lowerQuestion.includes('小毛')) {
    return '您好！我是小毛，很高兴为您服务。我可以回答关于国漆髹涂技艺、36道工序、传承人、作品等相关问题。';
  } else if (lowerQuestion.includes('谢谢')) {
    return '不客气！如果还有其他问题，随时可以问我。';
  } else {
    return '抱歉，我暂时无法回答这个问题。您可以尝试询问：什么是国漆髹涂技艺、36道工序、传承人信息、漆器制作流程等问题。如需更详细的信息，建议您查看网站的相关页面或联系传承人。';
  }
};

const formatMessage = (content) => {
  if (!content || content.trim() === '') {
    return '';
  }
  
  // 转义HTML特殊字符，防止XSS攻击
  let escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // 将换行符转换为HTML换行
  let formatted = escaped.replace(/\n/g, '<br/>');
  
  // 将数字编号（如"1."、"2."）转换为有序列表格式
  formatted = formatted.replace(/(\d+\.\s)/g, '<br/>$1');
  
  // 将"•"开头的行转换为列表项
  formatted = formatted.replace(/•\s/g, '• ');
  
  // 支持加粗标记（**文本**）
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  return formatted;
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const handleImageError = (event) => {
  // 如果图标加载失败，使用备用显示
  imageError.value = true;
  // 隐藏失败的图片元素
  if (event && event.target) {
    event.target.style.display = 'none';
  }
};

const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
};

watch(isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      scrollToBottom();
    });
  }
});

// 组件挂载时检查 AI API 配置状态
onMounted(async () => {
  try {
    const health = await checkHealth();
    apiAvailable.value = health.success && health.status === 'configured';
    if (apiAvailable.value) {
      console.log('AI API 已配置，模型:', health.model);
    }
  } catch (error) {
    console.warn('AI API 不可用，将使用本地知识库:', error.message);
    apiAvailable.value = false;
  }
});
</script>

<style lang="scss" scoped>
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.chatbot-toggle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 
    0 4px 16px rgba(163, 38, 42, 0.4),
    0 0 0 0 rgba(163, 38, 42, 0.5);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 24px;
  border: 3px solid var(--color-accent-gold);
  position: relative;
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(216, 184, 119, 0.4) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
  }

  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-accent-gold), var(--color-accent-gold-light));
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: -1;
  }

  &:hover {
    transform: scale(1.08) translateY(-2px);
    box-shadow: 
      0 8px 24px rgba(163, 38, 42, 0.5),
      0 0 0 4px rgba(216, 184, 119, 0.2);

    &::before {
      width: 120%;
      height: 120%;
      opacity: 1;
    }

    &::after {
      opacity: 0.3;
    }
  }

  &:active {
    transform: scale(1.05) translateY(0);
  }

  .chat-icon {
    width: 44px;
    height: 44px;
    object-fit: cover;
    border-radius: 50%;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
    transition: transform 0.3s ease;
  }

  .chat-icon-fallback {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    color: var(--color-accent-gold);
    font-family: 'KaiTi', '楷体', serif;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .close-icon {
    font-size: 22px;
    color: var(--color-accent-gold);
    transition: transform 0.3s ease;
  }

  &:hover .close-icon {
    transform: rotate(90deg);
  }
}

.chatbot-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 420px;
  height: 640px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 
    0 12px 48px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.chatbot-header {
  background: var(--color-primary);
  color: white;
  padding: 20px 16px 16px;
  text-align: center;
  position: relative;
  flex-shrink: 0;

  h3 {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.3px;
    position: relative;
    z-index: 1;
  }

  p {
    margin: 0;
    font-size: 13px;
    opacity: 0.9;
    position: relative;
    z-index: 1;
    font-weight: 400;
    line-height: 1.4;
  }
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  background: #f5f5f7; // 更柔和的背景色，减少视觉疲劳
  position: relative;

  // 自定义滚动条样式 - 更明显易用
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.03);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(163, 38, 42, 0.25);
    border-radius: 4px;
    transition: background 0.3s ease;

    &:hover {
      background: rgba(163, 38, 42, 0.4);
    }
  }
}

.message {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  align-items: flex-start;
  animation: messageSlideIn 0.25s ease-out;
  animation-fill-mode: both;

  // 减少动画延迟，让消息更快出现
  @for $i from 1 through 5 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.03}s;
    }
  }

  &.message-user {
    flex-direction: row-reverse;
  }

  // 最后一条消息增加间距，便于阅读
  &:last-child {
    margin-bottom: 20px;
  }
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  flex-shrink: 0;
  position: relative;
  margin-top: 2px; // 与文字顶部对齐

  :deep(.el-avatar) {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.9);
    transition: transform 0.2s ease;
    width: 36px;
    height: 36px;

    &:hover {
      transform: scale(1.08);
    }
  }
}

.message-content {
  flex: 1;
  max-width: 78%; // 稍微增加最大宽度，提高可读性
  min-width: 0;
}

.message-text {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 15px; // 增大字体，提高可读性
  line-height: 1.75; // 增加行高，阅读更舒适
  word-wrap: break-word;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  white-space: pre-wrap;
  word-break: break-word;
  display: block;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  min-height: 20px;
  visibility: visible;
  opacity: 1;
  position: relative;
  transition: all 0.2s ease;

  .message-user & {
    background: var(--color-primary); // 简化背景，使用纯色提高对比度
    color: #ffffff;
    border-bottom-right-radius: 4px;
    box-shadow: 
      0 2px 6px rgba(163, 38, 42, 0.2),
      0 1px 2px rgba(0, 0, 0, 0.1);
    font-weight: 400;
    
    // 移除渐变叠加，提高文字清晰度
  }

  .message-bot & {
    background: #ffffff;
    color: #2c2c2e !important; // 使用更深的文字颜色，提高对比度
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-bottom-left-radius: 4px;
    box-shadow: 
      0 1px 3px rgba(0, 0, 0, 0.06),
      0 1px 1px rgba(0, 0, 0, 0.04);
    font-weight: 400;
    
    // 移除渐变叠加，保持简洁
  }

  // 确保AI消息中的所有文本颜色一致且易读
  .message-bot &,
  .message-bot & :deep(*),
  .message-bot & :deep(strong),
  .message-bot & :deep(p),
  .message-bot & :deep(span),
  .message-bot & :deep(div),
  .message-bot & :deep(li),
  .message-bot & :deep(ul),
  .message-bot & :deep(ol) {
    color: #2c2c2e !important;
  }
  
  .message-bot & :deep(strong) {
    font-weight: 600;
    color: #1a1a1a !important; // 加粗文字更深，突出重要信息
  }

  :deep(p) {
    margin: 0 0 8px 0;
    display: block;
    line-height: 1.75;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul), :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
    display: block;
  }

  :deep(li) {
    margin-bottom: 4px;
    display: list-item;
    line-height: 1.7;
  }

  :deep(br) {
    display: block;
    content: '';
    margin: 4px 0;
  }

  &.message-empty {
    color: var(--text-secondary);
    font-style: italic;
    opacity: 0.6;
  }
}

// 确保消息内容可见
.message-content {
  min-width: 0;
  flex: 1;
  
  .message-text {
    &:empty {
      display: none;
    }
  }
}

.message-time {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.4);
  margin-top: 4px;
  text-align: right;
  font-weight: 400;
  padding: 0 2px;
  line-height: 1.2;

  .message-user & {
    text-align: left;
  }
}

.typing {
  display: flex;
  gap: 5px;
  padding: 12px 16px;
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 1px 1px rgba(0, 0, 0, 0.04);

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-primary);
    animation: typing 1.2s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

.chatbot-input {
  padding: 16px;
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  position: relative;

  :deep(.el-input) {
    .el-input__wrapper {
      border-radius: 20px;
      box-shadow: 
        0 1px 4px rgba(0, 0, 0, 0.06),
        inset 0 1px 2px rgba(0, 0, 0, 0.03);
      border: 1px solid rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      background: #f8f8f8; // 浅灰背景，更易识别输入区域

      &:hover {
        background: #ffffff;
        border-color: var(--color-primary);
        box-shadow: 
          0 2px 8px rgba(163, 38, 42, 0.1),
          inset 0 1px 2px rgba(0, 0, 0, 0.03);
      }

      &.is-focus {
        background: #ffffff;
        border-color: var(--color-primary);
        box-shadow: 
          0 2px 12px rgba(163, 38, 42, 0.15),
          inset 0 1px 2px rgba(0, 0, 0, 0.03);
      }
    }

    .el-input__inner {
      padding: 10px 14px;
      font-size: 15px; // 增大字体，输入更舒适
      line-height: 1.5;
      color: #1a1a1a;
      
      &::placeholder {
        color: rgba(0, 0, 0, 0.4);
      }
    }
  }

  :deep(.el-input-group__append) {
    .el-button {
      border-radius: 0 20px 20px 0;
      background: var(--color-primary);
      border: none;
      color: white;
      padding: 10px 18px;
      transition: all 0.2s ease;
      box-shadow: 0 1px 4px rgba(163, 38, 42, 0.2);
      font-size: 16px;

      &:hover:not(:disabled) {
        background: var(--color-primary-light);
        box-shadow: 0 2px 8px rgba(163, 38, 42, 0.3);
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

.quick-questions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 100px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(163, 38, 42, 0.2);
    border-radius: 2px;
  }
}

.quick-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 14px;
  padding: 8px 14px;
  font-size: 13px; // 增大字体，更易点击
  border: 1px solid rgba(163, 38, 42, 0.25);
  background: #ffffff;
  color: var(--color-primary);
  font-weight: 500;
  user-select: none; // 防止文字被选中
  min-height: 32px; // 增加点击区域
  display: inline-flex;
  align-items: center;

  &:hover {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(163, 38, 42, 0.2);
  }

  &:active {
    transform: translateY(0) scale(0.97);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chatbot-container {
    bottom: 16px;
    right: 16px;
  }

  .chatbot-toggle {
    width: 56px;
    height: 56px;

    .chat-icon,
    .chat-icon-fallback {
      width: 38px;
      height: 38px;
    }

    .close-icon {
      font-size: 20px;
    }
  }

  .chatbot-window {
    width: calc(100vw - 32px);
    max-width: 420px;
    height: calc(100vh - 100px);
    max-height: 640px;
    bottom: 80px;
    right: 0;
    border-radius: 16px;
  }

  .chatbot-header {
    padding: 20px 16px 16px;

    h3 {
      font-size: 17px;
    }

    p {
      font-size: 12px;
    }
  }

  .chatbot-messages {
    padding: 20px 16px;
  }

  .message-content {
    max-width: 80%;
  }

  .message-text {
    padding: 12px 16px;
    font-size: 13px;
  }

  .chatbot-input {
    padding: 16px;
  }

  .quick-questions {
    max-height: 100px;
  }
}

@media (max-width: 480px) {
  .chatbot-window {
    width: calc(100vw - 24px);
    height: calc(100vh - 80px);
    border-radius: 12px;
  }

  .message-content {
    max-width: 85%;
  }
}

// 确保消息内容可见
.message-content {
  min-width: 0;
  flex: 1;
  
  .message-text {
    &:empty {
      display: none;
    }
  }
}
</style>

