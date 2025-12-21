export const mockBooks = [
  {
    id: 1,
    isbn: '978-7-5354-1234-5',
    title: '红楼梦',
    author: '曹雪芹',
    publisher: '人民文学出版社',
    publishYear: 2020,
    category: 1,
    totalCopies: 5,
    availableCopies: 3,
    location: 'A区3排2架',
    description: '中国古典文学名著，清代作家曹雪芹创作的长篇章回体小说。',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    isbn: '978-7-02-001501-6',
    title: '三国演义',
    author: '罗贯中',
    publisher: '人民文学出版社',
    publishYear: 2019,
    category: 1,
    totalCopies: 3,
    availableCopies: 1,
    location: 'A区2排1架',
    description: '中国古代历史小说',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  },
  {
    id: 3,
    isbn: '978-7-02-015433-3',
    title: '西游记',
    author: '吴承恩',
    publisher: '人民文学出版社',
    publishYear: 2021,
    category: 1,
    totalCopies: 4,
    availableCopies: 4,
    location: 'A区2排3架',
    description: '中国古典神魔小说',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z'
  },
  {
    id: 4,
    isbn: '978-7-5327-8533-4',
    title: 'JavaScript高级程序设计',
    author: 'Nicholas C. Zakas',
    publisher: '人民邮电出版社',
    publishYear: 2019,
    category: 4,
    totalCopies: 10,
    availableCopies: 6,
    location: 'B区1排1架',
    description: 'JavaScript经典教程',
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z'
  },
  {
    id: 5,
    isbn: '978-7-115-51531-8',
    title: 'Vue.js设计与实现',
    author: '霍春阳',
    publisher: '人民邮电出版社',
    publishYear: 2022,
    category: 4,
    totalCopies: 8,
    availableCopies: 5,
    location: 'B区1排2架',
    description: 'Vue.js技术原理详解',
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z'
  },
  {
    id: 6,
    isbn: '978-7-5442-9981-6',
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    publisher: '中信出版社',
    publishYear: 2017,
    category: 2,
    totalCopies: 6,
    availableCopies: 2,
    location: 'C区1排1架',
    description: '从动物到上帝的人类历史',
    createdAt: '2024-01-06T00:00:00.000Z',
    updatedAt: '2024-01-06T00:00:00.000Z'
  },
  {
    id: 7,
    isbn: '978-7-5327-7372-0',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    publisher: '南海出版公司',
    publishYear: 2011,
    category: 1,
    totalCopies: 5,
    availableCopies: 3,
    location: 'A区1排1架',
    description: '拉丁美洲魔幻现实主义文学代表作',
    createdAt: '2024-01-07T00:00:00.000Z',
    updatedAt: '2024-01-07T00:00:00.000Z'
  },
  {
    id: 8,
    isbn: '978-7-5086-6852-7',
    title: '原则',
    author: '瑞·达利欧',
    publisher: '中信出版社',
    publishYear: 2018,
    category: 7,
    totalCopies: 7,
    availableCopies: 4,
    location: 'D区1排1架',
    description: '投资和工作生活原则',
    createdAt: '2024-01-08T00:00:00.000Z',
    updatedAt: '2024-01-08T00:00:00.000Z'
  }
];

// 生成更多图书数据
for (let i = 9; i <= 50; i++) {
  mockBooks.push({
    id: i,
    isbn: `978-7-${1000 + i}-${1000 + i}-${i}`,
    title: `图书示例 ${i}`,
    author: `作者 ${Math.floor(Math.random() * 10) + 1}`,
    publisher: ['人民文学出版社', '人民邮电出版社', '中信出版社', '清华大学出版社'][Math.floor(Math.random() * 4)],
    publishYear: 2015 + Math.floor(Math.random() * 8),
    category: Math.floor(Math.random() * 10) + 1,
    totalCopies: Math.floor(Math.random() * 10) + 1,
    availableCopies: Math.floor(Math.random() * 10) + 1,
    location: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}区${Math.floor(Math.random() * 5) + 1}排${Math.floor(Math.random() * 5) + 1}架`,
    description: `这是第${i}本图书的描述内容。`,
    createdAt: new Date(2024, 0, i).toISOString(),
    updatedAt: new Date(2024, 0, i).toISOString()
  });
}

// 确保 mockBooks 的 ID 是连续的
export function ensureBookIdsAreContinuous() {
  // 这个方法可以在应用启动时调用
  const storedBooks = JSON.parse(localStorage.getItem('books') || 'null')
  if (storedBooks) {
    // 重新分配 ID，确保连续
    const updatedBooks = storedBooks.map((book, index) => ({
      ...book,
      id: index + 1
    }))
    localStorage.setItem('books', JSON.stringify(updatedBooks))
    
    // 更新 mockBooks
    mockBooks.length = 0
    updatedBooks.forEach(book => mockBooks.push({...book}))
  }
}

// 确保图书数据初始化
export function initBookData() {
  // 检查 localStorage 是否有图书数据
  const storedBooks = JSON.parse(localStorage.getItem('books') || 'null')
  
  if (!storedBooks || storedBooks.length === 0) {
    // 如果没有存储的数据，使用 mockBooks 并保存
    localStorage.setItem('books', JSON.stringify(mockBooks))
    console.log('📚 初始化图书数据到 localStorage，数量:', mockBooks.length)
  } else {
    console.log('📚 已存在图书数据，数量:', storedBooks.length)
    
    // **修复：确保ID连续且唯一**
    const bookMap = new Map()
    
    // 按ID顺序处理图书，确保唯一性
    storedBooks
      .filter(book => book && book.id)
      .sort((a, b) => Number(a.id) - Number(b.id))
      .forEach(book => {
        const numericId = Number(book.id)
        if (!isNaN(numericId) && numericId > 0) {
          // 如果ID已存在，跳过重复的
          if (!bookMap.has(numericId)) {
            bookMap.set(numericId, {
              ...book,
              id: numericId
            })
          }
        }
      })
    
    // 转换为数组
    const mergedBooks = Array.from(bookMap.values())
    
    // 更新 localStorage
    localStorage.setItem('books', JSON.stringify(mergedBooks))
    
    console.log('🔄 合并并同步图书数据，共', mergedBooks.length, '本')
  }
}

initBookData()