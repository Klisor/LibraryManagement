<template>
  <div class="user-register">
    <div class="register-container">
      <div class="register-card">
        <h1><i class="el-icon-user"></i> 用户注册</h1>
        <p>创建图书管理系统账号</p>
        
        <el-form :model="form" :rules="rules" ref="registerForm" class="register-form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名 (3-20个字符)"
              prefix-icon="el-icon-user"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码 (6-20个字符)"
              prefix-icon="el-icon-lock"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="确认密码"
              prefix-icon="el-icon-lock"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              placeholder="邮箱地址"
              prefix-icon="el-icon-message"
            ></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              @click="handleRegister"
              style="width:100%"
              :loading="loading"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="switch-link">
          <span>已有账号？</span>
          <el-link type="primary" @click="$router.push('/user/login')">
            立即登录
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    handleRegister() {
      this.$refs.registerForm.validate((valid) => {
        if (!valid) return
        
        this.loading = true
        
        // 模拟注册过程
        setTimeout(() => {
          // 模拟用户注册成功
          localStorage.setItem('user', JSON.stringify({
            id: Date.now(),
            username: this.form.username,
            role: 'USER',
            email: this.form.email,
            maxBorrowCount: 5,
            borrowedCount: 0,
            createdAt: new Date().toISOString()
          }))
          
          this.$message.success('注册成功！')
          this.loading = false
          
          // 自动登录并跳转到用户首页
          setTimeout(() => {
            this.$router.push('/user')
          }, 500)
        }, 800)
      })
    }
  }
}
</script>

<style scoped>
.user-register {
  height: 100vh;
  background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  padding: 40px;
  width: 400px;
  text-align: center;
}

.register-card h1 {
  color: #303133;
  margin-bottom: 10px;
}

.register-card p {
  color: #909399;
  margin-bottom: 40px;
}

.register-form {
  margin-bottom: 30px;
}

.switch-link {
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 14px;
}

.switch-link span {
  margin-right: 10px;
}
</style>