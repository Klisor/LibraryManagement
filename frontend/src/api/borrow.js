// 借阅API - 模拟数据版本
import { mockBorrowRecords, mockBorrowStats } from '@/mock/borrow-data'
import { mockUsers } from '@/mock/user'
import { mockBooks } from '@/mock/book'

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const borrowApi = {
  // 获取借阅记录列表（分页）
  async getBorrowRecords(params = {}) {
    await delay(500)
    
    const { 
      page = 1, 
      size = 10, 
      status = '',
      userId = '',
      keyword = '',  // 新增：通用搜索关键词
      userName = '', // 保留兼容
      bookTitle = '' // 保留兼容
    } = params
    
    console.log('🔍 搜索参数:', params)
    console.log('总记录数:', mockBorrowRecords.length)
    
    // 首先，将所有记录转换为可搜索的格式
    const searchableRecords = mockBorrowRecords.map(record => {
      // 查找用户信息
      const user = mockUsers.find(u => u.id === record.userId)
      // 查找图书信息
      const book = mockBooks.find(b => b.id === record.bookId)
      
      return {
        ...record,
        // 搜索用的字段
        userRealName: user ? user.username : '',      // 用户的真实用户名
        userEmail: user ? user.email : '',            // 用户邮箱
        bookRealTitle: book ? book.title : '',        // 图书的真实书名
        bookAuthor: book ? book.author : '',          // 图书作者
        bookIsbn: book ? book.isbn : ''               // 图书ISBN
      }
    })
    
    // 开始过滤
    let filteredRecords = searchableRecords
    
    // 1. 状态过滤
    if (status && status.trim()) {
      filteredRecords = filteredRecords.filter(record => record.status === status)
    }
    
    // 2. 用户ID过滤
    if (userId && userId.toString().trim()) {
      filteredRecords = filteredRecords.filter(record => 
        record.userId === Number(userId)
      )
    }
    
    // 3. 关键词搜索 - 修复：支持 OR 搜索
    const searchTerm = keyword.trim().toLowerCase() || userName.trim().toLowerCase() || bookTitle.trim().toLowerCase()
    
    if (searchTerm) {
      console.log(`搜索关键词: "${searchTerm}"`)
      
      filteredRecords = filteredRecords.filter(record => {
        // 检查所有可能的匹配字段
        const matches = [
          // 原始用户名
          record.userName && record.userName.toLowerCase().includes(searchTerm),
          // 真实用户名
          record.userRealName && record.userRealName.toLowerCase().includes(searchTerm),
          // 用户ID
          record.userId.toString().includes(searchTerm),
          // 用户邮箱
          record.userEmail && record.userEmail.toLowerCase().includes(searchTerm),
          
          // 原始书名
          record.bookTitle && record.bookTitle.toLowerCase().includes(searchTerm),
          // 真实书名
          record.bookRealTitle && record.bookRealTitle.toLowerCase().includes(searchTerm),
          // 图书ID
          record.bookId.toString().includes(searchTerm),
          // 图书作者
          record.bookAuthor && record.bookAuthor.toLowerCase().includes(searchTerm),
          // 图书ISBN
          record.bookIsbn && record.bookIsbn.toLowerCase().includes(searchTerm)
        ]
        
        // 只要有一个匹配就返回true
        return matches.some(match => match === true)
      })
    }
    
    console.log(`过滤后记录数: ${filteredRecords.length}`)
    
    // 移除搜索用的辅助字段
    const resultRecords = filteredRecords.map(record => {
      const { userRealName, userEmail, bookRealTitle, bookAuthor, bookIsbn, ...rest } = record
      return rest
    })
    
    // 分页
    const start = (page - 1) * size
    const end = start + size
    const paginatedRecords = resultRecords.slice(start, end)
    
    return {
      code: 200,
      message: '成功',
      data: {
        total: resultRecords.length,
        page: Number(page),
        size: Number(size),
        list: paginatedRecords
      }
    }
  },
  
  // 保持其他方法不变
  async borrowBook(data) {
    await delay(500)
    
    const { userId, bookId } = data
    
    if (!userId || !bookId) {
      return {
        code: 400,
        message: '用户ID和图书ID不能为空',
        data: null
      }
    }
    
    // 检查用户是否存在
    const user = mockUsers.find(u => u.id === Number(userId))
    if (!user) {
      return {
        code: 404,
        message: '用户不存在',
        data: null
      }
    }
    
    // 检查图书是否存在
    const book = mockBooks.find(b => b.id === Number(bookId))
    if (!book) {
      return {
        code: 404,
        message: '图书不存在',
        data: null
      }
    }
    
    // 检查用户是否达到最大借阅数
    if (user.borrowedCount >= user.maxBorrowCount) {
      return {
        code: 400,
        message: '用户已达到最大借阅数量',
        data: null
      }
    }
    
    // 检查图书是否有库存
    if (book.availableCopies <= 0) {
      return {
        code: 400,
        message: '图书库存不足',
        data: null
      }
    }
    
    // 创建借阅记录
    const newRecord = {
      id: mockBorrowRecords.length + 1,
      userId: Number(userId),
      bookId: Number(bookId),
      userName: user.username,
      bookTitle: book.title,
      borrowDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后
      returnDate: null,
      renewedCount: 0,
      maxRenewCount: 1,
      status: 'BORROWED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // 更新用户借阅数量
    user.borrowedCount++
    
    // 更新图书库存
    book.availableCopies--
    
    // 添加借阅记录
    mockBorrowRecords.unshift(newRecord)
    
    return {
      code: 200,
      message: '借书成功',
      data: {
        recordId: newRecord.id,
        bookId: newRecord.bookId,
        userId: newRecord.userId,
        bookTitle: newRecord.bookTitle,
        userName: newRecord.userName,
        borrowDate: newRecord.borrowDate,
        dueDate: newRecord.dueDate,
        status: newRecord.status
      }
    }
  },
  
  async returnBook(recordId) {
    await delay(500)
    
    const record = mockBorrowRecords.find(r => r.id === Number(recordId))
    
    if (!record) {
      return {
        code: 404,
        message: '借阅记录不存在',
        data: null
      }
    }
    
    if (record.status === 'RETURNED') {
      return {
        code: 400,
        message: '图书已归还',
        data: null
      }
    }
    
    // 更新借阅记录
    record.returnDate = new Date().toISOString()
    record.status = 'RETURNED'
    record.updatedAt = new Date().toISOString()
    
    // 更新用户借阅数量
    const user = mockUsers.find(u => u.id === record.userId)
    if (user) {
      user.borrowedCount--
    }
    
    // 更新图书库存
    const book = mockBooks.find(b => b.id === record.bookId)
    if (book) {
      book.availableCopies++
    }
    
    return {
      code: 200,
      message: '还书成功',
      data: {
        recordId: record.id,
        bookId: record.bookId,
        userId: record.userId,
        bookTitle: record.bookTitle,
        userName: record.userName,
        borrowDate: record.borrowDate,
        returnDate: record.returnDate,
        status: record.status
      }
    }
  },
  
  async renewBook(recordId) {
    await delay(500)
    
    const record = mockBorrowRecords.find(r => r.id === Number(recordId))
    
    if (!record) {
      return {
        code: 404,
        message: '借阅记录不存在',
        data: null
      }
    }
    
    if (record.status !== 'BORROWED') {
      return {
        code: 400,
        message: '图书已归还，不能续借',
        data: null
      }
    }
    
    if (record.renewedCount >= record.maxRenewCount) {
      return {
        code: 400,
        message: '已达到最大续借次数',
        data: null
      }
    }
    
    // 更新借阅记录
    const currentDueDate = new Date(record.dueDate)
    currentDueDate.setDate(currentDueDate.getDate() + 15) // 续借15天
    record.dueDate = currentDueDate.toISOString()
    record.renewedCount++
    record.updatedAt = new Date().toISOString()
    
    return {
      code: 200,
      message: '续借成功',
      data: {
        recordId: record.id,
        newDueDate: record.dueDate,
        renewedCount: record.renewedCount,
        maxRenewCount: record.maxRenewCount
      }
    }
  },
  
  async getOverdueRecords(params = {}) {
    await delay(500)
    
    const { page = 1, size = 10 } = params
    const now = new Date()
    
    // 过滤逾期记录
    const overdueRecords = mockBorrowRecords.filter(record => {
      if (record.status === 'BORROWED') {
        const dueDate = new Date(record.dueDate)
        return dueDate < now
      }
      return record.status === 'OVERDUE'
    })
    
    // 计算逾期天数
    const recordsWithOverdueDays = overdueRecords.map(record => {
      const dueDate = new Date(record.dueDate)
      const overdueDays = Math.max(0, Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)))
      return {
        ...record,
        overdueDays
      }
    })
    
    // 分页
    const start = (page - 1) * size
    const end = start + size
    const paginatedRecords = recordsWithOverdueDays.slice(start, end)
    
    return {
      code: 200,
      message: '成功',
      data: {
        total: recordsWithOverdueDays.length,
        page: Number(page),
        size: Number(size),
        list: paginatedRecords
      }
    }
  },
  
  async getBorrowStats() {
    await delay(300)
    
    return {
      code: 200,
      message: '成功',
      data: mockBorrowStats
    }
  },
  
  async getBorrowRecordDetail(id) {
    await delay(300)
    
    const record = mockBorrowRecords.find(r => r.id === Number(id))
    
    if (record) {
      return {
        code: 200,
        message: '成功',
        data: record
      }
    } else {
      return {
        code: 404,
        message: '借阅记录不存在',
        data: null
      }
    }
  }
}