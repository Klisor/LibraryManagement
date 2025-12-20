<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-card">
        <h1><i class="el-icon-s-tools"></i> 管理员登录</h1>
        <p>图书管理系统 - 后台管理</p>
        
        <el-form :model="form" :rules="rules" ref="loginForm" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="管理员用户名"
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
        
        <div class="switch-link">
          <span>普通用户？</span>
          <el-link type="primary" @click="$router.push('/user/login')">
            前往用户登录
          </el-link>
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
            this.$router.push('/admin')
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
.admin-login {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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