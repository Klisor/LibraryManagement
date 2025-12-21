<template>
  <div class="admin-dashboard">
    <el-container style="height:100vh;">
      <!-- 侧边栏 - 古籍风格 -->
      <el-aside width="200px">
        <div class="logo">
          <img src="@/assets/image/icons/book1.png" alt="图书管理系统" class="logo-img">
          <h3>知行书阁（后台）</h3>
        </div>
        <el-menu
          :default-active="$route.path"
          background-color="#f9f7f3"
          text-color="#5b4636"
          active-text-color="#a7874b"
          :router="true"
          class="ancient-menu"
        >
          <el-menu-item index="/admin">
            <i class="el-icon-s-home"></i>
            <span>仪表板</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <i class="el-icon-user"></i>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/books">
            <i class="el-icon-notebook-2"></i>
            <span>图书管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/borrow">
            <i class="el-icon-document-copy"></i>
            <span>借阅管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
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
              <el-button 
                type="primary" 
                icon="el-icon-s-home" 
                @click="goToUserHome"
                class="ancient-btn home-btn"
              >
                用户首页
              </el-button>
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
                    <div class="overview-label">系统版本</div>
                    <div class="overview-value">v1.2.0</div>
                  </div>
                  <div class="overview-item">
                    <div class="overview-label">今日访问</div>
                    <div class="overview-value">{{ stats.todayVisits || 0 }} 次</div>
                  </div>
                  <div class="overview-item">
                    <div class="overview-label">本月新增用户</div>
                    <div class="overview-value">{{ stats.monthNewUsers || 0 }} 人</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="overview-item">
                    <div class="overview-label">本月借阅量</div>
                    <div class="overview-value">{{ stats.monthBorrows || 0 }} 次</div>
                  </div>
                  <div class="overview-item">
                    <div class="overview-label">图书借阅率</div>
                    <div class="overview-value">{{ stats.borrowRate || '0%' }}</div>
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
                  <el-card shadow="hover" class="action-card ancient-card" @click.native="$router.push('/admin/borrow')">
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
export default {
  name: 'AdminDashboard',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      stats: {
        userCount: 100,
        bookCount: 500,
        currentBorrow: 50,
        overdueCount: 5,
        todayVisits: 128,
        monthNewUsers: 15,
        monthBorrows: 256,
        borrowRate: '75%'
      },
      recentActivities: [
        {
          id: 1,
          icon: 'el-icon-user',
          title: '新用户注册',
          description: '用户"李四"完成了注册',
          time: '10分钟前'
        },
        {
          id: 2,
          icon: 'el-icon-notebook-2',
          title: '图书借阅',
          description: '《JavaScript高级程序设计》被借阅',
          time: '30分钟前'
        },
        {
          id: 3,
          icon: 'el-icon-edit',
          title: '图书信息更新',
          description: '《红楼梦》库存信息已更新',
          time: '1小时前'
        },
        {
          id: 4,
          icon: 'el-icon-time',
          title: '借阅到期提醒',
          description: '5本图书即将到期',
          time: '2小时前'
        }
      ]
    }
  },
  mounted() {
    if (!this.user.id || this.user.role !== 'ADMIN') {
      this.$router.push('/admin/login')
    }
    this.fetchDashboardStats()
  },
  methods: {
    // 获取仪表板统计数据
    async fetchDashboardStats() {
      try {
        // 这里可以调用API获取真实数据
        // const res = await dashboardApi.getStats()
        // this.stats = res.data
      } catch (error) {
        console.error('获取仪表板数据失败:', error)
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
h1, h2, h3, h4, h5, h6 {
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

/* 侧边栏样式 */
.el-aside {
  background: rgba(255, 254, 251, 0.95) !important;
  border-right: 1px solid #e8d4b8;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

/* 侧边栏logo */
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-bottom: 1px solid #e8d4b8;
  background: rgba(245, 240, 230, 0.8);
}

.logo-img {
  width: 25px;
  height: 25px;
  margin-right: 10px;
}

.logo h3 {
  color: #5b4636;
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 18px;
  margin: 0;
  font-weight: bold;
}

/* 侧边栏菜单 */
.ancient-menu {
  border-right: none !important;
  padding: 10px 0;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  transition: all 0.3s;
  margin: 5px 10px;
  border-radius: 8px;
}

.el-menu-item:hover {
  background: rgba(232, 212, 184, 0.2) !important;
}

.el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(167, 135, 75, 0.1), rgba(139, 115, 85, 0.1)) !important;
  border-left: 3px solid #a7874b !important;
  color: #5b4636 !important;
  font-weight: bold;
}

.el-menu-item i {
  color: #8b7355;
  font-size: 16px;
}

.el-menu-item.is-active i {
  color: #a7874b;
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