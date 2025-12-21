<template>
  <div class="user-login ancient-login">
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
        
        <p class="ancient-subtitle">图书管理系统 - 用户登录</p>
        
        <!-- 古籍风格表单 -->
        <el-form :model="form" :rules="rules" ref="loginForm" class="login-form ancient-form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名或邮箱"
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
              <i class="el-icon-s-promotion"></i>
              登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 古籍风格底部链接 - 调整为与管理员登录界面一致的布局 -->
        <div class="ancient-actions">
          <el-button class="ancient-link-btn register-btn" @click="$router.push('/user/register')">
            <i class="el-icon-user"></i>
            立即注册
          </el-button>
          <el-button class="ancient-link-btn admin-login-btn" @click="$router.push('/admin/login')">
            <i class="el-icon-s-custom"></i>
            管理员登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserLogin',
  data() {
    return {
      form: {
        username: 'user1',
        password: '123456'
      },
      loading: false,
      rules: {
        username: [
          { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (!valid) return
        
        this.loading = true
        
        // 模拟用户登录 - 支持多种验证方式
        setTimeout(() => {
          // 1. 从 localStorage 中获取所有注册的用户
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
          
          // 2. 从模拟用户数据中获取所有用户（不仅仅是前5个）
          const mockUsersAll = [
            {
              id: 1,
              username: 'admin',
              password: '123456',
              email: 'admin@example.com',
              role: 'ADMIN',
              maxBorrowCount: 10,
              borrowedCount: 0,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
              id: 2,
              username: 'user1',
              password: '123456',
              email: 'user1@example.com',
              role: 'USER',
              maxBorrowCount: 5,
              borrowedCount: 2,
              createdAt: '2024-01-02T00:00:00.000Z',
              updatedAt: '2024-01-02T00:00:00.000Z'
            },
            {
              id: 3,
              username: '李四',
              password: '123456',
              email: 'lisi@example.com',
              role: 'USER',
              maxBorrowCount: 5,
              borrowedCount: 1,
              createdAt: '2024-01-03T00:00:00.000Z',
              updatedAt: '2024-01-03T00:00:00.000Z'
            },
            {
              id: 4,
              username: '王五',
              password: '123456',
              email: 'wangwu@example.com',
              role: 'USER',
              maxBorrowCount: 5,
              borrowedCount: 0,
              createdAt: '2024-01-04T00:00:00.000Z',
              updatedAt: '2024-01-04T00:00:00.000Z'
            },
            {
              id: 5,
              username: '赵六',
              password: '123456',
              email: 'zhaoliu@example.com',
              role: 'USER',
              maxBorrowCount: 5,
              borrowedCount: 3,
              createdAt: '2024-01-05T00:00:00.000Z',
              updatedAt: '2024-01-05T00:00:00.000Z'
            },
            // 包含通过循环生成的用户（id: 6-20）
            ...[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(i => ({
              id: i,
              username: `user${i}`,
              password: '123456',
              email: `user${i}@example.com`,
              role: 'USER',
              maxBorrowCount: 5,
              borrowedCount: Math.floor(Math.random() * 6),
              createdAt: new Date(2024, 0, i).toISOString(),
              updatedAt: new Date(2024, 0, i).toISOString()
            }))
          ]
          
          // 3. 合并所有用户数据
          const allUsers = [...mockUsersAll, ...registeredUsers]
          
          // 4. 查找用户（支持用户名或邮箱登录）
          let user = allUsers.find(u => {
            // 检查用户名或邮箱是否匹配
            const isUsernameMatch = u.username === this.form.username
            const isEmailMatch = u.email === this.form.username
            
            // 检查密码是否匹配
            const isPasswordMatch = u.password === this.form.password
            
            // 允许普通用户和管理员角色登录用户端
            const isAllowedRole = u.role === 'USER' || u.role === 'ADMIN'
            
            return (isUsernameMatch || isEmailMatch) && isPasswordMatch && isAllowedRole
          })

          // 5. 如果没有找到，尝试通过用户ID查找（用户名修改后的情况）
          if (!user) {
            // 从 localStorage 获取最后登录的用户信息
            const lastUserStr = localStorage.getItem('user')
            if (lastUserStr) {
              try {
                const lastUser = JSON.parse(lastUserStr)
                // 尝试通过用户ID查找（用户可能修改了用户名）
                user = allUsers.find(u => {
                  // 检查是否是同一个用户
                  return u.id === lastUser.id && 
                        u.password === this.form.password && 
                        u.role === 'USER'
                })
                
                if (user) {
                  console.log('检测到用户名已修改，使用ID登录成功')
                  // 更新表单中的用户名为新的用户名
                  this.form.username = user.username
                }
              } catch (e) {
                console.error('解析用户信息失败:', e)
              }
            }
          }
          
          if (user) {
            // 移除密码字段，将用户信息存入 localStorage
            const { password, ...userWithoutPassword } = user
            
            // 管理员和普通用户都直接存入user，不再创建临时身份
            localStorage.setItem('user', JSON.stringify(userWithoutPassword))
            
            this.$message.success('登录成功')
            
            // 确保在Vue的下一个更新周期后跳转
            this.$nextTick(() => {
              // 使用replace而不是push，避免登录页面留在历史记录中
              this.$router.replace('/user').catch(() => {
                // 如果路由跳转失败，fallback到首页
                this.$router.push('/user')
              })
            })
          } else {
            this.$message.error('用户名或密码错误')
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

/* 古籍风格背景 */
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
  opacity: 0.9;
  z-index: 1;
}

/* 添加古籍风格遮罩 */
.ancient-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 248, 240, 0.6);
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
}

/* 古籍风格卡片 */
.ancient-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.91),
    rgba(255, 253, 250, 0.98)
  );
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  text-align: center;
  box-shadow: 
    0 25px 50px rgba(155, 135, 110, 0.2),
    0 15px 30px rgba(155, 135, 110, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.2),
    inset 0 -1px 1px rgba(0, 0, 0, 0.05); /* 底部内阴影增强立体感 */
  border: 1px solid rgba(232, 212, 184, 0.6);
  backdrop-filter: blur(10px);
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
  border: 2px solid rgba(212, 180, 131, 0.2);
  border-radius: 15px;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 253, 250, 0.03)
  );
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
  color: #7c7262;
  font-size: 28px;
  font-family: "STKaiti", "SimSun", serif;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.ancient-subtitle {
  color: #8b7355;
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
  border: 2px solid #e8d4b8 !important;
  color: #5b4636 !important;
  transition: all 0.3s !important;
  border-radius: 8px !important;
  height: 48px;
  font-size: 16px;
}

.ancient-input /deep/ .el-input__inner:focus {
  border-color: #d4b483 !important;
  box-shadow: 0 0 0 2px rgba(212, 180, 131, 0.3) !important;
  background-color: #fffdfa !important;
}

.ancient-input /deep/ .el-input__inner::placeholder {
  color: #a7874b !important;
  opacity: 0.7 !important;
}

.ancient-input /deep/ .el-input__prefix .el-icon-user,
.ancient-input /deep/ .el-input__prefix .el-icon-lock {
  color: #a7874b !important;
  font-size: 18px;
}

/* 古籍风格按钮 */
.ancient-btn.login-btn {
  background: linear-gradient(135deg, #a7874b, #8b7355);
  border: 2px solid #8b7355;
  color: white;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 25px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(155, 135, 110, 0.3);
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 18px;
  width: 100%;
  height: 48px;
}

.ancient-btn.login-btn:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b);
  border-color: #a7874b;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(155, 135, 110, 0.4);
}

.ancient-btn.login-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(155, 135, 110, 0.3);
}

.ancient-btn.login-btn /deep/ .el-icon-s-promotion {
  margin-right: 8px;
  font-size: 18px;
}

/* 古籍风格底部链接 - 调整为两端对齐，两按钮分别在左右 */
.ancient-actions {
  display: flex;
  justify-content: space-between; /* 改为两端对齐 */
  margin-top: 20px;
  gap: 10px;
}

.ancient-link-btn {
  background: linear-gradient(135deg, rgba(250, 248, 245, 0.9), rgba(247, 243, 236, 0.8));
  border: 1px solid #e8d4b8 !important;
  color: #8b7355 !important;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 20px;
  transition: all 0.3s;
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 16px;
  min-width: 120px;
}

.ancient-link-btn:hover {
  background: linear-gradient(135deg, rgba(232, 212, 184, 0.2), rgba(212, 180, 131, 0.1));
  color: #5b4636 !important;
  border-color: #d4b483 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.2);
}

.ancient-link-btn:active {
  transform: translateY(0);
}

.ancient-link-btn /deep/ .el-icon-user,
.ancient-link-btn /deep/ .el-icon-s-custom {
  margin-right: 6px;
  color: #a7874b !important;
}

/* 注册按钮特殊样式 */
.ancient-link-btn.register-btn {
  border-color: #9b7115 !important;
  color: #ab8f1d !important;
}

.ancient-link-btn.register-btn:hover {
  background: linear-gradient(135deg, rgba(193, 158, 64, 0.2), rgba(202, 155, 36, 0.1)) !important;
  color: #6d5c27 !important;
  border-color: #a68e21 !important;
}

.ancient-link-btn.register-btn /deep/ .el-icon-user {
  color: #7d775b !important;
}

/* 管理员登录按钮特殊样式 */
.ancient-link-btn.admin-login-btn {
  border-color: #c0a0b0 !important;
  color: #8b5b6b !important;
}

.ancient-link-btn.admin-login-btn:hover {
  background: linear-gradient(135deg, rgba(192, 160, 176, 0.2), rgba(166, 139, 152, 0.1)) !important;
  color: #6b3c4c !important;
  border-color: #b08b9e !important;
}

.ancient-link-btn.admin-login-btn /deep/ .el-icon-s-custom {
  color: #8b5b6b !important;
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
  
  .ancient-actions {
    justify-content: space-between; /* 改为两端对齐 */
    flex-wrap: nowrap; /* 确保不换行 */
  }
  
  .ancient-link-btn {
    min-width: 140px;
    margin-bottom: 10px;
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
  
  .ancient-actions {
    flex-direction: row; /* 改为横向排列 */
    justify-content: space-between; /* 两端对齐 */
    align-items: center; /* 垂直居中 */
  }
  
  .ancient-link-btn {
    width: 48%; /* 每个按钮占48%宽度 */
    min-width: auto;
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
  background: radial-gradient(circle, rgba(212, 180, 131, 0.1) 0%, transparent 70%);
  border-radius: 0 20px 0 0;
  pointer-events: none;
}
</style>