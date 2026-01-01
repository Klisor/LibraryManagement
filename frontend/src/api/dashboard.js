// /src/api/dashboard.js

import { API_CONFIG } from '@/config/api.config'
import request from '@/utils/request'

// 模拟数据
const mockStats = {
  userCount: 100,
  bookCount: 500,
  currentBorrow: 50,
  overdueCount: 5,
  todayVisits: 128,
  monthNewUsers: 15,
  monthBorrows: 256,
  borrowRate: '75%'
}

// 模拟数据API
const mockApi = {
  // 获取仪表板统计数据
  async getDashboardStats() {
    return {
      code: 200,
      message: '成功',
      data: mockStats
    }
  }
}

// 真实API - 修改为分别调用各个接口计算数据
const realApi = {
    async getCategories() {
    const response= request.get('/books/categories')
    return response
  },
  // 获取仪表板统计数据
  async getDashboardStats() {
    try {
      // 分别获取用户、图书、借阅数据
      const [usersRes, booksRes, borrowsRes] = await Promise.all([
        request.get('/users').catch(() => ({ data: [] })),
        request.get('/books').catch(() => ({ data: [] })),
        request.get('/borrow/records').catch(() => ({ data: [] }))
      ])
      
      // 解析数据 - 根据你的API响应结构调整
      let users = []
      let books = []
      let borrowRecords = []
      
      // 处理用户数据
      if (usersRes.data && usersRes.data.code === 200) {
        users = usersRes.data.data || []
      } else if (Array.isArray(usersRes.data)) {
        users = usersRes.data
      }
      
      // 处理图书数据
      if (booksRes.data && booksRes.data.code === 200) {
        books = booksRes.data.data || []
      } else if (Array.isArray(booksRes.data)) {
        books = booksRes.data
      } else if (booksRes.data && booksRes.data.list) {
        books = booksRes.data.list
      }
      
      // 处理借阅数据
      if (borrowsRes.data && borrowsRes.data.code === 200) {
        borrowRecords = borrowsRes.data.data || []
      } else if (Array.isArray(borrowsRes.data)) {
        borrowRecords = borrowsRes.data
      } else if (borrowsRes.data && borrowsRes.data.list) {
        borrowRecords = borrowsRes.data.list
      }
      
      // 计算统计数据
      const userCount = Array.isArray(users) ? users.length : 0
      const bookCount = Array.isArray(books) ? books.length : 0
      
      // 当前借阅（状态为BORROWED）
      const currentBorrow = Array.isArray(borrowRecords) 
        ? borrowRecords.filter(record => {
            const status = record.status?.toUpperCase()
            return status === 'BORROWED' || status === '借阅中'
          }).length 
        : 0
      
      // 逾期借阅
      const overdueCount = Array.isArray(borrowRecords)
        ? borrowRecords.filter(record => {
            const status = record.status?.toUpperCase()
            if ((status === 'BORROWED' || status === '借阅中') && record.dueDate) {
              const due = new Date(record.dueDate)
              const now = new Date()
              return due < now
            }
            return status === 'OVERDUE' || status === '逾期'
          }).length
        : 0
      
      // 模拟其他数据（你可以根据实际情况修改）
      const todayVisits = 128
      const monthNewUsers = 15
      const monthBorrows = 256
      const borrowRate = bookCount > 0 ? `${Math.round((currentBorrow / bookCount) * 100)}%` : '0%'
      
      return {
        code: 200,
        message: '成功',
        data: {
          userCount,
          bookCount,
          currentBorrow,
          overdueCount,
          todayVisits,
          monthNewUsers,
          monthBorrows,
          borrowRate
        }
      }
    } catch (error) {
      console.error('获取仪表板统计数据失败:', error)
      return {
        code: 500,
        message: '获取数据失败',
        data: mockStats
      }
    }
  }
}

// 根据配置选择使用哪个API
export const dashboardApi = API_CONFIG.USE_MOCK ? mockApi : realApi