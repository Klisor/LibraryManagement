<template>
  <div class="user-home">
    <el-container>
      <!-- 顶部导航栏 -->
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

          <AIAssistant />



      <div class="slFKQVlX disable-webp">
        <div class="wNX1MZuj">
          <img class="hIvrEdxx">

          <!-- 搜索框部分 -->
          <div class="IKPXWm_8">
            <div class="welcome-section">
              <h1>欢迎回来，{{ user.username }}！</h1>
              <p>尽情探索图书馆的宝藏吧</p>
            </div>
            <form class="semi-form kSyqFRia semi-form-vertical" id="35160b49-f6c4-4cfe-81c6-7453920959f8"
              x-form-id="35160b49-f6c4-4cfe-81c6-7453920959f8" @submit.prevent="handleSearch">
              <div class="X9lCp15V">
                <div class="JAuiogAS n439QfWC semi-form-field-pure">
                  <div class="semi-input-wrapper semi-input-wrapper-default">
                    <input v-model="searchQuery" class="semi-input semi-input-default" type="text"
                      placeholder="请输入要搜索的关键词" @keyup.enter="handleSearch" />

                  </div>
                  <div class="input-dropdown"></div>
                </div>
                <button type="button" class="V5wen4wu CTWhp47D GTFHg9Ol fNe2_IRG" @click="handleSearch">

                  <span class="O1hWWe9w">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32"
                      class="Qwo9sXRF">
                      <path fill="currentColor" fill-rule="evenodd"
                        d="M20.335 19.266a.5.5 0 0 1 .707 0l5.934 5.934a.5.5 0 0 1 0 .707l-.702.702a.5.5 0 0 1-.707 0l-5.934-5.934a.5.5 0 0 1 0-.707z"
                        clip-rule="evenodd"></path>
                      <path fill="currentColor" fill-rule="evenodd"
                        d="M14.5 22a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15m0 2a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19"
                        clip-rule="evenodd"></path>
                    </svg>
                  </span>
                </button>
              </div>
            </form>
            <div class="mTIbklVa ODjeRK12">
              <div class="VvxsT2hZ">
                <div class="V_FmhMa2"></div>
                <div class="ee4b6Yrr"></div>
                <div class="rjxXKT6M"></div>
              </div>
              <a href="javascript:void(0)" @click.prevent="handleNavSelect('books')">
                收录海量图书，查看书库
              </a>

              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 13 13">
                <path fill="currentColor" fill-rule="evenodd"
                  d="M7.896 6.31a.29.29 0 0 1 0 .403l-3.273 3.36a.44.44 0 0 0 0 .61l.196.202c.165.168.43.168.595 0l3.963-4.069a.44.44 0 0 0 0-.61L5.414 2.138a.413.413 0 0 0-.595 0l-.196.201a.44.44 0 0 0 0 .61z"
                  clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>

          <!-- 书籍展示区 -->
          <div class="YKQ3LT_P">
            <div class="KDOKcfQs">
              <!-- 浮动层十本固定书 -->
              <div v-for="book in fixedBooks" :key="book.id" class="iIhTKzCY"
                :style="{ left: book.left, bottom: book.bottom, width: book.width }">
                <div class="bgfMilo8">
                  <div class="gYFmLLOg">
                    <img class="tdDhe7yH" :src="book.img" :alt="book.title" style="opacity: 1;">
                  </div>
                </div>
                <a class="IFvYEVEc" href="javascript:void(0);" @click.prevent="viewBookDetail(book.id)">
                  <div class="ZUvnlOV7">
                    <div class="St9YxCSU">
                      <p class="oMYw9cis">{{ book.title }}</p>
                      <p class="aYZxtXZE">{{ book.desc }}</p>
                    </div>
                    <div class="eboJaEjs">
                      <span class="WKL3Tr8N">查看详情
                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" fill="none" viewBox="0 0 8 12"
                          class="FvGggq9s">
                          <path fill="currentColor" fill-opacity="0.8"
                            d="M5.1 5.649h2.232c0 .125-.07.197-.272.357C4.978 7.66 3.362 9.26 1.461 10.86a.8.8 0 0 1-.51.185H.775a.2.2 0 0 1-.15-.332z">
                          </path>
                          <path fill="currentColor" fill-opacity="0.8"
                            d="M5.1 5.65h2.232c0-.127-.07-.198-.272-.359C4.978 3.638 3.362 2.038 1.461.44a.8.8 0 0 0-.51-.186H.775a.2.2 0 0 0-.15.333z">
                          </path>
                          <path fill="currentColor" fill-opacity="0.8"
                            d="M4.79 5.612c0 .545-.67 1.074-.821 1.325l1.285-1.325z"></path>
                          <path fill="currentColor" fill-opacity="0.8"
                            d="M4.79 5.68c0-.545-.67-1.074-.821-1.325L5.254 5.68z"></path>
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <!-- 书名标签 -->
              <h3 v-for="book in fixedBooks" :key="'label-' + book.id" class="PMzLrNnp"
                :style="{ left: book.labelLeft, top: book.labelTop }">
                {{ book.title }}
              </h3>
            </div>

            <!-- 图书详情弹窗 -->
            <book-detail v-if="showDetail" :book-id="currentBookId" @close="showDetail = false" />
          </div>
        </div>
      </div>


      <!-- 主内容区 -->
      <el-main class="user-main ancient-main">
        <div class="main-layout">
          <!-- 左侧分类 -->
          <div class="left-panel">
            <div class="categories-section ancient-section">
              <h3 class="ancient-title">
                <img src="../../assets/image/icons/category.png" class="title-icon" /> 图书分类
              </h3>
              <div class="category-list">
                <div v-for="(category, index) in categories" :key="category.id" class="category-item-wrapper">
                  <div class="category-item ancient-item" :class="{ 'left': index % 2 === 0, 'right': index % 2 === 1 }"
                    @click="handleCategoryClick(category.id)">
                    <div class="category-icon ancient-icon">
                      <i :class="category.icon"></i>
                    </div>
                    <p>{{ category.name }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <!-- 右侧 -->
          <div class="right-panel">
            <!-- 热门借阅 -->
            <div class="hot-books-section ancient-section">
              <h3 class="ancient-title">
                <img src="../../assets/image/icons/hot.png" class="title-icon" /> 热门借阅
              </h3>

              <!-- 加载状态 -->
              <div v-if="hotBooksLoading" class="loading-container">
                <el-skeleton :rows="2" animated />
              </div>

              <!-- 有数据时显示 -->
              <div v-else-if="hotBooks.length > 0">
                <el-row :gutter="20" type="flex" justify="start">
                  <el-col :xs="12" :sm="6" v-for="book in hotBooks" :key="book.id">
                    <el-card class="book-card ancient-card" shadow="hover">
                      <div class="book-cover ancient-cover">
                        <i class="el-icon-notebook-2"></i>
                      </div>
                      <div class="book-info">
                        <h4>{{ book.title }}</h4>
                        <p class="author">{{ book.author }}</p>
                        <div class="book-meta">
                          <span class="category">{{ book.category }}</span>
                          <span class="available">{{ book.available }} 本可借</span>
                        </div>
                        <el-button type="primary" size="small" class="ancient-btn" @click="viewBookDetail(book.id)">
                          查看详情
                        </el-button>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>

              <!-- 无数据时显示 -->
              <div v-else class="empty-container">
                <el-empty description="暂无热门图书"></el-empty>
              </div>
            </div>
            <!-- 快速入口 -->
            <div class="quick-actions ancient-section">
              <h3 class="ancient-title">
                <img src="../../assets/image/icons/quick.png" class="title-icon" /> 快速入口
              </h3>
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="action-item ancient-item" @click="$router.push('/user/books')">
                    <div class="action-icon ancient-icon">
                      <i class="el-icon-search"></i>
                    </div>
                    <p>查找图书</p>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="action-item ancient-item" @click="$router.push('/user/borrow')">
                    <div class="action-icon ancient-icon">
                      <i class="el-icon-collection"></i>
                    </div>
                    <p>我的借阅</p>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="action-item ancient-item" @click="$router.push('/user/personal')">
                    <div class="action-icon ancient-icon">
                      <i class="el-icon-user"></i>
                    </div>
                    <p>个人中心</p>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </el-main>

    </el-container>
  </div>
</template>

<script>
import { bookApi } from '@/api/book'
import BookDetail from '@/components/BookDetail.vue'
export default {
  name: 'UserHome',
  components: { 
    BookDetail
   },
  data() {
    return {
      activeNav: 'home',
      searchQuery: '',
      searchTips: ['红楼梦', '三国演义', 'JavaScript', '历史', '人类'],


      hotBooks: [],
      hotBooksLoading: false, // 新增：加载状态
      // 分类数据
      categories: [
        { id: 1, name: '文学', icon: 'el-icon-reading', color: '#ff6b6b' },
        { id: 2, name: '科技', icon: 'el-icon-cpu', color: '#1dd1a1' },
        { id: 3, name: '历史', icon: 'el-icon-time', color: '#48dbfb' },
        { id: 4, name: '哲学', icon: 'el-icon-thumb', color: '#9c88ff' },
        { id: 5, name: '艺术', icon: 'el-icon-picture', color: '#f368e0' },
        { id: 6, name: '教育', icon: 'el-icon-school', color: '#ff9ff3' }
      ],
      fixedBooks: [
        { id: 1, title: '《罪与罚》', desc: '[俄] 陀思妥耶夫斯基 著 · 西方文学经典之作，心理描写的巅峰', img: require('../../assets/image/books/1.jpg'), left: '51%', bottom: '-10%', width: '8%', labelLeft: '53%', labelTop: '116%' },
        { id: 2, title: '《白鲸》', desc: '[美] 赫尔曼·梅尔维尔 著 · 美国文学经典，人与自然的史诗对决', img: require('../../assets/image/books/2.jpg'), left: '25.5%', bottom: '-6%', width: '7%', labelLeft: '27%', labelTop: '112%' },
        { id: 3, title: '《德米安：彷徨少年时》', desc: '[德] 埃米尔·辛克莱 著 · 探讨个人成长的经典文本', img: require('../../assets/image/books/3.jpg'), left: '67.2%', bottom: '1%', width: '6.5%', labelLeft: '66%', labelTop: '104%' },
        { id: 4, title: '《奥德赛》', desc: '[古希腊] 荷马 著 · 古希腊史诗，西方文学的奠基之作', img: require('../../assets/image/books/4.jpg'), left: '15.8%', bottom: '16%', width: '5.8%', labelLeft: '16.3%', labelTop: '88%' },
        { id: 5, title: '《变形记》', desc: '[奥地利] 弗兰茨·卡夫卡 著 · 现代主义文学代表作，荒诞派的先驱', img: require('../../assets/image/books/5.jpg'), left: '36.3%', bottom: '24%', width: '4%', labelLeft: '36%', labelTop: '79%' },
        { id: 6, title: '《呼啸山庄》', desc: '[英] 艾米莉·勃朗特 著 · 英国文学经典，哥特式爱情的典范', img: require('../../assets/image/books/6.jpg'), left: '58.5%', bottom: '30%', width: '4.5%', labelLeft: '58%', labelTop: '73.7%' },
        { id: 7, title: '《红楼梦》', desc: '[清] 曹雪芹 著 · 中国古典文学巅峰之作，四大名著之首', img: require('../../assets/image/books/7.jpg'), left: '79.6%', bottom: '23%', width: '5.8%', labelLeft: '80.3%', labelTop: '81%' },
        { id: 8, title: '《堂·吉诃德》', desc: '[西] 米格尔·德·塞万提斯 著 · 西班牙文学巨著，现代小说的开山之作', img: require('../../assets/image/books/8.jpg'), left: '24%', bottom: '36%', width: '3.6%', labelLeft: '23%', labelTop: '67%' },
        { id: 9, title: '《浮士德》', desc: '[德] 约翰·沃尔夫冈·冯·歌德 著 · 德国文学巅峰，探索人性与永恒的巨著', img: require('../../assets/image/books/9.jpg'), left: '44%', bottom: '39%', width: '3.4%', labelLeft: '43.5%', labelTop: '64%' },
        { id: 10, title: '《地狱变》', desc: '[日] 芥川龙之介 著 · 日本近代文学名篇，对艺术与人性深刻的探讨', img: require('../../assets/image/books/10.jpg'), left: '68.5%', bottom: '42%', width: '3.6%', labelLeft: '68%', labelTop: '62%' }
      ],
      showDetail: false,
      currentBookId: null,

      // 热门图书数据（初始为空，通过fetchHotBooks获取）
      hotBooks: [],
      // 添加本地用户状态
      localUser: JSON.parse(localStorage.getItem('user') || '{}')
    }
  },
  computed: {
    // 使用计算属性来获取用户信息，确保实时更新
    user() {
      return this.localUser
    }
  },
  mounted() {
    // 检查是否登录 - 允许普通用户和管理员
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      this.$router.push('/user/login')
      return
    }

    // 检查用户权限 - 允许普通用户和管理员访问（重要修改）
    if (user.role !== 'USER' && user.role !== 'ADMIN') {
      this.$message.warning('请以用户或管理员身份登录')
      this.$router.push('/user/login')
      return
    }

    // 设置当前激活的导航项
    this.setActiveNavFromRoute()

    // 监听 storage 事件
    window.addEventListener('storage', this.handleStorageChange)

    // 监听自定义事件
    if (window.eventBus) {
      window.eventBus.$on('user-info-updated', (userData) => {
        this.localUser = userData
      })
    }

    // 获取热门图书数据
    this.fetchHotBooks()
  },
  beforeDestroy() {
    // 清理事件监听器
    window.removeEventListener('storage', this.handleStorageChange)

    if (window.eventBus) {
      window.eventBus.$off('user-info-updated')
    }
  },
  watch: {
    '$route'(to) {
      this.setActiveNavFromRoute()
    },
    // 监听路由变化，当从个人中心返回首页时，更新用户信息
    '$route.path'(newPath) {
      if (newPath === '/user') {
        this.refreshUserInfo()
      }
    }
  },
  methods: {

    // 处理快速搜索
    handleQuickSearch(keyword) {
      // 检查keyword是否是分类名称
      const categoryMap = {
        '文学': 1,
        '历史': 2,
        '科学': 3,
        '技术': 4,
        '教育': 5,
        '艺术': 6,
        '商业': 7,
        '健康': 8,
        '旅行': 9,
        '其他': 10
      }

      // 如果是分类名，跳转到分类筛选
      if (categoryMap[keyword]) {
        this.handleCategoryClick(categoryMap[keyword])
      } else {
        // 否则执行关键词搜索
        this.searchQuery = keyword
        this.handleSearch()
      }
    },

    // 新增方法：获取热门图书
    async fetchHotBooks() {
      this.hotBooksLoading = true
      try {
        console.log('开始获取热门图书...')

        // 尝试调用API获取图书列表
        let response
        try {
          // 调用API获取图书列表，按借阅次数或其他热门指标排序
          response = await bookApi.getBooks({
            page: 1,
            size: 8, // 获取8本，确保有足够的选择
            availableOnly: true
          })

          console.log('热门图书API响应:', response)
        } catch (apiError) {
          console.error('调用图书API失败:', apiError)
          // 使用模拟数据
          this.useMockHotBooks()
          return
        }

        // 处理响应数据
        const res = response.data || response

        if (res && res.code === 200) {
          let books = []

          // 解析图书列表数据
          if (res.data && Array.isArray(res.data.list)) {
            books = res.data.list
          } else if (Array.isArray(res.data)) {
            books = res.data
          } else if (res.data && Array.isArray(res.data.content)) {
            books = res.data.content
          } else {
            books = res.data || []
          }

          console.log('获取到的图书列表:', books)

          if (books.length === 0) {
            // 如果没有数据，使用模拟数据
            this.useMockHotBooks()
            return
          }

          // 筛选出有库存的图书，并按某种规则排序（比如库存少的热门，或者随机）
          const availableBooks = books.filter(book =>
            (book.availableCopies || book.available || book.stock || 0) > 0
          )

          // 随机选择4本作为热门图书
          const randomBooks = [...availableBooks]
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)

          // 转换为需要的格式
          this.hotBooks = randomBooks.map(book => ({
            id: book.id || 0,
            title: book.title || '未知图书',
            author: book.author || '未知作者',
            category: this.getCategoryName(book.category || book.categoryCode || book.type || '其他'),
            available: book.availableCopies || book.available || book.stock || 0
          }))

          console.log('热门图书数据:', this.hotBooks)

        } else {
          // API返回错误，使用模拟数据
          this.useMockHotBooks()
        }
      } catch (error) {
        console.error('获取热门图书失败:', error)
        // 使用模拟数据
        this.useMockHotBooks()
      } finally {
        this.hotBooksLoading = false
      }
    },

    // 新增辅助方法：获取分类名称
    getCategoryName(categoryCode) {
      const categoryMap = {
        1: '文学',
        2: '历史',
        3: '科学',
        4: '技术',
        5: '教育',
        6: '艺术',
        7: '商业',
        8: '健康',
        9: '旅行',
        10: '其他'
      }
      return categoryMap[categoryCode] || '其他'
    },

    // 处理 localStorage 变化
    handleStorageChange(event) {
      if (event.key === 'user') {
        try {
          this.localUser = JSON.parse(event.newValue || '{}')
        } catch (e) {
          console.error('解析用户信息失败:', e)
        }
      } else if (event.key === 'books') {
        // 图书数据发生变化，重新获取热门图书
        this.fetchHotBooks()
      }
    },
    // 刷新用户信息
    refreshUserInfo() {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          this.localUser = JSON.parse(userStr)
        }
      } catch (e) {
        console.error('刷新用户信息失败:', e)
      }
    },
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

    handleQuickSearch(keyword) {
      // 检查keyword是否是分类名称
      const categoryMap = {
        '文学': 1,
        '历史': 2,
        '科学': 3,
        '技术': 4,
        '教育': 5,
        '艺术': 6,
        '商业': 7,
        '健康': 8,
        '旅行': 9,
        '其他': 10
      }

      // 如果是分类名，跳转到分类筛选
      if (categoryMap[keyword]) {
        this.handleCategoryClick(categoryMap[keyword])
      } else {
        // 否则执行关键词搜索
        this.searchQuery = keyword
        this.handleSearch()
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
        // 跳转到图书列表页面并传递搜索关键词
        this.$router.push({
          path: '/user/books',
          query: {
            q: this.searchQuery.trim(),
            field: 'all'  // 传递搜索字段
          }
        })
      }
    },

    handleCategoryClick(categoryId) {
      // 跳转到图书列表页面并筛选该分类
      this.$router.push({
        path: '/user/books',
        query: {
          category: categoryId
        }
      })
    },

    viewBookDetail(bookId) {
      // 使用BookDetail组件显示详情
      this.$router.push({
        path: '/user/books',
        query: { bookId: bookId }
      })
    }
  }
}
</script>

<style scoped>
/* 识典古籍首页样式 */
.L_uDaI4Z {
  position: relative;
  width: 100%;
  height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.slFKQVlX {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none !important;
}

.IKPXWm_8,
.IKPXWm_8 * {
  pointer-events: auto !important;
}

.YKQ3LT_P {
  pointer-events: none !important;
}

.IKPXWm_8,
.KDOKcfQs,
.iIhTKzCY,
.iIhTKzCY *,
input,
button {
  pointer-events: auto !important;
}

.ao13gLXJ {
  pointer-events: none !important;
}


/* 修改背景容器的高度，包含搜索框和书籍部分 */
.slFKQVlX.disable-webp {
  width: 100%;
  /* 增加高度以包含搜索框 */
  height: 1200px;
  /* 从700px增加到800px */
  position: relative;
  overflow: hidden;
}

.wNX1MZuj {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 背景图片样式 */
.hIvrEdxx {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
  pointer-events: none !important;

  background-image: url('../../assets/image/home.jpg');
  background-size: 100% 100%;
  /* 拉伸图片以完全填充容器，可能会变形 */
  background-position: center;
  background-repeat: no-repeat;
}

/* 搜索框容器样式 - 重新定位 */
.IKPXWm_8 {
  position: absolute;
  top: 30vh;
  left: 50%;
  /* 水平居中 */
  transform: translate(-50%, -50%);
  /* 精确居中 */
  z-index: 99;
  /* 确保在背景之上 */
  text-align: center;
  padding: 30px 20px;
  max-width: 800px;
  width: 90%;
  /* 添加半透明背景让内容更清晰 */
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* 标题样式 */
.yt3Z9uBn {
  font-size: 40px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  letter-spacing: 2px;
}

/* 表单样式 */
.semi-form {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 20px;
}

.X9lCp15V {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.JAuiogAS.n439QfWC {
  flex: 1;
}

.semi-input-wrapper {
  position: relative;
}

.semi-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  font-size: 16px;
  border: none;
  outline: none;
  background: transparent;
}

.semi-input::placeholder {
  color: #999;
}

.V5wen4wu {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #ecd9b3;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  transition: background-color 0.3s;
}

.V5wen4wu:hover {
  background: #d0bfaa;
}

.pp0ti3uC {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #d0bfaa;
  cursor: pointer;
  padding: 0 16px;
  font-size: 14px;
}

.pp0ti3uC:hover {
  color: #d0bfaa;
}

/* 书籍数量信息样式 */
.mTIbklVa {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
  color: #666;
  font-size: 14px;
}

.mTIbklVa a {
  color: #c09867;
  text-decoration: none;
}

.mTIbklVa a:hover {
  text-decoration: underline;
}

.VvxsT2hZ {
  display: flex;
  gap: 2px;
}

.V_FmhMa2,
.ee4b6Yrr,
.rjxXKT6M {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #666;
}

/* 动态古籍展示区样式 */
/* 书籍展示区样式 - 调整位置 */
.YKQ3LT_P {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 600px;
  /* 固定高度，或者使用 min-height */
  pointer-events: auto;
  z-index: 30;
  /* 确保在搜索框下方 */
}

/* 确保书籍部分在搜索框下面 */
.KDOKcfQs {
  position: relative;
  width: 100%;
  height: 100%;
  margin-top: 200px;
  /* 为搜索框留出空间 */
}



.iIhTKzCY {
  position: absolute;
  pointer-events: auto;
  /* 确保可以交互 */
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 31;
  cursor: pointer;
  /* 添加手型光标 */
  transform-origin: center bottom;
}


.iIhTKzCY:hover {
  transform: translateY(-15px) scale(1.05);
  z-index: 100;
}

.iIhTKzCY:hover .gYFmLLOg {
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.25);
}

.bgfMilo8 {
  position: relative;
  width: 100%;
  padding-bottom: 140%;
}

.gYFmLLOg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2.5px 2px rgba(0, 0, 0, 0.3);
  background: white;
}

.tdDhe7yH {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s;
}

.IFvYEVEc {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 40;
}

/* 悬停时显示弹出框 */
.iIhTKzCY:hover .IFvYEVEc {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.ZUvnlOV7 {
  position: absolute;
  top: calc(100% + 15px);
  bottom: auto;
  left: 50%;
  width: 280px;
  background: linear-gradient(rgb(255, 254, 252),
      rgb(255, 254, 252, 0.9));
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  transform: translateX(-50%) translateY(-10px);
  opacity: 0;
  transition: all 0.3s ease 0.1s, filter 0.3s ease;
  z-index: 40;
  color: white;
  /* 白色文字 */
}

/* 悬停显示并增强亮度 */
.iIhTKzCY:hover .ZUvnlOV7 {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  filter: brightness(1.1);
  /* 略微提亮 */
}


/* 弹出框三角形指示器 */
.ZUvnlOV7::before {
  content: '';
  position: absolute;
  top: -8px;
  bottom: auto;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px;
  border-style: solid;
  border-color: white transparent transparent transparent;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}


.St9YxCSU {
  margin-bottom: 12px;
}

.oMYw9cis {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.3;
  text-align: center;
}

.aYZxtXZE {
  font-size: 15px;
  color: #424242;
  line-height: 1.5;
  margin: 0;
}

.eboJaEjs {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.WKL3Tr8N {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #a7874b;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.WKL3Tr8N:hover {
  color: #5f4c28;
  text-decoration: underline;
}

.PMzLrNnp {
  position: absolute;
  font-size: 14px;
  font-weight: bold;
  color: rgb(87, 87, 87);

  margin: 0;
  white-space: nowrap;
  pointer-events: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .slFKQVlX.disable-webp {
    height: 900px;
    /* 移动端增加高度 */
  }

  .IKPXWm_8 {
    padding: 30px 15px;
    width: 95%;
  }

  .yt3Z9uBn {
    font-size: 48px;
  }

  .X9lCp15V {
    flex-direction: column;
    padding: 0;
    background: none;
    box-shadow: none;
  }

  .JAuiogAS.n439QfWC {
    width: 100%;
    background: white;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .KDOKcfQs {
    margin-top: 250px;
    /* 移动端增加留白 */
  }

  .pp0ti3uC {
    padding: 0;
  }

  .iIhTKzCY {
    width: 60px !important;
  }

  .ZUvnlOV7 {
    width: 200px;
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (max-width: 480px) {
  .yt3Z9uBn {
    font-size: 36px;
  }

  .IKPXWm_8 {
    padding: 20px 10px;
  }
}


p,
h1,
h2 {
  font-family: "STKaiti", "KaiTi", serif;
}



.user-home {
  height: 100vh;
}

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
  margin: 2px 20px;
}

.logo-img {
  width: 25px;
  /* 根据你的图标调整 */
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
  /* 深棕色，与古籍风格一致 */
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(250, 248, 245, 0.9);
  /* 半透明米白背景 */
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
  /* 图标使用金色 */
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


.user-main {

  background-image: url('../../assets/image/home2.jpg') !important;

  background-size: 110% 110% !important;
  background-position: center;
  background-repeat: no-repeat;
  background: #f9f4ee;
  /* 淡米色背景，仿古纸张感 */
  padding: 30px 50px;
  font-family: "Songti SC", "SimSun", serif;
  /* 宋体/仿宋风格 */
}

.quick-actions.ancient-section {
  /* 添加以下属性 */
  background: rgba(255, 254, 253, 0.6);
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-section h1 {
  font-size: 36px;
  margin-bottom: 10px;
  color: #665032;
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
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
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

/* 主布局 */
.main-layout {
  display: flex;
  gap: 30px;
}

/* 左侧分类固定宽度 */
/* 左侧面板 */
.left-panel {
  width: 280px;
  /* 可根据需求调整 */
  padding-right: 20px;
  box-sizing: border-box;
}

/* 分类整体样式 */
.categories-section.ancient-section {
  padding: 20px;

}

/* 分类项左右交替排列 */
.category-item.ancient-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 1px 10px;
  background: #faf8f5;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* 上下间距 */
}

.category-item-wrapper {
  display: flex;
}

.category-item.left {
  margin-right: auto;
  border-radius: 16px;
  /* 更圆角 */
}

.category-item.right {
  margin-left: auto;
  border-radius: 16px;
  /* 更圆角 */
}

/* 默认悬停效果 */
.category-item.ancient-item:hover {
  background: #f2f0ec;
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

/* 左边（奇数项）悬停往右移动 */
.category-item.ancient-item.left:hover {
  transform: translateX(20px);
  /* 往右 */
}

/* 右边（偶数项）悬停往左移动 */
.category-item.ancient-item.right:hover {
  transform: translateX(-20px);
  /* 往左 */
}

/* 偶数项左右反转（可选视觉效果） */
.category-item.ancient-item.reverse,
.category-item.ancient-item:nth-child(even) {
  flex-direction: row-reverse;
}

/* 分类图标 */
.category-icon.ancient-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #888;
  background: #fffffe;
  box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.03);
}

/* 分类文字 */
.category-item p {
  margin: 0;
  color: #555;
  font-weight: 500;
  font-family: "STKaiti", "KaiTi", serif;
}


/* 右侧自适应宽度，纵向布局热门借阅 + 快速入口 */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 调整热门借阅卡片为两列，更紧凑 */
.hot-books-section .el-row {
  display: flex;
  flex-wrap: wrap;
}

.hot-books-section .ancient-card {
  height: 260px;
  /* 缩小卡片高度 */
  padding: 10px;
}

.hot-books-section .ancient-cover {
  width: 70px;
  height: 80px;
  font-size: 26px;
  margin: auto;
}


.hot-books-section .book-info h4 {
  font-size: 14px;
  margin-bottom: 4px;
}

.hot-books-section .book-info .author {
  font-size: 12px;
  margin-bottom: 6px;
}

.hot-books-section .book-meta .category,
.hot-books-section .book-meta .available {
  font-size: 11px;
}

.hot-books-section .ancient-btn {
  padding: 6px 12px;
  font-size: 13px;
}

/* 保证四列不换行 */
.hot-books-section .el-row {
  flex-wrap: nowrap;
  overflow-x: auto;
  /* 屏幕过窄可滚动 */
}

.hot-books-section .el-col {
  margin-bottom: 20px;
}

.categories-section,
.hot-books-section,
.quick-actions {
  background: #fff8f0;
  /* 仿古纸张色 */
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 40px;
  box-shadow: 0 4px 12px rgba(155, 135, 110, 0.3);
  /* 暖色阴影 */
}


.categories-section h3,
.hot-books-section h3,
.quick-actions h3 {
  margin-bottom: 20px;
  color: #5b4636;
  /* 深棕色，更古典 */
  font-family: "FZKai-Z03S", "KaiTi", serif;
  /* 楷体效果 */
  border-bottom: 2px solid #e8cca4;
  /* 底部浅棕色横线 */
  padding-bottom: 5px;
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

.ancient-main {
  background: #f9f7f3;
  /* 淡米色背景 */
  font-family: "PingFang SC", "Microsoft YaHei", "STKaiti", "KaiTi", serif;
  color: #555;
  /* 中灰文字 */
  padding: 30px 50px;
}

/* 卡片区域背景 */
.ancient-section {
  background: linear-gradient(to bottom right,
      rgba(255, 254, 251, 0.9),
      rgba(255, 255, 254, 0.1));
  /* 淡米白渐变，半透明 */
  backdrop-filter: blur(4px);
  /* 背景轻微模糊，增加层次感 */
  padding: 50px;
  border-radius: 10px;
  margin-bottom: 40px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(238, 238, 238, 0.6);
  /* 半透明边框 */
  position: relative;
  transition: all 0.3s;
}

.ancient-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}


/* 板块标题 */
.ancient-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #3c3c3c;
  font-weight: 600;
  position: relative;
  border-bottom: 1px solid #ddd;
  padding-bottom: 6px;
  font-family: "STKaiti", "KaiTi", serif;
}

.ancient-title::after {
  content: "卍";
  position: absolute;
  right: 0;
  color: #bbb;
  font-size: 16px;
  font-weight: normal;
}

.title-icon {
  width: 25px;
  height: 25px;
  margin-right: 6px;
  margin-bottom: 6px;
  vertical-align: middle;
}


/* 分类 & 快捷入口 */
.ancient-item {
  text-align: center;
  cursor: pointer;
  padding: 20px 10px;
  border-radius: 10px;
  transition: all 0.3s;
  background: #faf8f5;
  border: 1px solid #eee;
}

.ancient-item:hover {
  background: #f2f0ec;
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.ancient-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 24px;
  color: #888;
  background: #eee;
  box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.05);
}

/* 图书卡片 */
.ancient-card {
  background: #fefcf9;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid #eee;
  transition: all 0.3s;
}

.ancient-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.ancient-cover {
  width: 80px;
  height: 70px;
  background: #f5f3ef;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.03);
}

.ancient-cover i {
  font-size: 36px;
  color: #aaa;
}

.book-info h4 {
  font-size: 16px;
  color: #333;
  margin: 0 0 8px 0;
  font-family: "STKaiti", "KaiTi", serif;
}

.book-info .author {
  color: #777;
  margin: 0 0 10px 0;
}

.book-meta .category,
.book-meta .available {
  color: #999;
  font-size: 12px;
}

/* 按钮淡雅风格 */
.ancient-btn {
  background: linear-gradient(to bottom, #e6e2d9, #e6e2d9);
  /* 单色渐变 */
  border: none;
  color: #555;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  padding: 8px 16px;
  /* 默认更大 */
  font-size: 14px;
  /* 字体更大 */
  transition: all 0.3s;
  box-shadow: none;
  /* 默认无阴影 */
  transform: translateY(8px);
  /* 默认轻微下移 */
}

.ancient-btn:hover {
  background: linear-gradient(to bottom, #dcd7cd, #dcd7cd);
  /* 悬停色 */
  color: #333;
  transform: translateY(4px) scale(1.03);
  /* 悬停上移并放大 5% */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  /* 柔和阴影 */
}



/* 快速入口文字 */
.action-item p {
  color: #555;
  font-weight: 500;
}

/* 快速入口圆形风格 */
/* 修改快速入口圆形区域背景和边框 */
.quick-actions .action-item.ancient-item {
  background: rgba(250, 248, 245, 0.85) !important;
  backdrop-filter: blur(10px);
  box-shadow:
    0 8px 32px rgba(155, 135, 110, 0.15),
    0 4px 8px rgba(155, 135, 110, 0.08),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(245, 229, 209, 0.5) !important;
}

.quick-actions .action-item.ancient-item:hover {
  background: rgba(245, 240, 230, 0.9) !important;
  border-color: rgba(212, 180, 131, 0.7) !important;
}

/* 修改快速入口图标样式 */
.quick-actions .action-icon.ancient-icon {
  background: linear-gradient(135deg, #f5f0e6, #e8d4b8) !important;
  border: 1px solid #e8d4b8 !important;
  color: #a7874b !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.quick-actions .action-item.ancient-item:hover .action-icon.ancient-icon {
  background: linear-gradient(135deg, #e8d4b8, #d4b483) !important;
  color: #8b7355 !important;
  border-color: #d4b483 !important;
}

.quick-actions .action-icon.ancient-icon {
  width: 50px;
  height: 50px;
  font-size: 24px;
  margin-bottom: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.03);
}

.quick-actions p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  text-align: center;
}


/* hover 效果统一淡雅 */
.action-item:hover,
.category-item:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

/* 图标背景淡雅 */
.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 24px;
  color: #666;
  background: #eee;
  box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.03);
}
.book-card {
  z-index: 1;
}
.ai-assistant {
  z-index: 10000;
}
</style>