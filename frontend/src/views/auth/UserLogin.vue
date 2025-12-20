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
        
        // 模拟用户登录 - 支持多种验证方式
        setTimeout(() => {
          // 1. 从 localStorage 中获取所有注册的用户
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
          
          // 2. 从模拟用户数据中获取所有用户（不仅仅是前5个）
          // 使用从mock/user导入的mockUsers数据
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
            
            // 必须是普通用户角色
            const isUserRole = u.role === 'USER'
            
            return (isUsernameMatch || isEmailMatch) && isPasswordMatch && isUserRole
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
            localStorage.setItem('user', JSON.stringify(userWithoutPassword))
            
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