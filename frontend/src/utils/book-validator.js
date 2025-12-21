// 图书数据验证和修复工具
export const BookValidator = {
  // 验证图书数据
  validateBook(book) {
    if (!book) return false
    
    const requiredFields = ['id', 'title', 'author', 'isbn']
    for (const field of requiredFields) {
      if (!book[field]) {
        console.warn(`❌ 图书数据缺失必要字段: ${field}`, book)
        return false
      }
    }
    
    // 确保ID是数字
    const id = Number(book.id)
    if (isNaN(id) || id <= 0) {
      console.warn(`❌ 图书ID无效: ${book.id}`, book)
      return false
    }
    
    return true
  },
  
  // 修复图书数据
  fixBookData(book) {
    if (!book) return null
    
    return {
      id: Number(book.id) || 0,
      isbn: String(book.isbn || '').trim(),
      title: String(book.title || '').trim(),
      author: String(book.author || '').trim(),
      category: Number(book.category) || 1,
      publisher: String(book.publisher || '').trim(),
      publishYear: Number(book.publishYear) || new Date().getFullYear(),
      totalCopies: Math.max(1, Number(book.totalCopies) || 1),
      availableCopies: Math.min(
        Math.max(0, Number(book.availableCopies) || 0),
        Number(book.totalCopies) || 1
      ),
      location: String(book.location || '').trim(),
      description: String(book.description || '').trim(),
      createdAt: book.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  
  // 验证整个图书列表
  validateBookList(books) {
    if (!Array.isArray(books)) return []
    
    const validBooks = []
    const seenIds = new Set()
    
    for (const book of books) {
      const fixedBook = this.fixBookData(book)
      if (fixedBook && fixedBook.id > 0) {
        // 避免重复ID
        if (!seenIds.has(fixedBook.id)) {
          seenIds.add(fixedBook.id)
          validBooks.push(fixedBook)
        }
      }
    }
    
    // 按ID排序
    validBooks.sort((a, b) => a.id - b.id)
    
    return validBooks
  }
}