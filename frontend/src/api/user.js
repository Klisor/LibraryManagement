// 用户API - 带环境切换版本
import { API_CONFIG } from '@/config/api.config'
import { mockUsers } from '@/mock/user'
import { mockBorrowRecords } from '@/mock/borrow-data'
import request from '@/utils/request'  // 真实的axios实例
import { getBorrowRecords, saveBorrowRecords } from '@/mock/borrow-data'

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 同步用户数据到所有存储位置
function syncUserDataToAllSources(updatedUser, shouldUpdateCurrentUser = false) {
    // 1. 只有在指定时才更新 localStorage 中的当前登录用户
    if (shouldUpdateCurrentUser) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      // 只更新当前登录用户（如果ID匹配）
      if (currentUser.id === updatedUser.id) {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    }
    
    // 2. 更新 registeredUsers 中的数据（用于登录验证）
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const userIndex = registeredUsers.findIndex(u => u.id === updatedUser.id)
    
    if (userIndex !== -1) {
      // 如果用户存在于 registeredUsers 中，更新它
      // 需要保留密码，更新其他信息
      registeredUsers[userIndex] = {
        ...registeredUsers[userIndex],
        ...updatedUser,
        // 确保保留密码
        password: registeredUsers[userIndex].password
      }
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
    }
  }

// 模拟数据API
const mockApi = {

  // 修改 deleteUser 方法（在 mockApi 对象中）
  async deleteUser(userId) {
   await delay(API_CONFIG.MOCK_DELAY || 500)
    
    // 1. 检查当前登录用户不能删除自己
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (currentUser.id === Number(userId)) {
      return {
        code: 400,
        message: '不能删除当前登录的用户',
        data: null
      }
    }
    
    // 2. 检查用户是否存在
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const userIndex = registeredUsers.findIndex(u => u.id === Number(userId))
    
    // 如果不在registeredUsers中，检查mockUsers
    let userSource = 'registered'
    let mockUserIndex = -1
    if (userIndex === -1) {
      mockUserIndex = mockUsers.findIndex(u => u.id === Number(userId))
      userSource = 'mock'
    }
    
    if (userIndex === -1 && mockUserIndex === -1) {
      return {
        code: 404,
        message: '用户不存在',
        data: null
      }
    }

    const borrowRecords = getBorrowRecords()

    // 3. 获取用户的借阅记录
    const userBorrowRecords = borrowRecords.filter(record => 
      record.userId === Number(userId)
   )
    
    // 检查是否有未归还的图书
    const unreturnedRecords = userBorrowRecords.filter(record => 
      !record.returnDate && (record.status === 'BORROWED' || record.status === 'OVERDUE')
    )
    
    // 4. 如果有未归还的图书，更新相关图书的库存
    if (unreturnedRecords.length > 0) {
      // 获取图书数据 - 使用统一的数据源
      const storedBooks = JSON.parse(localStorage.getItem('books') || 'null')
      const books = storedBooks || mockBooks
      
      unreturnedRecords.forEach(record => {
        const bookIndex = books.findIndex(book => Number(book.id) === Number(record.bookId))
        if (bookIndex !== -1) {
          // 增加图书的可用库存（因为借阅记录会被删除）
          books[bookIndex].availableCopies = (Number(books[bookIndex].availableCopies) || 0) + 1
        }
      })
      
      // 保存更新后的图书数据
      localStorage.setItem('books', JSON.stringify(books))
      
      // 同时更新mockBooks（用于内存中的一致性）
      if (!storedBooks) {
        unreturnedRecords.forEach(record => {
          const mockBookIndex = mockBooks.findIndex(book => Number(book.id) === Number(record.bookId))
          if (mockBookIndex !== -1) {
            mockBooks[mockBookIndex].availableCopies = (Number(mockBooks[mockBookIndex].availableCopies) || 0) + 1
          }
        })
      }
    }
    
    // 5. 删除该用户的所有借阅记录
    const updatedBorrowRecords = borrowRecords.filter(record => record.userId !== Number(userId))
    saveBorrowRecords(updatedBorrowRecords)
    
    // 6. 删除用户
    if (userSource === 'mock' && mockUserIndex !== -1) {
      mockUsers.splice(mockUserIndex, 1)
      // 同时从registeredUsers中删除（如果存在）
      const regIndex = registeredUsers.findIndex(u => u.id === Number(userId))
      if (regIndex !== -1) {
        registeredUsers.splice(regIndex, 1)
      }
    } else if (userIndex !== -1) {
      registeredUsers.splice(userIndex, 1)
    }
    
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
    
    return {
      code: 200,
      message: `用户删除成功${unreturnedRecords.length > 0 ? `，并已清理${unreturnedRecords.length}条未归还的借阅记录` : ''}`,
      data: null
    }
  },

  // 获取用户列表（分页+搜索）
  async getUsers(params = {}) {
    await delay(API_CONFIG.MOCK_DELAY || 500)
    
    const { 
      page = 1, 
      size = 10, 
      username = '',
      email = '',
      role = ''
    } = params
    
    // 1. 获取所有用户：模拟用户 + 注册用户
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    
    // 2. 合并用户时去重（以registeredUsers为准）
    const allUsersMap = new Map()
    
    // 先添加mockUsers
    mockUsers.forEach(user => {
      allUsersMap.set(user.id, user)
    })
    
    // 再添加registeredUsers，覆盖重复的
    registeredUsers.forEach(user => {
      allUsersMap.set(user.id, user)
    })
    
    const allUsers = Array.from(allUsersMap.values())
    
    // 过滤用户
    let filteredUsers = [...allUsers]
    
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
        list: paginatedUsers.map(user => {
          // 移除密码字段，确保安全
          const { password, ...userWithoutPassword } = user
          return userWithoutPassword
        })
      }
    }
  },
  
  // 获取用户详情
  async getUserDetail(userId) {
    await delay(API_CONFIG.MOCK_DELAY || 300)
    
    // 1. 先尝试从模拟用户中查找
    let user = mockUsers.find(u => u.id === Number(userId))
    
    // 2. 如果没找到，从注册用户中查找
    if (!user) {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      user = registeredUsers.find(u => u.id === Number(userId))
    }
    
    if (user) {
      // 查找用户的借阅记录 - 确保正确匹配用户ID
      const borrowRecords = getBorrowRecords()  // 修改这行
      const userBorrowRecords = borrowRecords  // 修改这行
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
      
      console.log(`用户 ${user.username} 的借阅记录:`, userBorrowRecords)
      
      // 移除密码字段
      const { password, ...userWithoutPassword } = user
      
      return {
        code: 200,
        message: '成功',
        data: {
          ...userWithoutPassword,
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
    await delay(API_CONFIG.MOCK_DELAY || 500)
    
    // 1. 只在registeredUsers中查找（统一数据源）
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    let userIndex = registeredUsers.findIndex(u => u.id === Number(userId))
    
    // 2. 如果没找到，再尝试从mockUsers中查找
    let userSource = 'registered'
    if (userIndex === -1) {
      userIndex = mockUsers.findIndex(u => u.id === Number(userId))
      userSource = 'mock'
    }
    
    if (userIndex === -1) {
      return {
        code: 404,
        message: '用户不存在',
        data: null
      }
    }
    
    let userToUpdate
    if (userSource === 'mock') {
      userToUpdate = mockUsers[userIndex]
    } else {
      userToUpdate = registeredUsers[userIndex]
    }
    
    // 如果角色变化，需要调整最大借阅数
    if (userData.role && userData.role !== userToUpdate.role) {
      const currentBorrowed = userToUpdate.borrowedCount
      
      if (userData.role === 'ADMIN') {
        const adminDefault = Math.max(10, currentBorrowed)
        if (userData.maxBorrowCount === undefined || userData.maxBorrowCount < adminDefault) {
          userData.maxBorrowCount = adminDefault
        }
      } else {
        const userDefault = Math.max(5, currentBorrowed)
        if (userData.maxBorrowCount === undefined || userData.maxBorrowCount < userDefault) {
          userData.maxBorrowCount = userDefault
        }
      }
    }
    
    // 检查最大借阅数量是否小于当前借阅数量
    if (userData.maxBorrowCount !== undefined) {
      const maxLimit = userData.role === 'ADMIN' ? 50 : 20;
      if (userData.maxBorrowCount > maxLimit) {
          return {
              code: 400,
              message: userData.role === 'ADMIN' 
                  ? '管理员最大借阅数不能超过50本' 
                  : '普通用户最大借阅数不能超过20本',
              data: null
          };
      }
    }
    
    // 更新用户信息
    const updatedUser = {
      ...userToUpdate,
      ...userData,
      updatedAt: new Date().toISOString()
    }
    
    // 保存更新到相应数据源
    if (userSource === 'mock') {
      mockUsers[userIndex] = updatedUser
      // 同时同步到registeredUsers
      const existingIndex = registeredUsers.findIndex(u => u.id === Number(userId))
      if (existingIndex !== -1) {
        registeredUsers[existingIndex] = updatedUser
      } else {
        registeredUsers.push(updatedUser)
      }
    } else {
      registeredUsers[userIndex] = updatedUser
    }
    
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
    
    // 移除密码字段
    const { password, ...userWithoutPassword } = updatedUser
    
    // 同步用户数据到所有存储位置，但不更新当前登录用户
    syncUserDataToAllSources(userWithoutPassword, false)
    
    return {
      code: 200,
      message: '更新成功',
      data: userWithoutPassword
    }
  },
  
  // 管理员添加用户
    async addUser(userData) {
      await delay(API_CONFIG.MOCK_DELAY || 500)
      
      const { username, email, password, role = 'USER', maxBorrowCount } = userData
      
      // 获取所有用户（包括mockUsers和registeredUsers）
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const allUsers = [...mockUsers, ...registeredUsers]
      
      // 检查用户名是否已存在
      if (allUsers.some(u => u.username === username)) {
        return {
          code: 400,
          message: '用户名已存在',
          data: null
        }
      }
      
      // 检查邮箱是否已存在
      if (allUsers.some(u => u.email === email)) {
        return {
          code: 400,
          message: '邮箱已存在',
          data: null
        }
      }
      
      // 最大借阅数校验
      const maxLimit = role === 'ADMIN' ? 50 : 20
      const minLimit = 0
      
      // 如果没有传递 maxBorrowCount，使用角色默认值
      let finalMaxBorrowCount = maxBorrowCount
      if (finalMaxBorrowCount === undefined || finalMaxBorrowCount === '') {
        finalMaxBorrowCount = role === 'ADMIN' ? 10 : 5
      }
      
      // 转换为数字
      finalMaxBorrowCount = Number(finalMaxBorrowCount)
      
      // 检查最大借阅数是否在有效范围内
      if (finalMaxBorrowCount < minLimit) {
        return {
          code: 400,
          message: '最大借阅数不能小于0',
          data: null
        }
      }
      
      if (finalMaxBorrowCount > maxLimit) {
        return {
          code: 400,
          message: role === 'ADMIN' 
            ? '管理员最大借阅数不能超过50本' 
            : '普通用户最大借阅数不能超过20本',
          data: null
        }
      }
      
      // 创建新用户 - 使用时间戳ID
      const newUser = {
        id: Date.now(),
        username,
        email,
        password,
        role,
        maxBorrowCount: finalMaxBorrowCount, // 使用传入的值或默认值
        borrowedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // 添加到registeredUsers（统一的数据源）
      registeredUsers.push(newUser)
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
      
      // 移除密码字段再返回
      const { password: _, ...userWithoutPassword } = newUser
      
      return {
        code: 200,
        message: '用户添加成功',
        data: userWithoutPassword
      }
    }
}

// 真实API
const realApi = {

  async deleteUser(userId) {
  return request.delete(`/users/${userId}`)
},

  // 获取用户列表（分页+搜索）
  async getUsers(params) {
    return request.get('/users', { params })
  },
  
  // 获取用户详情
  async getUserDetail(userId) {
    return request.get(`/users/${userId}`)
  },
  
  // 更新用户信息
  async updateUser(userId, userData) {
    return request.put(`/users/${userId}`, userData)
  },
  
  // 管理员添加用户
  async addUser(userData) {
    return request.post('/users', userData)
  }
}

// 根据配置选择使用哪个API
export const userApi = API_CONFIG.USE_MOCK ? mockApi : realApi