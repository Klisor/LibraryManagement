<!-- src/components/AIAssistant.vue -->
<template>
  <div class="ai-assistant">
    <!-- 悬浮球 -->
    <div class="assistant-ball" :class="{ expanded: isExpanded }" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <!-- 收起状态 -->
      <div class="ball-content" v-if="!isExpanded">
        <i class="el-icon-chat-dot-round"></i>
      </div>
      
      <!-- 展开状态 -->
      <div class="expanded-content" v-else>
        <div class="assistant-header">
          <div class="assistant-avatar">
            <i class="el-icon-chat-dot-round"></i>
          </div>
          <div class="assistant-title">
            <h3>知行书阁·AI助手</h3>
            <p class="status-indicator">
              <span class="status-dot" :class="{ online: isOnline }"></span>
              {{ isOnline ? '在线' : '离线' }}
            </p>
          </div>
          <div class="assistant-actions">
            <el-tooltip content="最小化" placement="bottom">
              <i class="el-icon-minus" @click="toggleExpand"></i>
            </el-tooltip>
          </div>
        </div>
        
        <!-- 对话内容 -->
        <div class="chat-container" ref="chatContainer">
          <div class="chat-messages">
            <div v-for="(message, index) in messages" :key="index" 
                 :class="['message-item', message.type]">
              <div class="message-avatar">
                <i :class="message.type === 'user' ? 'el-icon-user' : 'el-icon-chat-dot-round'"></i>
              </div>
              <div class="message-content">
                <div class="message-text" v-html="formatMessage(message.content)"></div>
                <div class="message-time">{{ formatTime(message.time) }}</div>
              </div>
            </div>
            
            <!-- 加载指示器 -->
            <div v-if="isLoading" class="message-item ai loading">
              <div class="message-avatar">
                <i class="el-icon-chat-dot-round"></i>
              </div>
              <div class="message-content">
                <div class="message-text">
                  <span class="typing-indicator">
                    <span></span><span></span><span></span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 输入区域 -->
          <div class="chat-input-area">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="2"
              placeholder="请输入您的问题，例如：推荐一些历史类的书籍..."
              @keyup.enter.native="sendMessage"
              :disabled="isLoading"
              class="chat-input"
              resize="none"
            ></el-input>
            <div class="input-actions">
              <div class="quick-questions">
                <el-button
                  v-for="question in quickQuestions"
                  :key="question"
                  size="mini"
                  @click="sendQuickQuestion(question)"
                  :disabled="isLoading"
                  class="quick-question-btn"
                >
                  {{ question }}
                </el-button>
              </div>
              <div class="send-button">
                <el-button
                  type="primary"
                  @click="sendMessage"
                  :loading="isLoading"
                  :disabled="!inputMessage.trim()"
                  class="send-btn"
                >
                  <i class="el-icon-position"></i> 发送
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { aiApi } from '@/api/ai'

export default {
  name: 'AIAssistant',
  data() {
    return {
      isExpanded: false,
      isOnline: true,
      isLoading: false,
      inputMessage: '',
      messages: [
        {
          type: 'ai',
          content: '您好！我是知行书阁的AI助手。我可以帮您：\n1. 推荐图书\n2. 解答关于图书的问题\n3. 协助查找特定类型的书籍\n4. 提供阅读建议\n\n有什么可以帮您的吗？',
          time: new Date()
        }
      ],
      quickQuestions: [
        '推荐历史书籍',
        '找一本编程书',
        '最近的新书',
        '借阅规则'
      ],
      expandTimer: null
    }
  },
  mounted() {
    // 可以在这里加载历史对话
    this.loadChatHistory()
  },
  methods: {
    onMouseEnter() {
      // 清除之前的定时器
      if (this.expandTimer) {
        clearTimeout(this.expandTimer)
      }
      // 延迟展开，避免误触
      this.expandTimer = setTimeout(() => {
        this.isExpanded = true
      }, 300)
    },
    
    onMouseLeave() {
      // 清除定时器
      if (this.expandTimer) {
        clearTimeout(this.expandTimer)
        this.expandTimer = null
      }
      // 如果鼠标离开了整个助手区域，则收起
      if (this.isExpanded && !this.$el.querySelector('.expanded-content:hover')) {
        setTimeout(() => {
          if (!this.$el.querySelector('.expanded-content:hover')) {
            this.isExpanded = false
          }
        }, 500)
      }
    },
    
    toggleExpand() {
      this.isExpanded = !this.isExpanded
    },
    
    async sendMessage() {
      if (!this.inputMessage.trim() || this.isLoading) return
      
      const userMessage = this.inputMessage.trim()
      
      // 添加用户消息
      this.messages.push({
        type: 'user',
        content: userMessage,
        time: new Date()
      })
      
      this.inputMessage = ''
      this.isLoading = true
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      
      try {
        // 调用AI接口
        console.log('用户问题:', userMessage)
        const response = await aiApi.chatWithAI({
          message: userMessage,
          conversationId: Date.now().toString()
        })
        console.log('AI回复:', response.data.data?.aiResponse )
        // 添加AI回复
        this.messages.push({
          type: 'ai',
          content: response.data.data?.aiResponse || '抱歉，我暂时无法回答这个问题。',
          time: new Date()
        })
        
      } catch (error) {
        console.error('AI对话失败:', error)
        
        this.messages.push({
          type: 'ai',
          content: '抱歉，网络连接出现问题，请稍后再试。',
          time: new Date()
        })
      } finally {
        this.isLoading = false
        
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    
    sendQuickQuestion(question) {
      this.inputMessage = question
      this.sendMessage()
    },
    
    async loadChatHistory() {
      try {
        // 如果有需要，可以加载历史对话
        // const response = await aiApi.getChatHistory(10)
        // this.messages = response.data.data || []
      } catch (error) {
        console.error('加载历史失败:', error)
      }
    },
    
    scrollToBottom() {
      const container = this.$refs.chatContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    
    formatMessage(content) {
      // 简单的消息格式化
      return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
    },
    
    formatTime(time) {
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      
      // 如果是今天
      if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // 如果是昨天
      if (diff < 2 * 24 * 60 * 60 * 1000) {
        return '昨天 ' + date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // 其他时间
      return date.toLocaleDateString('zh-CN') + ' ' + 
        date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
    }
  }
}
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 9999;
}

/* 悬浮球样式 */
.assistant-ball {
  background: linear-gradient(135deg, #a7874b, #8b7355);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  box-shadow: 0 6px 20px rgba(167, 135, 75, 0.4);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.assistant-ball.expanded {
  width: 380px;
  height: 500px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(139, 115, 85, 0.3);
  transform: scale(1.02);
}

.ball-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* 展开内容样式 */
.expanded-content {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom right,
    rgba(255, 254, 251, 0.98),
    rgba(255, 255, 254, 0.95));
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(232, 212, 184, 0.6);
}

/* 助手头部 */
.assistant-header {
  padding: 20px;
  background: linear-gradient(135deg, #a7874b, #8b7355);
  color: white;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 20px;
}

.assistant-title {
  flex: 1;
}

.assistant-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
}

.status-indicator {
  margin: 4px 0 0 0;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
  margin-right: 6px;
  transition: background-color 0.3s;
}

.status-dot.online {
  background: #52c41a;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.assistant-actions {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: color 0.3s;
}

.assistant-actions i:hover {
  color: white;
}

/* 聊天容器 */
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: rgba(250, 248, 245, 0.5);
}

/* 消息项样式 */
.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.message-item.ai .message-avatar {
  background: linear-gradient(135deg, #a7874b, #8b7355);
  color: white;
  margin-right: 10px;
}

.message-item.user .message-avatar {
  background: linear-gradient(135deg, #f5f0e6, #e8d4b8);
  color: #5b4636;
  margin-left: 10px;
}

.message-content {
  max-width: 70%;
}

.message-item.ai .message-content {
  background: white;
  border: 1px solid #e8d4b8;
  border-radius: 12px 12px 12px 4px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(139, 115, 85, 0.1);
}

.message-item.user .message-content {
  background: linear-gradient(135deg, #a7874b, #8b7355);
  color: white;
  border-radius: 12px 12px 4px 12px;
  padding: 12px 16px;
}

.message-text {
  line-height: 1.6;
  font-size: 14px;
  word-wrap: break-word;
}

.message-item.ai .message-text {
  color: #5b4636;
}

.message-item.ai .message-text strong {
  color: #a7874b;
  font-weight: bold;
}

.message-item.ai .message-text em {
  color: #8b7355;
  font-style: italic;
}

.message-item.ai .message-text code {
  background: rgba(167, 135, 75, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 6px;
  text-align: right;
}

.message-item.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

/* 打字指示器 */
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a7874b;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 输入区域样式 */
.chat-input-area {
  padding: 15px 20px;
  border-top: 1px solid #e8d4b8;
  background: rgba(255, 255, 255, 0.9);
}

.chat-input >>> .el-textarea__inner {
  background: rgba(250, 248, 245, 0.9);
  border: 1px solid #e8d4b8;
  border-radius: 8px;
  font-size: 14px;
  color: #5b4636;
  resize: none;
}

.chat-input >>> .el-textarea__inner:focus {
  border-color: #d4b483;
  box-shadow: 0 0 0 2px rgba(167, 135, 75, 0.1);
}

.input-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-questions {
  flex: 1;
  overflow-x: auto;
  white-space: nowrap;
}

.quick-question-btn {
  margin-right: 8px;
  margin-bottom: 4px;
  background: rgba(232, 212, 184, 0.3) !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
  border-radius: 16px !important;
  padding: 4px 12px !important;
  font-size: 12px !important;
  transition: all 0.3s;
}

.quick-question-btn:hover {
  background: rgba(167, 135, 75, 0.2) !important;
  border-color: #a7874b !important;
  transform: translateY(-1px);
}

.send-btn {
  background: linear-gradient(135deg, #a7874b, #8b7355) !important;
  border-color: #8b7355 !important;
  border-radius: 8px !important;
  color: white !important;
  font-weight: bold;
  padding: 8px 16px !important;
  transition: all 0.3s;
}

.send-btn:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(167, 135, 75, 0.3);
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(232, 212, 184, 0.1);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(167, 135, 75, 0.3);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(167, 135, 75, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-assistant {
    right: 15px;
    bottom: 15px;
  }
  
  .assistant-ball.expanded {
    width: calc(100vw - 60px);
    max-width: 380px;
    height: 400px;
  }
  
  .assistant-header {
    padding: 15px;
  }
  
  .chat-messages {
    padding: 15px;
  }
  
  .chat-input-area {
    padding: 12px 15px;
  }
  
  .input-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .quick-questions {
    width: 100%;
  }
  
  .send-button {
    width: 100%;
  }
  
  .send-btn {
    width: 100%;
  }
}
</style>