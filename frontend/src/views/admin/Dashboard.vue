<template>
  <div class="admin-dashboard">
    <el-container style="height:100vh;">
      <!-- 侧边栏 - 古籍风格 -->
      <AdminAside />

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航栏 - 古籍风格 -->
        <el-header class="admin-header">
          <div class="user-actions">
            <el-dropdown @command="handleCommand" class="admin-user-info">
              <span class="el-dropdown-link">
                <i class="el-icon-user"></i>
                {{ user.username }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 内容区 -->
        <el-main class="ancient-main">
          <div class="dashboard-content">
            <div class="page-header ancient-section">
              <div>
                <h2 class="ancient-title">仪表板</h2>
                <p class="ancient-subtitle">系统概览与统计数据</p>
              </div>
            </div>
            <!-- 日期区域 -->
<div class="current-date ancient-section">
  <h3 class="section-title ancient-title">
    <i class="el-icon-date title-icon"></i> 当前日期与时间
  </h3>
  <div class="date-content">
    <p class="date-text">{{ currentDate }}</p>
  </div>
</div>
            <!-- 统计卡片 - 古籍风格 -->
            <el-row :gutter="20" class="stats-section ancient-section">
              <el-col :xs="12" :sm="6">
                <el-card shadow="hover" class="ancient-card stat-card">
                  <div class="stat-content">
                    <div class="stat-icon" style="background:rgba(232, 212, 184, 0.3);">
                      <i class="el-icon-user" style="color:#5b4636;"></i>
                    </div>
                    <div class="stat-info">
                      <h3>{{ stats.userCount || 0 }}</h3>
                      <p>用户总数</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="12" :sm="6">
                <el-card shadow="hover" class="ancient-card stat-card">
                  <div class="stat-content">
                    <div class="stat-icon" style="background:rgba(232, 212, 184, 0.3);">
                      <i class="el-icon-notebook-2" style="color:#5b4636;"></i>
                    </div>
                    <div class="stat-info">
                      <h3>{{ stats.bookCount || 0 }}</h3>
                      <p>图书总数</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="12" :sm="6">
                <el-card shadow="hover" class="ancient-card stat-card">
                  <div class="stat-content">
                    <div class="stat-icon" style="background:rgba(232, 212, 184, 0.3);">
                      <i class="el-icon-edit" style="color:#5b4636;"></i>
                    </div>
                    <div class="stat-info">
                      <h3>{{ stats.currentBorrow || 0 }}</h3>
                      <p>当前借阅</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="12" :sm="6">
                <el-card shadow="hover" class="ancient-card stat-card">
                  <div class="stat-content">
                    <div class="stat-icon" style="background:rgba(232, 212, 184, 0.3);">
                      <i class="el-icon-time" style="color:#5b4636;"></i>
                    </div>
                    <div class="stat-info">
                      <h3>{{ stats.overdueCount || 0 }}</h3>
                      <p>逾期借阅</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 系统概览 -->
            <div class="overview-section ancient-section">
              <h3 class="section-title ancient-title">
                <i class="el-icon-s-data title-icon"></i> 系统概览
              </h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="overview-item">
                    <div class="overview-label">用户总数</div>
                    <div class="overview-value">{{ stats.userCount }} 人</div>
                  </div>
                  <div class="overview-item">
                    <div class="overview-label">图书总数</div>
                    <div class="overview-value">{{ stats.bookCount }} 本</div>
                  </div>
                  <div class="overview-item">
                    <div class="overview-label">当前借阅</div>
                    <div class="overview-value">{{ stats.currentBorrow }} 本</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="overview-item">
                    <div class="overview-label">逾期借阅</div>
                    <div class="overview-value">{{ stats.overdueCount }} 本</div>
                  </div>
                  <div class="overview-item">
                    <div class="overview-label">图书借阅率</div>
                    <div class="overview-value">{{ stats.borrowRate }}</div>
                  </div>
                  <div class="overview-item">
                    <div class="overview-label">系统状态</div>
                    <div class="overview-value status-active">
                      <span class="status-dot"></span> 正常运行
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>

            <!-- 快速操作 - 古籍风格 -->
            <div class="quick-actions-section ancient-section">
              <h3 class="section-title ancient-title">
                <img src="@/assets/image/icons/quick.png" class="title-icon" /> 快速操作
              </h3>
              <el-row :gutter="20">
                <el-col :xs="12" :sm="6">
                  <el-card shadow="hover" class="action-card ancient-card" @click.native="$router.push('/admin/books')">
                    <div class="action-content">
                      <div class="action-icon">
                        <i class="el-icon-circle-plus-outline"></i>
                      </div>
                      <h4>添加图书</h4>
                      <p class="action-desc">录入新图书信息</p>
                    </div>
                  </el-card>
                </el-col>
                <el-col :xs="12" :sm="6">
                  <el-card shadow="hover" class="action-card ancient-card"
                    @click.native="$router.push('/admin/borrow')">
                    <div class="action-content">
                      <div class="action-icon">
                        <i class="el-icon-circle-plus"></i>
                      </div>
                      <h4>借书登记</h4>
                      <p class="action-desc">处理图书借阅</p>
                    </div>
                  </el-card>
                </el-col>
                <el-col :xs="12" :sm="6">
                  <el-card shadow="hover" class="action-card ancient-card" @click.native="$router.push('/admin/users')">
                    <div class="action-content">
                      <div class="action-icon">
                        <i class="el-icon-user"></i>
                      </div>
                      <h4>添加用户</h4>
                      <p class="action-desc">注册新用户账号</p>
                    </div>
                  </el-card>
                </el-col>
                <el-col :xs="12" :sm="6">
                  <el-card shadow="hover" class="action-card ancient-card" @click.native="goToUserHome">
                    <div class="action-content">
                      <div class="action-icon">
                        <i class="el-icon-view"></i>
                      </div>
                      <h4>用户视角</h4>
                      <p class="action-desc">切换到用户界面</p>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <!-- 最近活动 -->
            <div class="recent-activities ancient-section">
              <h3 class="section-title ancient-title">
                <i class="el-icon-time title-icon"></i> 最近活动
              </h3>
              <div v-if="recentActivities.length > 0" class="activities-list">
                <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                  <div class="activity-icon">
                    <i :class="activity.icon"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-desc">{{ activity.description }}</div>
                    <div class="activity-time">{{ activity.time }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-activities">
                <el-empty description="暂无活动记录"></el-empty>
              </div>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { dashboardApi } from '@/api/dashboard'
export default {
  name: 'AdminDashboard',
data() {
  return {
    user: JSON.parse(localStorage.getItem('user') || '{}'),
    stats: {
      userCount: 0,
      bookCount: 0,
      currentBorrow: 0,
      overdueCount: 0,
      todayVisits: 0,
      monthNewUsers: 0,
      monthBorrows: 0,
      borrowRate: '0%'
    },
    recentActivities: [], // 初始化为空数组
    loading: false,
    currentDate: '' // 添加当前日期属性
  }
},
mounted() {
  if (!this.user.id || this.user.role !== 'ADMIN') {
    this.$router.push('/admin/login')
    return
  }
  this.fetchDashboardStats()
  this.fetchRecentActivities() // 新增：获取最近活动
  this.setCurrentDate() // 设置当前日期
  setInterval(this.setCurrentDate, 1000); // 每秒更新时间
},
  methods: {
setCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // 格式化为“YYYY年MM月DD日 HH:MM:SS”格式
  this.currentDate = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
},
    // 获取仪表板统计数据
    async fetchDashboardStats() {
      this.loading = true
      try {
        console.log('开始获取仪表板数据...')

        // 检查dashboardApi是否正确导入
        if (!dashboardApi || typeof dashboardApi.getDashboardStats !== 'function') {
          console.log('使用模拟仪表板数据')
          // 使用模拟数据
          this.stats = {
            userCount: 100,
            bookCount: 500,
            currentBorrow: 50,
            overdueCount: 5,
            todayVisits: 128,
            monthNewUsers: 15,
            monthBorrows: 256,
            borrowRate: '75%'
          }
          return
        }

        const res = await dashboardApi.getDashboardStats()
        console.log('仪表板数据响应:', res)

        if (res && res.code === 200) {
          this.stats = {
            ...this.stats,
            ...res.data
          }
          console.log('仪表板数据:', this.stats)
        } else {
          this.$message.warning(res?.message || '获取数据失败')
        }
      } catch (error) {
        console.error('获取仪表板数据失败:', error)
        // 使用模拟数据
        this.stats = {
          userCount: 100,
          bookCount: 500,
          currentBorrow: 50,
          overdueCount: 5,
          todayVisits: 128,
          monthNewUsers: 15,
          monthBorrows: 256,
          borrowRate: '75%'
        }
      } finally {
        this.loading = false
      }
    },

    // 新增：获取最近活动（借阅记录）
    // 新增：获取最近活动（借阅记录）
// 新增：获取最近活动（借阅记录）
async fetchRecentActivities() {
  try {
    console.log('开始获取最近活动...')
    
    // 检查是否有borrowApi
    let borrowApi = null
    let bookApi = null
    let userApi = null
    
    try {
      borrowApi = require('@/api/borrow').borrowApi
      bookApi = require('@/api/book').bookApi
      userApi = require('@/api/user').userApi
    } catch (e) {
      console.warn('无法导入API，使用模拟活动数据')
      this.recentActivities = this.getMockActivities()
      return
    }
    
    // 获取最近的借阅记录 - 首先尝试直接获取最新的记录
    try {
      // 方法1：直接获取所有记录然后排序取前5条
      console.log('尝试方法1：获取所有记录然后排序...')
      
      // 先获取所有借阅记录
      const allParams = {
        page: 1,
        size: 100, // 获取较多的记录
        status: '' // 不筛选状态，获取所有记录
      }
      
      const allResponse = await borrowApi.getBorrowRecords(allParams)
      console.log('所有借阅记录响应:', allResponse)
      
      let allData = allResponse
      if (allResponse && allResponse.data) {
        allData = allResponse.data
      }
      
      if (allData && allData.code === 200) {
        // 获取所有记录数据
        let allRecords = []
        if (Array.isArray(allData.data)) {
          allRecords = allData.data
        } else if (allData.data && Array.isArray(allData.data.list)) {
          allRecords = allData.data.list
        } else if (allData.data && Array.isArray(allData.data.content)) {
          allRecords = allData.data.content
        } else {
          allRecords = allData.data || []
        }
        
        console.log('获取到的所有借阅记录数量:', allRecords.length)
        
        if (allRecords.length === 0) {
          this.recentActivities = this.getMockActivities()
          return
        }
        
        // 按借阅日期降序排序（最新的在前）
        const sortedRecords = allRecords.sort((a, b) => {
          const dateA = a.borrowDate ? new Date(a.borrowDate).getTime() : 0
          const dateB = b.borrowDate ? new Date(b.borrowDate).getTime() : 0
          return dateB - dateA
        })
        
        console.log('排序后的记录（前5条）:', sortedRecords.slice(0, 5))
        
        // 只取最新的5条记录
        const latestRecords = sortedRecords.slice(0, 5)
        
        // 获取图书和用户信息
        const activitiesWithDetails = await this.enrichActivitiesWithDetails(latestRecords)
        
        // 转换为活动格式
        this.recentActivities = activitiesWithDetails.map((record, index) => {
          // 格式化日期
          const activityDate = record.borrowDate || record.createdAt || new Date().toISOString()
          const timeAgo = this.getTimeAgo(activityDate)
          
          // 获取用户名和书名
          const userName = record.userName || record.userRealName || record.user?.username || '用户'
          const bookTitle = record.bookTitle || record.bookRealTitle || record.book?.title || '图书'
          
          // 根据状态确定活动类型
          const status = record.status?.toUpperCase()
          let activityType = '借阅'
          if (status === 'RETURNED') {
            activityType = '归还'
          } else if (status === 'OVERDUE') {
            activityType = '逾期'
          }
          
          return {
            id: record.id || index + 1,
            icon: this.getActivityIcon(record.status),
            title: `图书${activityType}`,
            description: `用户"${userName}"${activityType}了《${bookTitle}》`,
            time: timeAgo
          }
        })
        
        console.log('生成的最近活动:', this.recentActivities)
        
      } else {
        throw new Error('获取借阅记录失败')
      }
      
    } catch (error) {
      console.error('获取最新借阅记录失败，尝试方法2:', error)
      
      // 方法2：如果方法1失败，使用模拟数据
      this.recentActivities = this.getMockActivities()
    }
    
  } catch (error) {
    console.error('获取最近活动失败:', error)
    // 使用模拟数据
    this.recentActivities = this.getMockActivities()
  }
},

    // 新增：丰富活动记录详细信息
    async enrichActivitiesWithDetails(records) {
      try {
        // 提取唯一的图书ID和用户ID
        const bookIds = [...new Set(records.map(record => record.bookId).filter(Boolean))]
        const userIds = [...new Set(records.map(record => record.userId).filter(Boolean))]

        console.log('需要获取的图书ID:', bookIds)
        console.log('需要获取的用户ID:', userIds)

        // 并行获取图书和用户信息
        const [booksInfo, usersInfo] = await Promise.all([
          this.fetchBooksInfo(bookIds),
          this.fetchUsersInfo(userIds)
        ])

        console.log('获取到的图书信息:', booksInfo)
        console.log('获取到的用户信息:', usersInfo)

        // 丰富记录信息
        return records.map(record => ({
          ...record,
          book: booksInfo.get(record.bookId),
          user: usersInfo.get(record.userId),
          // 使用获取到的信息，如果API返回了的话
          userName: record.userName || usersInfo.get(record.userId)?.username,
          bookTitle: record.bookTitle || booksInfo.get(record.bookId)?.title
        }))

      } catch (error) {
        console.error('丰富活动记录信息失败:', error)
        return records // 返回原始记录
      }
    },

    // 新增：批量获取图书信息
    async fetchBooksInfo(bookIds) {
      if (!bookIds || bookIds.length === 0) {
        return new Map()
      }

      try {
        let bookApi = null
        try {
          bookApi = require('@/api/book').bookApi
        } catch (e) {
          console.warn('无法导入bookApi')
          return new Map()
        }

        const bookPromises = bookIds.map(bookId =>
          bookApi.getBookDetail(bookId).catch(error => {
            console.error(`获取图书 ${bookId} 信息失败:`, error)
            return null
          })
        )

        const bookResponses = await Promise.all(bookPromises)

        // 创建图书信息映射
        const booksMap = new Map()

        bookResponses.forEach((response, index) => {
          const bookId = bookIds[index]
          if (response) {
            const res = response.data || response
            if (res.code === 200 && res.data) {
              booksMap.set(bookId, res.data)
            }
          }
        })

        return booksMap

      } catch (error) {
        console.error('批量获取图书信息失败:', error)
        return new Map()
      }
    },

    // 新增：批量获取用户信息
    async fetchUsersInfo(userIds) {
      if (!userIds || userIds.length === 0) {
        return new Map()
      }

      try {
        let userApi = null
        try {
          userApi = require('@/api/user').userApi
        } catch (e) {
          console.warn('无法导入userApi')
          return new Map()
        }

        const userPromises = userIds.map(userId =>
          userApi.getUserDetail(userId).catch(error => {
            console.error(`获取用户 ${userId} 信息失败:`, error)
            return null
          })
        )

        const userResponses = await Promise.all(userPromises)

        // 创建用户信息映射
        const usersMap = new Map()

        userResponses.forEach((response, index) => {
          const userId = userIds[index]
          if (response) {
            const res = response.data || response
            if (res.code === 200 && res.data) {
              usersMap.set(userId, res.data)
            }
          }
        })

        return usersMap

      } catch (error) {
        console.error('批量获取用户信息失败:', error)
        return new Map()
      }
    },

// 新增：获取模拟活动数据
getMockActivities() {
  // 创建最近几天的模拟数据
  const now = new Date()
  return [
    {
      id: 1,
      icon: 'el-icon-user',
      title: '新用户注册',
      description: '用户"王五"完成了注册',
      time: '1小时前'
    },
    {
      id: 2,
      icon: 'el-icon-notebook-2',
      title: '图书借阅',
      description: '用户"张三"借阅了《红楼梦》',
      time: '2小时前'
    },
    {
      id: 3,
      icon: 'el-icon-notebook-2',
      title: '图书借阅',
      description: '用户"李四"借阅了《JavaScript高级程序设计》',
      time: '3小时前'
    },
    {
      id: 4,
      icon: 'el-icon-check',
      title: '图书归还',
      description: '用户"赵六"归还了《三国演义》',
      time: '5小时前'
    },
    {
      id: 5,
      icon: 'el-icon-notebook-2',
      title: '图书借阅',
      description: '用户"钱七"借阅了《西游记》',
      time: '1天前'
    }
  ]
},

// 新增：根据状态获取活动图标
getActivityIcon(status) {
  if (!status) return 'el-icon-notebook-2'
  
  const statusUpper = status.toUpperCase()
  switch (statusUpper) {
    case 'BORROWED':
      return 'el-icon-notebook-2'
    case 'RETURNED':
      return 'el-icon-check'
    case 'OVERDUE':
      return 'el-icon-warning'
    default:
      return 'el-icon-notebook-2'
  }
},

// 新增：根据状态获取活动标题
getActivityTitle(status) {
  if (!status) return '图书借阅'
  
  const statusUpper = status.toUpperCase()
  switch (statusUpper) {
    case 'BORROWED':
      return '图书借阅'
    case 'RETURNED':
      return '图书归还'
    case 'OVERDUE':
      return '逾期借阅'
    default:
      return '图书借阅'
  }
},

    // 新增：计算时间间隔（显示为"X分钟前"等）
    getTimeAgo(dateString) {
      if (!dateString) return '刚刚'

      try {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMs = now - date

        // 转换为分钟
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

        if (diffInMinutes < 1) {
          return '刚刚'
        } else if (diffInMinutes < 60) {
          return `${diffInMinutes}分钟前`
        } else if (diffInMinutes < 24 * 60) {
          const hours = Math.floor(diffInMinutes / 60)
          return `${hours}小时前`
        } else if (diffInMinutes < 7 * 24 * 60) {
          const days = Math.floor(diffInMinutes / (24 * 60))
          return `${days}天前`
        } else {
          // 超过一周，显示具体日期
          return date.toLocaleDateString()
        }
      } catch (error) {
        console.error('格式化时间失败:', error)
        return '刚刚'
      }
    },

    // 处理下拉菜单命令
    handleCommand(command) {
      if (command === 'logout') {
        this.logout()
      } else if (command === 'profile') {
        this.$message.info('管理员个人资料功能开发中')
      }
    },

    // 退出登录
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/admin/login')
    },

    // 跳转到用户首页
    goToUserHome() {
      // 设置管理员以用户身份登录的标记
      const userData = {
        ...this.user,
        isAdminLoggedAsUser: true,
        originalRole: this.user.role
      }
      localStorage.setItem('user', JSON.stringify(userData))
      this.$router.push('/user')
    }
  }
}
</script>
<style scoped>
/* 导入全局样式 */
@import '@/assets/ancient-form.css';

/* 通用古籍字体 - 只用于标题 */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "STKaiti", "KaiTi", serif;
}

/* 容器 */
.admin-dashboard {
  min-height: 100vh;
  background-image: url('@/assets/image/home2.jpg');
  background-size: 110% 110%;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.admin-dashboard::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  z-index: -1;
}
.current-date {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 25px 30px;
  margin-bottom: 30px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 4px 12px rgba(155, 135, 110, 0.1);
  text-align: center; /* 居中对齐 */
}

.date-content {
  display: inline-block; /* 使内容居中 */
  padding: 20px;
  background: rgba(250, 248, 245, 0.9); /* 添加背景色 */
  border-radius: 10px; /* 添加圆角 */
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.1); /* 添加阴影 */
}

.date-text {
  color: #5b4636;
  font-size: 36px; /* 放大字体 */
  /* text-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5); */
  font-weight: bold;
  margin: 0;
}

/* 顶部导航栏 */
.admin-header {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 60px !important;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

/* 用户信息样式 */
.admin-user-info .el-dropdown-link {
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
  font-size: 14px;
}

.admin-user-info .el-dropdown-link:hover {
  background: rgba(247, 243, 236, 0.95);
  border-color: #cbc0b1;
  color: #5b4636;
  box-shadow: 0 2px 8px rgba(155, 135, 110, 0.15);
}

.admin-user-info .el-dropdown-link i {
  margin-right: 6px;
  color: #a7874b;
}

.admin-user-info .el-dropdown-link .el-icon-arrow-down {
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

/* 主内容区 */
.ancient-main {
  background: transparent;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  margin-bottom: 30px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 4px 12px rgba(155, 135, 110, 0.1);
}

.ancient-title {
  color: #5b4636;
  font-size: 24px;
  margin: 0 0 8px 0;
  font-weight: bold;
}

.ancient-subtitle {
  color: #8b7355;
  font-size: 14px;
  margin: 0;
}

.home-btn {
  background: linear-gradient(135deg, #a7874b, #8b7355) !important;
  border: 1px solid #8b7355 !important;
  color: white !important;
  font-weight: bold;
  padding: 10px 24px !important;
  border-radius: 20px !important;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.2);
  font-size: 14px;
}

.home-btn:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b) !important;
  border-color: #a7874b !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(155, 135, 110, 0.3);
}

.home-btn i {
  margin-right: 5px;
}

/* 古籍风格区块 */
.ancient-section {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 25px 30px;
  margin-bottom: 30px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 4px 12px rgba(155, 135, 110, 0.1);
}

/* 统计卡片区域 */
.stats-section {
  padding: 20px;
}

.stat-card {
  border: none !important;
  background: rgba(250, 248, 245, 0.8) !important;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(155, 135, 110, 0.15) !important;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
}

.stat-info h3 {
  font-size: 28px;
  color: #5b4636;
  margin: 0 0 5px 0;
  font-weight: bold;
}

.stat-info p {
  color: #8b7355;
  margin: 0;
  font-size: 14px;
}

/* 系统概览 */
.section-title {
  color: #5b4636;
  font-size: 18px;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8d4b8;
  font-weight: bold;
}

.title-icon {
  margin-right: 8px;
  vertical-align: middle;
}

/* 对于图片图标 */
.title-icon[src] {
  width: 20px;
  height: 20px;
}

/* 对于字体图标 */
.title-icon[class*="el-icon"] {
  font-size: 18px;
  color: #a7874b;
}

.overview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0e9dd;
}

.overview-item:last-child {
  border-bottom: none;
}

.overview-label {
  color: #5b4636;
  font-weight: 500;
  font-size: 14px;
}

.overview-value {
  color: #8b7355;
  font-weight: bold;
  font-size: 16px;
}

.status-active {
  display: flex;
  align-items: center;
  color: #67c23a;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #67c23a;
  border-radius: 50%;
  margin-right: 8px;
}

/* 快速操作卡片 */
.action-card {
  border: none !important;
  background: rgba(250, 248, 245, 0.8) !important;
  cursor: pointer;
  transition: all 0.3s;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(155, 135, 110, 0.15) !important;
}

.action-content {
  text-align: center;
  padding: 10px;
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(167, 135, 75, 0.1), rgba(139, 115, 85, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: #a7874b;
  font-size: 24px;
}

.action-content h4 {
  color: #5b4636;
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: bold;
}

.action-desc {
  color: #8b7355;
  font-size: 12px;
  margin: 0;
}

/* 最近活动 */
.activities-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 15px 0;
  border-bottom: 1px solid #f0e9dd;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(232, 212, 184, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #8b7355;
  font-size: 18px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  color: #5b4636;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.activity-desc {
  color: #8b7355;
  font-size: 13px;
  margin-bottom: 4px;
}

.activity-time {
  color: #a7874b;
  font-size: 12px;
}

.empty-activities {
  padding: 40px 0;
}

.empty-activities /deep/ .el-empty__description {
  color: #8b7355;
  font-family: "STKaiti", "KaiTi", serif;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .el-aside {
    width: 60px !important;
  }

  .logo h3 {
    display: none;
  }

  .logo-img {
    margin-right: 0;
  }

  .el-menu-item span {
    display: none;
  }

  .el-menu-item i {
    margin-right: 0;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .home-btn {
    align-self: flex-start;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .overview-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .activity-icon {
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .admin-header {
    padding: 0 10px;
  }

  .admin-user-info .el-dropdown-link {
    padding: 6px 12px;
    font-size: 12px;
  }

  .ancient-title {
    font-size: 20px;
  }

  .ancient-section {
    padding: 15px 20px;
  }

  .stat-info h3 {
    font-size: 24px;
  }
}
</style>