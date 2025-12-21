<template>
  <div class="borrow-management">
    <el-container style="height: 100vh;">
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <div class="logo">
          <img src="@/assets/image/icons/book1.png" alt="图书管理系统" class="logo-img">
          <h3>知行书阁（后台）</h3>
        </div>
        <el-menu
          :default-active="$route.path"
          background-color="#f9f7f3"
          text-color="#5b4636"
          active-text-color="#a7874b"
          :router="true"
          class="ancient-menu"
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
        <!-- 顶部导航栏 -->
        <el-header class="admin-header">
          <div class="user-actions">
            <el-dropdown @command="handleCommand" class="admin-user-info">
              <span class="el-dropdown-link">
                <i class="el-icon-user"></i>
                {{ user.username }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 内容区 -->
        <el-main class="ancient-main">
          <!-- 标签页切换 -->
          <div class="page-header">
            <h2>借阅管理</h2>
          </div>
          
          <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick" class="ancient-tabs">
            <el-tab-pane label="借书登记" name="borrow">
              <!-- 借书登记表单 -->
              <div class="borrow-form ancient-section">
                <h3 class="ancient-title">
                  <i class="el-icon-document-add"></i> 借书登记
                </h3>
                <el-form :model="borrowForm" :rules="borrowRules" ref="borrowFormRef" label-width="100px" class="ancient-form">
                  <el-form-item label="选择用户" prop="userId">
                    <el-select
                      v-model="borrowForm.userId"
                      placeholder="请输入用户名搜索"
                      filterable
                      remote
                      :remote-method="searchUsers"
                      :loading="userSearchLoading"
                      style="width: 300px"
                      @change="handleUserChange"
                      clearable
                      class="ancient-select"
                    >
                      <el-option
                        v-for="user in searchedUsers"
                        :key="user.id"
                        :label="`${user.username} (${user.email}) - 可借 ${user.maxBorrowCount - user.borrowedCount} 本`"
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
                      <!-- 如果没有搜索到用户时显示提示 -->
                      <el-option v-if="userSearchQuery && searchedUsers.length === 0" disabled>
                        <span style="color: #909399">未找到匹配的用户</span>
                      </el-option>
                    </el-select>
                    <div v-if="selectedUser" class="user-info">
                      <p><i class="el-icon-user"></i> 用户名：{{ selectedUser.username }}</p>
                      <p><i class="el-icon-collection"></i> 已借阅：{{ selectedUser.borrowedCount }} 本</p>
                      <p><i class="el-icon-plus"></i> 可再借：{{ selectedUser.maxBorrowCount - selectedUser.borrowedCount }} 本</p>
                    </div>
                  </el-form-item>
                  
                  <el-form-item label="选择图书" prop="bookId">
                    <el-select
                      v-model="borrowForm.bookId"
                      placeholder="请输入书名、作者或ISBN搜索"
                      filterable
                      remote
                      :remote-method="searchBooks"
                      :loading="bookSearchLoading"
                      style="width: 300px"
                      @change="handleBookChange"
                      clearable
                      class="ancient-select"
                    >
                      <el-option
                        v-for="book in searchedBooks"
                        :key="`book-${book.id}`"
                        :label="`${book.title} - ${book.author} (库存 ${book.availableCopies}/${book.totalCopies})`"
                        :value="book.id"
                        :disabled="book.availableCopies <= 0"
                      >
                        <span style="float: left">{{ book.title }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">
                          {{ book.availableCopies }}/{{ book.totalCopies }}
                          <span v-if="book.availableCopies <= 0" style="color: #f56c6c">
                            (无库存)
                          </span>
                        </span>
                      </el-option>
                      <!-- 如果没有搜索到图书时显示提示 -->
                      <el-option v-if="bookSearchQuery && searchedBooks.length === 0" disabled>
                        <span style="color: #909399">未找到匹配的图书</span>
                      </el-option>
                    </el-select>
                    
                    <!-- 添加刷新按钮 -->
                    <el-button 
                      type="text" 
                      icon="el-icon-refresh" 
                      @click="forceRefreshBookList" 
                      style="margin-left: 10px;"
                      title="刷新图书列表"
                      class="refresh-btn"
                    >
                      刷新
                    </el-button>
                    
                    <div v-if="selectedBook" class="book-info">
                      <p><i class="el-icon-notebook-2"></i> 书名：{{ selectedBook.title }}</p>
                      <p><i class="el-icon-user"></i> 作者：{{ selectedBook.author }}</p>
                      <p><i class="el-icon-tickets"></i> ISBN：{{ selectedBook.isbn }}</p>
                      <p><i class="el-icon-collection"></i> 库存：{{ selectedBook.availableCopies }}/{{ selectedBook.totalCopies }} 本</p>
                    </div>
                  </el-form-item>
                  
                  <el-form-item class="form-buttons">
                    <el-button 
                      type="primary" 
                      @click="handleBorrow" 
                      :loading="borrowing"
                      :disabled="!canBorrowBook"
                      class="ancient-btn confirm-btn"
                    >
                      <i class="el-icon-check"></i> 确认借书
                    </el-button>
                    <el-button @click="resetBorrowForm" class="ancient-btn reset-btn">
                      <i class="el-icon-refresh-left"></i> 重置
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="当前借阅" name="current">
              <!-- 当前借阅列表 -->
              <div class="current-borrow ancient-section">
                <div class="section-header">
                  <h3 class="ancient-title">
                    <i class="el-icon-collection"></i> 当前借阅列表
                  </h3>
                  <div class="search-box">
                    <el-input
                      v-model="currentSearch"
                      placeholder="搜索用户或图书"
                      style="width: 200px; margin-right: 15px;"
                      @keyup.enter.native="loadCurrentBorrow"
                      class="ancient-search"
                    >
                      <el-button slot="append" icon="el-icon-search" @click="loadCurrentBorrow" class="search-btn"></el-button>
                    </el-input>
                    <el-button @click="resetCurrentSearch" class="ancient-btn reset-btn">重置</el-button>
                  </div>
                </div>
                
                <el-table
                  :data="currentBorrowList"
                  border
                  stripe
                  style="width: 100%;"
                  v-loading="currentLoading"
                  class="ancient-table"
                  :row-class-name="tableRowClassName"
                >
                  <el-table-column prop="userName" label="借阅人" width="120" align="center"></el-table-column>
                  <el-table-column prop="bookTitle" label="图书名称" min-width="200"></el-table-column>
                  <el-table-column prop="borrowDate" label="借阅日期" width="150" align="center">
                    <template slot-scope="scope">
                      {{ formatDate(scope.row.borrowDate) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="dueDate" label="应还日期" width="150" align="center">
                    <template slot-scope="scope">
                      <span :class="getDueDateClass(scope.row.dueDate)">
                        {{ formatDate(scope.row.dueDate) }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="renewedCount" label="续借次数" width="100" align="center">
                    <template slot-scope="scope">
                      {{ scope.row.renewedCount }}/{{ scope.row.maxRenewCount }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="200" fixed="right" align="center">
                    <template slot-scope="scope">
                      <div class="action-buttons">
                        <el-button
                          size="mini"
                          @click="viewRecordDetail(scope.row)"
                          class="action-btn detail-btn"
                        >
                          <i class="el-icon-view"></i> 详情
                        </el-button>
                        <el-button
                          size="mini"
                          :disabled="!shouldShowReturnButton(scope.row)"
                          @click="shouldShowReturnButton(scope.row) && handleReturnBook(scope.row)"
                          class="action-btn return-btn"
                          :class="{ 'disabled-return-btn': !shouldShowReturnButton(scope.row) }"
                        >
                          <i class="el-icon-circle-check"></i> 还书
                        </el-button>
                      </div>
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
                    class="ancient-pagination"
                  >
                  </el-pagination>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="借阅记录" name="records">
              <!-- 所有借阅记录 -->
              <div class="all-records ancient-section">
                <div class="section-header">
                  <h3 class="ancient-title">
                    <i class="el-icon-document"></i> 所有借阅记录
                  </h3>
                  <div class="search-box">
                    <el-select
                      v-model="recordsFilter.status"
                      placeholder="状态筛选"
                      clearable
                      style="width: 120px; margin-right: 15px;"
                      @change="loadAllRecords"
                      class="ancient-select"
                    >
                      <el-option label="借阅中" value="BORROWED"></el-option>
                      <el-option label="已归还" value="RETURNED"></el-option>
                      <el-option label="已逾期" value="OVERDUE"></el-option>
                    </el-select>
                    <el-input
                      v-model="recordsFilter.keyword"
                      placeholder="搜索用户或图书"
                      style="width: 200px; margin-right: 15px;"
                      @keyup.enter.native="loadAllRecords"
                      class="ancient-search"
                    >
                      <el-button slot="append" icon="el-icon-search" @click="loadAllRecords" class="search-btn"></el-button>
                    </el-input>
                    <el-button @click="resetRecordsFilter" class="ancient-btn reset-btn">重置</el-button>
                  </div>
                </div>
                
                <el-table
                  :data="allRecordsList"
                  border
                  stripe
                  style="width: 100%;"
                  v-loading="recordsLoading"
                  class="ancient-table"
                  :row-class-name="tableRowClassName"
                >
                  <el-table-column prop="userName" label="借阅人" width="120" align="center"></el-table-column>
                  <el-table-column prop="bookTitle" label="图书名称" min-width="200"></el-table-column>
                  <el-table-column prop="borrowDate" label="借阅日期" width="150" align="center">
                    <template slot-scope="scope">
                      {{ formatDate(scope.row.borrowDate) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="dueDate" label="应还日期" width="150" align="center">
                    <template slot-scope="scope">
                      {{ formatDate(scope.row.dueDate) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="returnDate" label="归还日期" width="150" align="center">
                    <template slot-scope="scope">
                      {{ scope.row.returnDate ? formatDate(scope.row.returnDate) : '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100" align="center">
                    <template slot-scope="scope">
                      <el-tag :type="getStatusTagType(scope.row)" size="small" class="status-tag">
                        {{ getRealStatusText(scope.row) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="200" fixed="right" align="center">
                    <template slot-scope="scope">
                      <div class="action-buttons">
                        <el-button
                          size="mini"
                          @click="viewRecordDetail(scope.row)"
                          class="action-btn detail-btn"
                        >
                          <i class="el-icon-view"></i> 详情
                        </el-button>
                        <el-button
                          size="mini"
                          :disabled="!shouldShowReturnButton(scope.row)"
                          @click="shouldShowReturnButton(scope.row) && handleReturnBook(scope.row)"
                          class="action-btn return-btn"
                          :class="{ 'disabled-return-btn': !shouldShowReturnButton(scope.row) }"
                        >
                          <i class="el-icon-circle-check"></i> 还书
                        </el-button>
                      </div>
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
                    class="ancient-pagination"
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
      @close="detailDialogVisible = false"
      class="ancient-dialog"
    >
      <div v-if="selectedRecord" class="record-detail">
        <el-descriptions :column="1" border class="ancient-descriptions">
          <el-descriptions-item label="借阅人">
            <i class="el-icon-user"></i> {{ selectedRecord.userName }}
          </el-descriptions-item>
          <el-descriptions-item label="图书名称">
            <i class="el-icon-notebook-2"></i> {{ selectedRecord.bookTitle }}
          </el-descriptions-item>
          <el-descriptions-item label="借阅日期">
            <i class="el-icon-time"></i> {{ formatDate(selectedRecord.borrowDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="应还日期">
            <i class="el-icon-date"></i> {{ formatDate(selectedRecord.dueDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="归还日期">
            <i class="el-icon-circle-check"></i>
            {{ selectedRecord.returnDate ? formatDate(selectedRecord.returnDate) : '未归还' }}
          </el-descriptions-item>
          <el-descriptions-item label="续借次数">
            <i class="el-icon-refresh"></i>
            {{ selectedRecord.renewedCount }} / {{ selectedRecord.maxRenewCount }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedRecord)" size="small" class="status-tag">
              {{ getRealStatusText(selectedRecord) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            <i class="el-icon-circle-plus"></i> {{ formatDate(selectedRecord.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            <i class="el-icon-edit"></i> {{ formatDate(selectedRecord.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div slot="footer" class="dialog-footer ancient-dialog-footer">
        <el-button @click="detailDialogVisible = false" class="ancient-btn cancel-btn">关闭</el-button>
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
          { required: true, message: '请选择用户', trigger: 'blur' }
        ],
        bookId: [
          { required: true, message: '请选择图书', trigger: 'blur' }
        ]
      },
      borrowing: false,
      
      // 用户和图书数据
      userList: [],
      bookList: [],
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
      
      // 新增远程搜索相关属性
      userSearchLoading: false,
      userSearchQuery: '',
      searchedUsers: [],  // 用于存储搜索到的用户
      bookSearchLoading: false,
      bookSearchQuery: '',
      searchedBooks: [],  // 用于存储搜索到的图书

      // 详情对话框
      detailDialogVisible: false,
      selectedRecord: null,

      forceUserRefresh: 0
    }
  },
  computed: {
    // 可借阅的图书（有库存的） - 现在通过搜索过滤
    availableBooks() {
      // 由于现在使用远程搜索，这个计算属性可以简单返回当前搜索到的图书
      // 过滤掉无库存的图书
      return this.searchedBooks.filter(book => book.availableCopies > 0)
    },
    
    // 动态获取用户列表（包括管理员）
    dynamicUserList() {
      // 这个 console.log 可以帮助我们确认计算属性是否被重新执行
      console.log('🔄 重新计算 dynamicUserList，forceUserRefresh:', this.forceUserRefresh)
      
      // 合并 mockUsers 和 registeredUsers
      const mockUsersList = [...mockUsers]
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      
      // 创建一个映射来避免重复用户（以ID为准）
      const userMap = new Map()
      
      // 先添加 mockUsers
      mockUsersList.forEach(user => {
        if (user.id) {
          userMap.set(user.id, { 
            ...user,
            borrowedCount: Number(user.borrowedCount) || 0 // 确保是数字
          })
        }
      })
      
      // 再添加 registeredUsers，覆盖重复的
      registeredUsers.forEach(user => {
        if (user.id) {
          const userId = Number(user.id)
          if (!isNaN(userId)) {
            userMap.set(userId, { 
              ...user,
              id: userId, // 确保ID是数字类型
              borrowedCount: Number(user.borrowedCount) || 0 // 确保是数字
            })
          }
        }
      })
      
      return Array.from(userMap.values())
    },
    
    // 动态获取图书列表
    // 修改 dynamicBookList 计算属性
    dynamicBookList() {
      // 从统一的数据源获取图书数据
      try {
        // 直接从 localStorage 获取，避免循环依赖
        const storedBooks = JSON.parse(localStorage.getItem('books') || 'null')
        
        // 使用不同的变量名
        const books = storedBooks || [...mockBooks]
        
        // 确保所有图书ID是数字类型，并去重
        const bookMap = new Map()
        books.forEach(book => {
          if (book && book.id) {
            const numericId = Number(book.id)
            if (!isNaN(numericId)) {
              const uniqueBook = {
                ...book,
                id: numericId
              }
              bookMap.set(numericId, uniqueBook)
            }
          }
        })
        
        return Array.from(bookMap.values())
      } catch (error) {
        console.error('获取图书数据失败:', error)
        // 如果出现错误，返回去重后的mockBooks
        const bookMap = new Map()
        mockBooks.forEach(book => {
          if (book && book.id) {
            const numericId = Number(book.id)
            if (!isNaN(numericId)) {
              bookMap.set(numericId, book)
            }
          }
        })
        return Array.from(bookMap.values())
      }
    },
    canBorrowBook() {
      if (!this.borrowForm.userId || !this.borrowForm.bookId) {
        return false
      }
      
      // 检查用户是否达到最大借阅数
      if (this.selectedUser && this.selectedUser.borrowedCount >= this.selectedUser.maxBorrowCount) {
        return false
      }
      
      // 检查图书是否有库存
      if (this.selectedBook && this.selectedBook.availableCopies <= 0) {
        return false
      }
      
      return true
    }
  },
  mounted() {
    // 检查权限
    if (!this.user.id || this.user.role !== 'ADMIN') {
      this.$router.push('/admin/login')
      return
    }
    
    // 每次进入都重新加载用户和图书列表（但不再初始化搜索列表）
    // this.refreshUserList()  // 注释掉这行，因为现在用搜索
    // this.refreshBookList()  // 注释掉这行，因为现在用搜索
    
    // 初始化搜索列表为空
    this.searchedUsers = []
    this.searchedBooks = []
    
    // 根据当前标签页加载数据
    if (this.activeTab === 'current') {
      this.loadCurrentBorrow()
    } else if (this.activeTab === 'records') {
      this.loadAllRecords()
    }
  },
  methods: {
    // 表格行类名
    tableRowClassName({ row }) {
      return row.status === 'RETURNED' ? 'returned-row' : ''
    },

    // 搜索用户方法
    async searchUsers(query) {
      if (!query || query.trim() === '') {
        this.searchedUsers = []
        return
      }
      
      this.userSearchLoading = true
      this.userSearchQuery = query
      
      try {
        // 这里需要从用户列表中过滤，但为了性能，建议使用API搜索
        // 先使用本地过滤
        const allUsers = this.dynamicUserList
        const searchTerm = query.toLowerCase().trim()
        
        const results = allUsers.filter(user => 
          user.username.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        ).slice(0, 20) // 限制显示20条结果
        
        this.searchedUsers = results
        
        // 如果没有选中的用户或者选中的用户不在搜索结果中，重置选择
        if (this.selectedUser && !results.some(u => u.id === this.selectedUser.id)) {
          this.borrowForm.userId = ''
          this.selectedUser = null
        }
      } catch (error) {
        console.error('搜索用户失败:', error)
        this.$message.error('搜索用户失败')
      } finally {
        this.userSearchLoading = false
      }
    },

    // 搜索图书方法
    async searchBooks(query) {
      // 修改：当查询为空时，显示最新添加的图书
      if (!query || query.trim() === '') {
        this.bookSearchLoading = true
        try {
          // **修复：总是从 localStorage 获取最新数据**
          const storedBooks = JSON.parse(localStorage.getItem('books') || 'null')
          let allBooks = []
          
          if (storedBooks && storedBooks.length > 0) {
            allBooks = storedBooks
            console.log('📚 从 localStorage 获取图书数据，数量:', allBooks.length)
          } else {
            allBooks = [...mockBooks]
            console.log('📚 从 mockBooks 获取图书数据，数量:', allBooks.length)
          }
          
          // **修复：确保数据有效性并排序**
          const validBooks = allBooks
            .filter(book => book && book.id && book.title && book.author)
            .sort((a, b) => {
              // 按ID倒序，新添加的在前
              const idA = Number(a.id) || 0
              const idB = Number(b.id) || 0
              return idB - idA
            })
          
          this.searchedBooks = validBooks.slice(0, 30) // 显示最新30本
          
          console.log('🔍 空搜索返回图书数量:', this.searchedBooks.length)
          console.log('📖 最新3本图书:', this.searchedBooks.slice(0, 3).map(b => `${b.id}:${b.title}`).join(', '))
          
        } catch (error) {
          console.error('获取图书数据失败:', error)
          this.$message.error('获取图书数据失败')
          this.searchedBooks = []
        } finally {
          this.bookSearchLoading = false
        }
        return
      }
      
      this.bookSearchLoading = true
      this.bookSearchQuery = query
      
      try {
        // 关键修复：每次搜索时都从 localStorage 获取最新数据，而不是依赖缓存的列表
        const storedBooks = JSON.parse(localStorage.getItem('books') || 'null')
        const allBooks = storedBooks || [...mockBooks]
        
        // 确保数据有效
        const validBooks = allBooks.filter(book => 
          book && book.id && book.title && book.author
        )
        
        const searchTerm = query.toLowerCase().trim()
        
        // 在多个字段中搜索（书名、作者、ISBN）
        const results = validBooks.filter(book => {
          // 确保字段存在且是字符串
          const title = (book.title || '').toString().toLowerCase()
          const author = (book.author || '').toString().toLowerCase()
          const isbn = (book.isbn || '').toString().toLowerCase()
          
          return title.includes(searchTerm) ||
                author.includes(searchTerm) ||
                isbn.includes(searchTerm)
        })
        
        // 按ID倒序排列，确保新添加的图书显示在前面
        const sortedResults = results.sort((a, b) => b.id - a.id)
        
        this.searchedBooks = sortedResults.slice(0, 20) // 限制显示20条结果
        
        // 如果没有选中的图书或者选中的图书不在搜索结果中，重置选择
        if (this.selectedBook && !results.some(b => b.id === this.selectedBook.id)) {
          this.borrowForm.bookId = ''
          this.selectedBook = null
        }
        
        // 调试信息
        console.log('🔍 搜索关键词:', query)
        console.log('📚 搜索到图书数量:', results.length)
        if (results.length > 0) {
          console.log('📖 搜索结果:', results.map(b => `${b.id}:${b.title}`).join(', '))
        }
        
      } catch (error) {
        console.error('搜索图书失败:', error)
        this.$message.error('搜索图书失败')
      } finally {
        this.bookSearchLoading = false
      }
    },

    getLatestBookData() {
      try {
        // 直接从 localStorage 获取最新数据
        const storedBooks = JSON.parse(localStorage.getItem('books') || 'null')
        
        // 如果没有数据，使用 mockBooks
        const books = storedBooks || [...mockBooks]
        
        // 确保数据有效
        const validBooks = books.filter(book => 
          book && 
          book.id && 
          typeof book.id === 'number' && 
          !isNaN(book.id) &&
          book.title && 
          book.author
        )
        
        // 按ID倒序排序，确保新添加的图书在前
        validBooks.sort((a, b) => b.id - a.id)
        
        return validBooks
      } catch (error) {
        console.error('获取图书数据失败:', error)
        // 返回mock数据
        return [...mockBooks].sort((a, b) => b.id - a.id)
      }
    },
    // 添加方法判断是否应该显示还书按钮
    shouldShowReturnButton(record) {
      // 可以还书的逻辑：当前是借阅中或已逾期（且未归还）
      return record.status === 'BORROWED' || 
            record.status === 'OVERDUE' ||
            // 动态计算：如果是BORROWED状态但已过期，也应该可以还书
            (record.status === 'BORROWED' && new Date(record.dueDate) < new Date())
    },
    // 刷新图书列表
    refreshBookList() {
      // 使用新方法获取最新数据
      this.bookList = this.getLatestBookData()
      console.log('✅ 刷新图书列表，图书数量:', this.bookList.length)
      
      // 调试输出：显示每本书的库存
      this.bookList.forEach(book => {
        console.log(`📚 ${book.title} (ID: ${book.id}): 库存 ${book.availableCopies}/${book.totalCopies}`)
      })
    },

    // 刷新用户列表
    refreshUserList() {
      // 强制重新计算 dynamicUserList
      this.forceUserRefresh++
      
      // 等待 Vue 响应式系统更新
      this.$nextTick(() => {
        this.userList = this.dynamicUserList
        
        console.log('✅ 刷新用户列表，用户数量:', this.userList.length)
        
        // 查找当前选中的用户，如果有的话，更新它的引用
        if (this.selectedUser) {
          const updatedUser = this.userList.find(u => u.id === this.selectedUser.id)
          if (updatedUser) {
            this.selectedUser = updatedUser
          }
        }
      })
    },

    // 处理标签页切换
    handleTabClick(tab) {
      if (tab.name === 'borrow') {
        // 切换到借书登记时，重置搜索状态
        this.searchedUsers = []
        this.searchedBooks = []
        this.userSearchQuery = ''
        this.bookSearchQuery = ''
        
        // 新增：主动刷新图书列表，并触发一次空搜索
        this.refreshBookList()
        
        // 延迟一点执行搜索，确保数据已加载
        setTimeout(() => {
          this.searchBooks('')
        }, 100)
        
      } else if (tab.name === 'current') {
        this.loadCurrentBorrow()
      } else if (tab.name === 'records') {
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
      if (bookId) {
        const numericId = Number(bookId)
        
        // 优先从当前搜索到的图书列表中查找
        this.selectedBook = this.searchedBooks.find(b => {
          if (!b || !b.id) return false
          return Number(b.id) === numericId
        })
        
        // 如果没有找到，尝试从最新数据源中查找
        if (!this.selectedBook) {
          const allBooks = this.getLatestBookData()
          this.selectedBook = allBooks.find(b => {
            if (!b || !b.id) return false
            return Number(b.id) === numericId
          })
        }
        
        // 确保availableCopies是数字
        if (this.selectedBook && this.selectedBook.availableCopies !== undefined) {
          this.selectedBook.availableCopies = Number(this.selectedBook.availableCopies)
        }
        
        // 调试信息
        if (this.selectedBook) {
          console.log('✅ 选中图书:', this.selectedBook.title, 'ID:', this.selectedBook.id, '库存:', this.selectedBook.availableCopies)
        }
      } else {
        this.selectedBook = null
      }
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
            
            // **修复：更新所有相关列表**
            this.loadCurrentBorrow()
            this.loadAllRecords()
            this.refreshUserList()
            this.refreshBookList()
            
            // 重置表单
            this.resetBorrowForm()
            
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
      // 1. 重置表单数据
      this.borrowForm = {
        userId: '',
        bookId: ''
      }
      this.selectedUser = null
      this.selectedBook = null
      
      // 2. 重置搜索状态
      this.searchedUsers = []
      this.searchedBooks = []
      this.userSearchQuery = ''
      this.bookSearchQuery = ''
      
      // 3. 清除表单验证
      if (this.$refs.borrowFormRef) {
        this.$nextTick(() => {
          this.$refs.borrowFormRef.resetFields()
        })
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
          
          // **修复：添加调试日志，检查数据是否正确**
          console.log('📋 借书记录加载完成:', {
            总数: res.data.total,
            当前页记录数: res.data.list.length,
            状态分布: {
              BORROWED: res.data.list.filter(r => r.status === 'BORROWED').length,
              RETURNED: res.data.list.filter(r => r.status === 'RETURNED').length,
              OVERDUE: res.data.list.filter(r => r.status === 'OVERDUE').length
            }
          })
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
        type: 'warning',
        customClass: 'ancient-confirm-dialog'
      }).then(async () => {
        try {
          const res = await borrowApi.returnBook(record.id)
          
          if (res.code === 200) {
            this.$message.success('还书成功')
            
            // **关键修复：立即更新界面，而不是等待API重新加载**
            
            // 1. 如果当前在"当前借阅"标签页，立即从列表中移除这条记录
            if (this.activeTab === 'current') {
              const index = this.currentBorrowList.findIndex(r => r.id === record.id)
              if (index !== -1) {
                this.currentBorrowList.splice(index, 1)
                this.currentPagination.total--
              }
            }
            
            // 2. 如果当前在"借书记录"标签页，立即更新这条记录的状态
            if (this.activeTab === 'records') {
              const recordIndex = this.allRecordsList.findIndex(r => r.id === record.id)
              if (recordIndex !== -1) {
                // 立即更新状态和归还日期
                this.allRecordsList[recordIndex] = {
                  ...this.allRecordsList[recordIndex],
                  status: 'RETURNED',
                  returnDate: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
                
                // 强制Vue重新渲染这一行
                this.allRecordsList = [...this.allRecordsList]
              }
            }
            
            // 3. 刷新所有列表（确保数据一致性）
            this.loadCurrentBorrow()
            this.loadAllRecords()
            this.refreshUserList()
            this.refreshBookList()
            
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
        type: 'info',
        customClass: 'ancient-confirm-dialog'
      }).then(async () => {
        try {
          const res = await borrowApi.renewBook(record.id)
          
          if (res.code === 200) {
            this.$message.success('续借成功')
            
            // **修复：续借后也刷新所有相关列表**
            // 刷新当前借阅列表
            this.loadCurrentBorrow()
            
            // 刷新借阅记录列表
            this.loadAllRecords()
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
    // 添加一个方法来动态计算状态文本
    getRealStatusText(record) {
      // 如果记录已经是 RETURNED，直接返回"已归还"
      if (record.status === 'RETURNED') {
        return '已归还'
      }
      
      // 如果记录是 BORROWED，检查是否逾期
      if (record.status === 'BORROWED') {
        const now = new Date()
        const dueDate = new Date(record.dueDate)
        if (dueDate < now) {
          return '已逾期'
        } else {
          const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
          if (diffDays <= 3) {
            return '即将到期'
          }
          return '借阅中'
        }
      }
      
      // 如果记录是 OVERDUE，返回"已逾期"
      if (record.status === 'OVERDUE') {
        return '已逾期'
      }
      
      return record.status
    },

    getStatusTagType(record) {
      const statusText = this.getRealStatusText(record)
      switch (statusText) {
        case '借阅中': return 'primary'
        case '已归还': return 'success'
        case '已逾期': return 'danger'
        case '即将到期': return 'warning'
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
    
    // 强制刷新图书列表
    forceRefreshBookList() {
      console.log('🔄 强制刷新图书列表...')
      
      // 清空当前的搜索状态
      this.searchedBooks = []
      this.bookSearchQuery = ''
      this.borrowForm.bookId = ''
      this.selectedBook = null
      
      // 重新从 localStorage 加载数据
      const storedBooks = JSON.parse(localStorage.getItem('books') || 'null')
      console.log('📊 当前图书总数:', storedBooks ? storedBooks.length : 0)
      
      if (storedBooks) {
        console.log('📖 最新几本图书:', storedBooks.slice(0, 3).map(b => `${b.id}:${b.title}`).join(', '))
      }
      
      // 触发一次空搜索，显示最新图书
      this.searchBooks('')
      
      this.$message.success('图书列表已刷新')
    },

    // 下拉菜单命令处理
    handleCommand(command) {
      if (command === 'logout') {
        this.logout()
      } else if (command === 'profile') {
        this.$message.info('管理员个人资料功能开发中')
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
/* 导入全局样式 */
@import '@/assets/ancient-form.css';

/* 通用古籍字体 - 只用于标题 */
h1, h2, h3, h4, h5, h6 {
  font-family: "STKaiti", "KaiTi", serif;
}

/* 容器 */
.borrow-management {
  min-height: 100vh;
  background-image: url('@/assets/image/home2.jpg');
  background-size: 110% 110%;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.borrow-management::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  z-index: -1;
}

/* 侧边栏样式 */
.el-aside {
  background: rgba(255, 254, 251, 0.95) !important;
  border-right: 1px solid #e8d4b8;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

/* 侧边栏logo */
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-bottom: 1px solid #e8d4b8;
  background: rgba(245, 240, 230, 0.8);
}

.logo-img {
  width: 25px;
  height: 25px;
  margin-right: 10px;
}

.logo h3 {
  color: #5b4636;
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 18px;
  margin: 0;
  font-weight: bold;
}

/* 侧边栏菜单 */
.ancient-menu {
  border-right: none !important;
  padding: 10px 0;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  transition: all 0.3s;
  margin: 5px 10px;
  border-radius: 8px;
}

.el-menu-item:hover {
  background: rgba(232, 212, 184, 0.2) !important;
}

.el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(167, 135, 75, 0.1), rgba(139, 115, 85, 0.1)) !important;
  border-left: 3px solid #a7874b !important;
  color: #5b4636 !important;
  font-weight: bold;
}

.el-menu-item i {
  color: #8b7355;
  font-size: 16px;
}

.el-menu-item.is-active i {
  color: #a7874b;
}

/* 顶部导航栏 */
.admin-header {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 60px !important;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

/* 用户信息样式 */
.admin-user-info .el-dropdown-link {
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
  font-size: 14px;
}

.admin-user-info .el-dropdown-link:hover {
  background: rgba(247, 243, 236, 0.95);
  border-color: #cbc0b1;
  color: #5b4636;
  box-shadow: 0 2px 8px rgba(155, 135, 110, 0.15);
}

.admin-user-info .el-dropdown-link i {
  margin-right: 6px;
  color: #a7874b;
}

.admin-user-info .el-dropdown-link .el-icon-arrow-down {
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

/* 主内容区 */
.ancient-main {
  background: transparent;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

/* 页面头部 - 与BookManagement.vue保持一致 */
.page-header {
  margin-bottom: 20px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-header h2 {
  color: #5b4636;
  font-size: 22px;
  margin: 0;
}

/* 标签页样式 - 调整与BookManagement.vue一致 */
.ancient-tabs {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.ancient-tabs /deep/ .el-tabs__nav-wrap::after {
  background-color: #e8d4b8;
}

.ancient-tabs /deep/ .el-tabs__item {
  color: #8b7355;
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 15px;
  transition: all 0.3s;
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
}

.ancient-tabs /deep/ .el-tabs__item:hover {
  color: #a7874b;
}

.ancient-tabs /deep/ .el-tabs__item.is-active {
  color: #5b4636;
  font-weight: bold;
  background: rgba(245, 240, 230, 0.8);
  border-radius: 6px 6px 0 0;
}

.ancient-tabs /deep/ .el-tabs__active-bar {
  background-color: #a7874b;
  height: 3px;
}

/* 板块样式 - 调整与BookManagement.vue一致 */
.ancient-section {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 10px;
}

.ancient-title {
  color: #5b4636;
  font-size: 18px;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8d4b8;
  font-family: "STKaiti", "KaiTi", serif;
}

.ancient-title i {
  color: #a7874b;
  margin-right: 10px;
}

/* 表单样式 */
.ancient-form /deep/ .el-form-item__label {
  color: #5b4636;
  font-family: "STKaiti", "KaiTi", serif;
  font-weight: bold;
}

.user-info, .book-info {
  margin-top: 10px;
  padding: 15px;
  background: rgba(250, 248, 245, 0.8);
  border-radius: 8px;
  border: 1px solid #e8d4b8;
}

.user-info p, .book-info p {
  margin: 8px 0;
  color: #8b7355;
  font-size: 14px;
}

.user-info i, .book-info i {
  color: #a7874b;
  margin-right: 8px;
  width: 18px;
}

/* 搜索框样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
}

.ancient-search /deep/ .el-input__inner {
  background: #f9f4ee;
  border: 1px solid #e8d4b8;
  color: #5b4636;
}

.ancient-search /deep/ .el-input__inner:focus {
  border-color: #d4b483;
}

.search-btn {
  background: #a7874b !important;
  border-color: #8b7355 !important;
  color: white !important;
}

.search-btn:hover {
  background: #8b7355 !important;
  border-color: #5b4636 !important;
}

/* 刷新按钮 */
.refresh-btn {
  color: #a7874b !important;
  font-weight: bold;
}

.refresh-btn:hover {
  color: #8b7355 !important;
}

/* 表格样式 - 调整与BookManagement.vue一致 */
.ancient-table {
  background: transparent;
  border: none;
  margin-top: 0 !important; /* 移除表格上边距，与BookManagement.vue一致 */
}

.ancient-table::before {
  display: none;
}

.ancient-table th {
  background: rgba(245, 240, 230, 0.8) !important;
  color: #5b4636 !important;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
  border-bottom: 1px solid #e8d4b8 !important;
  font-size: 14px;
  padding: 12px 10px !important;
  text-align: center;
}

.ancient-table td {
  color: #333 !important;
  border-bottom: 1px solid #f0e9dd !important;
  padding: 12px 10px !important;
  font-size: 13px;
}

.ancient-table .el-table__row:hover td {
  background: rgba(232, 212, 184, 0.1) !important;
}

/* 状态标签 */
.status-tag {
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
  font-weight: 500;
  border: none;
  min-width: 70px;
}

/* 日期样式 */
.overdue {
  color: #f56c6c !important;
  font-weight: bold;
}

.near-due {
  color: #e6a23c !important;
  font-weight: bold;
}

.normal {
  color: #67c23a !important;
}

/* 操作按钮容器 - 修复对齐问题 */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 32px;
}

/* 操作按钮 - 优化后的尺寸 */
.action-btn {
  padding: 5px 12px !important;
  border-radius: 16px !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
  transition: all 0.3s;
  font-size: 12px;
  height: 28px;
  line-height: 18px;
  min-width: 70px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent !important;
}

.action-btn i {
  margin-right: 3px;
  font-size: 12px;
}

/* 详情按钮 - 使用古籍棕色系（纯色） */
.detail-btn {
  background: #a7874b !important;
  border: 1px solid #8b7355 !important;
  color: white !important;
}

.detail-btn:hover {
  background: #8b7355 !important;
  border-color: #a7874b !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(167, 135, 75, 0.3);
}
/* 详情按钮 - 使用饱和度较低的绿色 */
.detail-btn {
  background: #6a8c7c !important;
  border: 1px solid #5b7c6c !important;
  color: white !important;
}

.detail-btn:hover {
  background: #5b7c6c !important;
  border-color: #6a8c7c !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(106, 140, 124, 0.3);
}

/* 还书按钮 - 使用详情按钮的原棕色系 */
.return-btn {
  background: #a7874b !important;
  border: 1px solid #8b7355 !important;
  color: white !important;
}

.return-btn:hover {
  background: #8b7355 !important;
  border-color: #a7874b !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(167, 135, 75, 0.3);
}

/* 禁用的还书按钮样式（浅棕色） */
.disabled-return-btn {
  background: #e8d4b8 !important;
  border: 1px solid #c6b7a3 !important;
  color: #8b7355 !important;
  cursor: not-allowed !important;
  opacity: 0.7;
}

.disabled-return-btn:hover {
  background: #e8d4b8 !important;
  border-color: #c6b7a3 !important;
  transform: none !important;
  box-shadow: none !important;
}
/* 已归还行样式 */
.ancient-table /deep/ .returned-row td {
  background-color: rgba(245, 247, 250, 0.5) !important;
}

.ancient-table /deep/ .returned-row:hover td {
  background-color: rgba(232, 212, 184, 0.05) !important;
}

/* 古籍风格按钮 */
.ancient-btn {
  background: linear-gradient(135deg, #a7874b, #8b7355) !important;
  border: 1px solid #8b7355 !important;
  color: white !important;
  font-weight: bold;
  padding: 10px 20px !important;
  border-radius: 20px !important;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.3);
  font-size: 14px;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
}

.ancient-btn:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b) !important;
  border-color: #a7874b !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(155, 135, 110, 0.4);
}

.ancient-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(155, 135, 110, 0.3);
}

.ancient-btn i {
  margin-right: 5px;
}

.reset-btn {
  background: #f5f0e6 !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
}

.reset-btn:hover {
  background: #f3ebe1 !important;
  border-color: #c6b7a3 !important;
  color: #3c2c1e !important;
}

/* 表单按钮组 */
.form-buttons {
  margin-top: 30px;
  text-align: center;
}

/* 分页 - 调整与BookManagement.vue一致 */
/* 分页 */
.pagination {
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.ancient-pagination .el-pagination.is-background .btn-prev,
.ancient-pagination .el-pagination.is-background .btn-next,
.ancient-pagination .el-pagination.is-background .el-pager li {
  background: #f5f0e6 !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
  transition: all 0.3s !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif !important;
  border-radius: 4px !important;
}

.ancient-pagination .el-pagination.is-background .btn-prev:hover,
.ancient-pagination .el-pagination.is-background .btn-next:hover,
.ancient-pagination .el-pagination.is-background .el-pager li:hover {
  background: #e8dbc9 !important;
  border-color: #d4b483 !important;
  color: #5b4636 !important;
}
.pagination >>> .el-pagination.is-background .btn-prev,
.pagination >>> .el-pagination.is-background .btn-next,
.pagination >>> .el-pagination.is-background .el-pager li {
  background: #ffffff !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
  transition: all 0.3s !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif !important;
  border-radius: 4px !important;
}

/* 悬停效果 */
.pagination >>> .el-pagination.is-background .btn-prev:hover,
.pagination >>> .el-pagination.is-background .btn-next:hover,
.pagination >>> .el-pagination.is-background .el-pager li:hover {
  background: #f8f1e7 !important;
  border-color: #ddc29b !important;
  color: #5b4636 !important;
  transform: translateY(-1px);
}

/* 当前选中页数 */
.pagination >>> .el-pagination.is-background .el-pager li.active {
  background: #b49877 !important;
  border-color: #8b7355 !important;
  color: white !important;
  font-weight: bold;
}



/* 禁用按钮的样式 */
.pagination >>> .el-pagination.is-background .btn-prev.disabled,
.pagination >>> .el-pagination.is-background .btn-next.disabled {
  background: #f5f0e6 !important;
  border-color: #e8d4b8 !important;
  color: #c0c4cc !important;
  cursor: not-allowed;
}

/* 分页文字信息 */
.pagination >>> .el-pagination__total,
.pagination >>> .el-pagination__jump {
  color: #5b4636 !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif !important;
}

/* 页码输入框 */
.pagination >>> .el-pagination__editor.el-input .el-input__inner {
  border: 1px solid #e8d4b8 !important;
  background: #ffffff !important;
  color: #5b4636 !important;
  border-radius: 4px !important;
}


/* 对话框样式 */
.ancient-dialog .el-dialog {
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  background: #fdfbf8;
}

.ancient-dialog .el-dialog__header {
  background: #f5f0e6;
  border-bottom: 1px solid #e8d4b8;
  padding: 15px 20px;
}

.ancient-dialog .el-dialog__title {
  color: #5b4636;
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 18px;
}

/* 描述列表样式 */
.ancient-descriptions /deep/ .el-descriptions__label {
  background: #f5f0e6 !important;
  color: #5b4636 !important;
  font-family: "STKaiti", "KaiTi", serif;
  font-weight: bold;
  border-right: 1px solid #e8d4b8 !important;
  border-bottom: 1px solid #e8d4b8 !important;
}

.ancient-descriptions /deep/ .el-descriptions__content {
  background: #fffbf6 !important;
  color: #8b7355 !important;
  border-bottom: 1px solid #e8d4b8 !important;
}

.ancient-descriptions /deep/ .el-descriptions__content i {
  color: #a7874b;
  margin-right: 8px;
}


/* 响应式调整 */
@media (max-width: 768px) {
  .el-aside {
    width: 60px !important;
  }
  
  .logo h3 {
    display: none;
  }
  
  .logo-img {
    margin-right: 0;
  }
  
  .el-menu-item span {
    display: none;
  }
  
  .el-menu-item i {
    margin-right: 0;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .search-box {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .ancient-search,
  .ancient-select {
    width: 100% !important;
    margin-bottom: 10px;
    margin-right: 0 !important;
  }
  
  .action-btn {
    padding: 4px 8px !important;
    font-size: 11px;
    min-width: 60px;
    height: 26px;
  }
  
  .action-btn i {
    font-size: 11px;
  }
  
  .action-buttons {
    gap: 5px;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .admin-header {
    padding: 0 10px;
  }
  
  .admin-user-info .el-dropdown-link {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .ancient-main {
    padding: 10px;
  }
  
  .page-header {
    padding: 10px 15px;
  }
  
  .ancient-section {
    padding: 15px;
  }
  
  .ancient-table th,
  .ancient-table td {
    padding: 8px 5px !important;
    font-size: 12px;
  }
  
  .form-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .ancient-btn {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>