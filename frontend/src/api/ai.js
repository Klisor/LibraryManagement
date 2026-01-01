// src/api/ai.js
import request from '@/utils/request'

export const aiApi = {
  // AI对话
  chatWithAI(data) {
    return request({
      url: '/ai/chat',
      method: 'post',
      data
    })
  },
  
  // 获取对话历史
  getChatHistory(limit = 10) {
    return request({
      url: '/ai/history',
      method: 'get',
      params: { limit }
    })
  },
  
  // 清除对话历史
  clearChatHistory() {
    return request({
      url: '/ai/history',
      method: 'delete'
    })
  }
}