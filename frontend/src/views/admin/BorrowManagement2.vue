<template>
  <div class="borrow-management">
    <el-container style="height: 100vh;">
      <!-- 侧边栏 -->
      <AdminAside />
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

            <el-tab-pane label="还书登记" name="return">
              <!-- 还书登记表单 -->
              <div class="return-form ancient-section">
                <h3 class="ancient-title">
                  <i class="el-icon-document-checked"></i> 还书登记
                </h3>
                <el-form :model="returnForm" :rules="returnRules" ref="returnFormRef" label-width="100px"
                  class="ancient-form">
                  <el-form-item label="选择用户" prop="userId">
                    <el-select v-model="returnForm.userId" placeholder="请输入用户名搜索" filterable remote
                      :remote-method="searchUsersForReturn" :loading="returnUserSearchLoading" style="width: 300px"
                      @change="handleReturnUserChange" clearable class="ancient-select">
                      <el-option v-for="user in returnSearchedUsers" :key="user.id"
                        :label="`${user.username} (${user.email}) - 借阅中 ${user.borrowedCount} 本`"
                        :value="user.id" :disabled="user.borrowedCount <= 0">
                        <span style="float: left">{{ user.username }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">
                          {{ user.borrowedCount }} 本
                          <span v-if="user.borrowedCount <= 0" style="color: #909399">
                            (无借阅记录)
                          </span>
                        </span>
                      </el-option>
                      <el-option v-if="returnUserSearchQuery && returnSearchedUsers.length === 0" disabled>
                        <span style="color: #909399">未找到匹配的用户</span>
                      </el-option>
                    </el-select>
                    <div v-if="returnSelectedUser" class="user-info">
                      <p><i class="el-icon-user"></i> 用户名：{{ returnSelectedUser.username }}</p>
                      <p><i class="el-icon-collection"></i> 借阅中：{{ returnSelectedUser.borrowedCount }} 本</p>
                    </div>
                  </el-form-item>

                  <el-form-item label="选择图书" prop="bookId">
                    <!-- 删除搜索框，直接显示下拉列表 -->
                    <el-select v-model="returnForm.bookId" placeholder="请选择要归还的图书" style="width: 100%;"
                      @change="handleReturnBookChange" :loading="returnBookLoading" 
                      :disabled="!returnForm.userId" clearable class="ancient-select">
                      <el-option-group v-if="userBorrowRecords.length > 0" label="借阅中的图书">
                        <el-option v-for="record in userBorrowRecords" :key="`record-${record.id}`"
                          :label="`${record.bookTitle} - ${formatDate(record.borrowDate)} 借`"
                          :value="record.id">
                          <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>{{ record.bookTitle }}</span>
                            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                              <span style="color: #909399; font-size: 12px;">
                                {{ formatDate(record.borrowDate) }} 借
                              </span>
                              <el-tag :type="getStatusTagType(record)" size="mini" style="margin-top: 2px;">
                                {{ getRealStatusText(record) }}
                              </el-tag>
                            </div>
                          </div>
                        </el-option>
                      </el-option-group>
                      <el-option v-if="!returnForm.userId" disabled>
                        <span style="color: #909399">请先选择用户</span>
                      </el-option>
                      <el-option v-if="returnForm.userId && userBorrowRecords.length === 0" disabled>
                        <span style="color: #909399">该用户没有借阅中的图书</span>
                      </el-option>
                    </el-select>

                    <!-- 借阅记录详情展示 -->
                    <div v-if="selectedReturnRecord" class="record-info">
                      <el-card shadow="never" class="record-card">
                        <div slot="header" class="clearfix">
                          <span style="font-weight: bold; color: #5b4636;">
                            <i class="el-icon-notebook-2"></i> {{ selectedReturnRecord.bookTitle }}
                          </span>
                        </div>
                        <el-descriptions :column="1" size="small" class="record-descriptions">
                          <el-descriptions-item label="借阅日期">
                            <i class="el-icon-time"></i> {{ formatDate(selectedReturnRecord.borrowDate) }}
                          </el-descriptions-item>
                          <el-descriptions-item label="应还日期">
                            <i class="el-icon-date"></i> {{ formatDate(selectedReturnRecord.dueDate) }}
                          </el-descriptions-item>
                          <el-descriptions-item label="续借次数">
                            <i class="el-icon-refresh"></i> {{ selectedReturnRecord.renewedCount }}/{{
                              selectedReturnRecord.maxRenewCount }}
                          </el-descriptions-item>
                          <el-descriptions-item label="当前状态">
                            <el-tag :type="getStatusTagType(selectedReturnRecord)" size="small" class="status-tag">
                              {{ getRealStatusText(selectedReturnRecord) }}
                            </el-tag>
                            <span v-if="isOverdue(selectedReturnRecord)" style="color: #f56c6c; margin-left: 10px;">
                              逾期 {{ calculateOverdueDays(selectedReturnRecord) }} 天
                            </span>
                          </el-descriptions-item>
                        </el-descriptions>
                      </el-card>
                    </div>
                  </el-form-item>

                  <el-form-item class="form-buttons">
                    <el-button type="primary" @click="handleReturnBySearch" :loading="returning" :disabled="!canReturnBook"
                      class="ancient-btn confirm-btn">
                      <i class="el-icon-check"></i> 确认还书
                    </el-button>
                    <el-button @click="resetReturnForm" class="ancient-btn reset-btn">
                      <i class="el-icon-refresh-left"></i> 重置
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
              <!-- 当前借阅列表 -->
            <!-- <el-tab-pane label="当前借阅" name="current">
              <div class="current-borrow ancient-section">
                <div class="section-header">
                  <h3 class="ancient-title">
                    <i class="el-icon-collection"></i> 当前借阅列表
                  </h3>
                </div>

                <el-table :data="currentBorrowList" border stripe style="width: 100%;" v-loading="currentLoading"
                  class="ancient-table" :row-class-name="tableRowClassName">
                  <el-table-column prop="id" label="ID" width="80" align="center" sortable>
                    <template slot-scope="scope">
                      <span style="font-weight: bold; color: #a7874b;">{{ scope.row.id }}</span>
                    </template>
                  </el-table-column>
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
                        <el-button size="mini" @click="viewRecordDetail(scope.row)" class="action-btn detail-btn">
                          <i class="el-icon-view"></i> 详情
                        </el-button>
                        <el-button size="mini" :disabled="!shouldShowReturnButton(scope.row)"
                          @click="shouldShowReturnButton(scope.row) && handleReturnBook(scope.row)"
                          class="action-btn return-btn"
                          :class="{ 'disabled-return-btn': !shouldShowReturnButton(scope.row) }">
                          <i class="el-icon-circle-check"></i> 还书
                        </el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>

                <div class="pagination">
                  <el-pagination @size-change="handleCurrentSizeChange" @current-change="handleCurrentPageChange"
                    :current-page="currentPagination.page" :page-sizes="[10, 20, 50]"
                    :page-size="currentPagination.size" layout="total, sizes, prev, pager, next, jumper"
                    :total="currentPagination.total" :background="true" class="ancient-pagination">
                  </el-pagination>
                </div>
              </div>
            </el-tab-pane> -->
          </el-tabs>
        </el-main>
      </el-container>
    </el-container>

    <!-- 借阅详情对话框 -->
    <el-dialog title="借阅记录详情" :visible.sync="detailDialogVisible" width="600px" @close="detailDialogVisible = false"
      class="ancient-dialog">
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
import { userApi } from '@/api/user'
import { bookApi } from '@/api/book'

export default {
  name: 'BorrowManagement',
  data() {
    return {
      // 用户信息
      user: JSON.parse(localStorage.getItem('user') || '{}'),

      // 当前激活的标签页
      activeTab: 'return',

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

      // 还书表单
      returnForm: {
        userId: '',
        bookId: ''
      },
      returnRules: {
        userId: [
          { required: true, message: '请选择用户', trigger: 'blur' }
        ],
        bookId: [
          { required: true, message: '请选择图书', trigger: 'blur' }
        ]
      },
      returning: false,
      returnBookLoading: false, // 还书图书加载状态

      // 用户和图书数据
      userList: [],
      bookList: [],
      selectedUser: null,
      selectedBook: null,

      // 还书相关的数据
      returnSelectedUser: null,
      selectedReturnRecord: null, // 选中的借阅记录详情
      userBorrowRecords: [], // 用户的所有借阅记录

      // 当前借阅列表
      currentSearch: '',
      currentBorrowList: [],
      currentLoading: false,
      currentPagination: {
        page: 1,
        size: 10,
        total: 0
      },

      // 搜索相关属性
      userSearchLoading: false,
      userSearchQuery: '',
      searchedUsers: [],
      bookSearchLoading: false,
      bookSearchQuery: '',
      searchedBooks: [],

      // 还书用户搜索
      returnUserSearchLoading: false,
      returnUserSearchQuery: '',
      returnSearchedUsers: [],

      // 详情对话框
      detailDialogVisible: false,
      selectedRecord: null,

      forceUserRefresh: 0
    }
  },
  computed: {
    availableBooks() {
      return this.searchedBooks.filter(book => book.availableCopies > 0)
    },

    canBorrowBook() {
      if (!this.borrowForm.userId || !this.borrowForm.bookId) {
        return false
      }

      if (this.selectedUser && this.selectedUser.borrowedCount >= this.selectedUser.maxBorrowCount) {
        return false
      }

      if (this.selectedBook && this.selectedBook.availableCopies <= 0) {
        return false
      }

      return true
    },

    canReturnBook() {
      if (!this.returnForm.userId || !this.returnForm.bookId) {
        return false
      }

      // 确保有选中的借阅记录
      if (!this.selectedReturnRecord) {
        return false
      }

      // 确保借阅记录状态是可归还的
      if (this.selectedReturnRecord.status === 'RETURNED' || this.selectedReturnRecord.returnDate) {
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

    // 初始化搜索列表
    this.searchedUsers = []
    this.searchedBooks = []
    this.returnSearchedUsers = []
    this.userBorrowRecords = []

    if (this.activeTab === 'current') {
      this.loadCurrentBorrow()
    }
  },
  watch: {
    // 监听用户变化，自动加载用户的借阅记录
    'returnForm.userId': {
      handler(newUserId) {
        if (newUserId) {
          this.loadUserBorrowRecords(newUserId)
        } else {
          // 清空相关数据
          this.userBorrowRecords = []
          this.returnForm.bookId = ''
          this.selectedReturnRecord = null
        }
      },
      immediate: false
    }
  },
  methods: {
    // 表格行类名
    tableRowClassName({ row }) {
      return row.status === 'RETURNED' ? 'returned-row' : ''
    },

    // 搜索用户方法（借书）
    async searchUsers(query) {
      if (!query || query.trim() === '') {
        this.searchedUsers = []
        return
      }

      this.userSearchLoading = true
      this.userSearchQuery = query
      const searchTerm = query.trim().toLowerCase()

      try {
        const response = await userApi.getUsers({
          page: 1,
          size: 100,
          orderBy: 'username',
          order: 'asc'
        })

        const res = response.data

        if (res.code === 200) {
          let users = []

          if (Array.isArray(res.data)) {
            users = res.data
          } else if (res.data && Array.isArray(res.data.list)) {
            users = res.data.list
          } else if (res.data && Array.isArray(res.data.content)) {
            users = res.data.content
          } else {
            users = res.data || []
          }

          const filteredUsers = users.filter(user => {
            if (!user || !user.username) return false

            const username = user.username.toLowerCase()
            const email = user.email ? user.email.toLowerCase() : ''

            return username.includes(searchTerm) ||
              email.includes(searchTerm) ||
              (user.id && user.id.toString().includes(searchTerm))
          })

          this.searchedUsers = filteredUsers.map(user => {
            const maxBorrowCount = Number(user.maxBorrowCount) || 5
            const borrowedCount = Number(user.borrowedCount) || 0

            return {
              id: Number(user.id) || 0,
              username: user.username || '未知用户',
              email: user.email || '',
              role: user.role || 'USER',
              maxBorrowCount: maxBorrowCount,
              borrowedCount: borrowedCount,
              availableCount: maxBorrowCount - borrowedCount
            }
          })

        } else {
          console.warn('搜索用户失败:', res.message)
          this.$message.warning(res.message || '搜索失败')
          this.searchedUsers = []
        }

      } catch (error) {
        console.error('搜索用户失败:', error)
        this.$message.error('搜索失败: ' + error.message)
        this.searchedUsers = []
      } finally {
        this.userSearchLoading = false
      }
    },

    // 搜索用户（还书专用）
    async searchUsersForReturn(query) {
      if (!query || query.trim() === '') {
        this.returnSearchedUsers = []
        return
      }

      this.returnUserSearchLoading = true
      this.returnUserSearchQuery = query
      const searchTerm = query.trim().toLowerCase()

      try {
        const response = await userApi.getUsers({
          page: 1,
          size: 100,
          orderBy: 'username',
          order: 'asc'
        })

        const res = response.data

        if (res.code === 200) {
          let users = []

          if (Array.isArray(res.data)) {
            users = res.data
          } else if (res.data && Array.isArray(res.data.list)) {
            users = res.data.list
          } else if (res.data && Array.isArray(res.data.content)) {
            users = res.data.content
          } else {
            users = res.data || []
          }

          const filteredUsers = users.filter(user => {
            if (!user || !user.username) return false

            const username = user.username.toLowerCase()
            const email = user.email ? user.email.toLowerCase() : ''

            return username.includes(searchTerm) ||
              email.includes(searchTerm) ||
              (user.id && user.id.toString().includes(searchTerm))
          })

          this.returnSearchedUsers = filteredUsers.map(user => {
            const borrowedCount = Number(user.borrowedCount) || 0

            return {
              id: Number(user.id) || 0,
              username: user.username || '未知用户',
              email: user.email || '',
              role: user.role || 'USER',
              borrowedCount: borrowedCount
            }
          })

        } else {
          console.warn('搜索用户失败:', res.message)
          this.$message.warning(res.message || '搜索失败')
          this.returnSearchedUsers = []
        }

      } catch (error) {
        console.error('搜索用户失败:', error)
        this.$message.error('搜索失败: ' + error.message)
        this.returnSearchedUsers = []
      } finally {
        this.returnUserSearchLoading = false
      }
    },

    // 搜索图书方法（借书）
    async searchBooks(query) {
      if (!query || query.trim() === '') {
        this.bookSearchLoading = true
        try {
          var response = await bookApi.getBooks({
            page: 1,
            size: 30,
            orderBy: 'id',
            order: 'desc'
          })
          response = response.data
          if (response && response.code === 200) {
            let results = []

            if (Array.isArray(response.data)) {
              results = response.data
            } else if (response.data && Array.isArray(response.data.list)) {
              results = response.data.list
            } else if (response.data && Array.isArray(response.data.content)) {
              results = response.data.content
            } else {
              results = response.data || []
            }

            results = results.filter(book =>
              book && book.id && book.title && book.author
            ).map(book => {
              const totalCopies = book.total_copies || book.quantity || book.totalCopies || 0
              const availableCopies = book.available_copies || (book.available ? 1 : 0) || book.availableCopies || 0

              return {
                id: book.id,
                title: book.title,
                author: book.author || '未知作者',
                isbn: book.isbn || '',
                category: book.category || '未分类',
                totalCopies: Number(totalCopies),
                availableCopies: Number(availableCopies),
                quantity: Number(totalCopies),
                available: Number(availableCopies) > 0,
                borrowedCount: book.borrowed_count || book.borrowedCount || 0,
                description: book.description || '',
                coverImage: book.coverImage || '',
                location: book.location || '',
                publishDate: book.publishDate || '',
                publisher: book.publisher || '',
                _raw: book
              }
            })

            this.searchedBooks = results

          } else {
            console.warn('获取最新图书失败:', response)
          }

        } catch (error) {
          console.error('获取最新图书失败:', error)
        } finally {
          this.bookSearchLoading = false
        }
        return
      }

      this.bookSearchLoading = true
      this.bookSearchQuery = query

      try {
        let response
        try {
          response = await bookApi.searchBooks(query, 'title')
          response = response.data
        } catch (searchError) {
          console.log('搜索接口不可用，使用通用接口:', searchError)
          response = await bookApi.getBooks({
            keyword: query.trim(),
            page: 1,
            size: 20,
            orderBy: 'id',
            order: 'desc'
          })
          response = response.data
        }

        if (response && response.code === 200) {
          let results = []

          if (Array.isArray(response.data)) {
            results = response.data
          } else if (response.data && Array.isArray(response.data.list)) {
            results = response.data.list
          } else if (response.data && Array.isArray(response.data.content)) {
            results = response.data.content
          } else {
            results = response.data || []
          }

          results = results.filter(book =>
            book && book.id && book.title && book.author
          ).map(book => {
            const totalCopies = book.total_copies || book.quantity || book.totalCopies || 0
            const availableCopies = book.available_copies || (book.available ? 1 : 0) || book.availableCopies || 0

            return {
              id: book.id,
              title: book.title,
              author: book.author || '未知作者',
              isbn: book.isbn || '',
              category: book.category || '未分类',
              totalCopies: Number(totalCopies),
              availableCopies: Number(availableCopies),
              quantity: Number(totalCopies),
              available: Number(availableCopies) > 0,
              borrowedCount: book.borrowed_count || book.borrowedCount || 0,
              description: book.description || '',
              coverImage: book.coverImage || '',
              location: book.location || '',
              publishDate: book.publishDate || '',
              publisher: book.publisher || '',
              _raw: book
            }
          })

          this.searchedBooks = results

          if (this.selectedBook && !results.some(b => b.id === this.selectedBook.id)) {
            this.borrowForm.bookId = ''
            this.selectedBook = null
          }

        } else {
          console.warn('图书搜索API返回非200状态:', response)
          this.$message.warning(response?.message || '搜索图书失败')
          this.searchedBooks = []
        }

      } catch (error) {
        console.error('搜索图书失败:', error)
        this.$message.error('搜索图书失败')
        this.searchedBooks = []
      } finally {
        this.bookSearchLoading = false
      }
    },

    // 加载用户的借阅记录
    async loadUserBorrowRecords(userId) {
      if (!userId) return

      this.returnBookLoading = true
      try {
        // 获取用户的所有借阅记录（包括已归还的）
        const response = await borrowApi.getBorrowRecords({
          userId: userId,
          page: 1,
          size: 100,
          orderBy: 'borrow_date',
          order: 'desc'
        })

        const res = response.data

        if (res.code === 200) {
          let allRecords = []

          // 解析响应格式
          if (Array.isArray(res.data)) {
            allRecords = res.data
          } else if (res.data && res.data.list && Array.isArray(res.data.list)) {
            allRecords = res.data.list
          } else if (res.data && res.data.content && Array.isArray(res.data.content)) {
            allRecords = res.data.content
          } else {
            allRecords = res.data || []
          }

          console.log('📊 用户借阅记录:', {
            用户ID: userId,
            总记录数: allRecords.length,
            样本: allRecords.slice(0, 3)
          })

          // 过滤出未归还的记录（借阅中或已逾期）
          const borrowedRecords = allRecords.filter(record => {
            const status = record.status?.toUpperCase()
            return !record.returnDate && 
                   (status === 'BORROWED' || status === 'OVERDUE' || 
                    (status === 'BORROWED' && new Date(record.dueDate) < new Date()))
          })

          if (borrowedRecords.length === 0) {
            this.userBorrowRecords = []
            this.$message.info('该用户没有借阅中的图书')
            return
          }

          // 获取图书信息
          const bookIds = borrowedRecords.map(record => record.bookId).filter(id => id)
          const booksInfo = await this.fetchBooksByIds(bookIds)

          // 创建图书映射
          const bookMap = new Map()
          booksInfo.forEach(book => {
            bookMap.set(book.id, book)
          })

          // 合并信息
          this.userBorrowRecords = borrowedRecords.map(record => {
            const book = bookMap.get(record.bookId)
            return {
              id: record.id,
              userId: record.userId,
              bookId: record.bookId,
              borrowDate: record.borrowDate,
              dueDate: record.dueDate,
              returnDate: record.returnDate,
              renewedCount: record.renewedCount || 0,
              maxRenewCount: record.maxRenewCount || 1,
              status: record.status || 'BORROWED',
              createdAt: record.createdAt,
              updatedAt: record.updatedAt,
              bookTitle: book ? book.title : `图书ID: ${record.bookId}`,
              bookAuthor: book ? book.author : '未知作者',
              bookISBN: book ? book.isbn : ''
            }
          })

          console.log('✅ 用户借阅记录加载完成:', {
            借阅中图书数: this.userBorrowRecords.length,
            样本: this.userBorrowRecords.slice(0, 3)
          })

        } else {
          this.$message.warning(res.message || '获取借阅记录失败')
          this.userBorrowRecords = []
        }

      } catch (error) {
        console.error('加载用户借阅记录失败:', error)
        this.$message.error('加载借阅记录失败')
        this.userBorrowRecords = []
      } finally {
        this.returnBookLoading = false
      }
    },

    // 处理标签页切换
    handleTabClick(tab) {
      if (tab.name === 'borrow') {
        // 切换到借书登记
        this.searchedUsers = []
        this.searchedBooks = []
        this.userSearchQuery = ''
        this.bookSearchQuery = ''

        setTimeout(() => {
          this.searchBooks('')
        }, 100)

      } else if (tab.name === 'return') {
        // 切换到还书登记
        this.resetReturnForm()
        
      } else if (tab.name === 'current') {
        this.loadCurrentBorrow()
      }
    },

    // 用户选择变化（借书）
    handleUserChange(userId) {
      this.selectedUser = this.searchedUsers.find(u => u.id === userId)
      this.borrowForm.bookId = ''
      this.selectedBook = null
    },

    // 图书选择变化（借书）
    handleBookChange(bookId) {
      if (!bookId) {
        this.selectedBook = null;
        return;
      }

      const numericId = Number(bookId);
      let book = this.searchedBooks.find(b => Number(b?.id) === numericId)

      if (!book) {
        this.selectedBook = null;
        return;
      }

      book = {
        ...book,
        availableCopies: Number(book.availableCopies ?? 0),
        totalCopies: Number(book.totalCopies ?? 0),
      };

      if (book.availableCopies > book.totalCopies) {
        book.availableCopies = book.totalCopies;
      }

      this.selectedBook = book;
    },

    // 用户选择变化（还书）
    handleReturnUserChange(userId) {
      this.returnSelectedUser = this.returnSearchedUsers.find(u => u.id === userId)
      this.returnForm.userId = userId
      this.returnForm.bookId = ''
      this.selectedReturnRecord = null
    },

    // 借阅记录选择变化（还书）
    handleReturnBookChange(recordId) {
      if (!recordId) {
        this.selectedReturnRecord = null
        return
      }

      const record = this.userBorrowRecords.find(r => r.id === recordId)
      if (record) {
        this.selectedReturnRecord = record
        console.log('✅ 选中借阅记录:', {
          记录ID: record.id,
          图书: record.bookTitle,
          状态: record.status
        })
      } else {
        this.selectedReturnRecord = null
      }
    },

    // 借书
    async handleBorrow() {
      this.$refs.borrowFormRef.validate(async (valid) => {
        if (!valid) return

        this.borrowing = true

        try {
          var res = await borrowApi.borrowBook(this.borrowForm)
          res = res.data
          if (res.code === 200) {
            this.$message.success('借书成功')

            // 刷新相关列表
            this.loadCurrentBorrow()
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

    // 还书（通过搜索）
    async handleReturnBySearch() {
      this.$refs.returnFormRef.validate(async (valid) => {
        if (!valid) return

        if (!this.selectedReturnRecord) {
          this.$message.warning('请选择要归还的借阅记录')
          return
        }

        // 确认还书
        this.$confirm(`确定要归还《${this.selectedReturnRecord.bookTitle}》吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'ancient-confirm-dialog'
        }).then(async () => {
          this.returning = true

          try {
            // 使用借阅记录ID还书
            var res = await borrowApi.returnBook(this.selectedReturnRecord.id)
            res = res.data
            
            if (res.code === 200) {
              this.$message.success('还书成功')

              // 从列表中移除已归还的记录
              const index = this.userBorrowRecords.findIndex(r => r.id === this.selectedReturnRecord.id)
              if (index !== -1) {
                this.userBorrowRecords.splice(index, 1)
              }

              // 刷新相关列表
              this.loadCurrentBorrow()
              this.refreshUserList()
              this.refreshBookList()

              // 重置表单
              this.resetReturnForm()

              // 重新加载用户的借阅记录
              if (this.returnForm.userId) {
                this.loadUserBorrowRecords(this.returnForm.userId)
              }

            } else {
              this.$message.error(res.message)
            }
          } catch (error) {
            console.error('还书失败:', error)
            this.$message.error('还书失败，请稍后重试')
          } finally {
            this.returning = false
          }
        }).catch(() => {
          // 取消操作
        })
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
      this.searchedUsers = []
      this.searchedBooks = []
      this.userSearchQuery = ''
      this.bookSearchQuery = ''

      if (this.$refs.borrowFormRef) {
        this.$nextTick(() => {
          this.$refs.borrowFormRef.resetFields()
        })
      }
    },

    // 重置还书表单
    resetReturnForm() {
      this.returnForm = {
        userId: '',
        bookId: ''
      }
      this.returnSelectedUser = null
      this.selectedReturnRecord = null
      this.userBorrowRecords = []
      this.returnSearchedUsers = []
      this.returnUserSearchQuery = ''

      if (this.$refs.returnFormRef) {
        this.$nextTick(() => {
          this.$refs.returnFormRef.resetFields()
        })
      }
    },

    // 加载当前借阅
    async loadCurrentBorrow() {
      this.currentLoading = true
      try {
        const params = {
          page: 1,
          size: 1000,
        }

        if (this.currentSearch && this.currentSearch.trim()) {
          params.keyword = this.currentSearch.trim()
        }

        var res = await borrowApi.getBorrowRecords(params)
        res = res.data

        if (res.code === 200) {
          let allRecordsList = []

          if (res.data && res.data.list && Array.isArray(res.data.list)) {
            allRecordsList = res.data.list
          } else if (res.data && res.data.content && Array.isArray(res.data.content)) {
            allRecordsList = res.data.content
          } else if (Array.isArray(res.data)) {
            allRecordsList = res.data
          } else if (res.data && typeof res.data === 'object') {
            allRecordsList = res.data || []
          } else {
            allRecordsList = []
          }

          // 筛选当前借阅（借阅中和已逾期）
          const currentBorrowList = allRecordsList.filter(record => {
            const status = record.status?.toUpperCase()

            if (status === 'BORROWED' && record.dueDate) {
              const now = new Date()
              const dueDate = new Date(record.dueDate)
              if (dueDate < now) {
                record.status = 'OVERDUE'
                return true
              }
            }

            return status === 'BORROWED' || status === 'OVERDUE'
          })

          // 前端分页
          const startIndex = (this.currentPagination.page - 1) * this.currentPagination.size
          const endIndex = startIndex + this.currentPagination.size
          const paginatedList = currentBorrowList.slice(startIndex, endIndex)

          this.currentPagination.total = currentBorrowList.length

          if (paginatedList.length === 0) {
            this.currentBorrowList = []
            return
          }

          // 提取ID
          const userIds = []
          const bookIds = []

          paginatedList.forEach(record => {
            if (record.userId && !userIds.includes(record.userId)) {
              userIds.push(record.userId)
            }
            if (record.bookId && !bookIds.includes(record.bookId)) {
              bookIds.push(record.bookId)
            }
          })

          // 批量获取信息
          const [usersInfo, booksInfo] = await Promise.all([
            this.fetchUsersByIds(userIds),
            this.fetchBooksByIds(bookIds)
          ])

          // 创建映射
          const userMap = new Map()
          usersInfo.forEach(user => {
            userMap.set(user.id, user)
          })

          const bookMap = new Map()
          booksInfo.forEach(book => {
            bookMap.set(book.id, book)
          })

          // 合并信息
          this.currentBorrowList = paginatedList.map(record => {
            const user = userMap.get(record.userId)
            const book = bookMap.get(record.bookId)

            return {
              ...record,
              userName: user ? user.username : `用户ID: ${record.userId}`,
              userEmail: user ? user.email : '',
              bookTitle: book ? book.title : `图书ID: ${record.bookId}`,
              bookAuthor: book ? book.author : '',
              bookISBN: book ? book.isbn : ''
            }
          })

        } else {
          this.$message.error(res.message)
          this.currentBorrowList = []
          this.currentPagination.total = 0
        }
      } catch (error) {
        console.error('加载当前借阅失败:', error)
        this.$message.error('加载失败，请稍后重试')
        this.currentBorrowList = []
        this.currentPagination.total = 0
      } finally {
        this.currentLoading = false
      }
    },

    // 批量获取图书信息
    async fetchBooksByIds(bookIds) {
      if (!bookIds || bookIds.length === 0) {
        return []
      }

      try {
        return await this.fetchBooksOneByOne(bookIds)
      } catch (error) {
        console.error('批量获取图书信息失败:', error)
        return []
      }
    },

    // 逐个获取图书信息
    async fetchBooksOneByOne(bookIds) {
      const books = []

      for (const bookId of bookIds) {
        try {
          var response = await bookApi.getBookDetail(bookId)
          response = response.data
          if (response && response.code === 200 && response.data) {
            books.push(response.data)
          }
        } catch (error) {
          console.error(`获取图书 ${bookId} 信息失败:`, error)
          books.push({
            id: bookId,
            title: `图书${bookId}`,
            author: '未知作者',
            isbn: '未知ISBN'
          })
        }

        if (bookIds.length > 5) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }

      return books
    },

    // 批量获取用户信息
    async fetchUsersByIds(userIds) {
      if (!userIds || userIds.length === 0) {
        return []
      }

      try {
        return await this.fetchUsersOneByOne(userIds)
      } catch (error) {
        console.error('批量获取用户信息失败:', error)
        return []
      }
    },

    // 逐个获取用户信息
    async fetchUsersOneByOne(userIds) {
      const users = []

      for (const userId of userIds) {
        try {
          var response = await userApi.getUserDetail(userId)
          response = response.data
          if (response && response.code === 200 && response.data) {
            users.push(response.data)
          }
        } catch (error) {
          console.error(`获取用户 ${userId} 信息失败:`, error)
          users.push({
            id: userId,
            username: `用户${userId}`,
            email: '未知'
          })
        }

        if (userIds.length > 5) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }

      return users
    },

    // 刷新用户列表
    refreshUserList() {
      this.forceUserRefresh++
      this.$nextTick(() => {
        this.userList = this.dynamicUserList
        console.log('✅ 刷新用户列表，用户数量:', this.userList.length)
      })
    },

    // 刷新图书列表
    refreshBookList() {
      this.forceRefreshBookList()
    },

    // 强制刷新图书列表
    forceRefreshBookList() {
      console.log('🔄 强制刷新图书列表...')
      this.searchedBooks = []
      this.bookSearchQuery = ''
      this.borrowForm.bookId = ''
      this.selectedBook = null
      this.searchBooks('')
      this.$message.success('图书列表已刷新')
    },

    // 还书（从列表）
    handleReturnBook(record) {
      this.$confirm(`确定要归还《${record.bookTitle}》吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'ancient-confirm-dialog'
      }).then(async () => {
        try {
          var res = await borrowApi.returnBook(record.id)
          res = res.data
          if (res.code === 200) {
            this.$message.success('还书成功')

            // 从列表中移除
            if (this.activeTab === 'current') {
              const index = this.currentBorrowList.findIndex(r => r.id === record.id)
              if (index !== -1) {
                this.currentBorrowList.splice(index, 1)
                this.currentPagination.total--
              }
            }

            // 刷新列表
            this.loadCurrentBorrow()
            this.refreshUserList()
            this.refreshBookList()

          } else {
            this.$message.error(res.message)
          }
        } catch (error) {
          console.error('还书失败:', error)
          this.$message.error('还书失败，请稍后重试')
        }
      }).catch(() => { })
    },

    // 判断是否应该显示还书按钮
    shouldShowReturnButton(record) {
      return record.status === 'BORROWED' ||
        record.status === 'OVERDUE' ||
        (record.status === 'BORROWED' && new Date(record.dueDate) < new Date())
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

    // 查看记录详情
    async viewRecordDetail(record) {
      this.detailLoading = true
      this.selectedRecord = null
      this.detailDialogVisible = true

      try {
        var res = await borrowApi.getBorrowRecordDetail(record.id)
        res = res.data
        if (res.code === 200) {
          const borrowDetail = res.data

          const [userResponse, bookResponse] = await Promise.all([
            userApi.getUserDetail(borrowDetail.userId),
            bookApi.getBookDetail(borrowDetail.bookId)
          ])

          let userName = '未知用户'
          let userEmail = ''
          let bookTitle = '未知图书'
          let bookAuthor = ''
          let bookISBN = ''

          if (userResponse.data.code === 200) {
            userName = userResponse.data.data.username || '未知用户'
            userEmail = userResponse.data.data.email || ''
          } else {
            userName = record.userName || '未知用户'
          }

          if (bookResponse.data.code === 200) {
            bookTitle = bookResponse.data.data.title || '未知图书'
            bookAuthor = bookResponse.data.data.author || ''
            bookISBN = bookResponse.data.data.isbn || ''
          } else {
            bookTitle = record.bookTitle || '未知图书'
          }

          this.selectedRecord = {
            ...borrowDetail,
            userName: userName,
            userEmail: userEmail,
            bookTitle: bookTitle,
            bookAuthor: bookAuthor,
            bookISBN: bookISBN
          }

        } else {
          this.$message.error(res.message)
        }
      } catch (error) {
        console.error('获取详情失败:', error)
        this.$message.error('获取详情失败')
      } finally {
        this.detailLoading = false
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
        return 'overdue'
      } else if (diffDays <= 3) {
        return 'near-due'
      } else {
        return 'normal'
      }
    },

    getRealStatusText(record) {
      if (record.status === 'RETURNED') {
        return '已归还'
      }

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

    // 计算逾期天数
    calculateOverdueDays(record) {
      if (!record.dueDate) return 0
      const now = new Date()
      const dueDate = new Date(record.dueDate)
      const diffTime = now.getTime() - dueDate.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },

    // 判断是否逾期
    isOverdue(record) {
      if (!record.dueDate) return false
      const now = new Date()
      const dueDate = new Date(record.dueDate)
      return dueDate < now && record.status !== 'RETURNED'
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
/* 原有样式保持不变，只添加还书表单的特定样式 */

/* 还书表单样式 */
.return-form {
  background: rgba(255, 255, 255, 0.9);
  padding: 25px;
  border-radius: 12px;
  border: 2px solid #e8d4b8;
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.1);
  margin-top: 20px;
}

.return-form .ancient-title {
  color: #5b4636;
  font-size: 20px;
  margin: 0 0 25px 0;
  padding-bottom: 12px;
  border-bottom: 3px solid #d4b483;
}

/* 借阅记录卡片 */
.record-info {
  margin-top: 20px;
}

.record-card {
  /* background: rgba(250, 248, 245, 0.9); */
  border: 1px solid #d4b483;
  border-radius: 8px;
}

.record-card >>> .el-card__header {
  background: rgba(245, 240, 230, 0.8);
  border-bottom: 1px solid #e8d4b8;
  padding: 12px 20px;
}

.record-descriptions >>> .el-descriptions__label {
  /* background: transparent !important; */
  color: #8b7355 !important;
  font-weight: bold;
  width: 100px;
}

.record-descriptions >>> .el-descriptions__content {
  color: #5b4636 !important;
}


/* 下拉列表样式优化 */
.return-form .ancient-select >>> .el-select-dropdown__item {
  padding: 12px 20px !important;
}

.return-form .ancient-select >>> .el-select-dropdown__item .el-tag {
  margin-left: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .return-form {
    padding: 15px;
  }
  
  .record-card >>> .el-card__header {
    padding: 10px 15px;
  }
}

@media (max-width: 480px) {
  .return-form .ancient-title {
    font-size: 18px;
  }
  
  .record-descriptions >>> .el-descriptions__label {
    width: 80px;
  }
}
</style>
<style scoped>
/* 导入全局样式 */
@import '@/assets/ancient-form.css';

/* 通用古籍字体 - 只用于标题 */
h1,
h2,
h3,
h4,
h5,
h6 {
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

.user-info,
.book-info {
  margin-top: 10px;
  padding: 15px;
  background: rgba(250, 248, 245, 0.8);
  border-radius: 8px;
  border: 1px solid #e8d4b8;
}

.user-info p,
.book-info p {
  margin: 8px 0;
  color: #8b7355;
  font-size: 14px;
}

.user-info i,
.book-info i {
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
  margin-top: 0 !important;
  /* 移除表格上边距，与BookManagement.vue一致 */
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

.pagination>>>.el-pagination.is-background .btn-prev,
.pagination>>>.el-pagination.is-background .btn-next,
.pagination>>>.el-pagination.is-background .el-pager li {
  background: #ffffff !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
  transition: all 0.3s !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif !important;
  border-radius: 4px !important;
}

/* 悬停效果 */
.pagination>>>.el-pagination.is-background .btn-prev:hover,
.pagination>>>.el-pagination.is-background .btn-next:hover,
.pagination>>>.el-pagination.is-background .el-pager li:hover {
  background: #f8f1e7 !important;
  border-color: #ddc29b !important;
  color: #5b4636 !important;
  transform: translateY(-1px);
}

/* 当前选中页数 */
.pagination>>>.el-pagination.is-background .el-pager li.active {
  background: #b49877 !important;
  border-color: #8b7355 !important;
  color: white !important;
  font-weight: bold;
}



/* 禁用按钮的样式 */
.pagination>>>.el-pagination.is-background .btn-prev.disabled,
.pagination>>>.el-pagination.is-background .btn-next.disabled {
  background: #f5f0e6 !important;
  border-color: #e8d4b8 !important;
  color: #c0c4cc !important;
  cursor: not-allowed;
}

/* 分页文字信息 */
.pagination>>>.el-pagination__total,
.pagination>>>.el-pagination__jump {
  color: #5b4636 !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif !important;
}

/* 页码输入框 */
.pagination>>>.el-pagination__editor.el-input .el-input__inner {
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