// 借阅记录模拟数据
import { mockUsers } from '@/mock/user'
import { mockBooks } from '@/mock/book'

export const mockBorrowRecords = [
  // 前5条：使用真实用户和图书信息
  {
    id: 1,
    userId: 2, // user1
    bookId: 1, // 红楼梦
    userName: 'user1', // 使用真实用户名，而不是中文
    bookTitle: '红楼梦',
    borrowDate: '2024-12-01T10:00:00.000Z',
    dueDate: '2024-12-31T10:00:00.000Z',
    returnDate: null,
    renewedCount: 0,
    maxRenewCount: 1,
    status: 'BORROWED',
    createdAt: '2024-12-01T10:00:00.000Z',
    updatedAt: '2024-12-01T10:00:00.000Z'
  },
  {
    id: 2,
    userId: 2, // user1
    bookId: 2, // 三国演义
    userName: 'user1',
    bookTitle: '三国演义',
    borrowDate: '2024-12-05T14:30:00.000Z',
    dueDate: '2025-01-04T14:30:00.000Z',
    returnDate: null,
    renewedCount: 0,
    maxRenewCount: 1,
    status: 'BORROWED',
    createdAt: '2024-12-05T14:30:00.000Z',
    updatedAt: '2024-12-05T14:30:00.000Z'
  },
  {
    id: 3,
    userId: 1, // admin
    bookId: 4, // JavaScript高级程序设计
    userName: 'admin',
    bookTitle: 'JavaScript高级程序设计',
    borrowDate: '2024-11-20T09:00:00.000Z',
    dueDate: '2024-12-20T09:00:00.000Z',
    returnDate: '2024-12-15T16:00:00.000Z',
    renewedCount: 0,
    maxRenewCount: 1,
    status: 'RETURNED',
    createdAt: '2024-11-20T09:00:00.000Z',
    updatedAt: '2024-12-15T16:00:00.000Z'
  },
  {
    id: 4,
    userId: 1, // admin
    bookId: 5, // Vue.js设计与实现
    userName: 'admin',
    bookTitle: 'Vue.js设计与实现',
    borrowDate: '2024-11-15T11:00:00.000Z',
    dueDate: '2024-12-15T11:00:00.000Z',
    returnDate: null,
    renewedCount: 0,
    maxRenewCount: 1,
    status: 'OVERDUE',
    createdAt: '2024-11-15T11:00:00.000Z',
    updatedAt: '2024-11-15T11:00:00.000Z'
  },
  {
    id: 5,
    userId: 3, // user2
    bookId: 3, // 西游记
    userName: 'user2',
    bookTitle: '西游记',
    borrowDate: '2024-12-10T13:00:00.000Z',
    dueDate: '2025-01-09T13:00:00.000Z',
    returnDate: null,
    renewedCount: 1,
    maxRenewCount: 1,
    status: 'BORROWED',
    createdAt: '2024-12-10T13:00:00.000Z',
    updatedAt: '2024-12-25T13:00:00.000Z'
  }
];

// 生成更多测试数据 - 确保数据一致性
for (let i = 6; i <= 30; i++) {
  const userId = Math.floor(Math.random() * 5) + 1;
  const bookId = Math.floor(Math.random() * mockBooks.length) + 1;
  const borrowDate = new Date(2024, 11, Math.floor(Math.random() * 30) + 1);
  const dueDate = new Date(borrowDate);
  dueDate.setDate(dueDate.getDate() + 30);
  
  const statuses = ['BORROWED', 'RETURNED', 'OVERDUE'];
  const status = statuses[Math.floor(Math.random() * 3)];
  const returnDate = status === 'RETURNED' ? new Date(borrowDate.getTime() + Math.random() * 25 * 24 * 60 * 60 * 1000) : null;
  
  // 查找对应的用户和图书信息
  const user = mockUsers.find(u => u.id === userId);
  const book = mockBooks.find(b => b.id === bookId);
  
  // 使用真实用户名和书名
  const userName = user ? user.username : `user${userId}`;
  const bookTitle = book ? book.title : `图书${bookId}`;
  
  mockBorrowRecords.push({
    id: i,
    userId,
    bookId,
    userName: userName,
    bookTitle: bookTitle,
    borrowDate: borrowDate.toISOString(),
    dueDate: dueDate.toISOString(),
    returnDate: returnDate ? returnDate.toISOString() : null,
    renewedCount: Math.floor(Math.random() * 2),
    maxRenewCount: 1,
    status,
    createdAt: borrowDate.toISOString(),
    updatedAt: borrowDate.toISOString()
  });
}

// 借阅统计模拟数据
export const mockBorrowStats = {
  totalUsers: 100,
  totalBooks: 500,
  totalBorrowed: 50,
  totalOverdue: 5,
  todayBorrowed: 3,
  todayReturned: 2,
  popularBooks: [
    { bookId: 1, bookTitle: '红楼梦', borrowCount: 20 },
    { bookId: 2, bookTitle: '三国演义', borrowCount: 15 },
    { bookId: 4, bookTitle: 'JavaScript高级程序设计', borrowCount: 12 },
    { bookId: 5, bookTitle: 'Vue.js设计与实现', borrowCount: 10 },
    { bookId: 3, bookTitle: '西游记', borrowCount: 8 }
  ],
  popularCategories: [
    { category: 1, categoryName: '文学', count: 30 },
    { category: 4, categoryName: '技术', count: 20 },
    { category: 2, categoryName: '历史', count: 15 },
    { category: 7, categoryName: '商业', count: 10 },
    { category: 5, categoryName: '教育', count: 8 }
  ]
};

// 添加以下代码到文件末尾
// 初始化借阅记录到localStorage
export function initBorrowData() {
  const storedRecords = JSON.parse(localStorage.getItem('mockBorrowRecords') || 'null')
  
  if (!storedRecords) {
    // 如果没有存储的数据，使用 mockBorrowRecords 并保存
    localStorage.setItem('mockBorrowRecords', JSON.stringify(mockBorrowRecords))
    console.log('初始化借阅记录数据到 localStorage')
  } else {
    // 确保ID连续且唯一
    const recordMap = new Map()
    let maxId = 0
    
    // 收集所有记录，确保唯一性
    storedRecords.forEach(record => {
      if (record && record.id) {
        const numericId = Number(record.id)
        if (!isNaN(numericId)) {
          recordMap.set(numericId, record)
          if (numericId > maxId) {
            maxId = numericId
          }
        }
      }
    })
    
    // 确保mockBorrowRecords中的记录也在其中
    mockBorrowRecords.forEach(record => {
      if (record && record.id) {
        const numericId = Number(record.id)
        if (!isNaN(numericId) && !recordMap.has(numericId)) {
          recordMap.set(numericId, record)
          if (numericId > maxId) {
            maxId = numericId
          }
        }
      }
    })
    
    // 转换为数组，确保ID连续
    const mergedRecords = []
    for (let i = 1; i <= maxId; i++) {
      if (recordMap.has(i)) {
        mergedRecords.push(recordMap.get(i))
      }
    }
    
    // 更新 localStorage
    localStorage.setItem('mockBorrowRecords', JSON.stringify(mergedRecords))
    
    // 更新 mockBorrowRecords（修改数组内容而不是重新赋值）
    mockBorrowRecords.length = 0
    mergedRecords.forEach(record => mockBorrowRecords.push(record))
    
  }
}

// 导出一个函数来获取当前借阅记录
export function getBorrowRecords() {
  const stored = JSON.parse(localStorage.getItem('mockBorrowRecords'))
  return stored || mockBorrowRecords
}

// 导出一个函数来保存借阅记录
export function saveBorrowRecords(records) {
  localStorage.setItem('mockBorrowRecords', JSON.stringify(records))
  // 同时更新 mockBorrowRecords 数组
  mockBorrowRecords.length = 0
  records.forEach(record => mockBorrowRecords.push(record))
}
