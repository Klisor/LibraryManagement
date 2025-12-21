<template>
  <div class="compact-book-detail">
    <div v-if="loading" class="compact-loading">
      <div class="loading-icon">
        <i class="el-icon-loading"></i>
      </div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="compact-error">
      <div class="error-icon">
        <i class="el-icon-error"></i>
      </div>
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <el-button class="compact-btn" @click="loadBookDetail">重试</el-button>
    </div>
    
    <div v-else-if="book" class="compact-content">
      <!-- 主要信息区 - 两列布局 -->
      <div class="main-section">
        <!-- 左侧：封面和库存 -->
        <div class="left-panel">
          <div class="cover-wrapper">
            <div class="book-cover">
              {{ book.title.substring(0, 2) }}
            </div>
            <div v-if="book.availableCopies <= 0" class="stock-status unavailable">
              <i class="el-icon-close"></i>
              <span>已借光</span>
            </div>
            <div v-else class="stock-status available">
              <i class="el-icon-check"></i>
              <span>可借阅</span>
            </div>
          </div>
          
          <div class="stock-info">
            <div class="stock-item">
              <span class="stock-label">总副本：</span>
              <span class="stock-value">{{ book.totalCopies || 0 }}</span>
            </div>
            <div class="stock-item">
              <span class="stock-label">可借副本：</span>
              <span class="stock-value" :class="{ 'danger': book.availableCopies <= 0 }">
                {{ book.availableCopies || 0 }}
              </span>
            </div>
            <div class="stock-item">
              <span class="stock-label">已借出：</span>
              <span class="stock-value">
                {{ (book.totalCopies || 0) - (book.availableCopies || 0) }}
              </span>
            </div>
          </div>
          
          <!-- 库存状态提醒 -->
          <div v-if="book.availableCopies <= 0" class="availability-alert unavailable">
            <i class="el-icon-warning"></i>
            <div class="alert-content">
              <strong>库存不足</strong>
              <p>该图书暂无可用副本</p>
            </div>
          </div>
          <div v-else-if="book.availableCopies <= 2" class="availability-alert low">
            <i class="el-icon-warning"></i>
            <div class="alert-content">
              <strong>库存紧张</strong>
              <p>仅剩 {{ book.availableCopies }} 本可借</p>
            </div>
          </div>
        </div>
        
        <!-- 右侧：标题、作者、内容简介和详细信息 -->
        <div class="right-panel">
          <!-- 标题区域 -->
          <div class="header-section">
            <h1 class="book-title">
              <img src="@/assets/image/icons/book.png" alt="图书" class="title-book-icon" />
              {{ book.title }}
            </h1>
            <div class="author-info">
              <div class="author-line">
                <i class="el-icon-user"></i>
                <span>{{ book.author }}</span>
              </div>
              <el-tag class="category-tag">{{ getCategoryName(book.category) }}</el-tag>
            </div>
          </div>
          
          <!-- 内容简介 -->
          <div class="description-section">
            <h3 class="section-title">
              <i class="el-icon-reading"></i>
              内容简介
            </h3>
            <div class="description-content" :class="{ 'has-scroll': book.description && book.description.length > 200 }">
              <p v-if="book.description">{{ book.description }}</p>
              <div v-else class="empty-description">
                <i class="el-icon-document"></i>
                <p>暂无图书简介</p>
              </div>
            </div>
          </div>
          
          <!-- 详细信息网格 -->
          <div class="details-section">
            <h3 class="section-title">
              <i class="el-icon-info"></i>
              详细信息
            </h3>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-document-copy"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">ISBN</div>
                  <div class="detail-value">{{ book.isbn }}</div>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-office-building"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">出版社</div>
                  <div class="detail-value">{{ book.publisher || '未知' }}</div>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-date"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">出版年份</div>
                  <div class="detail-value">{{ book.publishYear || '未知' }}</div>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">
                  <i class="el-icon-location"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">存放位置</div>
                  <div class="detail-value">{{ book.location || '未知' }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 底部按钮区 -->
          <div class="footer-section">
            <div class="button-group">
              <el-button class="compact-btn" @click="$emit('close')">
                <i class="el-icon-close"></i>
                关闭
              </el-button>
              
              <el-button 
                v-if="book.availableCopies > 0" 
                class="compact-btn primary" 
                @click="$emit('borrow', book)"
              >
                <i class="el-icon-collection"></i>
                立即借阅
              </el-button>
              
              <el-button 
                v-else 
                class="compact-btn disabled" 
                disabled
              >
                <i class="el-icon-warning-outline"></i>
                已借光
              </el-button>
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
          this.book = null
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
/* 紧凑型图书详情样式 - 优化布局 */
.compact-book-detail {
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #5b4636;
  width: 100%;
  max-width: 850px;
  margin: 0 auto;
  padding: 0;
}

/* 加载状态 */
.compact-loading {
  text-align: center;
  padding: 50px 20px;
}

.loading-icon {
  font-size: 36px;
  color: #a7874b;
  margin-bottom: 15px;
}

.compact-loading p {
  margin: 0;
  color: #8b7355;
  font-size: 16px;
}

/* 错误状态 */
.compact-error {
  text-align: center;
  padding: 50px 20px;
}

.error-icon {
  font-size: 36px;
  color: #c77;
  margin-bottom: 15px;
}

.compact-error h3 {
  margin: 0 0 10px 0;
  color: #c77;
  font-size: 20px;
  font-weight: 600;
}

.compact-error p {
  margin: 0 0 20px 0;
  color: #8b7355;
  font-size: 16px;
}

/* 内容区域 */
.compact-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
}

/* 主要信息区 - 两列布局 */
.main-section {
  display: flex;
  flex: 1;
  gap: 25px;
  margin: 0;
  padding: 0;
  min-height: 0; /* 防止内容溢出 */
}

.left-panel {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0; /* 防止内容溢出 */
  padding-left: 10px;
}

/* 标题区域 */
.header-section {
  margin-bottom: 15px;
  padding: 0;
}

.book-title {
  margin: 0 0 12px 0;
  color: #3c2c1e;
  font-size: 24px;
  font-weight: bold;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 1.4;
}

.title-book-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-line {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8b7355;
  font-size: 16px;
  font-weight: 500;
}

.author-line i {
  color: #a7874b;
  font-size: 18px;
}

.category-tag {
  background: linear-gradient(135deg, #e8d4b8, #d4b483) !important;
  border: 1px solid #d4b483 !important;
  color: #5b4636 !important;
  font-weight: bold;
  padding: 4px 12px !important;
  border-radius: 16px !important;
  font-size: 12px !important;
  height: 26px;
  line-height: 18px;
}

/* 封面样式 */
.cover-wrapper {
  position: relative;
}

.book-cover {
  width: 220px;
  height: 300px;
  background: linear-gradient(135deg, #d6c3a0, #c6ae90) !important;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  font-weight: bold;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  box-shadow: 0 6px 16px rgba(155, 135, 110, 0.3);
  border: 2px solid #e8d4b8;
}

.stock-status {
  position: absolute;
  top: -8px;
  right: -8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.stock-status.unavailable {
  background: linear-gradient(135deg, #c77, #a55);
  color: white;
  border: 1px solid #a55;
}

.stock-status.available {
  background: linear-gradient(135deg, #fff1bc, #ffddaa) !important; /* 改为更亮的颜色 */
  color: rgb(107, 79, 37);
  border: 1px solid #ffcf87 !important; /* 改为更亮的边框 */
}

.stock-status i {
  font-size: 14px;
}

/* 库存信息 */
.stock-info {
  background: rgba(250, 248, 245, 0.95);
  border-radius: 8px;
  padding: 15px;
  border: 2px solid rgba(232, 212, 184, 0.4);
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(232, 212, 184, 0.4);
}

.stock-item:last-child {
  border-bottom: none;
}

.stock-label {
  color: #8b7355;
  font-size: 14px;
  font-weight: 500;
}

.stock-value {
  color: #5b4636;
  font-size: 18px;
  font-weight: bold;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.stock-value.danger {
  color: #c77;
}

/* 库存提醒 */
.availability-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid;
}

.availability-alert i {
  font-size: 18px;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-content strong {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
  font-weight: 600;
}

.alert-content p {
  margin: 0;
  font-size: 13px;
  color: #5b4636;
}

.availability-alert.unavailable {
  background: rgba(204, 119, 119, 0.1);
  border-color: rgba(204, 119, 119, 0.3);
  color: #c77;
}

.availability-alert.low {
  background: rgba(212, 175, 55, 0.1); /* 金色系背景 */
  border-color: rgba(246, 202, 81, 0.3);
  color: #baa068;
}

/* 内容简介 */
.description-section {
  background: rgba(250, 248, 245, 0.95);
  border-radius: 8px;
  padding: 15px;
  border: 2px solid rgba(232, 212, 184, 0.4);
  flex: 0 0 auto;
}

.section-title {
  margin: 0 0 12px 0;
  color: #5b4636;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(232, 212, 184, 0.4);
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.section-title i {
  color: #a7874b;
  font-size: 18px;
}

.description-content {
  font-size: 14px;
  line-height: 1.6;
  color: #5b4636;
  max-height: 150px;
  overflow-y: auto;
}

.description-content.has-scroll {
  padding-right: 10px;
}

.description-content p {
  margin: 0;
  text-indent: 2em;
  font-size: 14px;
  line-height: 1.6;
}

.empty-description {
  text-align: center;
  padding: 20px;
  color: #8b7355;
}

.empty-description i {
  font-size: 24px;
  margin-bottom: 8px;
  color: #d4b483;
  display: block;
}

.empty-description p {
  margin: 0;
  font-size: 14px;
}

/* 详细信息区域 */
.details-section {
  background: rgba(250, 248, 245, 0.95);
  border-radius: 8px;
  padding: 15px;
  border: 2px solid rgba(232, 212, 184, 0.4);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.details-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 2px solid rgba(232, 212, 184, 0.3);
  transition: all 0.2s;
}

.detail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(155, 135, 110, 0.15);
}

.detail-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #a7874b, #8b7355);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-label {
  color: #8b7355;
  font-size: 12px;
  margin-bottom: 4px;
  font-weight: 500;
}

.detail-value {
  color: #5b4636;
  font-size: 14px;
  font-weight: 600;
  word-break: break-word;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

/* 底部按钮区域 */
.footer-section {
  padding: 15px 0 0;
  border-top: 2px solid rgba(232, 212, 184, 0.4);
  margin-top: auto;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 按钮样式 - 调整"可借阅"按钮为更亮的颜色 */
.compact-btn {
  background: #f5f0e6 !important;
  border: 2px solid #e8d4b8 !important;
  color: #5b4636 !important;
  font-weight: 600;
  padding: 10px 20px !important;
  border-radius: 20px !important;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif !important;
  transition: all 0.3s !important;
  box-shadow: 0 3px 8px rgba(155, 135, 110, 0.15) !important;
  font-size: 14px !important;
  height: 40px;
  min-width: 100px;
}

.compact-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(155, 135, 110, 0.2) !important;
}

/* 修改为棕色系，与其他按钮风格统一 */
.compact-btn.primary {
  background: linear-gradient(135deg, #a7874b, #8b7355) !important;
  border: 2px solid #8b7355 !important;
  color: white !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.compact-btn.primary:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b) !important;
  border-color: #a7874b !important;
  box-shadow: 0 8px 16px rgba(155, 135, 110, 0.3) !important;
}

.compact-btn.secondary {
  background: linear-gradient(135deg, #e8d4b8, #d4b483) !important;
  border: 2px solid #d4b483 !important;
  color: #5b4636 !important;
}

.compact-btn.secondary:hover {
  background: linear-gradient(135deg, #d4b483, #e8d4b8) !important;
  border-color: #c9a86e !important;
}

.compact-btn.disabled {
  background: #f0f0f0 !important;
  border-color: #ddd !important;
  color: #999 !important;
  cursor: not-allowed !important;
}

.compact-btn i {
  margin-right: 6px;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-section {
    flex-direction: column;
    gap: 20px;
  }
  
  .left-panel {
    flex: none;
    width: 100%;
  }
  
  .right-panel {
    padding-left: 0;
  }
  
  .book-cover {
    width: 200px;
    height: 280px;
    margin: 0 auto;
    font-size: 32px;
  }
  
  .stock-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 15px;
  }
  
  .stock-item {
    flex-direction: column;
    text-align: center;
    padding: 10px;
    border-bottom: none;
    border-right: 1px dashed rgba(232, 212, 184, 0.4);
  }
  
  .stock-item:last-child {
    border-right: none;
  }
  
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .compact-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .book-title {
    font-size: 20px;
  }
  
  .title-book-icon {
    width: 20px;
    height: 20px;
  }
  
  .author-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .author-line {
    font-size: 14px;
  }
  
  .book-cover {
    width: 180px;
    height: 250px;
    font-size: 28px;
  }
  
  .stock-info {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stock-item {
    border-right: none;
    border-bottom: 1px dashed rgba(232, 212, 184, 0.4);
    padding: 12px 0;
  }
  
  .stock-item:last-child {
    border-bottom: none;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 15px;
  }
  
  .description-content p {
    font-size: 13px;
  }
  
  .detail-label {
    font-size: 11px;
  }
  
  .detail-value {
    font-size: 13px;
  }
}
</style>