<template>
  <div class="my-borrow">
    <!-- 顶部导航栏（复用BookList的样式） -->
    <div class="top-navbar">
      <div class="nav-container">
        <div class="nav-left">
          <div class="logo">
            <h2>📚 图书管理系统</h2>
          </div>
          <ul class="nav-menu">
            <li :class="{ active: $route.path === '/user' }">
              <router-link to="/user">首页</router-link>
            </li>
            <li :class="{ active: $route.path === '/user/books' }">
              <router-link to="/user/books">图书列表</router-link>
            </li>
            <li :class="{ active: $route.path === '/user/borrow' }">
              <router-link to="/user/borrow">我的借阅</router-link>
            </li>
            <li :class="{ active: $route.path === '/user/personal' }">
              <router-link to="/user/personal">个人中心</router-link>
            </li>
          </ul>
        </div>
        <div class="nav-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar size="small">{{ user.username.charAt(0) }}</el-avatar>
              <span class="username">{{ user.username }}</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="goToPersonal">个人中心</el-dropdown-item>
              <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 页面标题和统计 -->
      <div class="page-header">
        <h1>我的借阅</h1>
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
      <el-tabs v-model="activeTab" class="borrow-tabs">
        <el-tab-pane label="当前借阅" name="current">
          <!-- 当前借阅列表 -->
          <div class="borrow-list">
            <div v-if="currentLoading" class="loading-container">
              <el-skeleton :rows="5" animated />
            </div>
            
            <div v-else-if="currentBorrows.length === 0" class="empty-container">
              <el-empty description="暂无当前借阅记录"></el-empty>
              <div class="empty-action">
                <el-button type="primary" @click="goToBookList">去借书</el-button>
              </div>
            </div>
            
            <div v-else class="borrow-cards">
              <div
                v-for="record in currentBorrows"
                :key="record.id"
                class="borrow-card"
                :class="getCardClass(record.dueDate)"
              >
                <div class="card-header">
                  <h3 class="book-title">{{ record.bookTitle }}</h3>
                  <el-tag :type="getStatusTagType(record)" size="small">
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
                    @click="viewBookDetail(record.bookId)"
                  >
                    查看图书
                  </el-button>
                  
                  <el-button
                    size="small"
                    type="warning"
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
            <div class="search-filter">
              <el-input
                v-model="historyKeyword"
                placeholder="搜索书名"
                style="width: 300px; margin-right: 10px;"
                @keyup.enter.native="loadHistory"
              >
                <el-button slot="append" icon="el-icon-search" @click="loadHistory"></el-button>
              </el-input>
              
              <el-select
                v-model="historyStatus"
                placeholder="状态筛选"
                clearable
                @change="loadHistory"
                style="width: 150px; margin-right: 10px;"
              >
                <el-option label="已归还" value="RETURNED"></el-option>
                <el-option label="已逾期" value="OVERDUE"></el-option>
              </el-select>
              
              <el-button @click="resetHistoryFilter">重置</el-button>
            </div>
            
            <div v-if="historyLoading" class="loading-container">
              <el-skeleton :rows="5" animated />
            </div>
            
            <div v-else-if="historyRecords.length === 0" class="empty-container">
              <el-empty description="暂无借阅历史记录"></el-empty>
            </div>
            
            <div v-else class="history-table">
              <el-table
                :data="historyRecords"
                border
                stripe
                style="width: 100%;"
                :default-sort="{prop: 'borrowDate', order: 'descending'}"
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
                    <el-tag :type="getStatusTagType(scope.row)" size="small">
                      {{ getStatusText(scope.row) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      type="primary"
                      @click="viewBookDetail(scope.row.bookId)"
                    >
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <div v-if="historyTotal > 0" class="pagination-container">
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
      title="图书详情"
      :visible.sync="bookDetailVisible"
      width="600px"
    >
      <book-detail
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
    >
      <div v-if="recordToRenew" class="renew-confirm">
        <p>确定要为《{{ recordToRenew.bookTitle }}》续借15天吗？</p>
        <p>当前续借次数：{{ recordToRenew.renewedCount }}/{{ recordToRenew.maxRenewCount }}</p>
        <p>原应还日期：{{ formatDate(recordToRenew.dueDate) }}</p>
        <p>新应还日期：{{ formatDate(getNewDueDate(recordToRenew.dueDate)) }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="renewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRenew" :loading="renewing">
          确定续借
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { borrowApi } from '@/api/borrow'
import BookDetail from '@/components/BookDetail.vue'

export default {
  name: 'MyBorrow',
  components: {
    BookDetail
  },
  data() {
    return {
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
      // 检查用户是否登录
      if (!this.user.id || this.user.role !== 'USER') {
        this.$router.push('/user/login')
        return
      }
      
      console.log('当前用户信息:', this.user)
      console.log('用户ID:', this.user.id)
      console.log('用户名:', this.user.username)
      
      // 加载数据
      this.loadCurrentBorrows()
      this.loadHistory()
    },
  methods: {
    // 加载当前借阅数据
    async loadCurrentBorrows() {
      this.currentLoading = true
      try {
        const params = {
          page: 1,
          size: 100,
          // 不指定状态，获取所有状态的记录，然后在前端过滤
          userId: this.user.id
        }
        
        const res = await borrowApi.getBorrowRecords(params)
        
        if (res.code === 200) {
          // 当前借阅 = 状态为 BORROWED 的记录
          this.currentBorrows = res.data.list.filter(record => 
            record.status === 'BORROWED'
          )
          this.updateStats(res.data.list)  // 传入所有记录进行统计
        } else {
          this.$message.error(res.message)
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
      // 当前借阅 = 状态为 BORROWED 的记录
      const currentBorrows = records.filter(record => record.status === 'BORROWED')
      this.currentBorrowCount = currentBorrows.length
      
      // 可续借 = 当前借阅中且未达到最大续借次数的
      this.renewableCount = currentBorrows.filter(record => 
        record.renewedCount < record.maxRenewCount
      ).length
      
      // 即将到期 = 当前借阅中且7天内到期的
      this.nearDueCount = currentBorrows.filter(record => 
        this.isNearDue(record.dueDate)
      ).length
      
      // 已逾期 = 状态为 OVERDUE 的记录
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
        
        // 添加状态筛选
        if (this.historyStatus) {
          params.status = this.historyStatus
        }
        
        // 添加搜索关键词
        if (this.historyKeyword.trim()) {
          params.keyword = this.historyKeyword.trim()
        }
        
        const res = await borrowApi.getBorrowRecords(params)
        
        if (res.code === 200) {
          // 借阅历史 = 状态不为 BORROWED 的记录（包括 RETURNED 和 OVERDUE）
          this.historyRecords = res.data.list
          this.historyTotal = res.data.total
        } else {
          this.$message.error(res.message)
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
        const res = await borrowApi.renewBook(this.recordToRenew.id)
        
        if (res.code === 200) {
          this.$message.success('续借成功')
          this.renewDialogVisible = false
          
          // **修复：根据当前标签页刷新数据**
          if (this.activeTab === 'current') {
            this.loadCurrentBorrows()
          } else {
            // 如果在历史标签页，也刷新当前借阅（因为续借会影响当前借阅状态）
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
      this.selectedBookId = bookId
      this.bookDetailVisible = true
    },
    
    // 跳转到图书列表
    goToBookList() {
      this.$router.push('/user/books')
    },
    
    // 跳转到个人中心
    goToPersonal() {
      this.$router.push('/user/personal')
    },
    
    // 退出登录
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/user/login')
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
      return diffDays > 0 && diffDays <= 7 // 7天内到期
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
    
    getStatusTagType(record) {
      if (this.isOverdue(record.dueDate)) return 'danger'
      if (this.isNearDue(record.dueDate)) return 'warning'
      if (record.status === 'RETURNED') return 'success'
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
      newDate.setDate(newDate.getDate() + 15) // 续借15天
      return newDate.toISOString()
    }
  }
}
</script>

<style scoped>
.my-borrow {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏样式（复用BookList的样式） */
.top-navbar {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
}

.logo h2 {
  margin: 0;
  font-size: 20px;
  color: #409eff;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  margin-left: 40px;
  padding: 0;
}

.nav-menu li {
  margin: 0 15px;
}

.nav-menu li a {
  text-decoration: none;
  color: #606266;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-menu li.active a {
  color: #409eff;
  background-color: #ecf5ff;
}

.nav-menu li a:hover {
  color: #409eff;
}

.nav-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-info .username {
  margin: 0 8px;
}

/* 主要内容区 */
.main-content {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 页面标题和统计 */
.page-header {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0 0 20px 0;
  color: #303133;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  background-color: #f5f7fa;
  padding: 15px 20px;
  border-radius: 8px;
  text-align: center;
  min-width: 120px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-value.danger {
  color: #f56c6c;
}

/* 标签页 */
.borrow-tabs {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 当前借阅样式 */
.borrow-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.borrow-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
  transition: all 0.3s;
}

.borrow-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.borrow-card.overdue-card {
  border-left: 4px solid #f56c6c;
}

.borrow-card.near-due-card {
  border-left: 4px solid #e6a23c;
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
  color: #303133;
  flex: 1;
  margin-right: 10px;
}

.card-body {
  margin-bottom: 15px;
}

.info-row {
  margin-bottom: 8px;
  display: flex;
}

.info-row .label {
  color: #909399;
  width: 80px;
  flex-shrink: 0;
}

.info-row .value {
  color: #606266;
  flex: 1;
}

.due-warning,
.due-danger {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.due-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.due-danger {
  background-color: #fef0f0;
  color: #f56c6c;
}

.due-warning i,
.due-danger i {
  margin-right: 5px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 借阅历史样式 */
.search-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

.empty-action {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

/* 续借确认对话框 */
.renew-confirm p {
  margin: 10px 0;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 10px;
  }
  
  .nav-menu {
    margin-left: 20px;
  }
  
  .nav-menu li {
    margin: 0 5px;
  }
  
  .nav-menu li a {
    padding: 6px 8px;
    font-size: 14px;
  }
  
  .main-content {
    padding: 0 10px;
  }
  
  .stats {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .stat-item {
    min-width: calc(50% - 10px);
  }
  
  .borrow-cards {
    grid-template-columns: 1fr;
  }
}
</style>