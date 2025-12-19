<template>
  <div class="borrow-management">
    <el-container style="height: 100vh;">
      <!-- 侧边栏 -->
      <el-aside width="200px" style="background-color: #304156;">
        <div class="logo">
          <h3>📚 图书管理</h3>
        </div>
        <el-menu
          :default-active="$route.path"
          background-color="#304156"
          text-color="#fff"
          active-text-color="#ffd04b"
          :router="true"
        >
          <el-menu-item index="/admin">
            <i class="el-icon-s-home"></i>
            <span>仪表板</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <i class="el-icon-user"></i>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/books">
            <i class="el-icon-notebook-2"></i>
            <span>图书管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/borrow">
            <i class="el-icon-document-copy"></i>
            <span>借阅管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部栏 -->
        <el-header style="background-color: #fff; border-bottom: 1px solid #eee;">
          <div class="header-right">
            <span>欢迎，{{ user.username }}</span>
            <el-button type="text" @click="logout" style="margin-left: 20px;">
              退出
            </el-button>
          </div>
        </el-header>
        
        <!-- 内容区 -->
        <el-main>
          <!-- 标签页切换 -->
          <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
            <el-tab-pane label="借书登记" name="borrow">
              <!-- 借书登记表单 -->
              <div class="borrow-form">
                <h3>借书登记</h3>
                <el-form :model="borrowForm" :rules="borrowRules" ref="borrowFormRef" label-width="100px">
                  <el-form-item label="选择用户" prop="userId">
                    <el-select
                      v-model="borrowForm.userId"
                      placeholder="请选择用户"
                      filterable
                      style="width: 300px"
                      @change="handleUserChange"
                    >
                      <el-option
                        v-for="user in userList"
                        :key="user.id"
                        :label="`${user.username} (可借 ${user.maxBorrowCount - user.borrowedCount} 本)`"
                        :value="user.id"
                        :disabled="user.borrowedCount >= user.maxBorrowCount"
                      >
                        <span style="float: left">{{ user.username }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">
                          {{ user.borrowedCount }}/{{ user.maxBorrowCount }}
                          <span v-if="user.borrowedCount >= user.maxBorrowCount" style="color: #f56c6c">
                            (已达上限)
                          </span>
                        </span>
                      </el-option>
                    </el-select>
                    <div v-if="selectedUser" class="user-info">
                      <p>用户名：{{ selectedUser.username }}</p>
                      <p>已借阅：{{ selectedUser.borrowedCount }} 本</p>
                      <p>可再借：{{ selectedUser.maxBorrowCount - selectedUser.borrowedCount }} 本</p>
                    </div>
                  </el-form-item>
                  
                  <el-form-item label="选择图书" prop="bookId">
                    <el-select
                      v-model="borrowForm.bookId"
                      placeholder="请选择图书"
                      filterable
                      style="width: 300px"
                      @change="handleBookChange"
                    >
                      <el-option
                        v-for="book in availableBooks"
                        :key="book.id"
                        :label="`${book.title} (库存 ${book.availableCopies} 本)`"
                        :value="book.id"
                        :disabled="book.availableCopies <= 0"
                      >
                        <span style="float: left">{{ book.title }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">
                          {{ book.availableCopies }} 本可借
                          <span v-if="book.availableCopies <= 0" style="color: #f56c6c">
                            (无库存)
                          </span>
                        </span>
                      </el-option>
                    </el-select>
                    <div v-if="selectedBook" class="book-info">
                      <p>书名：{{ selectedBook.title }}</p>
                      <p>作者：{{ selectedBook.author }}</p>
                      <p>库存：{{ selectedBook.availableCopies }} 本</p>
                    </div>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button 
                      type="primary" 
                      @click="handleBorrow" 
                      :loading="borrowing"
                      :disabled="!borrowForm.userId || !borrowForm.bookId"
                    >
                      确认借书
                    </el-button>
                    <el-button @click="resetBorrowForm">重置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="当前借阅" name="current">
              <!-- 当前借阅列表 -->
              <div class="current-borrow">
                <div class="table-header">
                  <h3>当前借阅列表</h3>
                  <div class="search-box">
                    <el-input
                      v-model="currentSearch"
                      placeholder="搜索用户或图书"
                      style="width: 200px"
                      @keyup.enter.native="loadCurrentBorrow"
                    >
                      <el-button slot="append" icon="el-icon-search" @click="loadCurrentBorrow"></el-button>
                    </el-input>
                    <el-button @click="resetCurrentSearch">重置</el-button>
                  </div>
                </div>
                
                <el-table
                  :data="currentBorrowList"
                  border
                  stripe
                  style="width: 100%; margin-top: 20px;"
                  v-loading="currentLoading"
                >
                  <el-table-column prop="userName" label="借阅人" width="120"></el-table-column>
                  <el-table-column prop="bookTitle" label="图书名称" min-width="200"></el-table-column>
                  <el-table-column prop="borrowDate" label="借阅日期" width="150">
                    <template slot-scope="scope">
                      {{ formatDate(scope.row.borrowDate) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="dueDate" label="应还日期" width="150">
                    <template slot-scope="scope">
                      <span :class="getDueDateClass(scope.row.dueDate)">
                        {{ formatDate(scope.row.dueDate) }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="renewedCount" label="续借次数" width="100">
                    <template slot-scope="scope">
                      {{ scope.row.renewedCount }}/{{ scope.row.maxRenewCount }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150" fixed="right">
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        type="success"
                        @click="handleReturnBook(scope.row)"
                      >
                        还书
                      </el-button>
                      <el-button
                        size="mini"
                        type="warning"
                        @click="handleRenewBook(scope.row)"
                        :disabled="scope.row.renewedCount >= scope.row.maxRenewCount"
                      >
                        续借
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div class="pagination">
                  <el-pagination
                    @size-change="handleCurrentSizeChange"
                    @current-change="handleCurrentPageChange"
                    :current-page="currentPagination.page"
                    :page-sizes="[10, 20, 50]"
                    :page-size="currentPagination.size"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="currentPagination.total"
                    :background="true"
                  >
                  </el-pagination>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="借阅记录" name="records">
              <!-- 所有借阅记录 -->
              <div class="all-records">
                <div class="table-header">
                  <h3>所有借阅记录</h3>
                  <div class="search-box">
                    <el-select
                      v-model="recordsFilter.status"
                      placeholder="状态筛选"
                      clearable
                      style="width: 120px; margin-right: 10px;"
                      @change="loadAllRecords"
                    >
                      <el-option label="借阅中" value="BORROWED"></el-option>
                      <el-option label="已归还" value="RETURNED"></el-option>
                      <el-option label="已逾期" value="OVERDUE"></el-option>
                    </el-select>
                    <el-input
                      v-model="recordsFilter.keyword"
                      placeholder="搜索用户或图书"
                      style="width: 200px; margin-right: 10px;"
                      @keyup.enter.native="loadAllRecords"
                    >
                      <el-button slot="append" icon="el-icon-search" @click="loadAllRecords"></el-button>
                    </el-input>
                    <el-button @click="resetRecordsFilter">重置</el-button>
                  </div>
                </div>
                
                <el-table
                  :data="allRecordsList"
                  border
                  stripe
                  style="width: 100%; margin-top: 20px;"
                  v-loading="recordsLoading"
                >
                  <el-table-column prop="userName" label="借阅人" width="120"></el-table-column>
                  <el-table-column prop="bookTitle" label="图书名称" min-width="200"></el-table-column>
                  <el-table-column prop="borrowDate" label="借阅日期" width="150">
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
                  <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                      <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                        {{ getStatusText(scope.row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150" fixed="right">
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        type="primary"
                        @click="viewRecordDetail(scope.row)"
                      >
                        详情
                      </el-button>
                      <el-button
                        v-if="scope.row.status === 'BORROWED'"
                        size="mini"
                        type="success"
                        @click="handleReturnBook(scope.row)"
                      >
                        还书
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                
                <div class="pagination">
                  <el-pagination
                    @size-change="handleRecordsSizeChange"
                    @current-change="handleRecordsPageChange"
                    :current-page="recordsPagination.page"
                    :page-sizes="[10, 20, 50]"
                    :page-size="recordsPagination.size"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="recordsPagination.total"
                    :background="true"
                  >
                  </el-pagination>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 借阅详情对话框 -->
    <el-dialog
      title="借阅记录详情"
      :visible.sync="detailDialogVisible"
      width="600px"
    >
      <div v-if="selectedRecord" class="record-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="借阅人">{{ selectedRecord.userName }}</el-descriptions-item>
          <el-descriptions-item label="图书名称">{{ selectedRecord.bookTitle }}</el-descriptions-item>
          <el-descriptions-item label="借阅日期">{{ formatDate(selectedRecord.borrowDate) }}</el-descriptions-item>
          <el-descriptions-item label="应还日期">{{ formatDate(selectedRecord.dueDate) }}</el-descriptions-item>
          <el-descriptions-item label="归还日期">
            {{ selectedRecord.returnDate ? formatDate(selectedRecord.returnDate) : '未归还' }}
          </el-descriptions-item>
          <el-descriptions-item label="续借次数">
            {{ selectedRecord.renewedCount }} / {{ selectedRecord.maxRenewCount }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedRecord.status)" size="small">
              {{ getStatusText(selectedRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedRecord.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(selectedRecord.updatedAt) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { borrowApi } from '@/api/borrow'
import { mockUsers } from '@/mock/user'
import { mockBooks } from '@/mock/book'

export default {
  name: 'BorrowManagement',
  data() {
    return {
      // 用户信息
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      
      // 当前激活的标签页
      activeTab: 'borrow',
      
      // 借书表单
      borrowForm: {
        userId: '',
        bookId: ''
      },
      borrowRules: {
        userId: [
          { required: true, message: '请选择用户', trigger: 'change' }
        ],
        bookId: [
          { required: true, message: '请选择图书', trigger: 'change' }
        ]
      },
      borrowing: false,
      
      // 用户和图书数据
      userList: [...mockUsers].filter(u => u.role === 'USER'),
      bookList: [...mockBooks],
      selectedUser: null,
      selectedBook: null,
      
      // 当前借阅列表
      currentSearch: '',
      currentBorrowList: [],
      currentLoading: false,
      currentPagination: {
        page: 1,
        size: 10,
        total: 0
      },
      
      // 所有借阅记录
      recordsFilter: {
        status: '',
        keyword: ''
      },
      allRecordsList: [],
      recordsLoading: false,
      recordsPagination: {
        page: 1,
        size: 10,
        total: 0
      },
      
      // 详情对话框
      detailDialogVisible: false,
      selectedRecord: null
    }
  },
  computed: {
    // 可借阅的图书（有库存的）
    availableBooks() {
      return this.bookList.filter(book => book.availableCopies > 0)
    }
  },
  mounted() {
    // 检查权限
    if (!this.user.id || this.user.role !== 'ADMIN') {
      this.$router.push('/admin/login')
      return
    }
    
    // 根据当前标签页加载数据
    if (this.activeTab === 'current') {
      this.loadCurrentBorrow()
    } else if (this.activeTab === 'records') {
      this.loadAllRecords()
    }
  },
  methods: {
    // 处理标签页切换
    handleTabClick(tab) {
      if (tab.name === 'current' && this.currentBorrowList.length === 0) {
        this.loadCurrentBorrow()
      } else if (tab.name === 'records' && this.allRecordsList.length === 0) {
        this.loadAllRecords()
      }
    },
    
    // 用户选择变化
    handleUserChange(userId) {
      this.selectedUser = this.userList.find(u => u.id === userId)
      this.borrowForm.bookId = '' // 重置图书选择
      this.selectedBook = null
    },
    
    // 图书选择变化
    handleBookChange(bookId) {
      this.selectedBook = this.bookList.find(b => b.id === bookId)
    },
    
    // 借书
    async handleBorrow() {
      this.$refs.borrowFormRef.validate(async (valid) => {
        if (!valid) return
        
        this.borrowing = true
        
        try {
          const res = await borrowApi.borrowBook(this.borrowForm)
          
          if (res.code === 200) {
            this.$message.success('借书成功')
            
            // 重置表单
            this.resetBorrowForm()
            
            // 刷新用户和图书数据
            this.selectedUser = this.userList.find(u => u.id === this.borrowForm.userId)
            this.selectedBook = this.bookList.find(b => b.id === this.borrowForm.bookId)
            
            // 如果当前在"当前借阅"标签页，刷新数据
            if (this.activeTab === 'current') {
              this.loadCurrentBorrow()
            }
          } else {
            this.$message.error(res.message)
          }
        } catch (error) {
          console.error('借书失败:', error)
          this.$message.error('借书失败，请稍后重试')
        } finally {
          this.borrowing = false
        }
      })
    },
    
    // 重置借书表单
    resetBorrowForm() {
      this.borrowForm = {
        userId: '',
        bookId: ''
      }
      this.selectedUser = null
      this.selectedBook = null
      if (this.$refs.borrowFormRef) {
        this.$refs.borrowFormRef.clearValidate()
      }
    },
    
    // 加载当前借阅
    async loadCurrentBorrow() {
    this.currentLoading = true
    try {
        const params = {
        page: this.currentPagination.page,
        size: this.currentPagination.size,
        status: 'BORROWED'
        }
        
        // 使用 keyword 参数而不是 userName 和 bookTitle
        if (this.currentSearch && this.currentSearch.trim()) {
        params.keyword = this.currentSearch.trim()
        }
        
        const res = await borrowApi.getBorrowRecords(params)
        
        if (res.code === 200) {
        this.currentBorrowList = res.data.list
        this.currentPagination.total = res.data.total
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
    
    // 重置当前借阅搜索
    resetCurrentSearch() {
      this.currentSearch = ''
      this.currentPagination.page = 1
      this.loadCurrentBorrow()
    },
    
    // 当前借阅分页
    handleCurrentSizeChange(size) {
      this.currentPagination.size = size
      this.currentPagination.page = 1
      this.loadCurrentBorrow()
    },
    
    handleCurrentPageChange(page) {
      this.currentPagination.page = page
      this.loadCurrentBorrow()
    },
    
    // 加载所有借阅记录
    async loadAllRecords() {
    this.recordsLoading = true
    try {
        const params = {
        page: this.recordsPagination.page,
        size: this.recordsPagination.size,
        status: this.recordsFilter.status
        }
        
        // 使用 keyword 参数而不是 userName 和 bookTitle
        if (this.recordsFilter.keyword && this.recordsFilter.keyword.trim()) {
        params.keyword = this.recordsFilter.keyword.trim()
        }
        
        const res = await borrowApi.getBorrowRecords(params)
        
        if (res.code === 200) {
        this.allRecordsList = res.data.list
        this.recordsPagination.total = res.data.total
        } else {
        this.$message.error(res.message)
        }
    } catch (error) {
        console.error('加载借阅记录失败:', error)
        this.$message.error('加载失败，请稍后重试')
    } finally {
        this.recordsLoading = false
    }
    },
    
    // 重置借阅记录筛选
    resetRecordsFilter() {
      this.recordsFilter = {
        status: '',
        keyword: ''
      }
      this.recordsPagination.page = 1
      this.loadAllRecords()
    },
    
    // 借阅记录分页
    handleRecordsSizeChange(size) {
      this.recordsPagination.size = size
      this.recordsPagination.page = 1
      this.loadAllRecords()
    },
    
    handleRecordsPageChange(page) {
      this.recordsPagination.page = page
      this.loadAllRecords()
    },
    
    // 还书
    handleReturnBook(record) {
      this.$confirm(`确定要归还《${record.bookTitle}》吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await borrowApi.returnBook(record.id)
          
          if (res.code === 200) {
            this.$message.success('还书成功')
            
            // 刷新数据
            if (this.activeTab === 'current') {
              this.loadCurrentBorrow()
            } else if (this.activeTab === 'records') {
              this.loadAllRecords()
            }
            
            // 刷新用户和图书数据
            this.userList = [...mockUsers].filter(u => u.role === 'USER')
            this.bookList = [...mockBooks]
            
            // 如果正在借书，更新选中用户的信息
            if (this.selectedUser) {
              this.selectedUser = this.userList.find(u => u.id === this.selectedUser.id)
            }
          } else {
            this.$message.error(res.message)
          }
        } catch (error) {
          console.error('还书失败:', error)
          this.$message.error('还书失败，请稍后重试')
        }
      }).catch(() => {})
    },
    
    // 续借
    handleRenewBook(record) {
      this.$confirm(`确定要为《${record.bookTitle}》续借15天吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async () => {
        try {
          const res = await borrowApi.renewBook(record.id)
          
          if (res.code === 200) {
            this.$message.success('续借成功')
            
            // 刷新数据
            if (this.activeTab === 'current') {
              this.loadCurrentBorrow()
            } else if (this.activeTab === 'records') {
              this.loadAllRecords()
            }
          } else {
            this.$message.error(res.message)
          }
        } catch (error) {
          console.error('续借失败:', error)
          this.$message.error('续借失败，请稍后重试')
        }
      }).catch(() => {})
    },
    
    // 查看记录详情
    async viewRecordDetail(record) {
      try {
        const res = await borrowApi.getBorrowRecordDetail(record.id)
        
        if (res.code === 200) {
          this.selectedRecord = res.data
          this.detailDialogVisible = true
        } else {
          this.$message.error(res.message)
        }
      } catch (error) {
        console.error('获取详情失败:', error)
        this.$message.error('获取详情失败，请稍后重试')
      }
    },
    
    // 工具函数
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    
    getDueDateClass(dueDate) {
      const now = new Date()
      const due = new Date(dueDate)
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) {
        return 'overdue' // 已逾期
      } else if (diffDays <= 3) {
        return 'near-due' // 即将到期（3天内）
      } else {
        return 'normal'
      }
    },
    
    getStatusTagType(status) {
      switch (status) {
        case 'BORROWED': return 'primary'
        case 'RETURNED': return 'success'
        case 'OVERDUE': return 'danger'
        default: return 'info'
      }
    },
    
    getStatusText(status) {
      switch (status) {
        case 'BORROWED': return '借阅中'
        case 'RETURNED': return '已归还'
        case 'OVERDUE': return '已逾期'
        default: return status
      }
    },
    
    // 退出登录
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/admin/login')
    }
  }
}
</script>

<style scoped>
.borrow-form, .current-borrow, .all-records {
  padding: 20px;
}

.borrow-form h3, .current-borrow h3, .all-records h3 {
  margin-bottom: 20px;
  color: #303133;
}

.user-info, .book-info {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}

.user-info p, .book-info p {
  margin: 5px 0;
  color: #606266;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

/* 还书日期样式 */
.overdue {
  color: #f56c6c;
  font-weight: bold;
}

.near-due {
  color: #e6a23c;
  font-weight: bold;
}

.normal {
  color: #67c23a;
}

/* 侧边栏样式 */
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-bottom: 1px solid #2c3e50;
}

.logo h3 {
  margin: 0;
}

/* 头部样式 */
.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

/* 详情对话框样式 */
.record-detail {
  line-height: 1.8;
}

.record-detail p {
  margin: 8px 0;
}
</style>