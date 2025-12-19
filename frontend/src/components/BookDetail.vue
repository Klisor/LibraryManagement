<template>
  <div class="book-detail">
    <div v-if="loading" class="loading">
      加载中...
    </div>
    <div v-else-if="error" class="error">
      加载失败：{{ error }}
    </div>
    <div v-else-if="book" class="content">
      <div class="detail-header">
        <div class="cover-placeholder">
          {{ book.title.substring(0, 2) }}
        </div>
        
        <div class="basic-info">
          <h2>{{ book.title }}</h2>
          <div class="meta-row">
            <span class="label">作者：</span>
            <span class="value">{{ book.author }}</span>
          </div>
          <div class="meta-row">
            <span class="label">ISBN：</span>
            <span class="value">{{ book.isbn }}</span>
          </div>
          <div class="meta-row">
            <span class="label">分类：</span>
            <span class="value">{{ getCategoryName(book.category) }}</span>
          </div>
        </div>
      </div>
      
      <div class="detail-body">
        <div v-if="book.description" class="description">
          <h3>内容简介</h3>
          <p>{{ book.description }}</p>
        </div>
        
        <div class="additional-info">
          <h3>详细信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">出版社：</span>
              <span class="info-value">{{ book.publisher || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">出版年份：</span>
              <span class="info-value">{{ book.publishYear || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">总副本数：</span>
              <span class="info-value">{{ book.totalCopies || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">可借副本：</span>
              <span class="info-value">{{ book.availableCopies || 0 }}</span>
            </div>
            <div v-if="book.location" class="info-item">
              <span class="info-label">存放位置：</span>
              <span class="info-value">{{ book.location }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { bookApi } from '@/api/book'
import { BOOK_CATEGORIES } from '@/constants/bookCategories'

export default {
  name: 'BookDetail',
  props: {
    bookId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      book: null,
      loading: false,
      error: ''
    }
  },
  watch: {
    bookId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadBookDetail()
        }
      }
    }
  },
  methods: {
    async loadBookDetail() {
      this.loading = true
      this.error = ''
      
      try {
        const res = await bookApi.getBookDetail(this.bookId)
        
        if (res.code === 200) {
          this.book = res.data
        } else {
          this.error = res.message || '获取图书详情失败'
        }
      } catch (error) {
        console.error('加载图书详情失败:', error)
        this.error = '加载失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    
    getCategoryName(categoryCode) {
      return BOOK_CATEGORIES[categoryCode] || '未知分类'
    }
  }
}
</script>

<style scoped>
.book-detail {
  min-height: 400px;
}

.loading, .error {
  text-align: center;
  padding: 100px 0;
  color: #909399;
}

.error {
  color: #f56c6c;
}

.detail-header {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.cover-placeholder {
  width: 120px;
  height: 160px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  margin-right: 20px;
  flex-shrink: 0;
}

.basic-info {
  flex: 1;
}

.basic-info h2 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 24px;
}

.meta-row {
  margin-bottom: 8px;
  color: #606266;
}

.meta-row .label {
  color: #909399;
  margin-right: 5px;
}

.detail-body {
  padding-top: 20px;
}

.description h3,
.additional-info h3 {
  color: #303133;
  font-size: 18px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.description p {
  line-height: 1.6;
  color: #606266;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
}

.info-label {
  color: #909399;
  width: 100px;
  flex-shrink: 0;
}

.info-value {
  color: #606266;
  flex: 1;
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .cover-placeholder {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>