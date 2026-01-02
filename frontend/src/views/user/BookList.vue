<template>
  <div class="user-book-list">
    <!-- 顶部导航栏 - 与Home.vue保持一致 -->
    <el-header class="user-header">
      <div class="header-content">
        <div class="logo">
          <img src="../../assets/image/icons/book1.png" alt="图书管理系统" class="logo-img">
          <h2>知行书阁</h2>
        </div>

        <div class="nav-center">
          <el-menu mode="horizontal" :default-active="activeNav" @select="handleNavSelect">
            <el-menu-item index="home">首页</el-menu-item>
            <el-menu-item index="books">图书列表</el-menu-item>
            <el-menu-item index="borrow">我的借阅</el-menu-item>
            <el-menu-item index="personal">个人中心</el-menu-item>
          </el-menu>
        </div>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <i class="el-icon-user"></i>
              {{ user.username }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="notes">我的笔记</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 搜索和筛选区域 -->
      <div class="search-filter-area ancient-section">
        <div class="search-box">
          <el-input v-model="searchKeyword" placeholder="搜索图书名称、作者、ISBN" class="search-input"
            @keyup.enter.native="handleSearch">
            <el-select slot="prepend" v-model="searchField" placeholder="搜索范围" style="width: 120px;">
              <el-option label="全部" value="all"></el-option>
              <el-option label="书名" value="title"></el-option>
              <el-option label="作者" value="author"></el-option>
              <el-option label="ISBN" value="isbn"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="handleSearch" class="ancient-search-btn"></el-button>
          </el-input>
        </div>

        <div class="filter-box">
          <el-select v-model="categoryFilter" placeholder="选择分类" clearable @change="handleCategoryChange"
            style="width: 150px; margin-right: 10px;">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label"
              :value="item.value"></el-option>
          </el-select>

          <!-- 添加分类显示标签 -->
          <div v-if="categoryFilter" style="display: inline-block; margin-left: 10px;">
            当前分类：<el-tag size="small" class="ancient-tag">{{ getCategoryName(categoryFilter) }}</el-tag>
          </div>

          <el-checkbox v-model="availableOnly" @change="handleAvailableChange" style="margin-right: 10px;"
            class="ancient-checkbox">
            仅显示有库存
          </el-checkbox>

          <el-button @click="resetFilters" class="ancient-btn reset-btn">重置筛选</el-button>
        </div>
      </div>

      <!-- 图书列表 -->
      <div class="book-list-container ancient-section">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="6" animated />
        </div>

        <div v-else-if="books.length === 0" class="empty-container">
          <el-empty description="暂无图书数据"></el-empty>
        </div>

        <div v-else class="book-grid">
          <div v-for="book in books" :key="book.id" class="book-card ancient-card" @click="viewBookDetail(book)">
            <div class="book-cover ancient-cover">
              <div class="cover-placeholder">
                {{ book.title.substring(0, 2) }}
              </div>
              <div v-if="book.availableCopies <= 0" class="out-of-stock ancient-tag">
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
                <el-tag size="mini" class="ancient-tag category-tag">
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
                <el-button size="small" class="ancient-btn detail-btn" @click.stop="viewBookDetail(book)">
                  查看详情
                </el-button>

                <el-button size="small"
                  :class="book.availableCopies > 0 ? 'ancient-btn borrow-btn' : 'ancient-btn disabled-btn'"
                  :disabled="book.availableCopies <= 0" @click.stop="showBorrowDialog(book)">
                  {{ book.availableCopies > 0 ? '立即借阅' : '已借光' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination">
          <el-pagination @size-change="handleSizeChange" @current-change="handlePageChange" :current-page="currentPage"
            :page-sizes="[12, 24, 48, 96]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
            :total="total" :background="true" class="ancient-pagination">
          </el-pagination>
        </div>
      </div>
    </div>

    <!-- 图书详情对话框 -->
    <el-dialog :visible.sync="detailDialogVisible" width="850px" @close="selectedBook = null"
      custom-class="ancient-dialog no-header-dialog">
      <BookDetail v-if="selectedBook" :book-id="selectedBook.id" @close="detailDialogVisible = false"
        @borrow="handleBorrowBook" />
    </el-dialog>

    <!-- 借阅对话框 -->
    <el-dialog :visible.sync="borrowDialogVisible" width="400px" custom-class="ancient-dialog no-header-dialog">
      <div v-if="bookToBorrow" class="borrow-tip">
        <p>您将要借阅《{{ bookToBorrow.title }}》</p>
        <p>请前往管理员处办理借阅手续</p>
        <p class="tip-note">注：在线借阅功能需管理员操作</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="borrowDialogVisible = false" class="ancient-btn cancel-btn">取消</el-button>
        <el-button type="primary" @click="confirmBorrow" class="ancient-btn confirm-btn">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { bookApi } from '@/api/book'
import { BOOK_CATEGORIES, CATEGORY_OPTIONS } from '@/constants/bookCategories'
import BookDetail from '@/components/BookDetail.vue'

export default {
  name: 'BookList',
  components: {
    BookDetail
  },
  data() {
    return {
      // 用户信息
      user: {},
      activeNav: 'books',

      // 搜索和筛选
      searchKeyword: '',
      searchField: 'all',
      categoryFilter: '', // 确保初始值为空字符串
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
  watch: {
    '$route.query': {
      handler(newQuery) {
        this.handleRouteQuery(newQuery)
      },
      immediate: true
    },
    // 添加分类筛选的深度监听
    categoryFilter: {
      handler(newVal) {
        // 确保categoryFilter是数字类型，或者是空字符串
        if (newVal !== '' && typeof newVal === 'string') {
          // 如果是字符串类型的数字，转换为数字
          const numVal = Number(newVal)
          if (!isNaN(numVal)) {
            // 使用$nextTick确保DOM更新后再设置值
            this.$nextTick(() => {
              this.categoryFilter = numVal
            })
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    // 检查是否登录 - 允许普通用户和管理员
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      this.$router.push('/user/login')
      return
    }

    // 检查用户权限 - 允许普通用户和管理员访问
    if (user.role !== 'USER' && user.role !== 'ADMIN') {
      this.$message.warning('请以用户或管理员身份登录')
      this.$router.push('/user/login')
      return
    }

    // 确保本地user数据与localStorage同步
    this.user = user

    // 处理路由参数
    this.handleRouteQuery(this.$route.query)
  },
  methods: {
    // 导航选择处理
    handleNavSelect(index) {
      this.activeNav = index
      switch (index) {
        case 'home':
          if (this.$route.path !== '/user') {
            this.$router.push('/user')
          }
          break
        case 'books':
          if (this.$route.path !== '/user/books') {
            this.$router.push('/user/books')
          }
          break
        case 'borrow':
          this.$router.push('/user/borrow')
          break
        case 'personal':
          this.$router.push('/user/personal')
          break
        default:
          break
      }
    },

    // 用户命令处理
    handleCommand(command) {
      if (command === 'logout') {
        this.logout()
      } else if (command === 'profile' || command === 'notes') {
        this.$router.push('/user/personal')
      }
    },

    // 处理路由参数
    handleRouteQuery(query) {
      let needLoadBooks = false

      // 处理搜索关键词
      if (query.q && (query.q !== this.searchKeyword || query.field !== this.searchField)) {
        this.searchKeyword = query.q
        this.searchField = query.field || 'all'
        this.currentPage = 1
        needLoadBooks = true
      }

      // 处理分类筛选 - 确保转换为数字
      if (query.category) {
        const categoryId = Number(query.category)
        if (categoryId >= 1 && categoryId <= 10 && categoryId !== this.categoryFilter) {
          this.categoryFilter = categoryId
          this.currentPage = 1
          needLoadBooks = true
        }
      } else if (this.categoryFilter !== '') {
        // 如果URL中没有分类参数，但当前有筛选，重置它
        this.categoryFilter = ''
        this.currentPage = 1
        needLoadBooks = true
      }

      // 处理图书详情查看
      if (query.bookId) {
        this.viewBookById(query.bookId)
      }

      // 需要加载图书列表的情况：
      // 1. 有搜索或分类变化 (needLoadBooks = true)
      // 2. 首次进入页面，没有任何查询参数
      // 3. 只有bookId参数，没有其他查询参数（热门图书跳转情况）
      if (needLoadBooks) {
        this.loadBooks()
      } else if (!query.q && !query.category) {
        // 如果没有搜索和分类参数（包括有bookId的情况），就加载图书列表
        this.loadBooks()
      }
    },

    // 通过ID查看图书详情
    async viewBookById(bookId) {
      try {
        var res = await bookApi.getBookDetail(bookId)

        res = res.data
        console.log(res)
        if (res.code === 200) {
          this.selectedBook = res.data
          this.detailDialogVisible = true
        } else {
          this.$message.error(res.message || '图书不存在')
        }
      } catch (error) {
        console.error('获取图书详情失败:', error)
        this.$message.error('加载失败，请稍后重试')
      }
    },

    // 加载图书列表
    // 加载图书列表 - 修复版本
    async loadBooks() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: 100,  // 获取较多数据在前端处理
          orderBy: 'id',
          order: 'desc'
        }

        console.log('🔍 搜索条件:', {
          关键词: this.searchKeyword,
          搜索字段: this.searchField,
          分类: this.categoryFilter,
          仅显示有库存: this.availableOnly
        })

        // 获取所有图书数据
        var res = await bookApi.getBooks(params)
        res = res.data
        if (res.code === 200) {
          let allBooks = []

          // 解析响应格式
          if (Array.isArray(res.data)) {
            allBooks = res.data
          } else if (res.data && Array.isArray(res.data.list)) {
            allBooks = res.data.list
          } else if (res.data && Array.isArray(res.data.content)) {
            allBooks = res.data.content
          } else {
            allBooks = res.data || []
          }

          // 格式化图书数据
          const formattedBooks = allBooks.map(book => {
            // 处理库存字段
            const totalCopies = book.total_copies || book.quantity || book.totalCopies || 0
            const availableCopies = book.available_copies || book.availableCopies || 0

            return {
              id: Number(book.id) || 0,
              title: book.title || '未知书名',
              author: book.author || '未知作者',
              isbn: book.isbn || '',
              category: book.category||'未知分类',
              categoryId: Number(book.category) || 0,
              totalCopies: Number(totalCopies),
              availableCopies: Number(availableCopies),
              publisher: book.publisher || '',
              publishYear: book.publish_year || book.publishYear || '',
              location: book.location || '',
              description: book.description || '',
              coverImage: book.cover_image || book.coverImage || '',
              // 兼容字段
              quantity: Number(totalCopies),
              available: Number(availableCopies) > 0,
              borrowedCount: book.borrowed_count || book.borrowedCount || 0
            }
          })
          console.log(allBooks)
          // **前端搜索逻辑**
          let filteredBooks = [...formattedBooks]

          // 1. 按关键词搜索
          if (this.searchKeyword.trim()) {
            const searchTerm = this.searchKeyword.trim().toLowerCase()

            filteredBooks = filteredBooks.filter(book => {
              if (this.searchField === 'all') {
                // 搜索全部字段
                const title = (book.title || '').toLowerCase()
                const author = (book.author || '').toLowerCase()
                const isbn = (book.isbn || '').toLowerCase()

                return title.includes(searchTerm) ||
                  author.includes(searchTerm) ||
                  isbn.includes(searchTerm)
              } else {
                // 搜索特定字段
                const fieldValue = (book[this.searchField] || '').toString().toLowerCase()
                return fieldValue.includes(searchTerm)
              }
            })

            console.log('🔍 关键词搜索后:', {
              搜索词: searchTerm,
              搜索字段: this.searchField,
              搜索结果数: filteredBooks.length
            })
          }

          // 2. 按分类筛选
          if (this.categoryFilter !== '' && this.categoryFilter !== null) {
            const categoryId = Number(this.categoryFilter)
            filteredBooks = filteredBooks.filter(book =>
              book.categoryId === categoryId
            )
            console.log(`📂 分类筛选 ${categoryId} 后:`, filteredBooks.length)
          }

          // 3. 按库存筛选
          if (this.availableOnly) {
            filteredBooks = filteredBooks.filter(book =>
              book.availableCopies > 0
            )
            console.log('📦 库存筛选后:', filteredBooks.length)
          }

          // 设置总数
          this.total = filteredBooks.length

          // 分页处理
          const start = (this.currentPage - 1) * this.pageSize
          const end = start + this.pageSize
          this.books = filteredBooks.slice(start, end)


          if (filteredBooks.length === 0) {
            this.$message.info('没有找到符合条件的图书')
          }

        } else {
          console.warn('获取图书列表失败:', res.message)
          this.$message.error(res.message || '加载失败')
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

    // 退出登录
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/user/login')
    }
  }
}
</script>

<style scoped>
/* 无标题对话框样式 */
.no-header-dialog .el-dialog__header {
  display: none;
}

.no-header-dialog .el-dialog__body {
  padding: 0 !important;
}

/* 古籍风格样式 */
.user-book-list {
  min-height: 100vh;
  background-image: url('../../assets/image/home2.jpg');
  background-size: 110% 110%;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

/* 顶部导航栏样式 - 与Home.vue和Personal.vue完全一致 */
.user-header {
  background: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
    background-color: white;
  margin: 2px 20px;
}

.logo-img {
  width: 25px;
  height: 25px;
  margin-right: 20px;
  vertical-align: middle;
}

.logo h2 {
  display: inline-block;
  vertical-align: middle;
  color: #7c7262;
  font-size: 28px;
  font-family: "STKaiti", "SimSun", serif;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

/* 激活项底部横条 */
.nav-center .el-menu-item.is-active {
  border-bottom-color: #d4b483 !important;
}

/* 用户信息区域样式 */
.user-info .el-dropdown-link {
  cursor: pointer;
  color: #8b7355;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(250, 248, 245, 0.9);
  border: 1px solid #e8d4b8;
  transition: all 0.3s;
  font-family: "STKaiti", "KaiTi", serif;
}

.user-info .el-dropdown-link:hover {
  background: rgba(247, 243, 236, 0.95);
  border-color: #cbc0b1;
  color: #5b4636;
  box-shadow: 0 2px 8px rgba(155, 135, 110, 0.15);
}

.user-info .el-dropdown-link i {
  margin-right: 6px;
  color: #a7874b;
}

.user-info .el-dropdown-link .el-icon-arrow-down {
  margin-left: 6px;
  font-size: 12px;
  color: #8b7355;
}

.el-dropdown-menu {
  background: #ffffff !important;
  border: 1px solid #f6f1ea !important;
  border-radius: 8px !important;
}

.el-dropdown-menu__item:hover,
.el-dropdown-menu__item.is-hovered {
  background-color: rgba(230, 217, 203, 0.3) !important;
  color: #5b4636 !important;
}

/* 主要内容区 */
.main-content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 古籍风格板块 */
.ancient-section {
  background: linear-gradient(to bottom right,
      rgba(255, 254, 251, 0.9),
      rgba(255, 255, 254, 0.1));
  backdrop-filter: blur(4px);
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(238, 238, 238, 0.6);
  transition: all 0.3s;
}

.ancient-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 搜索和筛选区域 */
.search-filter-area {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 25px;
  border: 1px solid #eddebd;
  backdrop-filter: blur(10px);
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
}

.filter-box {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

/* 古籍风格按钮 */
.ancient-btn {
  background: linear-gradient(to bottom, #e6e2d9, #e6e2d9);
  border: 1px solid #e8d4b8 !important;
  color: #555 !important;
  font-weight: 500;
  border-radius: 6px !important;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s;
  box-shadow: none;
}
.ancient-btn:hover {
  background: linear-gradient(to bottom, #dcd7cd, #dcd7cd);
  color: #333 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  border-color: #d4b483 !important;
}
.ancient-search-btn {
  background: linear-gradient(to bottom, #e6e2d9, #e6e2d9);
  border: 1px solid #e8d4b8 !important;
  color: #555 !important;
  font-weight: 500;
  border-radius: 6px !important;
  cursor: pointer;
  padding: 10px 16px;
  font-size: 14px;
  transition: all 0.3s;
  box-shadow: none;
}

.ancient-search-btn:hover {
  background: linear-gradient(to bottom, #dcd7cd, #dcd7cd);
  color: #333 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  border-color: #d4b483 !important;
}

.ancient-btn.borrow-btn {
  background: linear-gradient(135deg, #a7874b, #8b7355) !important;
  border-color: #8b7355 !important;
  color: white !important;
}

.ancient-btn.borrow-btn:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b) !important;
  border-color: #a7874b !important;
}

.ancient-btn.detail-btn {
  background: #f5f0e6 !important;
  border-color: #e8d4b8 !important;
  color: #5b4636 !important;
}

.ancient-btn.reset-btn {
  background: #f8f0e4 !important;
  border-color: #e8d4b8 !important;
  color: #5b4636 !important;
}

.ancient-btn.disabled-btn {
  background: #f0f0f0 !important;
  border-color: #ddd !important;
  color: #999 !important;
  cursor: not-allowed !important;
}

.ancient-btn.confirm-btn {
  background: linear-gradient(135deg, #a7874b, #8b7355) !important;
  border-color: #8b7355 !important;
  color: white !important;
}

.ancient-btn.cancel-btn {
  background: #f5f0e6 !important;
  border-color: #e8d4b8 !important;
  color: #5b4636 !important;
}

/* 古籍风格标签 */
.ancient-tag {
  background: rgba(250, 248, 245, 0.9) !important;
  border: 1px solid #e8d4b8 !important;
  color: #8b7355 !important;
}

.category-tag {
  background: rgba(232, 212, 184, 0.3) !important;
  color: #5b4636 !important;
}

/* 复选框样式 */
.ancient-checkbox>>>.el-checkbox__inner {
  border-color: #e8d4b8;
  background-color: #fff;
}

.ancient-checkbox>>>.el-checkbox__inner:hover {
  border-color: #d4b483;
}

.ancient-checkbox>>>.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #a7874b;
  border-color: #8b7355;
}

.ancient-checkbox>>>.el-checkbox__label {
  color: #5b4636;

}

/* 图书列表样式 */
.book-list-container {
  background-color: rgba(255, 255, 255, 0.4) important！;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid #eddebd;
  backdrop-filter: blur(10px);
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
  gap: 30px;
}

/* 图书卡片样式 */
.book-card {
  border: 1px solid #e8d4b8;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  background: linear-gradient(to bottom right,
      rgba(255, 254, 251, 0.95),
      rgba(255, 255, 254, 0.1));
  backdrop-filter: blur(4px);
  margin: 15px 20px;

  /* 添加右下侧阴影 */
  box-shadow:
    2px 2px 5px rgba(0, 0, 0, 0.1),
    /* 右下阴影 */
    0 0 1px rgba(0, 0, 0, 0.05);
  /* 轻微四周阴影 */
}

.book-card:hover {
  /* 增强右下阴影，同时保留悬浮效果 */
  box-shadow:
    4px 4px 10px rgba(155, 135, 110, 0.3),
    /* 增强右下阴影 */
    0 0 2px rgba(0, 0, 0, 0.1),
    /* 轻微四周阴影 */
    0 8px 24px rgba(155, 135, 110, 0.2);
  /* 原有悬浮阴影效果 */
  transform: translateY(-4px);
  border-color: #d4b483;
}

.book-cover {
  position: relative;
  height: 180px;
  background: #a7874b;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e8d4b8;
  overflow: hidden;
  /* 确保阴影不会溢出 */
}

.book-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 15px;
  background: linear-gradient(to right,
      rgba(78, 48, 17, 0.2),
      rgba(71, 52, 16, 0.1));
  z-index: 1;
}



/* 书本信息区域 - 内边距调小 */
.book-info {
  padding: 15px 15px 15px 30px;
  /* 上 右 下 左 - 增加左内边距 */
  position: relative;
  z-index: 2;
}

/* 书本标题区域 */
.book-title-wrapper {
  margin-bottom: 12px;
  position: relative;
}

.book-title {
  margin: 0 0 5px 0;
  font-size: 16px;
  /* 字体大小调小 */
  font-weight: bold;
  color: #3c2c1e;
  line-height: 1.4;
  font-family: "STKaiti", "KaiTi", serif;
  text-align: center;
  position: relative;
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 8px;
}

.book-title::before,
.book-title::after {
  content: "「";
  position: absolute;
  color: #a7874b;
  font-size: 18px;
  /* 字体大小调小 */
}

.book-title::before {
  left: 0;
  top: -3px;
}

.book-title::after {
  content: "」";
  right: 0;
  bottom: -3px;
}

/* 标题装饰 */
.title-decoration {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 5px;

}

.decoration-dot {
  width: 5px;
  height: 5px;
  background: #a7874b;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.decoration-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e8d4b8, transparent);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.5;
    transform: scale(0.8);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 作者信息 */
.book-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  padding-bottom: 12px;
  position: relative;
}

.author-icon {
  width: 28px;
  /* 尺寸调小 */
  height: 28px;
  background: linear-gradient(135deg, #f5f0e6, #e8d4b8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5b4636;
  font-size: 14px;
  /* 图标大小调小 */
  flex-shrink: 0;
}

.author-text {
  flex: 1;
  color: #7c7262;
  font-size: 13px;
  /* 字体大小调小 */
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.author-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e8d4b8, transparent);
}

/* 书本元数据网格 */
.book-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  /* 间距调小 */
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  /* 内边距调小 */
  background: rgba(250, 248, 245, 0.8);
  border-radius: 6px;
  border: 1px solid rgba(232, 212, 184, 0.4);
  transition: all 0.2s ease;
}

.meta-item:hover {
  background: rgba(245, 240, 230, 0.9);
  transform: translateY(-1px);
  border-color: #d4b483;
}

.meta-icon {
  width: 22px;
  /* 尺寸调小 */
  height: 22px;
  background: linear-gradient(135deg, #a7874b, #8b7355);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  /* 图标大小调小 */
  flex-shrink: 0;
}

.meta-content {
  flex: 1;
  min-width: 0;
}

.meta-label {
  font-size: 10px;
  /* 字体大小调小 */
  color: #8b7355;
  margin-bottom: 1px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.meta-value {
  font-size: 12px;
  /* 字体大小调小 */
  color: #5b4636;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stock-count.available {
  color: #27ae60;
  font-weight: bold;
}

.stock-count.unavailable {
  color: #e74c3c;
  font-weight: bold;
}

.isbn {
  font-family: monospace;
  font-size: 11px;
  /* 字体大小调小 */
  letter-spacing: 0.3px;
}

/* 操作按钮区域 */
.book-actions {
  margin-top: 15px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  /* 间距调小 */
  margin-bottom: 10px;
}

.action-buttons .el-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 10px !important;
  /* 内边距调小 */
  font-size: 12px !important;
  /* 字体大小调小 */
}

.quick-info-tip {
  text-align: center;
  padding: 6px;
  background: rgba(167, 135, 75, 0.08);
  border-radius: 6px;
  color: #8b7355;
  font-size: 11px;
  /* 字体大小调小 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid rgba(232, 212, 184, 0.3);
}

.quick-info-tip i {
  color: #a7874b;
  font-size: 12px;
}

/* 书本装饰元素 */
.book-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.corner-decor {
  position: absolute;
  width: 16px;
  /* 尺寸调小 */
  height: 16px;
}

.corner-tl {
  top: -1px;
  left: -1px;
  border-top: 2px solid #a7874b;
  border-left: 2px solid #a7874b;
  border-radius: 3px 0 0 0;
}

.corner-tr {
  top: -1px;
  right: -1px;
  border-top: 2px solid #a7874b;
  border-right: 2px solid #a7874b;
  border-radius: 0 3px 0 0;
}

.corner-bl {
  bottom: -1px;
  left: -1px;
  border-bottom: 2px solid #a7874b;
  border-left: 2px solid #a7874b;
  border-radius: 0 0 0 3px;
}

.corner-br {
  bottom: -1px;
  right: -1px;
  border-bottom: 2px solid #a7874b;
  border-right: 2px solid #a7874b;
  border-radius: 0 0 3px 0;
}






.ancient-cover {
  background: linear-gradient(135deg, #d6c3a0, #c6ae90) !important;
}

.cover-placeholder {
  color: white;
  font-size: 32px;
  font-weight: bold;
  padding-left: 8px;
  font-family: "STKaiti", "KaiTi", serif;


}

.out-of-stock {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(245, 108, 108, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}


.book-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: bold;
  color: #5b4636;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: "STKaiti", "KaiTi", serif;
}

.book-author,
.book-category {
  margin-bottom: 10px;
  color: #8b7355;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.book-author i,
.book-meta .meta-item i {
  margin-right: 8px;
  color: #a7874b;
}

.book-meta {
  margin: 15px 0;
  font-size: 13px;
  color: #7c7262;
}

.meta-item {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.book-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 10px;
}

.book-actions .el-button {
  flex: 1;
}

/* 分页 - 与BookManagement完全一致 */
.pagination {
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 使用更具体的选择器来覆盖默认样式 */
.ancient-pagination .el-pagination.is-background .btn-prev,
.ancient-pagination .el-pagination.is-background .btn-next,
.ancient-pagination .el-pagination.is-background .el-pager li {
  background: #f5f0e6 !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
  transition: all 0.3s !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif !important;
}

.ancient-pagination .el-pagination.is-background .btn-prev:hover,
.ancient-pagination .el-pagination.is-background .btn-next:hover,
.ancient-pagination .el-pagination.is-background .el-pager li:hover {
  background: #e8dbc9 !important;
  border-color: #d4b483 !important;
  color: #5b4636 !important;
}

.ancient-pagination .el-pagination.is-background .el-pager li.active {
  background: #8b7355 !important;
  border-color: #8b7355 !important;
  color: white !important;
}

/* 覆盖默认的蓝色焦点/活动状态 */
.ancient-pagination .el-pagination.is-background .el-pager li.active:hover {
  background: #8b7355 !important;
  border-color: #8b7355 !important;
  color: white !important;
}

/* 特别确保第一页和第二页的样式 */
.ancient-pagination .el-pagination.is-background .el-pager li.number:hover,
.ancient-pagination .el-pagination.is-background .el-pager li.number.active {
  background: #8b7355 !important;
  border-color: #8b7355 !important;
  color: white !important;
}

/* 分页样式 - 全局生效 */
.pagination {
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.ancient-pagination .el-pagination.is-background .btn-prev,
.ancient-pagination .el-pagination.is-background .btn-next,
.ancient-pagination .el-pagination.is-background .el-pager li {
  background: #f5f0e6 !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
  transition: all 0.3s !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif !important;
  border-radius: 4px !important;
}

.ancient-pagination .el-pagination.is-background .btn-prev:hover,
.ancient-pagination .el-pagination.is-background .btn-next:hover,
.ancient-pagination .el-pagination.is-background .el-pager li:hover {
  background: #e8dbc9 !important;
  border-color: #d4b483 !important;
  color: #5b4636 !important;
}

.pagination>>>.el-pagination.is-background .btn-prev,
.pagination>>>.el-pagination.is-background .btn-next,
.pagination>>>.el-pagination.is-background .el-pager li {
  background: #ffffff !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
  transition: all 0.3s !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif !important;
  border-radius: 4px !important;
}

/* 悬停效果 */
.pagination>>>.el-pagination.is-background .btn-prev:hover,
.pagination>>>.el-pagination.is-background .btn-next:hover,
.pagination>>>.el-pagination.is-background .el-pager li:hover {
  background: #f8f1e7 !important;
  border-color: #ddc29b !important;
  color: #5b4636 !important;
  transform: translateY(-1px);
}

/* 当前选中页数 */
.pagination>>>.el-pagination.is-background .el-pager li.active {
  background: #b49877 !important;
  border-color: #8b7355 !important;
  color: white !important;
  font-weight: bold;
}



/* 禁用按钮的样式 */
.pagination>>>.el-pagination.is-background .btn-prev.disabled,
.pagination>>>.el-pagination.is-background .btn-next.disabled {
  background: #f5f0e6 !important;
  border-color: #e8d4b8 !important;
  color: #c0c4cc !important;
  cursor: not-allowed;
}

/* 分页文字信息 */
.pagination>>>.el-pagination__total,
.pagination>>>.el-pagination__jump {
  color: #5b4636 !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif !important;
}

/* 页码输入框 */
.pagination>>>.el-pagination__editor.el-input .el-input__inner {
  border: 1px solid #e8d4b8 !important;
  background: #ffffff !important;
  color: #5b4636 !important;
  border-radius: 4px !important;
}

/* 古籍风格对话框样式 */
.ancient-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
  font-family: "STKaiti", "KaiTi", serif !important;
}

.ancient-dialog .el-dialog__header {
  background: linear-gradient(135deg, #a7874b, #8b7355);
  padding: 20px !important;
}

.ancient-dialog .el-dialog__title {
  color: white !important;
  font-family: "STKaiti", "KaiTi", serif !important;
  font-size: 20px !important;
  font-weight: bold !important;
}

.ancient-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white !important;
  font-size: 20px !important;
}

.ancient-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #f0e6d3 !important;
}

.ancient-dialog .el-dialog__body {
  padding: 0 !important;
  background: linear-gradient(to bottom right, rgba(255, 254, 251, 0.95), rgba(255, 255, 254, 0.1));
}

/* 借阅提示样式 */
.borrow-tip {
  text-align: center;
  padding: 30px 20px;
}

.borrow-tip p {
  margin: 15px 0;
  font-size: 16px;
  color: #5b4636;
}

.tip-note {
  font-size: 14px;
  color: #8b7355;
  margin-top: 20px;
  font-style: italic;
}

.dialog-footer {
  text-align: center;
  padding: 10px 20px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-header {
    padding: 0 15px;
  }

  .logo {
    margin: 2px 10px;
  }

  .logo h2 {
    font-size: 20px;
  }

  .main-content {
    padding: 0 15px;
  }

  .search-filter-area {
    padding: 20px 15px;
  }

  .filter-box {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-box>* {
    margin-bottom: 10px;
  }

  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }

  .ancient-section {
    padding: 20px 15px;
  }
}

@media (max-width: 480px) {
  .logo h2 {
    font-size: 18px;
  }

  .nav-center .el-menu-item {
    padding: 0 8px;
    font-size: 13px;
  }

  .user-info .el-dropdown-link {
    padding: 6px 10px;
    font-size: 13px;
  }

  .book-grid {
    grid-template-columns: 1fr;
  }

  .book-cover {
    height: 150px;
  }

  .cover-placeholder {
    font-size: 28px;
  }
}
</style>