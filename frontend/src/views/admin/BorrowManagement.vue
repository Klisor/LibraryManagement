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
                <el-form :model="borrowForm" :rules="borrowRules" ref="borrowFormRef" label-width="100px"
                  class="ancient-form">
                  <el-form-item label="选择用户" prop="userId">
                    <el-select v-model="borrowForm.userId" placeholder="请输入用户名搜索" filterable remote
                      :remote-method="searchUsers" :loading="userSearchLoading" style="width: 300px"
                      @change="handleUserChange" clearable class="ancient-select">
                      <el-option v-for="user in searchedUsers" :key="user.id"
                        :label="`${user.username} (${user.email}) - 可借 ${user.maxBorrowCount - user.borrowedCount} 本`"
                        :value="user.id" :disabled="user.borrowedCount >= user.maxBorrowCount">
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
                      <p><i class="el-icon-plus"></i> 可再借：{{ selectedUser.maxBorrowCount - selectedUser.borrowedCount }}
                        本</p>
                    </div>
                  </el-form-item>

                  <el-form-item label="选择图书" prop="bookId">
                    <el-select v-model="borrowForm.bookId" placeholder="请输入书名、作者或ISBN搜索" filterable remote
                      :remote-method="searchBooks" :loading="bookSearchLoading" style="width: 300px"
                      @change="handleBookChange" clearable class="ancient-select">
                      <el-option v-for="book in searchedBooks" :key="`book-${book.id}`"
                        :label="`${book.title} - ${book.author} (库存 ${book.availableCopies}/${book.totalCopies})`"
                        :value="book.id" :disabled="book.availableCopies <= 0">
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
                    <el-button type="text" icon="el-icon-refresh" @click="forceRefreshBookList"
                      style="margin-left: 10px;" title="刷新图书列表" class="refresh-btn">
                      刷新
                    </el-button>

                    <div v-if="selectedBook" class="book-info">
                      <p><i class="el-icon-notebook-2"></i> 书名：{{ selectedBook.title }}</p>
                      <p><i class="el-icon-user"></i> 作者：{{ selectedBook.author }}</p>
                      <p><i class="el-icon-tickets"></i> ISBN：{{ selectedBook.isbn }}</p>
                      <p><i class="el-icon-collection"></i> 库存：{{ selectedBook.availableCopies }}/{{
                        selectedBook.totalCopies }} 本</p>
                    </div>
                  </el-form-item>

                  <el-form-item class="form-buttons">
                    <el-button type="primary" @click="handleBorrow" :loading="borrowing" :disabled="!canBorrowBook"
                      class="ancient-btn confirm-btn">
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
            </el-tab-pane>

            <el-tab-pane label="借阅记录" name="records">
              <!-- 所有借阅记录 -->
              <div class="all-records ancient-section">
                <div class="section-header">
                  <h3 class="ancient-title">
                    <i class="el-icon-document"></i> 所有借阅记录
                  </h3>

                </div>

                <el-table :data="allRecordsList" border stripe style="width: 100%;" v-loading="recordsLoading"
                  class="ancient-table" :row-class-name="tableRowClassName">
                  <!-- 添加ID列 -->
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
                  <el-pagination @size-change="handleRecordsSizeChange" @current-change="handleRecordsPageChange"
                    :current-page="recordsPagination.page" :page-sizes="[10, 20, 50]"
                    :page-size="recordsPagination.size" layout="total, sizes, prev, pager, next, jumper"
                    :total="recordsPagination.total" :background="true" class="ancient-pagination">
                  </el-pagination>
                </div>
              </div>
            </el-tab-pane>
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
    // 动态获取用户列表（从API获取）
    async dynamicUserList() {
      try {
        // 从API获取用户列表
        const response = await userApi.getUsers({
          page: 1,
          size: 1000,  // 获取足够多的用户
          orderBy: 'id',
          order: 'desc'
        })

        const res = response.data

        if (res.code === 200) {
          let users = []

          // 解析响应格式
          if (Array.isArray(res.data)) {
            users = res.data
          } else if (res.data && Array.isArray(res.data.list)) {
            users = res.data.list
          } else if (res.data && Array.isArray(res.data.content)) {
            users = res.data.content
          } else {
            users = res.data || []
          }

          // 处理用户数据
          const processedUsers = users.filter(user =>
            user && user.id && user.username && user.email
          ).map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role || 'USER',
            maxBorrowCount: user.maxBorrowCount || 5,
            borrowedCount: user.borrowedCount || 0
          }))

          console.log('✅ 从API获取用户列表成功:', processedUsers.length)
          return processedUsers

        } else {
          console.warn('获取用户列表失败:', res.message)
          return []
        }

      } catch (error) {
        console.error('获取用户列表失败:', error)
        return []
      }
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

    // 搜索用户方法 - 修复 el-select 的 remote-method
    async searchUsers(query) {
      if (!query || query.trim() === '') {
        this.searchedUsers = []
        return
      }

      this.userSearchLoading = true
      this.userSearchQuery = query
      const searchTerm = query.trim().toLowerCase()

      try {
        // 从API获取用户列表
        const response = await userApi.getUsers({
          page: 1,
          size: 100,
          orderBy: 'username',
          order: 'asc'
        })

        const res = response.data

        if (res.code === 200) {
          let users = []

          // 解析响应格式
          if (Array.isArray(res.data)) {
            users = res.data
          } else if (res.data && Array.isArray(res.data.list)) {
            users = res.data.list
          } else if (res.data && Array.isArray(res.data.content)) {
            users = res.data.content
          } else {
            users = res.data || []
          }

          console.log('📊 获取到的用户数据:', {
            总数: users.length,
            样本: users.slice(0, 3).map(u => `${u.username}(${u.email})`)
          })

          // 在前端进行搜索过滤
          const filteredUsers = users.filter(user => {
            if (!user || !user.username) return false

            const username = user.username.toLowerCase()
            const email = user.email ? user.email.toLowerCase() : ''

            return username.includes(searchTerm) ||
              email.includes(searchTerm) ||
              (user.id && user.id.toString().includes(searchTerm))
          })

          // 格式化数据
          this.searchedUsers = filteredUsers.map(user => {
            // 确保数值字段正确
            const maxBorrowCount = Number(user.maxBorrowCount) || 5
            const borrowedCount = Number(user.borrowedCount) || 0

            return {
              id: Number(user.id) || 0,
              username: user.username || '未知用户',
              email: user.email || '',
              role: user.role || 'USER',
              maxBorrowCount: maxBorrowCount,
              borrowedCount: borrowedCount,
              // 添加可借阅数量计算
              availableCount: maxBorrowCount - borrowedCount
            }
          })

          console.log('🔍 搜索结果:', {
            关键词: query,
            结果数: this.searchedUsers.length,
            样本: this.searchedUsers.slice(0, 3)
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

    // 搜索图书方法（调用后端API）
    async searchBooks(query) {
      // 修改：当查询为空时，显示最新添加的图书
      if (!query || query.trim() === '') {
        this.bookSearchLoading = true
        try {
          // 调用API获取最新图书
          var response = await bookApi.getBooks({
            page: 1,
            size: 30,  // 获取最新30本
            orderBy: 'id',  // 按ID排序
            order: 'desc'   // 降序，新添加的在前
          })
          response = response.data
          if (response && response.code === 200) {
            let results = []

            // 解析响应格式
            if (Array.isArray(response.data)) {
              results = response.data
            } else if (response.data && Array.isArray(response.data.list)) {
              results = response.data.list
            } else if (response.data && Array.isArray(response.data.content)) {
              results = response.data.content
            } else {
              results = response.data || []
            }

            // 确保图书信息完整，并修正库存字段
            results = results.filter(book =>
              book && book.id && book.title && book.author
            ).map(book => {
              // 根据数据库字段映射库存信息
              // 数据库字段：total_copies, available_copies
              // API可能返回：quantity, available 或 total_copies, available_copies
              const totalCopies = book.total_copies || book.quantity || book.totalCopies || 0
              const availableCopies = book.available_copies || (book.available ? 1 : 0) || book.availableCopies || 0

              return {
                id: book.id,
                title: book.title,
                author: book.author || '未知作者',
                isbn: book.isbn || '',
                category: book.category || '未分类',
                // 修正：使用正确的库存字段
                totalCopies: Number(totalCopies),  // 总副本数
                availableCopies: Number(availableCopies),  // 可用副本数
                // 兼容性字段（可选）
                quantity: Number(totalCopies),
                available: Number(availableCopies) > 0,
                borrowedCount: book.borrowed_count || book.borrowedCount || 0,
                description: book.description || '',
                coverImage: book.coverImage || '',
                location: book.location || '',
                publishDate: book.publishDate || '',
                publisher: book.publisher || '',
                // 保留原始数据用于调试
                _raw: book
              }
            })

            this.searchedBooks = results

            console.log('📚 空搜索返回最新图书:', {
              数量: results.length,
              样本: results.slice(0, 3).map(b => ({
                id: b.id,
                title: b.title,
                总库存: b.totalCopies,
                可用库存: b.availableCopies,
                原始数据: b._raw
              }))
            })

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
        // 调用API搜索图书
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

        console.log('图书搜索API响应原始数据:', response)

        if (response && response.code === 200) {
          let results = []

          // 解析响应格式
          if (Array.isArray(response.data)) {
            results = response.data
          } else if (response.data && Array.isArray(response.data.list)) {
            results = response.data.list
          } else if (response.data && Array.isArray(response.data.content)) {
            results = response.data.content
          } else {
            results = response.data || []
          }

          // 确保图书信息完整，并修正库存字段
          results = results.filter(book =>
            book && book.id && book.title && book.author
          ).map(book => {
            // 修正库存字段映射
            const totalCopies = book.total_copies || book.quantity || book.totalCopies || 0
            const availableCopies = book.available_copies || (book.available ? 1 : 0) || book.availableCopies || 0

            return {
              id: book.id,
              title: book.title,
              author: book.author || '未知作者',
              isbn: book.isbn || '',
              category: book.category || '未分类',
              // 修正后的库存字段
              totalCopies: Number(totalCopies),
              availableCopies: Number(availableCopies),
              // 兼容性字段
              quantity: Number(totalCopies),
              available: Number(availableCopies) > 0,
              borrowedCount: book.borrowed_count || book.borrowedCount || 0,
              description: book.description || '',
              coverImage: book.coverImage || '',
              location: book.location || '',
              publishDate: book.publishDate || '',
              publisher: book.publisher || '',
              _raw: book  // 调试用
            }
          })

          this.searchedBooks = results

          // 如果没有选中的图书或者选中的图书不在搜索结果中，重置选择
          if (this.selectedBook && !results.some(b => b.id === this.selectedBook.id)) {
            this.borrowForm.bookId = ''
            this.selectedBook = null
          }

          console.log('🔍 图书搜索完成:', {
            关键词: query,
            结果数: results.length,
            样本: results.slice(0, 3).map(b => ({
              id: b.id,
              title: b.title,
              总库存: b.totalCopies,
              可用库存: b.availableCopies
            }))
          })

        } else {
          console.warn('图书搜索API返回非200状态:', response)
          this.$message.warning(response?.message || '搜索图书失败')
          this.searchedBooks = []
        }

      } catch (error) {
        console.error('搜索图书失败:', error)

        // 错误处理
        if (error.response) {
          const status = error.response.status
          if (status === 401) {
            this.$message.error('登录已过期，请重新登录')
          } else if (status === 403) {
            this.$message.error('没有搜索权限')
          } else if (status === 404) {
            this.$message.error('搜索接口不存在')
          } else {
            this.$message.error(`搜索失败 (${status})`)
          }
        } else if (error.message === 'Network Error') {
          this.$message.error('网络错误，请检查连接')
        } else {
          this.$message.error('搜索图书失败')
        }
        this.searchedBooks = []
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

    handleBookChange(bookId) {
      if (!bookId) {
        this.selectedBook = null;
        return;
      }

      const numericId = Number(bookId);

      // 1. 先查搜索列表
      let book =
        this.searchedBooks.find(b => Number(b?.id) === numericId) ||
        this.getLatestBookData().find(b => Number(b?.id) === numericId);

      if (!book) {
        this.selectedBook = null;
        return;
      }

      // 2. 统一格式 + 兜底
      book = {
        ...book,
        availableCopies: Number(book.availableCopies ?? 0),
        totalCopies: Number(book.totalCopies ?? 0),
      };

      // 3. 保证 available 不超过 total
      if (book.availableCopies > book.totalCopies) {
        book.availableCopies = book.totalCopies;
      }

      this.selectedBook = book;

      // 调试用
      console.log('✅ 选中图书:', book.title, 'ID:', book.id,
        '库存:', `${book.availableCopies}/${book.totalCopies}`);
    },

    // 借书
    async handleBorrow() {
      this.$refs.borrowFormRef.validate(async (valid) => {
        if (!valid) return

        this.borrowing = true

        try {
          var res = await borrowApi.borrowBook(this.borrowForm)
          console.log(res)
          res = res.data
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
    // 加载当前借阅
    async loadCurrentBorrow() {
      this.currentLoading = true
      try {
        // 方案1：获取所有记录，在前端筛选和分页
        const params = {
          page: 1, // 固定为第1页
          size: 1000, // 获取足够多的数据
        }

        // 使用 keyword 参数
        if (this.currentSearch && this.currentSearch.trim()) {
          params.keyword = this.currentSearch.trim()
        }

        var res = await borrowApi.getBorrowRecords(params)
        res = res.data

        if (res.code === 200) {
          console.log('📊 当前借阅API响应:', res.data)

          // 获取所有借阅记录列表
          let allRecordsList = []

          // 根据不同的响应格式处理
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

          // 在前端筛选当前借阅（借阅中和已逾期）
          const currentBorrowList = allRecordsList.filter(record => {
            const status = record.status?.toUpperCase()

            // 动态检查是否逾期
            if (status === 'BORROWED' && record.dueDate) {
              const now = new Date()
              const dueDate = new Date(record.dueDate)
              if (dueDate < now) {
                // 标记为逾期
                record.status = 'OVERDUE'
                return true
              }
            }

            return status === 'BORROWED' || status === 'OVERDUE'
          })

          console.log('🔍 当前借阅筛选:', {
            获取总数: allRecordsList.length,
            当前借阅数: currentBorrowList.length,
            借阅中: currentBorrowList.filter(r => r.status?.toUpperCase() === 'BORROWED').length,
            已逾期: currentBorrowList.filter(r => r.status?.toUpperCase() === 'OVERDUE').length
          })

          // 在前端进行分页
          const startIndex = (this.currentPagination.page - 1) * this.currentPagination.size
          const endIndex = startIndex + this.currentPagination.size
          const paginatedList = currentBorrowList.slice(startIndex, endIndex)

          // 设置正确的分页总数
          this.currentPagination.total = currentBorrowList.length

          console.log('📄 前端分页信息:', {
            筛选后总数: currentBorrowList.length,
            当前页码: this.currentPagination.page,
            每页大小: this.currentPagination.size,
            当前页记录数: paginatedList.length,
            起始索引: startIndex,
            结束索引: endIndex
          })

          if (paginatedList.length === 0) {
            this.currentBorrowList = []
            return
          }

          // 提取所有需要查询的ID
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

          // 批量获取用户和图书信息
          const [usersInfo, booksInfo] = await Promise.all([
            this.fetchUsersByIds(userIds),
            this.fetchBooksByIds(bookIds)
          ])

          // 创建ID到信息的映射
          const userMap = new Map()
          usersInfo.forEach(user => {
            userMap.set(user.id, user)
          })

          const bookMap = new Map()
          booksInfo.forEach(book => {
            bookMap.set(book.id, book)
          })

          // 合并信息到借阅记录
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

          console.log('✅ 当前借阅加载完成:', {
            显示记录数: this.currentBorrowList.length,
            分页总数: this.currentPagination.total,
            总页数: Math.ceil(this.currentPagination.total / this.currentPagination.size)
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
    // 添加一个辅助方法统计状态分布
    getStatusDistribution(records) {
      const distribution = {}
      records.forEach(record => {
        const status = record.status?.toUpperCase() || 'UNKNOWN'
        distribution[status] = (distribution[status] || 0) + 1
      })
      return distribution
    },

    // 根据用户ID批量获取用户信息
    async fetchUsersByIds(userIds) {
      if (!userIds || userIds.length === 0) {
        return []
      }

      try {
        // 方法1: 如果后端支持批量查询
        var response
        // 方法2: 如果后端不支持批量，逐个查询
        if (!response || response.code !== 200) {
          return await this.fetchUsersOneByOne(userIds)
        }

        // 解析响应
        let users = []
        if (response.data && Array.isArray(response.data)) {
          users = response.data
        } else if (response.data && response.data.list && Array.isArray(response.data.list)) {
          users = response.data.list
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          users = response.data.content
        }

        return users

      } catch (error) {
        console.error('批量获取用户信息失败:', error)
        return await this.fetchUsersOneByOne(userIds)
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
          // 添加一个占位用户
          users.push({
            id: userId,
            username: `用户${userId}`,
            email: '未知'
          })
        }

        // 添加延迟避免请求过于频繁
        if (userIds.length > 5) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }

      return users
    },

    // 根据图书ID批量获取图书信息
    async fetchBooksByIds(bookIds) {
      if (!bookIds || bookIds.length === 0) {
        return []
      }

      try {
        var response
        // 方法2: 如果后端不支持批量，逐个查询
        if (!response || response.code !== 200) {
          return await this.fetchBooksOneByOne(bookIds)
        }

        // 解析响应
        let books = []
        if (response.data && Array.isArray(response.data)) {
          books = response.data
        } else if (response.data && response.data.list && Array.isArray(response.data.list)) {
          books = response.data.list
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          books = response.data.content
        }

        return books

      } catch (error) {
        console.error('批量获取图书信息失败:', error)
        return await this.fetchBooksOneByOne(bookIds)
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
          // 添加一个占位图书
          books.push({
            id: bookId,
            title: `图书${bookId}`,
            author: '未知作者',
            isbn: '未知ISBN'
          })
        }

        // 添加延迟避免请求过于频繁
        if (bookIds.length > 5) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }

      return books
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

        // 使用 keyword 参数
        if (this.recordsFilter.keyword && this.recordsFilter.keyword.trim()) {
          params.keyword = this.recordsFilter.keyword.trim()
        }

        var res = await borrowApi.getBorrowRecords(params)
        res = res.data

        if (res.code === 200) {

          // 获取借阅记录列表和分页信息
          let recordsList = []
          let totalRecords = 0

          // 根据不同的响应格式处理 - 支持分页格式
          if (res.data && res.data.list && Array.isArray(res.data.list)) {
            // 格式1: { data: { list: [], total: 100, page: 1, size: 10 } }
            recordsList = res.data.list
            totalRecords = res.data.total || 0
            this.recordsPagination.page = res.data.page || this.recordsPagination.page
            this.recordsPagination.size = res.data.size || this.recordsPagination.size


          } else if (res.data && res.data.content && Array.isArray(res.data.content)) {
            // 格式2: { data: { content: [], totalElements: 100, pageable: {} } }
            recordsList = res.data.content
            totalRecords = res.data.totalElements || res.data.total || 0


          } else if (Array.isArray(res.data)) {
            // 格式3: 直接返回数组（没有分页信息）
            recordsList = res.data
            totalRecords = res.data.length


          } else if (res.data && typeof res.data === 'object') {
            // 格式4: 其他对象格式
            recordsList = res.data || []
            totalRecords = Array.isArray(recordsList) ? recordsList.length : 0

          } else {
            recordsList = []
            totalRecords = 0
          }

          // 设置分页总数
          this.recordsPagination.total = totalRecords
          // 如果没有记录，直接返回空数组
          if (recordsList.length === 0) {
            this.allRecordsList = []
            return
          }

          // 提取所有需要查询的ID
          const userIds = []
          const bookIds = []

          recordsList.forEach(record => {
            if (record.userId && !userIds.includes(record.userId)) {
              userIds.push(record.userId)
            }
            if (record.bookId && !bookIds.includes(record.bookId)) {
              bookIds.push(record.bookId)
            }
          })


          // 批量获取用户和图书信息
          const [usersInfo, booksInfo] = await Promise.all([
            this.fetchUsersByIds(userIds),
            this.fetchBooksByIds(bookIds)
          ])

          // 创建ID到信息的映射
          const userMap = new Map()
          usersInfo.forEach(user => {
            userMap.set(user.id, user)
          })

          const bookMap = new Map()
          booksInfo.forEach(book => {
            bookMap.set(book.id, book)
          })

          // 合并信息到借阅记录
          this.allRecordsList = recordsList.map(record => {
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

          this.$message.error(res.message || '加载借阅记录失败')
          this.allRecordsList = []
          this.recordsPagination.total = 0
        }
      } catch (error) {

        // 显示详细的错误信息
        if (error.response) {
          console.error('错误详情:', {
            状态码: error.response.status,
            错误信息: error.response.data,
            请求URL: error.config?.url
          })

          if (error.response.status === 404) {
            this.$message.error('借阅记录接口不存在')
          } else if (error.response.status === 401) {
            this.$message.error('登录已过期，请重新登录')
          } else {
            this.$message.error(`加载失败 (${error.response.status})`)
          }
        } else {
          this.$message.error('加载失败，请稍后重试')
        }

        this.allRecordsList = []
        this.recordsPagination.total = 0
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
          var res = await borrowApi.returnBook(record.id)
          res = res.data
          console.log(res)
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
      }).catch(() => { })
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
          var res = await borrowApi.renewBook(record.id)
          res = res.data
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
      }).catch(() => { })
    },

    // 查看记录详情
    // 查看记录详情
    async viewRecordDetail(record) {
      // 先显示加载状态
      this.detailLoading = true
      this.selectedRecord = null
      this.detailDialogVisible = true

      try {
        // 1. 获取借阅记录详情
        var res = await borrowApi.getBorrowRecordDetail(record.id)

        res = res.data
        if (res.code === 200) {
          const borrowDetail = res.data

          // 2. 并行获取用户和图书的详细信息
          const [userResponse, bookResponse] = await Promise.all([
            userApi.getUserDetail(borrowDetail.userId),
            bookApi.getBookDetail(borrowDetail.bookId)
          ])


          // 3. 组装完整详情数据
          let userName = '未知用户'
          let userEmail = ''
          let bookTitle = '未知图书'
          let bookAuthor = ''
          let bookISBN = ''

          // 处理用户信息
          if (userResponse.data.code === 200) {
            userName = userResponse.data.data.username || '未知用户'
            userEmail = userResponse.data.data.email || ''
          } else {
            // 如果用户API失败，使用当前记录中的用户名
            userName = record.userName || '未知用户'
          }

          // 处理图书信息
          if (bookResponse.data.code === 200) {
            bookTitle = bookResponse.data.data.title || '未知图书'
            bookAuthor = bookResponse.data.data.author || ''
            bookISBN = bookResponse.data.data.isbn || ''
          } else {
            // 如果图书API失败，使用当前记录中的书名
            bookTitle = record.bookTitle || '未知图书'
          }

          // 4. 合并所有信息
          this.selectedRecord = {
            ...borrowDetail,
            userName: userName,
            userEmail: userEmail,
            bookTitle: bookTitle,
            bookAuthor: bookAuthor,
            bookISBN: bookISBN
          }

        } else {

        }
      } catch (error) {


        // 错误处理
        if (error.response) {
          console.error('错误详情:', {
            状态码: error.response.status,
            错误信息: error.response.data
          })
        }

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