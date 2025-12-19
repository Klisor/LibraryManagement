export const BOOK_CATEGORIES = {
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
};

// 分类下拉选项
export const CATEGORY_OPTIONS = [
  { value: 1, label: '文学' },
  { value: 2, label: '历史' },
  { value: 3, label: '科学' },
  { value: 4, label: '技术' },
  { value: 5, label: '教育' },
  { value: 6, label: '艺术' },
  { value: 7, label: '商业' },
  { value: 8, label: '健康' },
  { value: 9, label: '旅行' },
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