// 图书API - 带环境切换版本
import { API_CONFIG } from '@/config/api.config'
import { mockBooks } from '@/mock/book'
import request from '@/utils/request'  // 真实的axios实例
import { BookValidator } from '@/utils/book-validator'

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟数据API
// const mockApi = {
//   // 修改 getBooksData 方法，确保始终返回统一的数据源
//     getBooksData() {
//       // 首先从 localStorage 获取图书数据
//       let storedBooks = JSON.parse(localStorage.getItem('books') || 'null')
      
//       if (storedBooks && storedBooks.length > 0) {
//         // 只检查是否有重复ID，如果重复则重新整理
//         let needsReindex = false
//         const idSet = new Set()
        
//         for (const book of storedBooks) {
//           if (idSet.has(book.id)) {
//             needsReindex = true
//             break
//           }
//           idSet.add(book.id)
//         }
        
//         // 只在ID重复时重新整理（保护性措施）
//         if (needsReindex) {
//           console.warn('发现重复图书ID，正在重新整理...')
//           storedBooks = storedBooks.map((book, index) => ({
//             ...book,
//             id: index + 1
//           }))
//           localStorage.setItem('books', JSON.stringify(storedBooks))
//         }
        
//         return storedBooks
//       } else {
//         // 如果没有存储的数据，使用 mockBooks 并保存
//         const initialData = [...mockBooks]
//         localStorage.setItem('books', JSON.stringify(initialData))
//         return initialData
//       }
//     },
  
//   // 保存图书数据到 localStorage
//   saveBooksData(books) {
//     localStorage.setItem('books', JSON.stringify(books))
//   },
  
//   // 获取图书列表（分页）
//   async getBooks(params = {}) {
//     await delay(API_CONFIG.MOCK_DELAY || 500)
    
//     const { 
//       page = 1, 
//       size = 10, 
//       title = '', 
//       author = '', 
//       category = '',
//       availableOnly = false,
//       isbn = ''
//     } = params
    
//     // 获取数据
//     const allBooks = this.getBooksData()
    
//     // 过滤数据
//     let filteredBooks = [...allBooks]
    
//     if (title) {
//       filteredBooks = filteredBooks.filter(book => 
//         book.title.toLowerCase().includes(title.toLowerCase())
//       )
//     }
    
//     if (author) {
//       filteredBooks = filteredBooks.filter(book => 
//         book.author.toLowerCase().includes(author.toLowerCase())
//       )
//     }
    
//     if (isbn) {
//       filteredBooks = filteredBooks.filter(book => 
//         book.isbn.toLowerCase().includes(isbn.toLowerCase())
//       )
//     }
    
//     if (category) {
//       filteredBooks = filteredBooks.filter(book => 
//         book.category === Number(category)
//       )
//     }
    
//     if (availableOnly) {
//       filteredBooks = filteredBooks.filter(book => 
//         book.availableCopies > 0
//       )
//     }
    
//     // 分页
//     const start = (page - 1) * size
//     const end = start + size
//     const paginatedBooks = filteredBooks.slice(start, end)
    
//     return {
//       code: 200,
//       message: '成功',
//       data: {
//         total: filteredBooks.length,
//         page: Number(page),
//         size: Number(size),
//         list: paginatedBooks
//       }
//     }
//   },
  
//   // 获取图书详情
//   async getBookDetail(id) {
//     await delay(API_CONFIG.MOCK_DELAY || 300)
    
//     const allBooks = this.getBooksData()
//     const book = allBooks.find(b => b.id === Number(id))
    
//     if (book) {
//       return {
//         code: 200,
//         message: '成功',
//         data: book
//       }
//     } else {
//       return {
//         code: 404,
//         message: '图书不存在',
//         data: null
//       }
//     }
//   },
  
//   // 添加图书
//   async addBook(bookData) {
//     await delay(API_CONFIG.MOCK_DELAY || 500)
    
//     const allBooks = this.getBooksData()
    
//     // **关键修复：改进ISBN检查逻辑**
//     if (bookData.isbn) {
//       // 标准化ISBN：去除首尾空格
//       const normalizedNewIsbn = String(bookData.isbn).trim()
      
//       // 检查ISBN是否已存在（标准化比较）
//       const existingBook = allBooks.find(b => {
//         if (!b || !b.isbn) return false
//         const existingIsbn = String(b.isbn).trim()
//         return existingIsbn === normalizedNewIsbn
//       })
      
//       if (existingBook) {
//         console.log(`ISBN检查失败：新ISBN "${normalizedNewIsbn}" 已存在`)
//         return {
//           code: 400,
//           message: `ISBN "${normalizedNewIsbn}" 已存在`,
//           data: null
//         }
//       }
      
//       // 使用标准化的ISBN
//       bookData.isbn = normalizedNewIsbn
//     }
    
//     // 检查分类ID是否有效
//     if (bookData.category < 1 || bookData.category > 10) {
//       return {
//         code: 400,
//         message: '分类ID无效，必须在1-10之间',
//         data: null
//       }
//     }
    
//     // **关键修复：改进的ID生成逻辑**
//     let maxId = 0
//     if (allBooks && allBooks.length > 0) {
//       // 确保所有ID都是数字，并处理可能的非数字ID
//       const numericIds = allBooks
//         .map(b => {
//           if (!b || !b.id) return 0
//           const id = Number(b.id)
//           return !isNaN(id) ? id : 0
//         })
//         .filter(id => id > 0)
      
//       if (numericIds.length > 0) {
//         maxId = Math.max(...numericIds)
//       }
//     }
    
//     // **修复：确保新ID是连续的正整数**
//     const newId = maxId + 1
//     console.log(`🔢 生成新图书ID: ${newId}, 当前最大ID: ${maxId}, 图书总数: ${allBooks.length}`)
    
//     // **修复：正确处理表单数据**
//     const newBook = {
//       id: newId,
//       isbn: bookData.isbn ? String(bookData.isbn).trim() : '',
//       title: bookData.title || '',
//       author: bookData.author || '',
//       category: Number(bookData.category) || 1,
//       publisher: bookData.publisher || '',
//       publishYear: Number(bookData.publishYear) || new Date().getFullYear(),
//       totalCopies: Number(bookData.totalCopies) || 1,
//       availableCopies: Math.min(
//         Number(bookData.availableCopies) || Number(bookData.totalCopies) || 1,
//         Number(bookData.totalCopies) || 1
//       ),
//       location: bookData.location || '',
//       description: bookData.description || '',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString()
//     }
    
//     // **修复：确保数据有效性**
//     console.log('📝 准备添加的图书:', newBook)
    
//     // 添加到数组
//     allBooks.unshift(newBook)
    
//     // 保存到 localStorage
//     this.saveBooksData(allBooks)
    
//     // 同步更新 mockBooks
//     this.syncMockBooks(allBooks)
    
//     // **新增：验证保存结果**
//     const savedBooks = JSON.parse(localStorage.getItem('books') || '[]')
//     console.log('💾 保存后检查:')
//     console.log(`   - localStorage图书总数: ${savedBooks.length}`)
//     console.log(`   - 新图书是否保存: ${savedBooks.some(b => b.id === newId)}`)
//     if (savedBooks.length > 0) {
//       console.log(`   - 最新图书ID: ${savedBooks[0].id}, 书名: ${savedBooks[0].title}`)
//     }

//     const validatedBook = BookValidator.fixBookData(newBook)
//       if (!validatedBook || validatedBook.id <= 0) {
//         return {
//           code: 500,
//           message: '图书数据验证失败',
//           data: null
//         }
//       }

      

//     return {
//       code: 200,
//       message: '图书添加成功',
//       data: newBook  // 确保返回包含正确ID的对象
//     }
//   },

//   // 新增同步方法，确保 mockBooks 和 localStorage 数据一致
//   syncMockBooks(allBooks) {
//     // 更新 mockBooks 数组，但保持其原始结构不变
//     // 这里我们只是用新的数据替换 mockBooks 的内容
//     mockBooks.length = 0
//     allBooks.forEach(book => {
//       mockBooks.push({...book})
//     })
//   },
  
//   // 删除图书
//   async deleteBook(id) {
//     await delay(API_CONFIG.MOCK_DELAY || 500)
    
//     const allBooks = this.getBooksData()
    
//     // 确保 id 是数字类型进行比较
//     const numericId = Number(id)
//     const index = allBooks.findIndex(b => Number(b.id) === numericId)
    
//     if (index === -1) {
//       return {
//         code: 404,
//         message: '图书不存在',
//         data: null
//       }
//     }
    
//     // 检查图书是否已被借阅
//     const book = allBooks[index]
//     if (book.totalCopies !== book.availableCopies) {
//       return {
//         code: 400,
//         message: '图书已被借阅，无法删除',
//         data: null
//       }
//     }
    
//     allBooks.splice(index, 1)
    
//     // 保存到 localStorage
//     this.saveBooksData(allBooks)
    
//     // 同步更新 mockBooks
//     this.syncMockBooks(allBooks)
    
//     return {
//       code: 200,
//       message: '删除成功',
//       data: null
//     }
//   },

//   // 更新图书
//   async updateBook(id, bookData) {
//     await delay(API_CONFIG.MOCK_DELAY || 500)
    
//     const allBooks = this.getBooksData()
//     const numericId = Number(id)
//     const index = allBooks.findIndex(b => Number(b.id) === numericId)
    
//     if (index === -1) {
//       return {
//         code: 404,
//         message: '图书不存在',
//         data: null
//       }
//     }
    
//     const currentBook = allBooks[index]
    
//     // 检查分类ID是否有效
//     if (bookData.category && (bookData.category < 1 || bookData.category > 10)) {
//       return {
//         code: 400,
//         message: '分类ID无效，必须在1-10之间',
//         data: null
//       }
//     }
    
//     // 处理ISBN：先标准化
//     let normalizedIsbn = String(currentBook.isbn).trim()
    
//     // 如果用户提供了ISBN，使用用户提供的并标准化
//     if (bookData.isbn !== undefined && bookData.isbn !== null) {
//       normalizedIsbn = String(bookData.isbn).trim()
      
//       // 只有在新ISBN与当前ISBN不同时才检查重复
//       if (normalizedIsbn !== String(currentBook.isbn).trim()) {
//         // 检查新ISBN是否已经在其他图书中存在
//         const existingBook = allBooks.find(b => {
//           if (Number(b.id) === numericId) return false // 跳过当前图书
          
//           const existingIsbn = String(b.isbn || '').trim()
//           return existingIsbn === normalizedIsbn
//         })
        
//         if (existingBook) {
//           console.log(`ISBN检查失败：新ISBN "${normalizedIsbn}" 与图书ID ${existingBook.id} 的ISBN重复`)
//           return {
//             code: 400,
//             message: `ISBN "${normalizedIsbn}" 已存在，不能重复使用`,
//             data: null
//           }
//         }
//       }
//     }
    
//     // 检查库存逻辑
//     if (bookData.availableCopies !== undefined && 
//         bookData.totalCopies !== undefined &&
//         bookData.availableCopies > bookData.totalCopies) {
//       return {
//         code: 400,
//         message: '可用副本数不能大于总副本数',
//         data: null
//       }
//     }
    
//     // 合并数据，保留原始数据中没有被修改的字段
//     const updatedBook = {
//       ...currentBook,
//       ...bookData,
//       // 使用标准化的ISBN
//       isbn: normalizedIsbn,
//       updatedAt: new Date().toISOString()
//     }
    
//     // 如果availableCopies大于totalCopies，调整为相等
//     if (updatedBook.availableCopies > updatedBook.totalCopies) {
//       updatedBook.availableCopies = updatedBook.totalCopies
//     }
    
//     // 确保availableCopies不为负数
//     if (updatedBook.availableCopies < 0) {
//       updatedBook.availableCopies = 0
//     }
    
//     allBooks[index] = updatedBook
    
//     // 保存到 localStorage
//     this.saveBooksData(allBooks)
    
//     // 同步更新 mockBooks
//     this.syncMockBooks(allBooks)
    
//     return {
//       code: 200,
//       message: '更新成功',
//       data: updatedBook
//     }
//   },
  
//   // 搜索图书（快速搜索，不分页）
//   async searchBooks(q, field = 'title') {
//     await delay(API_CONFIG.MOCK_DELAY || 300)
    
//     if (!q) {
//       return {
//         code: 400,
//         message: '搜索关键词不能为空',
//         data: null
//       }
//     }
    
//     // 允许 'all' 字段
//     const validFields = ['title', 'author', 'isbn', 'all']
//     if (!validFields.includes(field)) {
//       return {
//         code: 400,
//         message: '搜索字段必须是title、author、isbn或all',
//         data: null
//       }
//     }
    
//     const allBooks = this.getBooksData()
    
//     const results = allBooks.filter(book => {
//       if (field === 'all') {
//         // 在多个字段中搜索（书名、作者、ISBN）
//         return book.title.toLowerCase().includes(q.toLowerCase()) ||
//               book.author.toLowerCase().includes(q.toLowerCase()) ||
//               book.isbn.toLowerCase().includes(q.toLowerCase())
//       } else {
//         // 在单个字段中搜索
//         const value = book[field] || ''
//         return value.toString().toLowerCase().includes(q.toLowerCase())
//       }
//     }).slice(0, 10) // 最多返回10条
    
//     return {
//       code: 200,
//       message: '成功',
//       data: results.map(book => ({
//         id: book.id,
//         isbn: book.isbn,
//         title: book.title,
//         author: book.author,
//         publisher: book.publisher,
//         publishYear: book.publishYear,
//         category: book.category,
//         availableCopies: book.availableCopies,
//         totalCopies: book.totalCopies,
//         description: book.description || '',  // 添加这行
//         location: book.location || ''         // 如果需要显示位置，也可以添加
//       }))
//     }
//   },
  
//   // 获取所有分类
//   async getCategories() {
//     await delay(API_CONFIG.MOCK_DELAY || 200)
    
//     return {
//       code: 200,
//       message: '成功',
//       data: {
//         1: '文学',
//         2: '历史',
//         3: '科学',
//         4: '技术',
//         5: '教育',
//         6: '艺术',
//         7: '商业',
//         8: '健康',
//         9: '旅行',
//         10: '其他'
//       }
//     }
//   }
// }

// 真实API
const realApi = {
  // 获取图书列表（分页）
  async getBooks(params) {
    
    return request.get('/books', { params })
  },
  
  // 获取图书详情
  async getBookDetail(id) {
    return request.get(`/books/${id}`)
  },
  
  // 添加图书
  async addBook(bookData) {
    return request.post('/books', bookData)
  },
  
  // 更新图书
  async updateBook(id, bookData) {
    return request.put(`/books/${id}`, bookData)
  },
  
  // 删除图书
  async deleteBook(id) {
    return request.delete(`/books/${id}`)
  },
  
  // 搜索图书（快速搜索，不分页）
  async searchBooks(q, field = 'title') {
    return request.get('/books/search', { params: { q, field } })
  },
  
  // 获取所有分类
  async getCategories() {
    return request.get('/books/categories')
  }
}

// 根据配置选择使用哪个API
export const bookApi = API_CONFIG.USE_MOCK ? mockApi : realApi