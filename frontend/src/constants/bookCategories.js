// 根据您的数据库（2=科技），修改constants/bookCategories.js
export const BOOK_CATEGORIES = {
  1: '文学',
  2: '科技',  // 根据数据库修改：数据库中的2是"科技"
  3: '历史',
  4: '哲学',
  5: '艺术',
  6: '教育',
  7: '经济',
  8: '法律',
  9: '医学',
  10: '其他'
};

// 分类下拉选项
export const CATEGORY_OPTIONS = [
  { value: 1, label: '文学' },
  { value: 2, label: '科技' },  // 修改这里
  { value: 3, label: '历史' },
  { value: 4, label: '哲学' },
  { value: 5, label: '艺术' },
  { value: 6, label: '教育' },
  { value: 7, label: '经济' },
  { value: 8, label: '法律' },
  { value: 9, label: '医学' },
  { value: 10, label: '其他' }
];

// 根据数字获取分类名称
export function getCategoryName(categoryCode) {
  return BOOK_CATEGORIES[categoryCode] || '未知分类';
}

// 获取分类颜色（用于前端展示）
export function getCategoryColor(categoryCode) {
  const colors = [
    '#ff6b6b', '#48dbfb', '#1dd1a1', '#feca57', '#ff9ff3',
    '#f368e0', '#ff9f43', '#54a0ff', '#5f27cd', '#c8d6e5'
  ];
  return colors[(categoryCode - 1) % colors.length];
}