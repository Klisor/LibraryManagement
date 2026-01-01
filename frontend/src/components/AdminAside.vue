<template>
<el-aside width="200px">
  <div class="logo">
    <img src="@/assets/image/icons/book1.png" alt="图书管理系统" class="logo-img">
    <h3>知行书阁（后台）</h3>
  </div>
  <el-menu :default-active="$route.path" background-color="#f9f7f3" text-color="#5b4636"
    active-text-color="#a7874b" :router="true" class="ancient-menu">
    <el-menu-item index="/admin">
      <i class="el-icon-s-home"></i>
      <span>仪表板</span>
    </el-menu-item>
    <el-submenu index="/admin/users">
      <template slot="title">
        <i class="el-icon-user"></i>
        <span>用户</span>
      </template>
      <el-menu-item index="/admin/users">
        <span>用户管理</span>
      </el-menu-item>
    </el-submenu>
    <el-submenu index="/admin/books">
      <template slot="title">
        <i class="el-icon-notebook-2"></i>
        <span>图书</span>
      </template>
      <el-menu-item index="/admin/books">
        <span>图书管理</span>
      </el-menu-item>
      <el-menu-item index="/admin/categories">
        <span>分类管理</span>
      </el-menu-item>
    </el-submenu>
    <el-submenu index="/admin/borrow">
      <template slot="title">
        <i class="el-icon-document-copy"></i>
        <span>借阅</span>
      </template>
      <el-menu-item index="/admin/borrow">
        <span>借阅管理</span>
      </el-menu-item>
      <el-menu-item index="/admin/back">
        <span>还书管理</span>
      </el-menu-item>
    </el-submenu>
  </el-menu>
</el-aside>

</template>
<script> 
export default {
  name: 'AdminAside',
  
}
</script>
<style>
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


}


</style>