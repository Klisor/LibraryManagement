<template>
  <div class="user-home">
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="user-header">
        <div class="header-content">
          <div class="logo">
            <h2>📚 图书管理系统</h2>
          </div>
          <div class="nav-center">
            <el-menu
              mode="horizontal"
              :default-active="activeNav"
              @select="handleNavSelect"
            >
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
      
      <!-- 主内容区 -->
      <el-main class="user-main">
        <div class="welcome-section">
          <h1>欢迎回来，{{ user.username }}！</h1>
          <p>尽情探索图书馆的宝藏吧</p>
        </div>
        
        <!-- 搜索栏 -->
        <div class="search-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索图书、作者、ISBN..."
            class="search-input"
            @keyup.enter.native="handleSearch"
          >
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
          <div class="search-tips">
            <span>试试搜索：</span>
            <el-tag
              v-for="tag in searchTips"
              :key="tag"
              size="small"
              @click="searchQuery = tag; handleSearch()"
              style="margin-left: 5px; cursor: pointer;"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        
        <!-- 分类快捷入口 -->
        <div class="categories-section">
          <h3>📁 图书分类</h3>
          <el-row :gutter="20">
            <el-col
              :span="4"
              v-for="category in categories"
              :key="category.id"
            >
              <div class="category-item" @click="handleCategoryClick(category.id)">
                <div class="category-icon" :style="{ backgroundColor: category.color }">
                  <i :class="category.icon"></i>
                </div>
                <p>{{ category.name }}</p>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <!-- 热门图书 -->
        <div class="hot-books-section">
          <h3>🔥 热门借阅</h3>
          <el-row :gutter="20">
            <el-col
              :span="6"
              v-for="book in hotBooks"
              :key="book.id"
            >
              <el-card class="book-card" shadow="hover">
                <div class="book-cover">
                  <i class="el-icon-notebook-2"></i>
                </div>
                <div class="book-info">
                  <h4>{{ book.title }}</h4>
                  <p class="author">{{ book.author }}</p>
                  <div class="book-meta">
                    <span class="category">{{ book.category }}</span>
                    <span class="available">{{ book.available }} 本可借</span>
                  </div>
                  <el-button
                    type="primary"
                    size="small"
                    @click="viewBookDetail(book.id)"
                    style="margin-top: 10px;"
                  >
                    查看详情
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        
        <!-- 快速入口 -->
        <div class="quick-actions">
          <h3>⚡ 快速入口</h3>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="action-item" @click="$router.push('/user/books')">
                <div class="action-icon" style="background: #409eff;">
                  <i class="el-icon-search"></i>
                </div>
                <p>查找图书</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="action-item" @click="$router.push('/user/borrow')">
                <div class="action-icon" style="background: #67c23a;">
                  <i class="el-icon-collection"></i>
                </div>
                <p>我的借阅</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="action-item" @click="$router.push('/user/personal')">
                <div class="action-icon" style="background: #e6a23c;">
                  <i class="el-icon-user"></i>
                </div>
                <p>个人中心</p>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="action-item" @click="$router.push('/user/personal')">
                <div class="action-icon" style="background: #9c27b0;">
                  <i class="el-icon-edit"></i>
                </div>
                <p>我的笔记</p>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'UserHome',
  data() {
    return {
      activeNav: 'home',
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      searchQuery: '',
      searchTips: ['红楼梦', '三国演义', '编程', '历史', '科学'],
      
      // 分类数据
      categories: [
        { id: 1, name: '文学', icon: 'el-icon-reading', color: '#ff6b6b' },
        { id: 2, name: '历史', icon: 'el-icon-time', color: '#48dbfb' },
        { id: 3, name: '科学', icon: 'el-icon-set-up', color: '#1dd1a1' },
        { id: 4, name: '技术', icon: 'el-icon-cpu', color: '#feca57' },
        { id: 5, name: '教育', icon: 'el-icon-school', color: '#ff9ff3' },
        { id: 6, name: '艺术', icon: 'el-icon-picture', color: '#f368e0' }
      ],
      
      // 热门图书数据
      hotBooks: [
        { id: 1, title: '红楼梦', author: '曹雪芹', category: '文学', available: 3 },
        { id: 2, title: '三国演义', author: '罗贯中', category: '文学', available: 1 },
        { id: 3, title: 'JavaScript高级程序设计', author: 'Nicholas C. Zakas', category: '技术', available: 5 },
        { id: 4, title: '人类简史', author: '尤瓦尔·赫拉利', category: '历史', available: 2 }
      ]
    }
  },
  mounted() {
    // 检查是否登录
    if (!this.user.id || this.user.role !== 'USER') {
      this.$router.push('/user/login')
    }
    // 设置当前激活的导航项
    this.setActiveNavFromRoute()
  },
  watch: {
    '$route'(to) {
      this.setActiveNavFromRoute()
    }
  },
  methods: {
    setActiveNavFromRoute() {
      const path = this.$route.path
      if (path === '/user') {
        this.activeNav = 'home'
      } else if (path === '/user/books') {
        this.activeNav = 'books'
      } else if (path === '/user/borrow') {
        this.activeNav = 'borrow'
      } else if (path === '/user/personal') {
        this.activeNav = 'personal'
      }
    },
    
    handleNavSelect(index) {
    this.activeNav = index
    // 根据不同的index跳转到对应的路由
    switch (index) {
      case 'home':
        // 如果已经在首页，不需要跳转
        if (this.$route.path !== '/user') {
          this.$router.push('/user')
        }
        break
      case 'books':
        this.$router.push('/user/books')
        break
      case 'borrow':
        this.$router.push('/user/borrow')  // 修改这里，实际跳转
        break
      case 'personal':
        this.$router.push('/user/personal')  // 修改这里，实际跳转
        break
      default:
        break
    }
  },
    
    handleCommand(command) {
      if (command === 'logout') {
        this.logout()
      } else if (command === 'profile') {
        this.$router.push('/user/personal')
      } else if (command === 'notes') {
        this.$router.push('/user/personal')
        // 个人中心页面打开时会显示笔记部分
      }
    },
    
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/user/login')
    },
    
    handleSearch() {
      if (this.searchQuery.trim()) {
        // 这里可以跳转到图书列表页面并传递搜索关键词
        this.$router.push({
          path: '/user/books',
          query: { q: this.searchQuery.trim() }
        })
      }
    },
    
    handleCategoryClick(categoryId) {
      // 跳转到图书列表页面并筛选该分类
      this.$router.push({
        path: '/user/books',
        query: { category: categoryId }
      })
    },
    
    viewBookDetail(bookId) {
      // 这里可以跳转到图书详情页面，暂时先提示
      this.$message.info(`查看图书ID: ${bookId} 的详情（功能开发中）`)
    }
  }
}
</script>

<style scoped>
.user-home {
  height: 100vh;
}

.user-header {
  background: white;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo h2 {
  margin: 0;
  color: #409eff;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.user-info .el-dropdown-link {
  cursor: pointer;
  color: #409eff;
  display: flex;
  align-items: center;
}

.user-info .el-dropdown-link i {
  margin-right: 5px;
}

.user-main {
  background: #f5f7fa;
  padding: 30px 50px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-section h1 {
  font-size: 36px;
  margin-bottom: 10px;
  color: #303133;
}

.welcome-section p {
  font-size: 18px;
  color: #909399;
}

.search-section {
  background: white;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 40px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.search-input {
  max-width: 600px;
  margin: 0 auto;
}

.search-tips {
  margin-top: 15px;
  color: #909399;
  font-size: 14px;
}

.categories-section,
.hot-books-section,
.quick-actions {
  background: white;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 40px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.categories-section h3,
.hot-books-section h3,
.quick-actions h3 {
  margin-bottom: 20px;
  color: #303133;
}

.category-item {
  text-align: center;
  cursor: pointer;
  padding: 20px 10px;
  border-radius: 8px;
  transition: all 0.3s;
}

.category-item:hover {
  background: #f5f7fa;
  transform: translateY(-5px);
}

.category-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
  font-size: 24px;
}

.category-item p {
  margin: 0;
  color: #606266;
  font-weight: 500;
}

.book-card {
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.book-cover {
  width: 80px;
  height: 100px;
  background: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.book-cover i {
  font-size: 40px;
  color: #409eff;
}

.book-info h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-info .author {
  color: #909399;
  margin: 0 0 10px 0;
  font-size: 14px;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.book-meta .category {
  color: #409eff;
}

.book-meta .available {
  color: #67c23a;
}

.action-item {
  text-align: center;
  cursor: pointer;
  padding: 25px 10px;
  border-radius: 8px;
  transition: all 0.3s;
}

.action-item:hover {
  background: #f5f7fa;
  transform: translateY(-5px);
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
  font-size: 24px;
}

.action-item p {
  margin: 0;
  color: #606266;
  font-weight: 500;
}
</style>