<template>
  <div class="admin-dashboard">
    <el-container style="height:100vh;">
      <!-- 侧边栏 - 修复路由配置 -->
      <el-aside width="200px" style="background:#304156;">
        <div class="logo">📚 图书管理</div>
        <el-menu
          :default-active="$route.path"
          background-color="#304156"
          text-color="#fff"
          active-text-color="#409eff"
          :router="true"
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
        <!-- 顶部栏 -->
        <el-header style="background:#fff;border-bottom:1px solid #eee;">
          <div class="header-right">
            <span>欢迎，{{ user.username }}</span>
            <el-button type="text" @click="logout" style="margin-left:20px;">
              退出
            </el-button>
          </div>
        </el-header>
        
        <!-- 内容区 -->
        <el-main>
          <div class="dashboard-content">
            <h2>管理员仪表板</h2>
            <p>系统概览与统计数据</p>
            
            <!-- 统计卡片 -->
            <el-row :gutter="20" style="margin-top:30px;">
              <el-col :span="6">
                <el-card shadow="hover">
                  <div class="stat-card">
                    <div class="stat-icon" style="background:#67c23a;">
                      <i class="el-icon-user-solid"></i>
                    </div>
                    <div class="stat-info">
                      <h3>100</h3>
                      <p>用户总数</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover">
                  <div class="stat-card">
                    <div class="stat-icon" style="background:#409eff;">
                      <i class="el-icon-reading"></i>
                    </div>
                    <div class="stat-info">
                      <h3>500</h3>
                      <p>图书总数</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover">
                  <div class="stat-card">
                    <div class="stat-icon" style="background:#e6a23c;">
                      <i class="el-icon-collection"></i>
                    </div>
                    <div class="stat-info">
                      <h3>50</h3>
                      <p>当前借阅</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover">
                  <div class="stat-card">
                    <div class="stat-icon" style="background:#f56c6c;">
                      <i class="el-icon-time"></i>
                    </div>
                    <div class="stat-info">
                      <h3>5</h3>
                      <p>逾期借阅</p>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            
            <!-- 快速操作 -->
            <div style="margin-top:40px;">
              <h3>快速操作</h3>
              <el-row :gutter="20" style="margin-top:20px;">
                <el-col :span="8">
                  <el-card shadow="hover" class="action-card" @click.native="$router.push('/admin/books')">
                    <div class="action-content">
                      <i class="el-icon-circle-plus-outline"></i>
                      <h4>添加图书</h4>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card shadow="hover" class="action-card" @click.native="showMessage">
                    <div class="action-content">
                      <i class="el-icon-circle-plus"></i>
                      <h4>借书登记</h4>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card shadow="hover" class="action-card" @click.native="showMessage">
                    <div class="action-content">
                      <i class="el-icon-user"></i>
                      <h4>添加用户</h4>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
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
      user: JSON.parse(localStorage.getItem('user') || '{}')
    }
  },
  mounted() {
    if (!this.user.id || this.user.role !== 'ADMIN') {
      this.$router.push('/admin/login')
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/admin/login')
    },
    showMessage() {
      this.$message.info('功能开发中...')
    }
  }
}
</script>

<style scoped>
.logo {
  height: 60px;
  line-height: 60px;
  color: white;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #2c3e50;
}
.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}
.dashboard-content {
  padding: 20px;
}
.dashboard-content h2 {
  margin-bottom: 10px;
}
.dashboard-content p {
  color: #909399;
}
.stat-card {
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
  color: white;
  font-size: 24px;
  margin-right: 15px;
}
.stat-info h3 {
  font-size: 28px;
  margin: 0 0 5px 0;
}
.stat-info p {
  margin: 0;
  color: #909399;
}
.action-card {
  cursor: pointer;
  transition: transform 0.3s;
}
.action-card:hover {
  transform: translateY(-5px);
}
.action-content {
  text-align: center;
  padding: 20px 0;
}
.action-content i {
  font-size: 40px;
  color: #409eff;
  margin-bottom: 15px;
}
.action-content h4 {
  margin: 0;
  color: #303133;
}
</style>