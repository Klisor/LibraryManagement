<template>
  <div class="user-register ancient-register">
    <!-- 古籍风格背景层 -->
    <div class="ancient-background"></div>
    
    <div class="register-container">
      <div class="ancient-card register-card">
        <!-- 古籍风格标题 -->
        <div class="ancient-title-section">
          <div class="ancient-title-icon">
            <img src="../../assets/image/icons/book1.png" alt="图书管理系统" class="title-logo">
          </div>
          <h1 class="ancient-title-text">知行书阁</h1>
        </div>
        
        <p class="ancient-subtitle">用户注册 - 创建账号</p>
        
        <!-- 古籍风格表单 -->
        <el-form :model="form" :rules="rules" ref="registerForm" class="ancient-form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名 (3-20个字符)"
              prefix-icon="el-icon-user"
              class="ancient-input"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码 (6-20个字符)"
              prefix-icon="el-icon-lock"
              class="ancient-input"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="确认密码"
              prefix-icon="el-icon-lock"
              class="ancient-input"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              placeholder="邮箱地址"
              prefix-icon="el-icon-message"
              class="ancient-input"
            ></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              @click="handleRegister"
              class="ancient-btn register-btn"
              :loading="loading"
            >
              <i class="el-icon-user-solid"></i>
              注册账号
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 古籍风格底部链接 - 只保留一个按钮并靠右 -->
        <div class="ancient-footer">
          <el-button class="ancient-link-btn" @click="$router.push('/user/login')">
            <i class="el-icon-s-promotion"></i>
            已有账号？立即登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { authApi } from '@/api/auth'
  
  export default {
    name: 'UserRegister',
    data() {
      // 确认密码的验证规则
      const validateConfirmPassword = (rule, value, callback) => {
        if (value !== this.form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }
      
      return {
        form: {
          username: '',
          password: '',
          confirmPassword: '',
          email: ''
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
          ],
          confirmPassword: [
            { required: true, message: '请确认密码', trigger: 'blur' },
            { validator: validateConfirmPassword, trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱地址', trigger: 'blur' },
            { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      async handleRegister() {
        this.$refs.registerForm.validate(async (valid) => {
          if (!valid) return
          
          this.loading = true
          
          try {
            // 构建注册数据
            const registerData = {
              username: this.form.username,
              password: this.form.password,
              email: this.form.email
            }
            
            // 调用后端API注册接口
            var response = await authApi.register(registerData)
            response=response.data
            console.log(response)
            // 根据设计文档，注册成功返回200
            if (response.code === 200) {
              this.$message.success(response.message || '注册成功！请登录')
              
              // 延迟跳转到登录页面
              setTimeout(() => {
                this.$router.push('/user/login')
              }, 800)
            } else {
              // 注册返回非200状态码，但用户可能已创建
              this.handleRegistrationResponse(response)
            }
            
          } catch (error) {
            // 捕获请求异常
            this.handleRegistrationError(error)
          } finally {
            this.loading = false
          }
        })
      },
      
      // 处理注册响应（非200状态码）
      handleRegistrationResponse(response) {
        // 检查响应中是否有用户已存在的信息
        const errorMessage = response.message || '注册过程中出现异常'
        
        // 如果是用户名或邮箱已存在的错误
        if (errorMessage.includes('已存在') || 
            errorMessage.includes('已注册') || 
            errorMessage.includes('exist')) {
          this.$message.error(errorMessage)
          return
        }
        
        // 其他错误，尝试验证用户是否真的创建成功
        this.$message.warning('正在验证用户创建状态...')
        
        // 延迟验证，确保后端处理完成
        setTimeout(async () => {
          await this.verifyUserCreation()
        }, 1500)
      },
      
      // 处理注册错误（网络或服务器错误）
      handleRegistrationError(error) {
        if (error.response) {
          const status = error.response.status
          const errorData = error.response.data
          const errorMessage = errorData?.message || '注册失败'
          
          switch (status) {
            case 400:
              this.$message.error(errorMessage)
              break
            case 409: // 冲突，通常表示用户名或邮箱已存在
              this.$message.error(errorMessage)
              break
            case 500:
              // 500错误但数据库可能已经创建了用户
              this.$message.warning('正在验证用户创建状态...')
              
              // 延迟验证，确保后端处理完成
              setTimeout(async () => {
                await this.verifyUserCreation()
              }, 1500)
              break
            default:
              this.$message.error(`注册失败: ${status}`)
          }
        } else if (error.message === 'Network Error') {
          this.$message.error('网络错误，请检查网络连接')
        } else {
          this.$message.error('注册失败，请重试')
        }
      },
      
      // 验证用户是否创建成功
      async verifyUserCreation() {
        try {
          const loginData = {
            username: this.form.username,
            password: this.form.password
          }
          
          const loginResponse = await authApi.login(loginData)
          
          if (loginResponse.code === 200) {
            this.$message.success('注册成功！可以正常登录')
            
            // 自动跳转到登录页面
            setTimeout(() => {
              this.$router.push('/user/login')
            }, 1000)
          } else {
            this.$message.error('注册失败，请重试或联系管理员')
          }
        } catch (loginError) {
          // 如果登录失败，说明用户确实没有创建成功
          this.$message.error('注册失败，用户未创建成功')
        }
      }
    }
  }
  </script>
<style scoped>
/* 古籍风格整体样式 */
.ancient-register {
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

/* 注册容器 */
.register-container {
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 20px;
}

/* 古籍风格卡片 */
.ancient-card.register-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 253, 250, 0.98)
  );
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  text-align: center;
  box-shadow: 
    0 20px 40px rgba(155, 135, 110, 0.2),
    0 10px 20px rgba(155, 135, 110, 0.15),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(232, 212, 184, 0.6);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

/* 古籍卡片装饰边框 */
.ancient-card.register-card::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border: 2px solid rgba(212, 180, 131, 0.2);
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
  font-family: "STKaiti", "KaiTi", serif;
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
.ancient-input /deep/ .el-input__prefix .el-icon-lock,
.ancient-input /deep/ .el-input__prefix .el-icon-message {
  color: #a7874b !important;
  font-size: 18px;
}

/* 古籍风格注册按钮 */
.ancient-btn.register-btn {
  background: linear-gradient(135deg, #a7874b, #8b7355);
  border: 2px solid #8b7355;
  color: white;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 25px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(155, 135, 110, 0.3);
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 16px;
  width: 100%;
  height: 48px;
}

.ancient-btn.register-btn:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b);
  border-color: #a7874b;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(155, 135, 110, 0.4);
}

.ancient-btn.register-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(155, 135, 110, 0.3);
}

.ancient-btn.register-btn /deep/ .el-icon-user-solid {
  margin-right: 8px;
  font-size: 18px;
}

/* 加载状态 */
.ancient-btn.register-btn.is-loading {
  opacity: 0.8;
}

/* 古籍风格底部链接 - 只保留一个按钮并靠右 */
.ancient-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.ancient-link-btn {
  background: linear-gradient(135deg, rgba(255, 250, 245, 0.9), rgba(255, 248, 240, 0.8));
  border: 1px solid #e8d4b8 !important;
  color: #8b7355 !important;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 20px;
  transition: all 0.3s;
  font-family: "STKaiti", "KaiTi", serif;
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

.ancient-link-btn /deep/ .el-icon-s-promotion {
  margin-right: 6px;
  color: #a7874b !important;
}

/* 添加古籍风格装饰元素 */
.ancient-card.register-card::after {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .ancient-card.register-card {
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
  
  .ancient-footer {
    justify-content: center; /* 移动端居中显示 */
  }
  
  .ancient-link-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .ancient-card.register-card {
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
  
  .ancient-btn.register-btn {
    height: 44px;
    font-size: 15px;
  }
  
  .ancient-input /deep/ .el-input__inner {
    height: 44px;
    font-size: 15px;
  }
}
</style>