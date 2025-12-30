// 笔记API - 带环境切换版本
import { API_CONFIG } from '@/config/api.config'
import { mockUsers } from '@/mock/user'
import { mockBooks } from '@/mock/book'
import request from '@/utils/request'  // 真实的axios实例

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟笔记数据
let mockNotes = [
  {
    id: 1,
    userId: 2, // user1
    bookId: 1, // 红楼梦
    title: '红楼梦读后感',
    content: '《红楼梦》是一部中国古典文学的巅峰之作，展现了封建社会的繁华与衰败。',
    createdAt: '2024-12-01T10:00:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    id: 2,
    userId: 2,
    bookId: 2, // 三国演义
    title: '三国演义人物分析',
    content: '诸葛亮智谋超群，关羽忠义无双，曹操奸雄并济...',
    createdAt: '2024-12-05T14:30:00.000Z',
    updatedAt: '2024-12-05T14:30:00.000Z'
  },
  {
    id: 3,
    userId: 2,
    bookId: null, // 不关联图书
    title: '读书计划',
    content: '1. 每周读一本文学类书籍\n2. 每月写一篇读书笔记\n3. 学习中国古典文学',
    createdAt: '2024-12-10T09:00:00.000Z',
    updatedAt: '2024-12-10T09:00:00.000Z'
  },
  {
    id: 4,
    userId: 1, // admin
    bookId: 4, // JavaScript高级程序设计
    title: 'JS学习笔记',
    content: 'JavaScript的核心概念：闭包、原型链、异步编程',
    createdAt: '2024-11-20T09:00:00.000Z',
    updatedAt: '2024-11-20T09:00:00.000Z'
  }
];

// 生成更多测试数据
for (let i = 5; i <= 15; i++) {
  const userId = Math.floor(Math.random() * 3) + 1; // 从1-3用户中随机
  const hasBook = Math.random() > 0.3;
  const bookId = hasBook ? Math.floor(Math.random() * mockBooks.length) + 1 : null;
  
  const titles = [
    '读书笔记', '学习心得', '人物分析', '情节解读',
    '文学欣赏', '技术总结', '个人感悟', '书摘'
  ];
  const contents = [
    '这是一篇关于这本书的读书笔记...',
    '通过阅读这本书，我学到了很多...',
    '这本书的人物塑造非常成功...',
    '情节跌宕起伏，引人入胜...',
    '文学价值很高，值得反复阅读...',
    '技术要点总结如下...',
    '我的个人感悟是...',
    '摘录了一些精彩的段落...'
  ];
  
  const title = titles[Math.floor(Math.random() * titles.length)] + ' ' + i;
  const content = contents[Math.floor(Math.random() * contents.length)];
  
  const createdAt = new Date(2024, 11, Math.floor(Math.random() * 30) + 1);
  
  mockNotes.push({
    id: i,
    userId,
    bookId,
    title,
    content,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString()
  });
}

// 模拟数据API
const mockApi = {
  // 获取当前用户的笔记列表（分页）
  async getNotes(params = {}) {
    await delay(API_CONFIG.MOCK_DELAY || 500)
    
    const { 
      page = 1, 
      size = 10,
      bookId = '',
      keyword = ''
    } = params
    
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
    
    // 过滤出当前用户的笔记
    let filteredNotes = mockNotes.filter(note => note.userId === currentUserId)
    
    // 按书籍ID筛选
    if (bookId !== undefined && bookId !== '') {
      // 如果bookId为0，表示筛选未关联书籍（bookId为null）
      if (Number(bookId) === 0) {
        filteredNotes = filteredNotes.filter(note => note.bookId === null)
      } else {
        // 否则筛选指定bookId的笔记
        filteredNotes = filteredNotes.filter(note => note.bookId === Number(bookId))
      }
    }
    
    // 关键词搜索（标题和内容）
    if (keyword && keyword.trim()) {
      const searchTerm = keyword.trim().toLowerCase()
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm)
      )
    }
    
    // 排序：最新的在前面
    filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // 分页
    const start = (page - 1) * size
    const end = start + size
    const paginatedNotes = filteredNotes.slice(start, end)
    
    // 添加图书信息
    const notesWithBookInfo = paginatedNotes.map(note => {
      const book = note.bookId ? mockBooks.find(b => b.id === note.bookId) : null
      return {
        ...note,
        bookTitle: book ? book.title : null,
        bookInfo: book ? {
          title: book.title,
          author: book.author,
          category: book.category
        } : null
      }
    })
    
    return {
      code: 200,
      message: '成功',
      data: {
        total: filteredNotes.length,
        page: Number(page),
        size: Number(size),
        list: notesWithBookInfo
      }
    }
  },
  
  // 获取笔记详情
  async getNoteDetail(noteId) {
    await delay(API_CONFIG.MOCK_DELAY || 300)
    
    const note = mockNotes.find(n => n.id === Number(noteId))
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
    
    if (!note) {
      return {
        code: 404,
        message: '笔记不存在',
        data: null
      }
    }
    
    // 检查权限
    if (note.userId !== currentUserId) {
      return {
        code: 403,
        message: '无权访问此笔记',
        data: null
      }
    }
    
    // 添加图书信息
    const book = note.bookId ? mockBooks.find(b => b.id === note.bookId) : null
    const noteWithBookInfo = {
      ...note,
      bookTitle: book ? book.title : null,
      bookInfo: book ? {
        title: book.title,
        author: book.author,
        category: book.category
      } : null
    }
    
    return {
      code: 200,
      message: '成功',
      data: noteWithBookInfo
    }
  },
  
  // 创建笔记
  async createNote(noteData) {
    await delay(API_CONFIG.MOCK_DELAY || 500)
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    
    const { title, content, bookId } = noteData
    
    if (!title || !title.trim()) {
      return {
        code: 400,
        message: '笔记标题不能为空',
        data: null
      }
    }
    
    if (!content || !content.trim()) {
      return {
        code: 400,
        message: '笔记内容不能为空',
        data: null
      }
    }
    
    // 检查关联的图书是否存在
    if (bookId) {
      const book = mockBooks.find(b => b.id === Number(bookId))
      if (!book) {
        return {
          code: 400,
          message: '关联的书籍不存在',
          data: null
        }
      }
    }
    
    // 创建新笔记
    const newNote = {
      id: mockNotes.length + 1,
      userId: currentUser.id,
      bookId: bookId ? Number(bookId) : null,
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockNotes.push(newNote)
    
    return {
      code: 200,
      message: '笔记创建成功',
      data: newNote
    }
  },
  
  // 更新笔记
  async updateNote(noteId, noteData) {
    await delay(API_CONFIG.MOCK_DELAY || 500)
    
    const noteIndex = mockNotes.findIndex(n => n.id === Number(noteId))
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
    
    if (noteIndex === -1) {
      return {
        code: 404,
        message: '笔记不存在',
        data: null
      }
    }
    
    // 检查权限
    if (mockNotes[noteIndex].userId !== currentUserId) {
      return {
        code: 403,
        message: '无权修改此笔记',
        data: null
      }
    }
    
    // 检查关联的图书是否存在
    if (noteData.bookId !== undefined) {
      if (noteData.bookId) {
        const book = mockBooks.find(b => b.id === Number(noteData.bookId))
        if (!book) {
          return {
            code: 400,
            message: '关联的书籍不存在',
            data: null
          }
        }
      }
    }
    
    // 更新笔记
    const updatedNote = {
      ...mockNotes[noteIndex],
      ...noteData,
      updatedAt: new Date().toISOString()
    }
    
    mockNotes[noteIndex] = updatedNote
    
    return {
      code: 200,
      message: '笔记更新成功',
      data: updatedNote
    }
  },
  
  // 删除笔记
  async deleteNote(noteId) {
    await delay(API_CONFIG.MOCK_DELAY || 500)
    
    const noteIndex = mockNotes.findIndex(n => n.id === Number(noteId))
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
    
    if (noteIndex === -1) {
      return {
        code: 404,
        message: '笔记不存在',
        data: null
      }
    }
    
    // 检查权限
    if (mockNotes[noteIndex].userId !== currentUserId) {
      return {
        code: 403,
        message: '无权删除此笔记',
        data: null
      }
    }
    
    // 删除笔记
    mockNotes.splice(noteIndex, 1)
    
    return {
      code: 200,
      message: '笔记删除成功',
      data: null
    }
  },
  
  // 获取某本书的笔记列表（分页）
  async getBookNotes(bookId, params = {}) {
    await delay(API_CONFIG.MOCK_DELAY || 500)
    
    const { page = 1, size = 10 } = params
    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
    
    // 检查书籍是否存在
    const book = mockBooks.find(b => b.id === Number(bookId))
    if (!book) {
      return {
        code: 404,
        message: '书籍不存在',
        data: null
      }
    }
    
    // 过滤出当前用户对该书籍的笔记
    const filteredNotes = mockNotes.filter(note => 
      note.userId === currentUserId && note.bookId === Number(bookId)
    )
    
    // 排序：最新的在前面
    filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // 分页
    const start = (page - 1) * size
    const end = start + size
    const paginatedNotes = filteredNotes.slice(start, end)
    
    return {
      code: 200,
      message: '成功',
      data: {
        total: filteredNotes.length,
        page: Number(page),
        size: Number(size),
        list: paginatedNotes,
        bookInfo: {
          title: book.title,
          author: book.author
        }
      }
    }
  }
}

// 真实API
const realApi = {
  // 获取当前用户的笔记列表（分页）
  async getNotes(params = {}) {
    try {
      const { 
        page = 1, 
        size = 10,
        keyword = '',
        bookId = ''
      } = params
      
      // 调用后端API
      const response = await request.get('/notes', { params })
      
      let data = response.data || response
      
      // 确保返回的数据结构统一
      if (data.code === 200) {
        let notes = []
        let total = 0
        
        // 处理不同的响应格式
        if (Array.isArray(data.data)) {
          // 格式: { code: 200, data: [...] }
          notes = data.data
          total = notes.length
        } else if (data.data && Array.isArray(data.data.list)) {
          // 格式: { code: 200, data: { list: [...], total: X, page: X, size: X } }
          notes = data.data.list
          total = data.data.total || notes.length
        } else {
          // 其他格式
          notes = data.data || []
          total = notes.length
        }
        
        // 前端过滤（如果后端不支持所有筛选参数）
        let filteredNotes = notes
        
        // 按书籍ID筛选
        if (bookId !== undefined && bookId !== '') {
          // 如果bookId为0，表示筛选未关联书籍（bookId为null）
          if (Number(bookId) === 0) {
            filteredNotes = filteredNotes.filter(note => !note.bookId)
          } else {
            // 否则筛选指定bookId的笔记
            filteredNotes = filteredNotes.filter(note => note.bookId === Number(bookId))
          }
        }
        
        // 关键词搜索（标题和内容）
        if (keyword && keyword.trim()) {
          const searchTerm = keyword.trim().toLowerCase()
          filteredNotes = filteredNotes.filter(note => 
            (note.title && note.title.toLowerCase().includes(searchTerm)) ||
            (note.content && note.content.toLowerCase().includes(searchTerm))
          )
        }
        
        // 排序：最新的在前面
        filteredNotes.sort((a, b) => 
          new Date(b.createdAt || b.created_at || 0) - 
          new Date(a.createdAt || a.created_at || 0)
        )
        
        // 分页
        const start = (page - 1) * size
        const end = start + size
        const paginatedNotes = filteredNotes.slice(start, end)
        
        // 确保返回格式与mockApi一致
        return {
          code: 200,
          message: '成功',
          data: {
            total: filteredNotes.length,
            page: Number(page),
            size: Number(size),
            list: paginatedNotes
          }
        }
      } else {
        // API返回错误
        return data
      }
      
    } catch (error) {
      console.error('笔记API错误:', error)
      
      // 错误时返回空数据
      return {
        code: 500,
        message: '获取笔记失败',
        data: {
          total: 0,
          page: params.page || 1,
          size: params.size || 10,
          list: []
        }
      }
    }
  },
  
  // 获取笔记详情
  async getNoteDetail(noteId) {
    return request.get(`/notes/${noteId}`)
  },
  
  // 创建笔记
  async createNote(noteData) {
    return request.post('/notes', noteData)
  },
  
  // 更新笔记
  async updateNote(noteId, noteData) {
    return request.put(`/notes/${noteId}`, noteData)
  },
  
  // 删除笔记
  async deleteNote(noteId) {
    return request.delete(`/notes/${noteId}`)
  },
  
  // 获取某本书的笔记列表（分页）
  async getBookNotes(bookId, params = {}) {
    return request.get(`/books/${bookId}/notes`, { params })
  }
}

// 根据配置选择使用哪个API
export const noteApi = API_CONFIG.USE_MOCK ? mockApi : realApi