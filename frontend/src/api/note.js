// 笔记API - 模拟数据版本
import { mockUsers } from '@/mock/user'
import { mockBooks } from '@/mock/book'

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

export const noteApi = {
  // 获取当前用户的笔记列表（分页）
  async getNotes(params = {}) {
    await delay(500)
    
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
    if (bookId) {
      filteredNotes = filteredNotes.filter(note => note.bookId === Number(bookId))
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
    await delay(300)
    
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
    await delay(500)
    
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
    await delay(500)
    
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
    await delay(500)
    
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
    await delay(500)
    
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