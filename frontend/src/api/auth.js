// src/api/auth.js
import { API_CONFIG } from '@/config/api.config'
import request from '@/utils/request'
import { mockUsers } from '@/mock/user'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const mockAuth = {
  async login(credentials) {
    await delay(API_CONFIG.MOCK_DELAY || 300)
    
    // 支持用户名或邮箱登录
    const { username, email, password } = credentials
    
    // 检查注册用户
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    
    // 查找用户（支持用户名或邮箱登录）
    let user = registeredUsers.find(u => {
      const usernameMatch = username && u.username === username
      const emailMatch = email && u.email === email
      return (usernameMatch || emailMatch) && u.password === password
    })
    
    // 如果没找到，检查mockUsers
    if (!user) {
      user = mockUsers.find(u => {
        const usernameMatch = username && u.username === username
        const emailMatch = email && u.email === email
        return (usernameMatch || emailMatch) && u.password === password
      })
    }
    
    if (user) {
      // 模拟token
      const token = 'mock-jwt-token-' + Date.now()
      const expiresIn = 86400 // 24小时
      
      const userInfo = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        maxBorrowCount: user.maxBorrowCount || 5,
        borrowedCount: user.borrowedCount || 0,
        token: token
      }
      
      // 保存用户信息和token
      localStorage.setItem('user', JSON.stringify(userInfo))
      
      return {
        code: 200,
        message: '登录成功',
        data: {
          token: token,
          expiresIn: expiresIn,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            maxBorrowCount: user.maxBorrowCount || 5,
            borrowedCount: user.borrowedCount || 0
          }
        },
        timestamp: new Date().toISOString()
      }
    }
    
    return {
      code: 400,
      message: '用户名或密码错误',
      data: null,
      timestamp: new Date().toISOString()
    }
  },
  
  async register(userData) {
    await delay(API_CONFIG.MOCK_DELAY || 300)
    
    const { username, password, email } = userData
    
    // 检查是否已存在
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const allUsers = [...mockUsers, ...registeredUsers]
    
    if (allUsers.some(u => u.username === username)) {
      return {
        code: 400,
        message: '用户名已存在',
        data: null,
        timestamp: new Date().toISOString()
      }
    }
    
    if (allUsers.some(u => u.email === email)) {
      return {
        code: 400,
        message: '邮箱已存在',
        data: null,
        timestamp: new Date().toISOString()
      }
    }
    
    // 创建新用户
    const newUser = {
      id: Date.now(),
      username,
      password,
      email,
      role: 'USER',
      maxBorrowCount: 5,
      borrowedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // 添加到registeredUsers
    registeredUsers.push(newUser)
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
    
    return {
      code: 200,
      message: '注册成功',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        maxBorrowCount: newUser.maxBorrowCount,
        borrowedCount: newUser.borrowedCount,
        createdAt: newUser.createdAt
      },
      timestamp: new Date().toISOString()
    }
  },
  
  async logout() {
    localStorage.removeItem('user')
    return {
      code: 200,
      message: '退出成功',
      data: null,
      timestamp: new Date().toISOString()
    }
  },
  
  async getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      return {
        code: 401,
        message: '未登录',
        data: null,
        timestamp: new Date().toISOString()
      }
    }
    
    try {
      const user = JSON.parse(userStr)
      return {
        code: 200,
        message: '成功',
        data: user,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        code: 401,
        message: '用户信息解析失败',
        data: null,
        timestamp: new Date().toISOString()
      }
    }
  }
}

// src/api/auth.js - 更新realAuth部分
const realAuth = {
    // 用户登录 - 只支持用户名登录，不支持邮箱登录
    async login(credentials) {
      // 根据实际测试，后端只接受：{"username":"xxx","password":"xxx"}
      // 注意：这里不再支持email字段
      return request.post('/auth/login', credentials)
    },
    
    // 用户注册 - 保持设计文档的格式
    async register(userData) {
      return request.post('/users/register', userData)
    },
    
    // 退出登录
    async logout() {
      localStorage.removeItem('user')
      return {
        code: 200,
        message: '退出成功',
        data: null,
        timestamp: new Date().toISOString()
      }
    },
    
    // 获取当前用户信息
    async getCurrentUser() {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        return Promise.reject(new Error('未登录'))
      }
      
      try {
        const user = JSON.parse(userStr)
        if (user.token && user.id) {
          return request.get(`/users/${user.id}`)
        } else {
          return Promise.resolve({
            code: 200,
            message: '成功',
            data: user,
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }

// 根据配置选择使用哪个API
export const authApi = API_CONFIG.USE_MOCK ? mockAuth : realAuth