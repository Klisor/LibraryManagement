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
  import { authApi } from '@/api/auth'
  import { API_CONFIG } from '@/config/api.config'
  import request from '@/utils/request'
  
  export default {
    name: 'UserLogin',
    data() {
      return {
        form: {
          username: 'user1',
          password: '123456'
        },
        loading: false,
        debug: process.env.NODE_ENV === 'development',
        activeDebugPanel: process.env.NODE_ENV === 'development' ? ['1'] : [],
        apiConfig: API_CONFIG,
        rules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, message: '用户名长度至少3个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      async handleLogin() {

        this.$refs.loginForm.validate(async (valid) => {
          if (!valid) return
          
          this.loading = true
          
          try {
            const credentials = {
              username: this.form.username,
              password: this.form.password
            }
            var response = await authApi.login(credentials)
         
            response=response.data
            if (response.code === 200) {
              response=response.data
              this.$message.success(response.message || '登录成功')
              if (response.data && response.data.token) {
                const userInfo = {
                  ...response.data.user,
                  token: response.data.token,
                  expiresIn: response.data.expiresIn
                }
                console.log("login!!!")
                localStorage.setItem('user', JSON.stringify(userInfo))
              }
              
              this.$nextTick(() => {
                this.$router.replace('/user')
              })
            } else {
              this.$message.error(response.message || '登录失败')
            }
            
          } catch (error) {
            if (error.response) {
              const status = error.response.status
              const errorData = error.response.data
              
              switch (status) {
                case 400:
                  if (errorData && errorData.message) {
                    this.$message.error(errorData.message)
                  } else {
                    this.$message.error('用户名或密码错误')
                  }
                  break
                case 401:
                  this.$message.error('认证失败')
                  break
                case 404:
                  this.$message.error('登录接口不存在')
                  break
                case 500:
                  if (errorData && errorData.message) {
                    this.$message.error('服务器错误: ' + errorData.message)
                  } else {
                    this.$message.error('服务器内部错误')
                  }
                  break
                default:
                  this.$message.error(`请求失败: ${status}`)
              }
            } else if (error.message === 'Network Error') {
              this.$message.error('网络错误，请检查网络连接')
            } else if (error.message) {
              this.$message.error(error.message)
            } else {
              this.$message.error('登录失败，请重试')
            }
          } finally {
            this.loading = false
          }
        })
      },
      
      setTestUser(username, password) {
        this.form.username = username
        this.form.password = password
        this.$message.info(`已设置为测试用户: ${username}`)
      },
      
      async testRealLogin(username, password) {
        const credentials = {
          username: username,
          password: password
        }
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
          })
          
          const data = await response.json()
          
          if (response.ok && data.code === 200) {
            this.$message.success(`✅ 登录成功: ${data.message}`)
            return { success: true, data: data }
          } else if (response.status === 400) {
            this.$message.warning(`⚠️ 登录失败: ${data.message || '用户名或密码错误'}`)
            return { success: false, error: data.message }
          } else if (response.status === 500) {
            this.$message.error(`❌ 服务器错误: ${data.message || '内部错误'}`)
            return { success: false, error: data.message }
          } else {
            this.$message.warning(`响应状态: ${response.status}, 消息: ${data.message}`)
            return { success: false, error: data.message }
          }
        } catch (error) {
          this.$message.error('测试失败: ' + error.message)
          return { success: false, error: error.message }
        }
      },
      
      async testApiConnection() {
        try {
          const response = await fetch('/api/users')
          const data = await response.json()
          
          if (response.ok) {
            this.$message.success(`✅ API连接正常，获取到 ${data.length || data.data?.length || 0} 个用户`)
          } else {
            this.$message.error(`API错误: ${response.status}`)
          }
        } catch (error) {
          this.$message.error('API连接失败: ' + error.message)
        }
      },
      
      async testAuthLogin() {
        this.$message.info('测试 /auth/login 接口...')
        
        const testData = {
          username: 'admin',
          password: 'admin'
        }
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
          })
          
          let data
          try {
            data = await response.json()
          } catch (e) {
            const text = await response.text()
            this.$message.error('响应不是JSON: ' + text.substring(0, 100))
            return
          }
          
          if (response.ok) {
            if (data.code === 200) {
              this.$message.success('✅ 接口正常，登录成功')
            } else {
              this.$message.warning(`接口返回 ${data.code}: ${data.message}`)
            }
          } else {
            this.$message.error(`接口错误 ${response.status}: ${data.message || '未知错误'}`)
          }
        } catch (error) {
          this.$message.error('测试失败: ' + error.message)
        }
      },
      
      async testRealLoginWithCurrentUser() {
        const result = await this.testRealLogin(this.form.username, this.form.password)
        if (result.success) {
          this.$message.success('当前用户登录测试成功！')
        }
      },
      
      async batchTestLogin() {
        this.$message.info('开始批量测试登录...')
        
        const testCases = [
          { username: 'admin', password: 'admin', desc: '管理员' },
          { username: '张三', password: '123456', desc: '用户张三' },
          { username: 'user1', password: '123456', desc: '用户user1' },
          { username: '李四', password: '123456', desc: '用户李四' },
          { username: '王五', password: '123456', desc: '用户王五' }
        ]
        
        let successCount = 0
        
        for (const testCase of testCases) {
          this.$message.info(`测试用户: ${testCase.desc} (${testCase.username})`)
          
          const result = await this.testRealLogin(testCase.username, testCase.password)
          if (result.success) {
            successCount++
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        this.$message.info(`批量测试完成，成功: ${successCount}/${testCases.length}`)
      },
      
      clearLocalStorage() {
        localStorage.clear()
        this.$message.success('已清除localStorage')
      },
      
      showLocalStorage() {
        const user = localStorage.getItem('user')
        const registeredUsers = localStorage.getItem('registeredUsers')
        
        this.$message.info('localStorage内容已输出到控制台')
      }
    },
    mounted() {
      if (this.debug) {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          try {
            JSON.parse(savedUser)
          } catch (e) {}
        }
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