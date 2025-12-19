// 用户API - 模拟数据版本
import API_CONFIG from '@/config/api.config'
import { mockUsers } from '@/mock/user'
import request from '@/utils/request'  // 真实的axios实例

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const userApi = {
  // 获取用户列表（分页+搜索）
  async getUsers(params = {}) {
    await delay(500)
    
    const { 
      page = 1, 
      size = 10, 
      username = '',
      email = '',
      role = ''
    } = params
    
    // 过滤用户
    let filteredUsers = [...mockUsers]
    
    // 用户名搜索
    if (username && username.trim()) {
      const searchTerm = username.trim().toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm)
      )
    }
    
    // 邮箱搜索
    if (email && email.trim()) {
      const searchTerm = email.trim().toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(searchTerm)
      )
    }
    
    // 角色筛选
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }
    
    // 排序：最新创建的在前面
    filteredUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // 分页
    const start = (page - 1) * size
    const end = start + size
    const paginatedUsers = filteredUsers.slice(start, end)
    
    return {
      code: 200,
      message: '成功',
      data: {
        total: filteredUsers.length,
        page: Number(page),
        size: Number(size),
        list: paginatedUsers
      }
    }
  },
  
  // 获取用户详情
  async getUserDetail(userId) {
    await delay(300)
    
    const user = mockUsers.find(u => u.id === Number(userId))
    
    if (user) {
        // 查找用户的借阅记录 - 修复：确保正确匹配用户ID
        const userBorrowRecords = mockBorrowRecords
        .filter(record => {
            // 确保两个ID都是数字类型再比较
            const recordUserId = Number(record.userId)
            const targetUserId = Number(userId)
            return recordUserId === targetUserId
        })
        .map(record => ({
            id: record.id,
            bookTitle: record.bookTitle,
            borrowDate: record.borrowDate,
            dueDate: record.dueDate,
            returnDate: record.returnDate,
            status: record.status
        }))
        
        console.log(`用户 ${user.username} 的借阅记录:`, userBorrowRecords) // 添加调试日志
        
        return {
        code: 200,
        message: '成功',
        data: {
            ...user,
            borrowRecords: userBorrowRecords
        }
        }
    } else {
        return {
        code: 404,
        message: '用户不存在',
        data: null
        }
    }
    },
  
  // 更新用户信息
  async updateUser(userId, userData) {
    await delay(500)
    
    const userIndex = mockUsers.findIndex(u => u.id === Number(userId))
    
    if (userIndex === -1) {
        return {
        code: 404,
        message: '用户不存在',
        data: null
        }
    }
    
    // 如果角色变化，需要调整最大借阅数
    if (userData.role && userData.role !== mockUsers[userIndex].role) {
        const currentBorrowed = mockUsers[userIndex].borrowedCount
        
        if (userData.role === 'ADMIN') {
        // 角色变成管理员，至少设置10本，但不能小于当前借阅数
        const adminDefault = Math.max(10, currentBorrowed)
        if (userData.maxBorrowCount === undefined || userData.maxBorrowCount < adminDefault) {
            userData.maxBorrowCount = adminDefault
        }
        } else {
        // 角色变成普通用户，至少设置5本，但不能小于当前借阅数
        const userDefault = Math.max(5, currentBorrowed)
        if (userData.maxBorrowCount === undefined || userData.maxBorrowCount < userDefault) {
            userData.maxBorrowCount = userDefault
        }
        }
    }
    
    // 检查最大借阅数量是否小于当前借阅数量
    if (userData.maxBorrowCount !== undefined) {
        const currentBorrowed = mockUsers[userIndex].borrowedCount
        if (userData.maxBorrowCount < currentBorrowed) {
        return {
            code: 400,
            message: '最大借阅数量不能小于当前借阅数量',
            data: null
        }
        }
    }
    
    // 更新用户信息
    const updatedUser = {
        ...mockUsers[userIndex],
        ...userData,
        updatedAt: new Date().toISOString()
    }
    
    mockUsers[userIndex] = updatedUser
    
    return {
        code: 200,
        message: '更新成功',
        data: updatedUser
    }
    },
  
  // 管理员添加用户
  async addUser(userData) {
    await delay(500)
    
    const { username, email, password, role = 'USER' } = userData
    
    // 检查用户名是否已存在
    if (mockUsers.some(u => u.username === username)) {
      return {
        code: 400,
        message: '用户名已存在',
        data: null
      }
    }
    
    // 检查邮箱是否已存在
    if (mockUsers.some(u => u.email === email)) {
      return {
        code: 400,
        message: '邮箱已存在',
        data: null
      }
    }
    
    // 创建新用户
    const newUser = {
      id: mockUsers.length + 1,
      username,
      email,
      password, // 注意：实际项目中密码应该加密
      role,
      maxBorrowCount: role === 'ADMIN' ? 10 : 5, // 管理员可借10本，普通用户5本
      borrowedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockUsers.push(newUser)
    
    // 移除密码字段再返回
    const { password: _, ...userWithoutPassword } = newUser
    
    return {
      code: 200,
      message: '用户添加成功',
      data: userWithoutPassword
    }
  }
}