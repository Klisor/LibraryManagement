<template>
  <div class="user-book-list">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="nav-container">
        <div class="nav-left">
          <div class="logo">
            <h2>📚 图书管理系统</h2>
          </div>
          <ul class="nav-menu">
            <li :class="{ active: $route.path === '/user' }">
              <router-link to="/user">首页</router-link>
            </li>
            <li :class="{ active: $route.path === '/user/books' }">
              <router-link to="/user/books">图书列表</router-link>
            </li>
            <li :class="{ active: $route.path === '/user/borrow' }">
              <router-link to="/user/borrow">我的借阅</router-link>
            </li>
            <li :class="{ active: $route.path === '/user/personal' }">
              <router-link to="/user/personal">个人中心</router-link>
            </li>
          </ul>
        </div>
        <div class="nav-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar size="small">{{ user.username.charAt(0) }}</el-avatar>
              <span class="username">{{ user.username }}</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="goToPersonal">个人中心</el-dropdown-item>
              <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 搜索和筛选区域 -->
      <div class="search-filter-area">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索图书名称、作者、ISBN"
            class="search-input"
            @keyup.enter.native="handleSearch"
          >
            <el-select
              slot="prepend"
              v-model="searchField"
              placeholder="搜索范围"
              style="width: 120px;"
            >
              <el-option label="全部" value="all"></el-option>
              <el-option label="书名" value="title"></el-option>
              <el-option label="作者" value="author"></el-option>
              <el-option label="ISBN" value="isbn"></el-option>
            </el-select>
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="handleSearch"
            ></el-button>
          </el-input>
        </div>

        <div class="filter-box">
          <el-select
            v-model="categoryFilter"
            placeholder="选择分类"
            clearable
            @change="handleCategoryChange"
            style="width: 150px; margin-right: 10px;"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>

          <el-checkbox
            v-model="availableOnly"
            @change="handleAvailableChange"
            style="margin-right: 10px;"
          >
            仅显示有库存
          </el-checkbox>

          <el-button @click="resetFilters">重置筛选</el-button>
        </div>
      </div>

      <!-- 图书列表 -->
      <div class="book-list-container">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="6" animated />
        </div>

        <div v-else-if="books.length === 0" class="empty-container">
          <el-empty description="暂无图书数据"></el-empty>
        </div>

        <div v-else class="book-grid">
          <div
            v-for="book in books"
            :key="book.id"
            class="book-card"
            @click="viewBookDetail(book)"
          >
            <div class="book-cover">
              <div class="cover-placeholder">
                {{ book.title.substring(0, 2) }}
              </div>
              <div v-if="book.availableCopies <= 0" class="out-of-stock">
                已借光
              </div>
            </div>
            
            <div class="book-info">
              <h3 class="book-title" :title="book.title">
                {{ book.title }}
              </h3>
              
              <div class="book-author">
                <i class="el-icon-user"></i>
                {{ book.author }}
              </div>
              
              <div class="book-category">
                <el-tag size="mini" type="info">
                  {{ getCategoryName(book.category) }}
                </el-tag>
              </div>
              
              <div class="book-meta">
                <div class="meta-item">
                  <i class="el-icon-collection"></i>
                  <span>库存：{{ book.availableCopies }}/{{ book.totalCopies }}</span>
                </div>
                
                <div v-if="book.publisher" class="meta-item">
                  <i class="el-icon-office-building"></i>
                  <span>{{ book.publisher }}</span>
                </div>
                
                <div v-if="book.publishYear" class="meta-item">
                  <i class="el-icon-date"></i>
                  <span>{{ book.publishYear }}年</span>
                </div>
              </div>
              
              <div class="book-actions">
                <el-button
                  size="small"
                  type="primary"
                  @click.stop="viewBookDetail(book)"
                >
                  查看详情
                </el-button>
                
                <el-button
                  size="small"
                  :type="book.availableCopies > 0 ? 'success' : 'info'"
                  :disabled="book.availableCopies <= 0"
                  @click.stop="showBorrowDialog(book)"
                >
                  {{ book.availableCopies > 0 ? '立即借阅' : '已借光' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            :current-page="currentPage"
            :page-sizes="[12, 24, 48, 96]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :background="true"
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <!-- 图书详情对话框 -->
    <el-dialog
      title="图书详情"
      :visible.sync="detailDialogVisible"
      width="700px"
      @close="selectedBook = null"
    >
      <div v-if="selectedBook" class="book-detail">
        <div class="detail-header">
          <div class="detail-cover">
            <div class="cover-placeholder-large">
              {{ selectedBook.title.substring(0, 2) }}
            </div>
          </div>
          
          <div class="detail-basic">
            <h2>{{ selectedBook.title }}</h2>
            <div class="detail-meta">
              <div class="meta-row">
                <span class="label">作者：</span>
                <span class="value">{{ selectedBook.author }}</span>
              </div>
              
              <div class="meta-row">
                <span class="label">分类：</span>
                <span class="value">
                  <el-tag size="small">
                    {{ getCategoryName(selectedBook.category) }}
                  </el-tag>
                </span>
              </div>
              
              <div v-if="selectedBook.publisher" class="meta-row">
                <span class="label">出版社：</span>
                <span class="value">{{ selectedBook.publisher }}</span>
              </div>
              
              <div v-if="selectedBook.publishYear" class="meta-row">
                <span class="label">出版年份：</span>
                <span class="value">{{ selectedBook.publishYear }}</span>
              </div>
              
              <div class="meta-row">
                <span class="label">ISBN：</span>
                <span class="value">{{ selectedBook.isbn }}</span>
              </div>
              
              <div class="meta-row">
                <span class="label">库存状态：</span>
                <span class="value">
                  <el-tag :type="selectedBook.availableCopies > 0 ? 'success' : 'danger'" size="small">
                    {{ selectedBook.availableCopies > 0 ? '可借阅' : '已借光' }}
                  </el-tag>
                  <span style="margin-left: 10px;">
                    {{ selectedBook.availableCopies }}/{{ selectedBook.totalCopies }} 本
                  </span>
                </span>
              </div>
              
              <div v-if="selectedBook.location" class="meta-row">
                <span class="label">存放位置：</span>
                <span class="value">{{ selectedBook.location }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedBook.description" class="detail-description">
          <h3>内容简介</h3>
          <div class="description-content">
            {{ selectedBook.description }}
          </div>
        </div>
        
        <div v-else class="detail-description">
          <h3>内容简介</h3>
          <div class="description-empty">
            暂无图书简介
          </div>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="selectedBook && selectedBook.availableCopies > 0"
          type="primary"
          @click="handleBorrowBook(selectedBook)"
        >
          借阅此书
        </el-button>
      </div>
    </el-dialog>

    <!-- 借阅对话框（暂时简单实现） -->
    <el-dialog
      title="借阅提示"
      :visible.sync="borrowDialogVisible"
      width="400px"
    >
      <div v-if="bookToBorrow" class="borrow-tip">
        <p>您将要借阅《{{ bookToBorrow.title }}》</p>
        <p>请前往管理员处办理借阅手续</p>
        <p class="tip-note">注：在线借阅功能需管理员操作</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="borrowDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBorrow">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { bookApi } from '@/api/book'
import { BOOK_CATEGORIES, CATEGORY_OPTIONS } from '@/constants/bookCategories'

export default {
  name: 'BookList',
  data() {
    return {
      // 用户信息
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      
      // 搜索和筛选
      searchKeyword: '',
      searchField: 'all',
      categoryFilter: '',
      availableOnly: false,
      
      // 图书数据
      books: [],
      loading: false,
      currentPage: 1,
      pageSize: 12,
      total: 0,
      
      // 对话框
      detailDialogVisible: false,
      selectedBook: null,
      borrowDialogVisible: false,
      bookToBorrow: null,
      
      // 分类选项（使用常量）
      categoryOptions: CATEGORY_OPTIONS
    }
  },
  mounted() {
    // 检查用户是否登录
    if (!this.user.id || this.user.role !== 'USER') {
      this.$router.push('/user/login')
      return
    }
    
    // 加载图书列表
    this.loadBooks()
  },
  methods: {
    // 加载图书列表
    async loadBooks() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize
        }
        
        // 添加搜索条件
        if (this.searchKeyword.trim()) {
          if (this.searchField === 'all') {
            // 使用快速搜索接口
            const searchRes = await bookApi.searchBooks({
              q: this.searchKeyword.trim(),
              field: 'title'
            })
            
            if (searchRes.code === 200 && searchRes.data.length > 0) {
              // 如果有搜索结果，显示搜索结果
              this.books = searchRes.data
              this.total = searchRes.data.length
            } else {
              // 没有搜索结果，清空列表
              this.books = []
              this.total = 0
            }
            this.loading = false
            return
          } else {
            // 使用特定字段搜索
            params[this.searchField] = this.searchKeyword.trim()
          }
        }
        
        // 添加分类筛选
        if (this.categoryFilter) {
          params.category = this.categoryFilter
        }
        
        // 添加库存筛选
        if (this.availableOnly) {
          params.availableOnly = true
        }
        
        // 调用图书列表接口
        const res = await bookApi.getBooks(params)
        
        if (res.code === 200) {
          this.books = res.data.list
          this.total = res.data.total
        } else {
          this.$message.error(res.message)
          this.books = []
          this.total = 0
        }
      } catch (error) {
        console.error('加载图书列表失败:', error)
        this.$message.error('加载失败，请稍后重试')
        this.books = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    
    // 搜索
    handleSearch() {
      this.currentPage = 1
      this.loadBooks()
    },
    
    // 分类变化
    handleCategoryChange() {
      this.currentPage = 1
      this.loadBooks()
    },
    
    // 库存筛选变化
    handleAvailableChange() {
      this.currentPage = 1
      this.loadBooks()
    },
    
    // 重置筛选
    resetFilters() {
      this.searchKeyword = ''
      this.searchField = 'all'
      this.categoryFilter = ''
      this.availableOnly = false
      this.currentPage = 1
      this.loadBooks()
    },
    
    // 分页
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadBooks()
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadBooks()
    },
    
    // 查看图书详情
    viewBookDetail(book) {
      this.selectedBook = book
      this.detailDialogVisible = true
    },
    
    // 显示借阅对话框
    showBorrowDialog(book) {
      if (book.availableCopies <= 0) {
        this.$message.warning('该图书暂无库存')
        return
      }
      
      this.bookToBorrow = book
      this.borrowDialogVisible = true
    },
    
    // 确认借阅
    confirmBorrow() {
      this.$message.info('借阅功能需要管理员操作，请前往管理员处办理')
      this.borrowDialogVisible = false
    },
    
    // 处理借阅图书
    handleBorrowBook(book) {
      this.detailDialogVisible = false
      this.showBorrowDialog(book)
    },
    
    // 根据数字获取分类名称
    getCategoryName(categoryCode) {
      return BOOK_CATEGORIES[categoryCode] || '未知分类'
    },
    
    // 导航到个人中心
    goToPersonal() {
      this.$router.push('/user/personal')
    },
    
    // 退出登录
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/user/login')
    }
  }
}
</script>

<style scoped>
.user-book-list {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏样式 */
.top-navbar {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
}

.logo h2 {
  margin: 0;
  font-size: 20px;
  color: #409eff;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  margin-left: 40px;
  padding: 0;
}

.nav-menu li {
  margin: 0 15px;
}

.nav-menu li a {
  text-decoration: none;
  color: #606266;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-menu li.active a {
  color: #409eff;
  background-color: #ecf5ff;
}

.nav-menu li a:hover {
  color: #409eff;
}

.nav-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-info .username {
  margin: 0 8px;
}

/* 主要内容区 */
.main-content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 搜索和筛选区域 */
.search-filter-area {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
}

.filter-box {
  display: flex;
  align-items: center;
}

/* 图书列表样式 */
.book-list-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

/* 图书网格布局 */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* 图书卡片样式 */
.book-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  background-color: #fff;
}

.book-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.book-cover {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-placeholder {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.out-of-stock {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(245, 108, 108, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.book-info {
  padding: 15px;
}

.book-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author,
.book-category {
  margin-bottom: 8px;
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.book-author i,
.book-meta .meta-item i {
  margin-right: 5px;
}

.book-meta {
  margin: 10px 0;
  font-size: 12px;
  color: #606266;
}

.meta-item {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.book-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

/* 分页样式 */
.pagination-container {
  margin-top: 30px;
  text-align: center;
}

/* 图书详情对话框样式 */
.book-detail {
  line-height: 1.6;
}

.detail-header {
  display: flex;
  margin-bottom: 20px;
}

.detail-cover {
  flex-shrink: 0;
  margin-right: 20px;
}

.cover-placeholder-large {
  width: 150px;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: bold;
  border-radius: 8px;
}

.detail-basic {
  flex: 1;
}

.detail-basic h2 {
  margin: 0 0 15px 0;
  color: #303133;
}

.meta-row {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.meta-row .label {
  color: #909399;
  width: 80px;
  flex-shrink: 0;
}

.meta-row .value {
  color: #606266;
  flex: 1;
}

.detail-description {
  margin-top: 20px;
}

.detail-description h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.description-content {
  color: #606266;
  line-height: 1.8;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.description-empty {
  color: #909399;
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

/* 借阅提示样式 */
.borrow-tip {
  text-align: center;
  padding: 20px 0;
}

.borrow-tip p {
  margin: 10px 0;
  font-size: 16px;
  color: #606266;
}

.tip-note {
  font-size: 14px;
  color: #909399;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 10px;
  }
  
  .nav-menu {
    margin-left: 20px;
  }
  
  .nav-menu li {
    margin: 0 5px;
  }
  
  .nav-menu li a {
    padding: 6px 8px;
    font-size: 14px;
  }
  
  .main-content {
    padding: 0 10px;
  }
  
  .search-filter-area {
    padding: 15px;
  }
  
  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .detail-header {
    flex-direction: column;
  }
  
  .detail-cover {
    margin-right: 0;
    margin-bottom: 20px;
    align-self: center;
  }
}
</style>