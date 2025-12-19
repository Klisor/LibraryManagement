<template>
  <div class="user-login">
    <div class="login-container">
      <div class="login-card">
        <h1><i class="el-icon-reading"></i> 用户登录</h1>
        <p>图书管理系统 - 用户端</p>
        
        <el-form :model="form" :rules="rules" ref="loginForm" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名或邮箱"
              prefix-icon="el-icon-user"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              prefix-icon="el-icon-lock"
              @keyup.enter.native="handleLogin"
            ></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              @click="handleLogin"
              style="width:100%"
              :loading="loading"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="actions">
          <el-link type="primary" @click="$router.push('/user/register')">
            立即注册
          </el-link>
          <el-link type="primary" @click="$router.push('/admin/login')">
            管理员登录
          </el-link>
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
        
        // 模拟用户登录
        setTimeout(() => {
          if (this.form.username === 'user1' && this.form.password === '123456') {
            localStorage.setItem('user', JSON.stringify({
              id: 2,
              username: 'user1',
              role: 'USER',
              email: 'user1@example.com',
              maxBorrowCount: 5,
              borrowedCount: 2
            }))
            
            this.$message.success('登录成功')
            this.$router.push('/user')
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
.user-login {
  height: 100vh;
  background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  padding: 40px;
  width: 400px;
  text-align: center;
}

.login-card h1 {
  color: #303133;
  margin-bottom: 10px;
}

.login-card p {
  color: #909399;
  margin-bottom: 40px;
}

.login-form {
  margin-bottom: 30px;
}

.actions {
  display: flex;
  justify-content: space-between;
}
</style>