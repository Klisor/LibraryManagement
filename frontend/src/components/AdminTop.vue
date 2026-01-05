<template>
        <el-header class="admin-header">
          <div class="user-actions">
            <el-dropdown @command="handleCommand" class="admin-user-info">
              <span class="el-dropdown-link">
                <i class="el-icon-user"></i>
                {{ user.username }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>
        

</template>
<script> 
export default {
  name: 'AdminTop',
  data() {
    return {
      // 用户信息
      user: JSON.parse(localStorage.getItem('user') || '{}'),
    }
},
  methods: {    
    // 下拉菜单命令处理
    handleCommand(command) {
      if (command === 'logout') {
        this.logout()
      } else if (command === 'profile') {
        this.$message.info('管理员个人资料功能开发中')
      }
    },
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
},
mounted() {
  this.user = JSON.parse(localStorage.getItem('user') || '{}')
}
}
</script>

<style >
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
    gap: 10px;
    align-items: flex-start;
  }
  
  .button-group {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .search-bar .el-col {
    margin-bottom: 10px;
  }
  
  .action-btn {
    padding: 6px 12px !important;
    font-size: 12px;
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
  
  .action-btn {
    padding: 5px 10px !important;
    font-size: 11px;
    margin: 2px 0;
  }
  
}
</style>