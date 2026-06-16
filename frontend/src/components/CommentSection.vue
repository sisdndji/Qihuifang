<template>
  <div class="comment-section card-lacquer">
    <h2 class="section-title">留言讨论</h2>
    
    <!-- 留言表单 -->
    <div class="comment-form">
      <el-form :model="commentForm" label-width="80px">
        <el-form-item label="昵称" required>
          <el-input
            v-model="commentForm.nickname"
            placeholder="请输入您的昵称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="留言内容" required>
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入您的留言..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            发表留言
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 留言列表 -->
    <div class="comments-list" v-loading="loading">
      <div v-if="comments.length === 0" class="empty-comments">
        <el-empty description="暂无留言，快来发表第一条吧！" />
      </div>
      
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="comment-item"
      >
        <div class="comment-header">
          <div class="comment-author">
            <el-avatar :size="40" class="author-avatar">
              {{ comment.nickname?.charAt(0) || '匿' }}
            </el-avatar>
            <div class="author-info">
              <span class="author-name">{{ comment.nickname || '匿名用户' }}</span>
              <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
            </div>
          </div>
        </div>
        <div class="comment-content">
          {{ comment.content }}
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { commentsAPI } from '../api/comments';

const props = defineProps({
  heritageId: {
    type: Number,
    required: true
  }
});

const loading = ref(false);
const submitting = ref(false);
const comments = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const commentForm = ref({
  nickname: '',
  content: ''
});

const fetchComments = async () => {
  loading.value = true;
  try {
    const res = await commentsAPI.getAll({
      heritage_id: props.heritageId,
      page: currentPage.value,
      pageSize: pageSize.value
    });
    comments.value = res.data.comments || [];
    total.value = res.data.total || 0;
  } catch (error) {
    console.error('获取留言失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!commentForm.value.nickname.trim()) {
    ElMessage.warning('请输入昵称');
    return;
  }
  if (!commentForm.value.content.trim()) {
    ElMessage.warning('请输入留言内容');
    return;
  }

  submitting.value = true;
  try {
    await commentsAPI.create({
      heritage_id: props.heritageId,
      nickname: commentForm.value.nickname.trim(),
      content: commentForm.value.content.trim()
    });
    ElMessage.success('留言发表成功');
    commentForm.value = {
      nickname: '',
      content: ''
    };
    await fetchComments();
  } catch (error) {
    ElMessage.error('发表留言失败');
  } finally {
    submitting.value = false;
  }
};

const handlePageChange = () => {
  fetchComments();
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  } else if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

onMounted(() => {
  fetchComments();
});
</script>

<style lang="scss" scoped>
.comment-section {
  padding: 24px;
  margin-top: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-accent-gold);
}

.comment-form {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(216, 184, 119, 0.2);
}

.comments-list {
  min-height: 200px;
}

.empty-comments {
  padding: 40px 0;
  text-align: center;
}

.comment-item {
  padding: 16px;
  margin-bottom: 16px;
  background: rgba(27, 20, 16, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(216, 184, 119, 0.2);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--color-accent-gold);
    background: rgba(27, 20, 16, 0.5);
  }
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent-gold);
}

.comment-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.comment-content {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-main);
  white-space: pre-wrap;
  word-break: break-word;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>

