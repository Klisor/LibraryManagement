<template>
  <div class="admin-login ancient-login">
    <!-- 古籍风格背景层 -->
    <div class="ancient-background"></div>
    
    <div class="login-container">
      <div class="login-card ancient-card">
        <!-- 古籍风格标题 -->
        <div class="ancient-title-section">
          <div class="ancient-title-icon">
            <img src="../../assets/image/icons/book1.png" alt="图书管理系统" class="title-logo">
          </div>
          <h1 class="ancient-title-text">知行书阁</h1>
        </div>
        
        <p class="ancient-subtitle">图书管理系统 - 管理员登录</p>
        
        <!-- 古籍风格表单 -->
        <el-form :model="form" :rules="rules" ref="loginForm" class="login-form ancient-form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="管理员用户名"
              prefix-icon="el-icon-user"
              class="ancient-input"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              prefix-icon="el-icon-lock"
              @keyup.enter.native="handleLogin"
              class="ancient-input"
            ></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              @click="handleLogin"
              class="ancient-btn login-btn"
              :loading="loading"
            >
              <i class="el-icon-s-tools"></i>
              管理员登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 古籍风格底部链接 - 只保留用户登录按钮，放在右下角 -->
        <div class="ancient-actions single-action">
          <el-button class="ancient-link-btn user-login-btn" @click="$router.push('/user/login')">
            <i class="el-icon-user"></i>
            用户登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLogin',
  data() {
    return {
      form: {
        username: 'admin',
        password: '123456'
      },
      loading: false,
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在3-20个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在6-20个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (!valid) return
        
        this.loading = true
        
        // 模拟管理员登录 - 支持多种验证方式
        setTimeout(() => {
          // 1. 固定的模拟管理员
          const mockAdmins = [
            { username: 'admin', password: '123456', role: 'ADMIN', id: 1, email: 'admin@example.com', maxBorrowCount: 10, borrowedCount: 0 }
          ]
          
          // 2. 从localStorage中获取所有注册的用户，筛选出管理员
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
          const registeredAdmins = registeredUsers.filter(u => u.role === 'ADMIN')
          
          // 3. 合并所有管理员数据
          const allAdmins = [...mockAdmins, ...registeredAdmins]
          
          // 4. 查找管理员用户（只支持用户名登录）
          const admin = allAdmins.find(u => {
            // 检查用户名是否匹配
            const isUsernameMatch = u.username === this.form.username
            // 检查密码是否匹配
            const isPasswordMatch = u.password === this.form.password
            // 必须是管理员角色
            const isAdminRole = u.role === 'ADMIN'
            
            return isUsernameMatch && isPasswordMatch && isAdminRole
          })
          
          if (admin) {
            // 移除密码字段，将管理员信息存入localStorage
            const { password, ...adminWithoutPassword } = admin
            localStorage.setItem('user', JSON.stringify(adminWithoutPassword))
            
            this.$message.success('登录成功')
            
            // 确保在Vue的下一个更新周期后跳转
            this.$nextTick(() => {
              this.$router.replace('/admin').catch(() => {
                this.$router.push('/admin')
              })
            })
          } else {
            this.$message.error('管理员用户名或密码错误')
          }
          this.loading = false
        }, 500)
      })
    }
  }
}
</script>

<style scoped>
.ancient-login {
  height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: "STKaiti", "KaiTi", serif;
}

/* 古籍风格背景 - 使用稍深的颜色 */
.ancient-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../../assets/image/home2.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.85; /* 比用户登录页稍深 */
  z-index: 1;
}

/* 添加古籍风格遮罩 - 使用稍深的遮罩颜色 */
.ancient-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(240, 235, 225, 0.1); /* 比用户登录页稍深 */
  z-index: 2;
}

/* 登录容器 */
.login-container {
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  
  /* 添加半透明毛玻璃效果 */
  background: rgba(255, 255, 255, 0.05); /* 半透明白色背景 */
  backdrop-filter: blur(10px); /* 毛玻璃模糊效果 */
  -webkit-backdrop-filter: blur(10px); /* 兼容Safari */
  border-radius: 16px; /* 圆角 */
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37); /* 阴影增强效果 */
  border: 1px solid rgba(255, 255, 255, 0.18); /* 白色边框增强玻璃感 */
}



/* 古籍风格卡片 - 使用稍深的背景色 */
/* 加强古籍风格卡片的毛玻璃效果 */
.ancient-card {
  background: linear-gradient(
    135deg,
    rgba(244, 241, 235, 0.98), /* 提高不透明度 */
    rgba(246, 243, 235, 0.9)
  );
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  text-align: center;
  box-shadow: 
    0 20px 40px rgba(130, 110, 85, 0.25),
    0 10px 20px rgba(130, 110, 85, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(200, 180, 150, 0.7);
  backdrop-filter: blur(15px); /* 增加模糊度 */
  -webkit-backdrop-filter: blur(15px); /* Safari兼容 */
  position: relative;
  overflow: hidden;
}

/* 古籍卡片装饰边框 */
.ancient-card::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border: 2px solid rgba(180, 155, 115, 0.3); /* 稍深的边框 */
  border-radius: 15px;
  pointer-events: none;
}

/* 古籍风格标题区域 */
.ancient-title-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.ancient-title-icon {
  margin-right: 15px;
}

.title-logo {
  width: 32px;
  height: 32px;
  vertical-align: middle;
}

.ancient-title-text {
  display: inline-block;
  vertical-align: middle;
  color: #5c4d3c; /* 比用户登录页稍深的颜色 */
  font-size: 28px;
  font-family: "STKaiti", "SimSun", serif;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
}

.ancient-subtitle {
  color: #6b573c; /* 比用户登录页稍深的颜色 */
  margin-bottom: 40px;
  font-size: 16px;
  font-family: "STKaiti", "KaiTi", serif;
}

/* 古籍风格表单 */
.ancient-form {
  margin-bottom: 30px;
}

/* 古籍风格输入框 */
.ancient-input /deep/ .el-input__inner {
  background-color: #fffffe !important;
  border: 2px solid #d8c4a8 !important; /* 稍深的边框 */
  color: #4a3c2c !important; /* 稍深的文字颜色 */
  transition: all 0.3s !important;
  border-radius: 8px !important;
  height: 48px;
  font-size: 16px;
}

.ancient-input /deep/ .el-input__inner:focus {
  border-color: #b89a7c !important; /* 稍深的焦点边框 */
  box-shadow: 0 0 0 2px rgba(184, 154, 124, 0.4) !important; /* 稍深的焦点阴影 */
  background-color: #fffdfa !important;
}

.ancient-input /deep/ .el-input__inner::placeholder {
  color: #8b6f4b !important; /* 稍深的占位符颜色 */
  opacity: 0.7 !important;
}

.ancient-input /deep/ .el-input__prefix .el-icon-user,
.ancient-input /deep/ .el-input__prefix .el-icon-lock {
  color: #8b6f4b !important; /* 稍深的图标颜色 */
  font-size: 18px;
}

/* 古籍风格按钮 - 使用稍深的颜色 */
.ancient-btn.login-btn {
  background: linear-gradient(135deg, #8b6f4b, #6b573c); /* 比用户登录页稍深的颜色 */
  border: 2px solid #6b573c;
  color: white;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 25px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(130, 110, 85, 0.35); /* 稍深的阴影 */
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 17px;
  width: 100%;
  height: 48px;
}

.ancient-btn.login-btn:hover {
  background: linear-gradient(135deg, #6b573c, #8b6f4b);
  border-color: #8b6f4b;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(130, 110, 85, 0.5); /* 稍深的悬停阴影 */
}

.ancient-btn.login-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(130, 110, 85, 0.3);
}

.ancient-btn.login-btn /deep/ .el-icon-s-tools {
  margin-right: 8px;
  font-size: 18px;
}

/* 古籍风格底部链接 - 单个按钮，右对齐 */
.ancient-actions.single-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.ancient-actions.single-action .ancient-link-btn {
  background: linear-gradient(135deg, rgba(250, 245, 235, 0.9), rgba(245, 240, 230, 0.8));
  border: 1px solid #d8c4a8 !important;
  color: #6b573c !important;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 20px;
  transition: all 0.3s;
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 16px;
}

.ancient-actions.single-action .ancient-link-btn:hover {
  background: linear-gradient(135deg, rgba(220, 200, 170, 0.3), rgba(200, 180, 150, 0.2));
  color: #4a3c2c !important;
  border-color: #b89a7c !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(130, 110, 85, 0.25);
}

.ancient-actions.single-action .ancient-link-btn:active {
  transform: translateY(0);
}

.ancient-actions.single-action .ancient-link-btn /deep/ .el-icon-user {
  margin-right: 6px;
  color: #8b6f4b !important;
}

/* 加载状态 */
.ancient-btn.login-btn.is-loading {
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ancient-card {
    padding: 30px 20px;
    width: 90%;
    margin: 0 auto;
  }
  
  .ancient-title-text {
    font-size: 24px;
  }
  
  .ancient-subtitle {
    font-size: 14px;
  }
  
  .ancient-actions.single-action {
    justify-content: center;
  }
  
  .ancient-actions.single-action .ancient-link-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .ancient-card {
    padding: 25px 15px;
  }
  
  .ancient-title-section {
    flex-direction: column;
    gap: 10px;
  }
  
  .ancient-title-icon {
    margin-right: 0;
  }
  
  .title-logo {
    width: 28px;
    height: 28px;
  }
  
  .ancient-title-text {
    font-size: 22px;
  }
  
  .ancient-subtitle {
    font-size: 13px;
  }
  
  .ancient-btn.login-btn {
    height: 44px;
    font-size: 15px;
  }
  
  .ancient-input /deep/ .el-input__inner {
    height: 44px;
    font-size: 15px;
  }
}

/* 添加古籍风格装饰元素 */
.ancient-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(184, 154, 124, 0.15) 0%, transparent 70%);
  border-radius: 0 20px 0 0;
  pointer-events: none;
}
</style>