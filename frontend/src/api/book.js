import { mockBooks } from '@/mock/book'

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const bookApi = {
  // 获取图书列表（分页）
  async getBooks(params = {}) {
    await delay(500)
    
    const { 
      page = 1, 
      size = 10, 
      title = '', 
      author = '', 
      category = '',
      availableOnly = false 
    } = params
    
    // 过滤数据
    let filteredBooks = [...mockBooks]
    
    if (title) {
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(title.toLowerCase())
      )
    }
    
    if (author) {
      filteredBooks = filteredBooks.filter(book => 
        book.author.toLowerCase().includes(author.toLowerCase())
      )
    }
    
    if (category) {
      filteredBooks = filteredBooks.filter(book => 
        book.category === Number(category)
      )
    }
    
    if (availableOnly) {
      filteredBooks = filteredBooks.filter(book => 
        book.availableCopies > 0
      )
    }
    
    // 分页
    const start = (page - 1) * size
    const end = start + size
    const paginatedBooks = filteredBooks.slice(start, end)
    
    return {
      code: 200,
      message: '成功',
      data: {
        total: filteredBooks.length,
        page: Number(page),
        size: Number(size),
        list: paginatedBooks
      }
    }
  },
  
  // 获取图书详情
  async getBookDetail(id) {
    await delay(300)
    
    const book = mockBooks.find(b => b.id === Number(id))
    
    if (book) {
      return {
        code: 200,
        message: '成功',
        data: book
      }
    } else {
      return {
        code: 404,
        message: '图书不存在',
        data: null
      }
    }
  },
  
  // 添加图书
  async addBook(bookData) {
    await delay(500)
    
    // 检查ISBN是否已存在
    const existingBook = mockBooks.find(b => b.isbn === bookData.isbn)
    if (existingBook) {
      return {
        code: 400,
        message: 'ISBN已存在',
        data: null
      }
    }
    
    // 检查分类ID是否有效
    if (bookData.category < 1 || bookData.category > 10) {
      return {
        code: 400,
        message: '分类ID无效，必须在1-10之间',
        data: null
      }
    }
    
    const newBook = {
      id: mockBooks.length + 1,
      ...bookData,
      availableCopies: bookData.availableCopies || bookData.totalCopies || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockBooks.unshift(newBook) // 添加到数组开头
    
    return {
      code: 200,
      message: '图书添加成功',
      data: newBook
    }
  },
  
  // 更新图书
  async updateBook(id, bookData) {
    await delay(500)
    
    const index = mockBooks.findIndex(b => b.id === Number(id))
    
    if (index === -1) {
      return {
        code: 404,
        message: '图书不存在',
        data: null
      }
    }
    
    // 检查分类ID是否有效
    if (bookData.category && (bookData.category < 1 || bookData.category > 10)) {
      return {
        code: 400,
        message: '分类ID无效，必须在1-10之间',
        data: null
      }
    }
    
    // 检查库存逻辑
    if (bookData.availableCopies !== undefined && 
        bookData.totalCopies !== undefined &&
        bookData.availableCopies > bookData.totalCopies) {
      return {
        code: 400,
        message: '可用副本数不能大于总副本数',
        data: null
      }
    }
    
    const updatedBook = {
      ...mockBooks[index],
      ...bookData,
      updatedAt: new Date().toISOString()
    }
    
    mockBooks[index] = updatedBook
    
    return {
      code: 200,
      message: '更新成功',
      data: updatedBook
    }
  },
  
  // 删除图书
  async deleteBook(id) {
    await delay(500)
    
    const index = mockBooks.findIndex(b => b.id === Number(id))
    
    if (index === -1) {
      return {
        code: 404,
        message: '图书不存在',
        data: null
      }
    }
    
    // 检查图书是否已被借阅
    if (mockBooks[index].totalCopies !== mockBooks[index].availableCopies) {
      return {
        code: 400,
        message: '图书已被借阅，无法删除',
        data: null
      }
    }
    
    mockBooks.splice(index, 1)
    
    return {
      code: 200,
      message: '删除成功',
      data: null
    }
  },
  
  // 搜索图书（快速搜索，不分页）
  async searchBooks(q, field = 'title') {
    await delay(300)
    
    if (!q) {
      return {
        code: 400,
        message: '搜索关键词不能为空',
        data: null
      }
    }
    
    const validFields = ['title', 'author', 'isbn']
    if (!validFields.includes(field)) {
      return {
        code: 400,
        message: '搜索字段必须是title、author或isbn',
        data: null
      }
    }
    
    const results = mockBooks.filter(book => {
      const value = book[field] || ''
      return value.toString().toLowerCase().includes(q.toLowerCase())
    }).slice(0, 10) // 最多返回10条
    
    return {
      code: 200,
      message: '成功',
      data: results.map(book => ({
        id: book.id,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        publishYear: book.publishYear,
        category: book.category,
        availableCopies: book.availableCopies
      }))
    }
  },
  
  // 获取所有分类
  async getCategories() {
    await delay(200)
    
    return {
      code: 200,
      message: '成功',
      data: {
        1: '文学',
        2: '历史',
        3: '科学',
        4: '技术',
        5: '教育',
        6: '艺术',
        7: '商业',
        8: '健康',
        9: '旅行',
        10: '其他'
      }
    }
  }
}