<template>
  <div class="my-borrow ancient-page">
    <!-- 顶部导航栏（与Home.vue和Personal.vue保持一致） -->
    <el-header class="user-header ancient-header">
      <div class="header-content">
        <div class="logo">
          <img src="../../assets/image/icons/book1.png" alt="图书管理系统" class="logo-img">
          <h2>知行书阁</h2>
        </div>

        <div class="nav-center">
          <el-menu mode="horizontal" :default-active="activeNav" @select="handleNavSelect">
            <el-menu-item index="home">首页</el-menu-item>
            <el-menu-item index="books">图书列表</el-menu-item>
            <el-menu-item index="borrow">我的借阅</el-menu-item>
            <el-menu-item index="personal">个人中心</el-menu-item>
          </el-menu>
        </div>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <i class="el-icon-user"></i>
              {{ user.username }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="notes">我的笔记</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 页面标题和统计 -->
      <div class="page-header ancient-section">
        <h1 class="ancient-title">
          <img src="../../assets/image/icons/book.png" class="title-icon" /> 我的借阅
        </h1>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-label">当前借阅</div>
            <div class="stat-value">{{ currentBorrowCount }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">可续借</div>
            <div class="stat-value">{{ renewableCount }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">即将到期</div>
            <div class="stat-value warning">{{ nearDueCount }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">已逾期</div>
            <div class="stat-value danger">{{ overdueCount }}</div>
          </div>
        </div>
      </div>

      <!-- 标签页切换 -->
      <el-tabs v-model="activeTab" class="borrow-tabs ancient-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="当前借阅" name="current">
          <!-- 当前借阅列表 -->
          <div class="borrow-list">
            <div v-if="currentLoading" class="loading-container">
              <el-skeleton :rows="5" animated />
            </div>
            
            <div v-else-if="currentBorrows.length === 0" class="empty-container ancient-empty">
              <el-empty description="暂无当前借阅记录"></el-empty>
              <div class="empty-action">
                <el-button type="primary" class="ancient-btn" @click="goToBookList">去借书</el-button>
              </div>
            </div>
            
            <div v-else class="borrow-cards">
              <div
                v-for="record in currentBorrows"
                :key="record.id"
                class="borrow-card ancient-card"
                :class="getCardClass(record.dueDate)"
              >
                <div class="card-header">
                  <h3 class="book-title">{{ record.bookTitle }}</h3>
                  <el-tag :type="getStatusTagType(record)" size="small" class="ancient-tag">
                    {{ getStatusText(record) }}
                  </el-tag>
                </div>
                
                <div class="card-body">
                  <div class="info-row">
                    <span class="label">借阅日期：</span>
                    <span class="value">{{ formatDate(record.borrowDate) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">应还日期：</span>
                    <span class="value">{{ formatDate(record.dueDate) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">续借次数：</span>
                    <span class="value">{{ record.renewedCount }}/{{ record.maxRenewCount }}</span>
                  </div>
                  
                  <div v-if="isNearDue(record.dueDate)" class="due-warning">
                    <i class="el-icon-warning"></i>
                    还有 {{ getDaysUntilDue(record.dueDate) }} 天到期
                  </div>
                  
                  <div v-if="isOverdue(record.dueDate)" class="due-danger">
                    <i class="el-icon-warning"></i>
                    已逾期 {{ getOverdueDays(record.dueDate) }} 天
                  </div>
                </div>
                
                <div class="card-actions">
                  <el-button
                    size="small"
                    type="primary"
                    class="ancient-btn"
                    @click="viewBookDetail(record.bookId)"
                  >
                    查看图书
                  </el-button>
                  
                  <el-button
                    size="small"
                    type="warning"
                    class="ancient-btn"
                    @click="handleRenew(record)"
                    :disabled="!canRenew(record)"
                  >
                    续借
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="借阅历史" name="history">
          <!-- 借阅历史列表 -->
          <div class="history-list">
            <div class="search-filter ancient-filter">
            
              
              <el-select
                v-model="historyStatus"
                placeholder="状态筛选"
                clearable
                @change="loadHistory"
                class="ancient-select"
                style="width: 150px;"
              >
                <el-option label="已归还" value="RETURNED"></el-option>
                <el-option label="已逾期" value="OVERDUE"></el-option>
              </el-select>
              
              <el-button @click="resetHistoryFilter" class="ancient-btn reset-btn">重置</el-button>
            </div>
            
            <div v-if="historyLoading" class="loading-container">
              <el-skeleton :rows="5" animated />
            </div>
            
            <div v-else-if="historyRecords.length === 0" class="empty-container ancient-empty">
              <el-empty description="暂无借阅历史记录"></el-empty>
            </div>
            
            <div v-else class="history-table ancient-table">
              <el-table
                :data="historyRecords"
                border
                stripe
                style="width: 100%;"
                :default-sort="{prop: 'borrowDate', order: 'descending'}"
                class="ancient-table"
                :row-style="{height: '60px'}"
              >
                <el-table-column prop="bookTitle" label="图书名称" min-width="200"></el-table-column>
                <el-table-column prop="borrowDate" label="借阅日期" width="150" sortable>
                  <template slot-scope="scope">
                    {{ formatDate(scope.row.borrowDate) }}
                  </template>
                </el-table-column>
                <el-table-column prop="dueDate" label="应还日期" width="150">
                  <template slot-scope="scope">
                    {{ formatDate(scope.row.dueDate) }}
                  </template>
                </el-table-column>
                <el-table-column prop="returnDate" label="归还日期" width="150">
                  <template slot-scope="scope">
                    {{ scope.row.returnDate ? formatDate(scope.row.returnDate) : '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="renewedCount" label="续借次数" width="100"></el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template slot-scope="scope">
                    <el-tag :type="getStatusTagType(scope.row)" size="small" class="ancient-tag">
                      {{ getStatusText(scope.row) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      type="primary"
                      class="table-action-btn"
                      @click="viewBookDetail(scope.row.bookId)"
                    >
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <div v-if="historyTotal > 0" class="pagination-container ancient-pagination">
                <el-pagination
                  @size-change="handleHistorySizeChange"
                  @current-change="handleHistoryPageChange"
                  :current-page="historyPagination.page"
                  :page-sizes="[10, 20, 50]"
                  :page-size="historyPagination.size"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="historyTotal"
                  :background="true"
                >
                </el-pagination>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 图书详情对话框 -->
    <el-dialog
      :title="selectedBookId ? '📖 图书详情' : '图书详情'"
      :visible.sync="bookDetailVisible"
      width="850px"
      @closed="selectedBookId = null"
      custom-class="ancient-dialog"
    >
      <BookDetail
        v-if="selectedBookId"
        :book-id="selectedBookId"
        @close="bookDetailVisible = false"
      />
    </el-dialog>
    
    <!-- 续借确认对话框 -->
    <el-dialog
      title="续借确认"
      :visible.sync="renewDialogVisible"
      width="400px"
      custom-class="ancient-dialog"
    >
      <div v-if="recordToRenew" class="renew-confirm">
        <p>确定要为《{{ recordToRenew.bookTitle }}》续借15天吗？</p>
        <p>当前续借次数：{{ recordToRenew.renewedCount }}/{{ recordToRenew.maxRenewCount }}</p>
        <p>原应还日期：{{ formatDate(recordToRenew.dueDate) }}</p>
        <p>新应还日期：{{ formatDate(getNewDueDate(recordToRenew.dueDate)) }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="renewDialogVisible = false" class="ancient-btn">取消</el-button>
        <el-button type="primary" @click="confirmRenew" :loading="renewing" class="ancient-btn">
          确定续借
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { borrowApi } from '@/api/borrow'
import { bookApi } from '@/api/book'
import BookDetail from '@/components/BookDetail.vue'

export default {
  name: 'MyBorrow',
  components: {
    BookDetail
  },
  data() {
    return {
      // 导航激活状态
      activeNav: 'borrow',
      
      // 用户信息
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      
      // 标签页
      activeTab: 'current',
      
      // 统计数据
      currentBorrowCount: 0,
      renewableCount: 0,
      nearDueCount: 0,
      overdueCount: 0,
      
      // 当前借阅数据
      currentBorrows: [],
      currentLoading: false,
      
      // 借阅历史数据
      historyKeyword: '',
      historyStatus: '',
      historyRecords: [],
      historyLoading: false,
      historyTotal: 0,
      historyPagination: {
        page: 1,
        size: 10
      },
      
      // 对话框
      bookDetailVisible: false,
      selectedBookId: null,
      renewDialogVisible: false,
      recordToRenew: null,
      renewing: false
    }
  },
  mounted() {
    // 检查是否登录 - 允许普通用户和管理员
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      this.$router.push('/user/login')
      return
    }

    // 检查用户权限 - 允许普通用户和管理员访问
    if (user.role !== 'USER' && user.role !== 'ADMIN') {
      this.$message.warning('请以用户或管理员身份登录')
      this.$router.push('/user/login')
      return
    }

    // 确保本地user数据与localStorage同步
    this.user = user

    console.log('当前用户信息:', this.user)
    console.log('用户ID:', this.user.id)
    console.log('用户名:', this.user.username)
    
    // 加载数据
    this.loadCurrentBorrows()
    this.loadHistory()
  },
  methods: {
    // 标签页点击处理
    handleTabClick(tab) {
      // 这里可以添加标签页切换时的逻辑
      console.log('切换到标签:', tab.name)
    },
    
    // 导航菜单选择
    handleNavSelect(index) {
      this.activeNav = index
      switch (index) {
        case 'home':
          if (this.$route.path !== '/user') {
            this.$router.push('/user')
          }
          break
        case 'books':
          this.$router.push('/user/books')
          break
        case 'borrow':
          if (this.$route.path !== '/user/borrow') {
            this.$router.push('/user/borrow')
          }
          break
        case 'personal':
          this.$router.push('/user/personal')
          break
        default:
          break
      }
    },
    
    // 用户下拉菜单命令处理
    handleCommand(command) {
      if (command === 'logout') {
        this.logout()
      } else if (command === 'profile' || command === 'notes') {
        this.$router.push('/user/personal')
      }
    },
    
    // 退出登录
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/user/login')
    },
    
    // 加载当前借阅数据
// 加载当前借阅数据（按需获取图书信息版本）
async loadCurrentBorrows() {
  this.currentLoading = true
  try {
    const params = {
      page: 1,
      size: 100,
      userId: this.user.id
    }
    
    // 调用 API
    const response = await borrowApi.getBorrowRecords(params)
    console.log('当前借阅响应:', response)
    
    // 简化处理：直接从响应中提取数据
    let data = response
    
    // 如果 response 有 data 属性（axios 响应格式）
    if (response && response.data) {
      data = response.data
    }
    
    console.log("处理后的数据:", data)
    
    // 现在 data 应该是 { code: 200, message: "成功", data: {...} }
    if (data && data.code === 200) {
      // 获取内层的 data
      const innerData = data.data
      
      // 获取列表数据
      let records = []
      if (Array.isArray(innerData)) {
        records = innerData
      } else if (innerData && Array.isArray(innerData.list)) {
        records = innerData.list
      } else {
        records = innerData || []
      }
      
      console.log("获取到的记录:", records)
      
      // 为每条记录获取图书信息
      const recordsWithBooks = await Promise.all(
        records.map(async record => {
          try {
            var bookResponse = await bookApi.getBookDetail(record.bookId)
            const bookRes = bookResponse.data 
            
            if (bookRes.code === 200 && bookRes.data) {
              return {
                ...record,
                bookTitle: bookRes.data.title || '未知图书',
                bookInfo: bookRes.data
              }
            } else {
              return {
                ...record,
                bookTitle: '图书信息获取失败',
                bookInfo: null
              }
            }
          } catch (error) {
            console.error(`获取图书 ${record.bookId} 信息失败:`, error)
            return {
              ...record,
              bookTitle: record.bookTitle || '未知图书',
              bookInfo: null
            }
          }
        })
      )
      
      this.currentBorrows = recordsWithBooks.filter(record => 
        record.status === 'BORROWED' || 
        (record.status === 'BORROWED' && this.isOverdue(record.dueDate))
      )
      this.updateStats(records)
    } else {
      this.$message.error(data?.message || '加载失败')
    }
  } catch (error) {
    console.error('加载当前借阅失败:', error)
    this.$message.error('加载失败，请稍后重试')
  } finally {
    this.currentLoading = false
  }
},
    
    // 更新统计数据
    updateStats(records) {
      const currentBorrows = records.filter(record => record.status === 'BORROWED')
      this.currentBorrowCount = currentBorrows.length
      
      this.renewableCount = currentBorrows.filter(record => 
        record.renewedCount < record.maxRenewCount
      ).length
      
      this.nearDueCount = currentBorrows.filter(record => 
        this.isNearDue(record.dueDate)
      ).length
      
      this.overdueCount = records.filter(record => 
        record.status === 'OVERDUE'
      ).length
    },
    
    // 加载借阅历史
    async loadHistory() {
  this.historyLoading = true
  try {
    const params = {
      page: this.historyPagination.page,
      size: this.historyPagination.size,
      userId: this.user.id
    }
    
    if (this.historyStatus) {
      params.status = this.historyStatus
    }
    
    if (this.historyKeyword.trim()) {
      params.keyword = this.historyKeyword.trim()
    }
    
    // 调用 API
    const response = await borrowApi.getBorrowRecords(params)
    console.log('借阅历史响应:', response)
    
    // 处理响应结构
    let res
    const responseData = response.data || response
    
    // 处理不同的响应格式
    if (responseData.data && responseData.data.code !== undefined) {
      // 格式: { data: { code, message, data: {...} } }
      res = responseData.data
    } else if (responseData.code !== undefined) {
      // 格式: { code, message, data: {...} }
      res = responseData
    } else {
      // 其他格式，尝试直接使用
      res = responseData
    }
    
    if (res && res.code === 200) {
      // 获取列表数据
      let records = []
      let total = 0
      
      if (Array.isArray(res.data)) {
        // 如果 data 直接是数组
        records = res.data
        total = records.length
      } else if (res.data && Array.isArray(res.data.list)) {
        // 如果 data 中有 list 字段
        records = res.data.list
        total = res.data.total || records.length
      } else {
        // 其他格式
        records = res.data || []
        total = records.length
      }
      
      console.log('获取到的历史记录:', records)
      
      // 为每条记录获取图书信息
      const recordsWithBooks = await Promise.all(
        records.map(async record => {
          try {
            const bookResponse = await bookApi.getBookDetail(record.bookId)
            const bookRes = bookResponse.data || bookResponse
            
            if (bookRes.code === 200 && bookRes.data) {
              return {
                ...record,
                bookTitle: bookRes.data.title || '未知图书',
                bookInfo: bookRes.data
              }
            } else {
              // 如果API返回了图书信息但在bookTitle字段中
              return {
                ...record,
                bookTitle: record.bookTitle || '图书信息获取失败',
                bookInfo: null
              }
            }
          } catch (error) {
            console.error(`获取图书 ${record.bookId} 信息失败:`, error)
            // 使用原有数据或默认值
            return {
              ...record,
              bookTitle: record.bookTitle || '未知图书',
              bookInfo: null
            }
          }
        })
      )
      
      this.historyRecords = recordsWithBooks
      this.historyTotal = total
    } else {
      this.$message.error(res?.message || '加载失败')
    }
  } catch (error) {
    console.error('加载借阅历史失败:', error)
    this.$message.error('加载失败，请稍后重试')
  } finally {
    this.historyLoading = false
  }
},
    
    // 重置历史筛选
    resetHistoryFilter() {
      this.historyKeyword = ''
      this.historyStatus = ''
      this.historyPagination.page = 1
      this.loadHistory()
    },
    
    // 历史分页
    handleHistorySizeChange(size) {
      this.historyPagination.size = size
      this.historyPagination.page = 1
      this.loadHistory()
    },
    
    handleHistoryPageChange(page) {
      this.historyPagination.page = page
      this.loadHistory()
    },
    
    // 检查是否可以续借
    canRenew(record) {
      return record.status === 'BORROWED' && 
             record.renewedCount < record.maxRenewCount
    },
    
    // 处理续借
    handleRenew(record) {
      this.recordToRenew = record
      this.renewDialogVisible = true
    },
    
    // 确认续借
    async confirmRenew() {
      if (!this.recordToRenew) return
      
      this.renewing = true
      try {
        var res = await borrowApi.renewBook(this.recordToRenew.id)
        res=res.data
        if (res.code === 200) {
          this.$message.success('续借成功')
          this.renewDialogVisible = false
          
          if (this.activeTab === 'current') {
            this.loadCurrentBorrows()
          } else {
            this.loadCurrentBorrows()
          }
        } else {
          this.$message.error(res.message)
        }
      } catch (error) {
        console.error('续借失败:', error)
        this.$message.error('续借失败，请稍后重试')
      } finally {
        this.renewing = false
        this.recordToRenew = null
      }
    },
    
    // 查看图书详情
    viewBookDetail(bookId) {
      if (this.bookDetailVisible) {
        this.bookDetailVisible = false
        this.$nextTick(() => {
          this.selectedBookId = bookId
          this.bookDetailVisible = true
        })
      } else {
        this.selectedBookId = bookId
        this.bookDetailVisible = true
      }
    },
    
    // 跳转到图书列表
    goToBookList() {
      this.$router.push('/user/books')
    },
    
    // 工具函数
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    
    // 日期相关函数
    isNearDue(dueDate) {
      const due = new Date(dueDate)
      const now = new Date()
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
      return diffDays > 0 && diffDays <= 7
    },
    
    isOverdue(dueDate) {
      const due = new Date(dueDate)
      const now = new Date()
      return due < now
    },
    
    getDaysUntilDue(dueDate) {
      const due = new Date(dueDate)
      const now = new Date()
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    },
    
    getOverdueDays(dueDate) {
      const due = new Date(dueDate)
      const now = new Date()
      const diffDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    },
    
    getCardClass(dueDate) {
      if (this.isOverdue(dueDate)) return 'overdue-card'
      if (this.isNearDue(dueDate)) return 'near-due-card'
      return ''
    },
    
    // 修改状态标签类型，将借阅中改为金色系
    getStatusTagType(record) {
      if (this.isOverdue(record.dueDate)) return 'danger'
      if (this.isNearDue(record.dueDate)) return 'warning'
      if (record.status === 'RETURNED') return 'success'
      // 借阅中状态使用金色系，设置为'primary'但我们会自定义样式
      return 'primary'
    },
    
    getStatusText(record) {
      if (record.status === 'RETURNED') return '已归还'
      if (this.isOverdue(record.dueDate)) return '已逾期'
      if (this.isNearDue(record.dueDate)) return '即将到期'
      return '借阅中'
    },
    
    getNewDueDate(currentDueDate) {
      const newDate = new Date(currentDueDate)
      newDate.setDate(newDate.getDate() + 15)
      return newDate.toISOString()
    }
  }
}
</script>

<style scoped>
/* 古籍风格全局设置 */
p,
h1,
h2,
h3 {
  font-family: "STKaiti", "KaiTi", serif;
}

/* 页面整体样式 */
.my-borrow.ancient-page {
  min-height: 100vh;
  background-image: url('../../assets/image/home2.jpg');
  background-size: 110% 110%;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

/* 添加半透明遮罩层，让内容更清晰 */
.my-borrow.ancient-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  z-index: -1;
}

/* 顶部导航栏样式（与Home.vue和Personal.vue一致） */
.user-header.ancient-header {
  background: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
    background-color: white;
  margin: 2px 20px;
}

.logo-img {
  width: 25px;
  height: 25px;
  margin-right: 20px;
  vertical-align: middle;
}

.logo h2 {
  display: inline-block;
  vertical-align: middle;
  color: #7c7262;
  font-size: 28px;
  font-family: "STKaiti", "SimSun", serif;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

/* 激活项底部横条 */
.nav-center .el-menu-item.is-active {
  border-bottom-color: #d4b483 !important;
}

/* 用户信息区域样式 */
.user-info .el-dropdown-link {
  cursor: pointer;
  color: #8b7355;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(250, 248, 245, 0.9);
  border: 1px solid #e8d4b8;
  transition: all 0.3s;
  font-family: "STKaiti", "KaiTi", serif;
}

.user-info .el-dropdown-link:hover {
  background: rgba(247, 243, 236, 0.95);
  border-color: #cbc0b1;
  color: #5b4636;
  box-shadow: 0 2px 8px rgba(155, 135, 110, 0.15);
}

.user-info .el-dropdown-link i {
  margin-right: 6px;
  color: #a7874b;
}

.user-info .el-dropdown-link .el-icon-arrow-down {
  margin-left: 6px;
  font-size: 12px;
  color: #8b7355;
}

.el-dropdown-menu {
  background: #ffffff !important;
  border: 1px solid #f6f1ea !important;
  border-radius: 8px !important;
}

.el-dropdown-menu__item:hover,
.el-dropdown-menu__item.is-hovered {
  background-color: rgba(230, 217, 203, 0.3) !important;
  color: #5b4636 !important;
}

/* 主要内容区 */
.main-content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 页面标题和统计 */
.page-header.ancient-section {
  background: linear-gradient(
    to bottom right,
    rgba(255, 254, 251, 0.9),
    rgba(255, 255, 254, 0.1)
  );
  backdrop-filter: blur(4px);
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(238, 238, 238, 0.6);
}

.page-header .ancient-title {
  margin-bottom: 20px;
  font-size: 28px;
  color: #5b4636;
  font-weight: 600;
  position: relative;
  border-bottom: 1px solid #ddd;
  padding-bottom: 6px;
  font-family: "STKaiti", "KaiTi", serif;
}

.title-icon {
  width: 25px;
  height: 25px;
  margin-right: 6px;
  margin-bottom: 6px;
  vertical-align: middle;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  background: rgba(250, 248, 245, 0.8);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e8d4b8;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.1);
}

.stat-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(155, 135, 110, 0.2);
  background: rgba(250, 248, 245, 1);
}

.stat-label {
  color: #8b7355;
  font-size: 15px;
  margin-bottom: 10px;
  font-weight: 500;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #a7874b;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-value.danger {
  color: #f56c6c;
}

/* 标签页样式 - 修改选中状态为古籍风格 */
.borrow-tabs.ancient-tabs {
  background: linear-gradient(
    to bottom right,
    rgba(255, 254, 251, 0.9),
    rgba(255, 255, 254, 0.1)
  );
  backdrop-filter: blur(4px);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(238, 238, 238, 0.6);
}

/* 修改标签页样式 - 参考顶边栏样式 */
.borrow-tabs.ancient-tabs /deep/ .el-tabs__header {
  margin-bottom: 20px;
}

.borrow-tabs.ancient-tabs /deep/ .el-tabs__nav-wrap::after {
  background-color: #e8d4b8 !important;
  height: 1px !important;
}

.borrow-tabs.ancient-tabs /deep/ .el-tabs__active-bar {
  background-color: #d4b483 !important;
  height: 2px !important;
}

/* 未选中标签页样式 - 淡一些的棕色 */
.borrow-tabs.ancient-tabs /deep/ .el-tabs__item {
  color: #a7874b !important;
  font-family: "STKaiti", "KaiTi", serif !important;
  font-size: 16px !important;
  font-weight: 500 !important;
  transition: all 0.3s !important;
}

/* 悬停状态 */
.borrow-tabs.ancient-tabs /deep/ .el-tabs__item:hover {
  color: #8b7355 !important;
}

/* 选中标签页样式 - 字体变黑，有金色条 */
.borrow-tabs.ancient-tabs /deep/ .el-tabs__item.is-active {
  color: #5b4636 !important;
  font-weight: 600 !important;
}

/* 禁用修改蓝色focus样式 */
.borrow-tabs.ancient-tabs /deep/ .el-tabs__item:focus.is-active.is-focus:not(:active) {
  box-shadow: none !important;
}

/* 当前借阅样式 */
.borrow-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.borrow-card.ancient-card {
  border: 1px solid #e8d4b8;
  border-radius: 12px;
  padding: 20px;
  background: #ffffff;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.1);
}

.borrow-card.ancient-card:hover {
  box-shadow: 0 6px 16px rgba(155, 135, 110, 0.2);
  transform: translateY(-3px);
}

.borrow-card.overdue-card {
  border-left: 5px solid #f56c6c;
}

.borrow-card.near-due-card {
  border-left: 5px solid #e6a23c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.book-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #5b4636;
  flex: 1;
  margin-right: 10px;
  font-family: "STKaiti", "KaiTi", serif;
}

/* 修改借阅状态标签样式 - 金色系 */
.ancient-tag {
  border-radius: 12px;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-weight: 500;
  font-size: 13px;
}

/* 自定义标签颜色 - 金色系 */
.ancient-tag.el-tag--primary {
  background-color: #f5e8c8 !important;
  border-color: #e6cb93 !important;
  color: #8b7355 !important;
}

.ancient-tag.el-tag--warning {
  background-color: #fdf6ec !important;
  border-color: #fbe2c4 !important;
  color: #e6a23c !important;
}

.ancient-tag.el-tag--success {
  background-color: #f0f9eb !important;
  border-color: #c2e7b0 !important;
  color: #67c23a !important;
}

.ancient-tag.el-tag--danger {
  background-color: #fef0f0 !important;
  border-color: #fbc4c4 !important;
  color: #f56c6c !important;
}

.card-body {
  margin-bottom: 15px;
}

.info-row {
  margin-bottom: 10px;
  display: flex;
  color: #8b7355;
  align-items: center;
  font-size: 14px;
}

.info-row .label {
  width: 80px;
  flex-shrink: 0;
  color: #8b7355;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-weight: 500;
}

.info-row .value {
  color: #5b4636;
  flex: 1;
  font-weight: 500;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
}

.due-warning,
.due-danger {
  margin-top: 15px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
}

.due-warning {
  background-color: rgba(253, 246, 236, 0.8);
  color: #e6a23c;
  border: 1px solid rgba(230, 162, 60, 0.2);
}

.due-danger {
  background-color: rgba(254, 240, 240, 0.8);
  color: #f56c6c;
  border: 1px solid rgba(245, 108, 108, 0.2);
}

.due-warning i,
.due-danger i {
  margin-right: 8px;
  font-size: 16px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 古籍风格按钮 */
.ancient-btn {
  background: linear-gradient(to bottom, #e6e2d9, #e6e2d9);
  border: none;
  color: #555;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s;
  box-shadow: none;
  transform: translateY(8px);
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
}

.ancient-btn:hover {
  background: linear-gradient(to bottom, #dcd7cd, #dcd7cd);
  color: #333;
  transform: translateY(4px) scale(1.03);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.ancient-btn.el-button--primary {
  background: #8b7355 !important;
  color: white !important;
}

.ancient-btn.el-button--warning {
  background: #fff5ea !important;
  color: rgb(133, 109, 77) !important;
  border-color: #d0b67d  !important;
}

.ancient-btn.el-button--primary:hover {
  background: #a7874b !important;
}

.ancient-btn.el-button--warning:hover {
  background: #e8d8c3 !important;
}

/* 重置按钮优化 */
.reset-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0 !important;
  transform: translateY(0) !important;
}

/* 表格操作按钮 - 移除动画效果 */
.table-action-btn {
  background:  #a7874b !important;
  border: none;
  color: white !important;
  font-weight: 500;
  border-radius: 4px;
  padding: 10px 12px !important;
  font-size: 13px;
  transform: none !important;
  margin: 0 !important;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
}

.table-action-btn:hover {
  background: #8b7355 !important;
  transform: none !important;
  box-shadow: 0 2px 6px rgba(155, 135, 110, 0.3);
}

/* 借阅历史样式 */
.search-filter.ancient-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 优化搜索筛选区域，确保按钮对齐 */
.search-filter.ancient-filter {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.search-filter .ancient-input,
.search-filter .ancient-select,
.search-filter .ancient-btn {
  height: 40px;
  display: flex;
  align-items: center;
}

/* 修复搜索输入框和按钮的样式问题 */
.search-filter .ancient-input {
  flex: 0 0 auto;
  width: 300px;
}

.search-filter .ancient-input /deep/ .el-input__inner {
  border: 1px solid #e8d4b8 !important;
  border-radius: 6px 0 0 6px !important;
  background-color: #fffffe !important;
  color: #5b4636 !important;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 14px;
  height: 40px;
  line-height: 40px;
}

/* 修复搜索按钮样式 */
.search-filter .ancient-input /deep/ .el-input-group__append {
  background-color: #e6e2d9 !important;
  border: 1px solid #e8d4b8 !important;
  border-left: none !important;
  border-radius: 0 6px 6px 0 !important;
  padding: 0 15px !important;
  height: 40px;
  display: flex;
  align-items: center;
}

.search-filter .ancient-input /deep/ .el-input-group__append .el-button {
  background: transparent !important;
  border: none !important;
  color: #5b4636 !important;
  padding: 0 !important;
  margin: 0 !important;
  transform: none !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.search-filter .ancient-input /deep/ .el-input-group__append .el-button:hover {
  background: rgba(212, 180, 131, 0.2) !important;
  color: #3c2c1e !important;
}

/* 专门为搜索附加按钮添加的样式 */
.search-append-btn {
  background: transparent !important;
  border: none !important;
  color: #5b4636 !important;
  padding: 0 !important;
  margin: 0 !important;
  transform: none !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.search-append-btn:hover {
  background: rgba(212, 180, 131, 0.2) !important;
  color: #3c2c1e !important;
}

.ancient-select {
  flex: 0 0 auto;
  width: 150px;
}

.ancient-select /deep/ .el-input__inner {
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 14px;
  height: 40px;
  line-height: 40px;
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

.ancient-empty {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 40px;
  border: 1px dashed #e8d4b8;
}

.empty-action {
  margin-top: 20px;
}

/* 古籍风格表格 */
.history-table.ancient-table {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8d4b8;
}

.ancient-table /deep/ .el-table {
  background: transparent;
}

.ancient-table /deep/ .el-table th {
  background: #f5f0e6 !important;
  color: #5b4636 !important;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-weight: bold;
  border-bottom: 1px solid #e8d4b8;
  padding: 12px 0 !important;
  height: 48px !important;
  font-size: 15px;
}

.ancient-table /deep/ .el-table td {
  background: rgba(255, 255, 255, 0.7);
  color: #5b4636;
  border-bottom: 1px solid #f0e6d3;
  padding: 8px 0 !important;
  vertical-align: middle !important;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 14px;
}

.ancient-table /deep/ .el-table__row {
  height: 60px !important;
}

.ancient-table /deep/ .el-table__row td {
  vertical-align: middle !important;
}

.ancient-table /deep/ .el-table--striped .el-table__body tr.el-table__row--striped td {
  background: rgba(245, 240, 230, 0.5);
}

.ancient-table /deep/ .el-table--enable-row-hover .el-table__body tr:hover>td {
  background: rgba(232, 212, 184, 0.3);
}

.ancient-table /deep/ .el-table--border {
  border: 1px solid #e8d4b8;
}

.ancient-table /deep/ .el-table--border th,
.ancient-table /deep/ .el-table--border td {
  border-right: 1px solid #e8d4b8;
}

/* 分页样式 */
.pagination-container.ancient-pagination {
  margin-top: 20px;
  text-align: center;
}

.ancient-pagination /deep/ .el-pagination.is-background .btn-prev,
.ancient-pagination /deep/ .el-pagination.is-background .btn-next,
.ancient-pagination /deep/ .el-pagination.is-background .el-pager li {
  color: #8b7355;
  border: 1px solid #e8d4b8;
  background: #fffbf6;
  font-weight: 500;
  transition: all 0.3s;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 14px;
}

.ancient-pagination /deep/ .el-pagination.is-background .btn-prev:hover,
.ancient-pagination /deep/ .el-pagination.is-background .btn-next:hover,
.ancient-pagination /deep/ .el-pagination.is-background .el-pager li:hover {
  color: #5b4636;
  background: #e8dbc9;
  border-color: #d4b483;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(155, 135, 110, 0.2);
}

.ancient-pagination /deep/ .el-pagination.is-background .el-pager li.active {
  background: #8b7355;
  border-color: #3c2c1e !important;
  color: white !important;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(91, 70, 54, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.ancient-pagination /deep/ .el-pagination.is-background .el-pager li.active:hover {
  background: #554d39 !important;
}

/* 续借确认对话框 */
.renew-confirm p {
  margin: 10px 0;
  color: #606266;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 0 10px;
  }
  
  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .stat-item {
    min-width: calc(50% - 10px);
  }
  
  .borrow-cards {
    grid-template-columns: 1fr;
  }
  
  .search-filter.ancient-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .ancient-input,
  .ancient-select,
  .reset-btn {
    width: 100% !important;
    margin-bottom: 10px;
    height: 40px !important;
  }
  
  /* 移动端标签页样式调整 */
  .borrow-tabs.ancient-tabs /deep/ .el-tabs__item {
    font-size: 14px !important;
    padding: 0 12px !important;
  }
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
  }
  
  .stat-item {
    min-width: 100%;
  }
}
</style>