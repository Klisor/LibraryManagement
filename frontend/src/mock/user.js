// 模拟用户数据
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    email: 'admin@example.com',
    role: 'ADMIN',
    maxBorrowCount: 10,
    borrowedCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    username: 'user1',
    password: '123456',
    email: 'user1@example.com',
    role: 'USER',
    maxBorrowCount: 5,
    borrowedCount: 2,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  },
  {
    id: 3,
    username: '李四',
    password: '123456',
    email: 'lisi@example.com',
    role: 'USER',
    maxBorrowCount: 5,
    borrowedCount: 1,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z'
  },
  {
    id: 4,
    username: '王五',
    password: '123456',
    email: 'wangwu@example.com',
    role: 'USER',
    maxBorrowCount: 5,
    borrowedCount: 0,
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z'
  },
  {
    id: 5,
    username: '赵六',
    password: '123456',
    email: 'zhaoliu@example.com',
    role: 'USER',
    maxBorrowCount: 5,
    borrowedCount: 3,
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z'
  }
];

// 生成更多用户数据
for (let i = 6; i <= 20; i++) {
  mockUsers.push({
    id: i,
    username: `user${i}`,
    password: '123456',
    email: `user${i}@example.com`,
    role: 'USER',
    maxBorrowCount: 5,
    borrowedCount: Math.floor(Math.random() * 6),
    createdAt: new Date(2024, 0, i).toISOString(),
    updatedAt: new Date(2024, 0, i).toISOString()
  });
}