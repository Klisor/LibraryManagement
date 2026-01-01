<template>
  <div class="personal-center">
    <!-- 顶部导航栏 -->
    <el-header class="user-header">
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
              {{ user.username || '用户' }}
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
      <!-- 个人信息卡片 -->
      <div class="profile-card">
        <!-- 头像居中部分 -->
        <div class="avatar-center-section">
          <el-avatar :size="100" class="user-avatar">
            {{ (user.username || 'U').charAt(0) }}
          </el-avatar>

          <div class="user-name-tag">
            <h2>{{ user.username }}</h2>
            <el-tag :style="{
              backgroundColor: user.role === 'ADMIN' ? '#f8f0e4' : '#f5eedf',
              color: user.role === 'ADMIN' ? '#c77' : '#948054',
              borderColor: user.role === 'ADMIN' ? '#e8d4b8' : '#e6cb93'
            }" size="small">
              {{ user.role === 'ADMIN' ? '管理员' : '普通用户' }}
            </el-tag>
          </div>

          <p class="user-email">{{ user.email }}</p>

          <!-- 统计信息 -->
          <div class="profile-stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ user.borrowedCount || 0 }}</div>
              <div class="stat-label">当前借阅</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ user.maxBorrowCount || 5 }}</div>
              <div class="stat-label">最大借阅</div>
            </div>
            <div class="stat-item">
              <div class="stat-value available">
                {{ (user.maxBorrowCount || 5) - (user.borrowedCount || 0) }}
              </div>
              <div class="stat-label">可用额度</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ noteStats.total }}</div>
              <div class="stat-label">笔记数量</div>
            </div>
          </div>

          <!-- 编辑资料按钮 -->
          <div class="profile-actions">
            <el-button class="ancient-btn" icon="el-icon-edit" @click="showEditProfile">
              编辑资料
            </el-button>
          </div>
        </div>
      </div>

      <!-- 笔记管理区域 -->
      <div class="notes-section">
        <div class="section-header">
          <h3> 我的笔记</h3>
          <div class="section-actions">
            <el-button type="warning" icon="el-icon-plus" @click="showCreateNote" class="custom-note-btn">
              新建笔记
            </el-button>
          </div>
        </div>

        <!-- 笔记筛选 -->
        <div class="notes-filter">
          <el-input v-model="noteFilter.keyword" placeholder="搜索笔记标题或内容" style="width: 300px; margin-right: 10px;"
            @keyup.enter.native="loadNotes">
            <el-button slot="append" icon="el-icon-search" @click="loadNotes"></el-button>
          </el-input>

          <!-- <el-select v-model="noteFilter.bookId" placeholder="关联书籍筛选" clearable filterable
            style="width: 200px; margin-right: 10px;" @change="loadNotes">
            <el-option label="全部笔记" value=""></el-option>
            <el-option label="未关联书籍" :value="0"></el-option>
            <el-option v-for="book in userBooks" :key="book.id" :label="book.title" :value="book.id"></el-option>
          </el-select> -->

          <el-button @click="resetNoteFilter">重置</el-button>
        </div>

        <!-- 笔记列表 -->
        <div class="notes-list">
          <div v-if="notesLoading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>

          <div v-else-if="notes.length === 0" class="empty-container">
            <el-empty description="暂无笔记">
              <el-button type="primary" @click="showCreateNote" class="ancient-primary-btn">
                创建第一篇笔记
              </el-button>
            </el-empty>
          </div>

          <div v-else class="notes-grid">
            <div v-for="note in notes" :key="note.id" class="note-card" @click="viewNoteDetail(note)">
              <div class="note-header">
                <h4 class="note-title">{{ note.title }}</h4>
                <div class="note-actions">
                  <el-button size="mini" type="text" icon="el-icon-edit" @click.stop="editNote(note)"></el-button>
                  <el-button size="mini" type="text" icon="el-icon-delete" @click.stop="deleteNote(note)"></el-button>
                </div>
              </div>

              <div class="note-content-preview">
                {{ getContentPreview(note.content) }}
              </div>

              <div class="note-meta">
                <div v-if="note.bookInfo" class="note-book">
                  <i class="el-icon-notebook-2"></i>
                  <span>{{ note.bookInfo.title }}</span>
                </div>
                <div v-else class="note-book">
                  <i class="el-icon-document"></i>
                  <span>未关联书籍</span>
                </div>

                <div class="note-date">
                  <i class="el-icon-time"></i>
                  <span>{{ formatDate(note.updatedAt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="noteStats.total > 0" class="pagination-container">
            <el-pagination @size-change="handleNotesSizeChange" @current-change="handleNotesPageChange"
              :current-page="notesPagination.page" :page-sizes="[12, 24, 48]" :page-size="notesPagination.size"
              layout="total, sizes, prev, pager, next, jumper" :total="noteStats.total" :background="true">
            </el-pagination>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑资料对话框 -->
    <!-- 修改编辑资料对话框，用户名完全禁用 -->
    <el-dialog title="编辑资料" :visible.sync="editProfileDialogVisible" width="500px">
      <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="100px">
        <!-- 用户名：所有用户都不可修改 -->
        <el-form-item label="用户名">
          <el-input v-model="user.username" placeholder="用户名" disabled></el-input>
          <div class="form-tip">用户名不可修改</div>
        </el-form-item>

        <!-- 邮箱：所有用户都可以修改 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
<!-- 修改密码 -->
<el-form-item label="新密码" prop="password">
  <el-input
    v-model="profileForm.password"
    placeholder="请输入新密码"
    type="password"
    show-password
  ></el-input>
</el-form-item>
        <!-- 当前借阅数：只读 -->
        <el-form-item label="当前借阅">
          <el-input-number v-model="user.borrowedCount" disabled controls-position="right"></el-input-number>
        </el-form-item>

        <!-- 最大借阅数：普通用户只读，管理员可编辑 -->
        <el-form-item label="最大借阅">
          <div v-if="user.role !== 'ADMIN'">
            <el-input-number v-model="user.maxBorrowCount" disabled controls-position="right"></el-input-number>
            <span class="form-tip">普通用户最大借阅数为5本</span>
          </div>
          <div v-else>
            <el-input-number v-model="profileForm.maxBorrowCount" :min="user.borrowedCount" :max="50"
              controls-position="right"></el-input-number>
            <span class="form-tip">管理员最大可借阅50本，且不能小于当前借阅数</span>
          </div>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editProfileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateProfile" :loading="updatingProfile">
          保存
        </el-button>
      </div>
    </el-dialog>

    <!-- 笔记详情/编辑对话框 -->
    <el-dialog :title="noteDialogTitle" :visible.sync="noteDialogVisible" width="700px" @close="handleNoteDialogClose">
      <el-form :model="noteForm" :rules="noteRules" ref="noteFormRef" label-width="100px" v-loading="noteFormLoading">
        <el-form-item label="笔记标题" prop="title">
          <el-input v-model="noteForm.title" placeholder="请输入笔记标题" maxlength="200" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="关联书籍" prop="bookId">
          <el-select v-model="noteForm.bookId" placeholder="选择关联书籍（可选）" clearable filterable style="width: 100%;">
            <el-option label="不关联书籍" :value="null"></el-option>
            <el-option v-for="book in availableBooks" :key="book.id" :label="`${book.title} - ${book.author}`"
              :value="book.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="笔记内容" prop="content">
          <el-input v-model="noteForm.content" type="textarea" :rows="10" placeholder="请输入笔记内容..."
            resize="vertical"></el-input>
        </el-form-item>

        <el-form-item v-if="selectedNote" label="创建时间">
          <span>{{ formatDate(selectedNote.createdAt) }}</span>
        </el-form-item>

        <el-form-item v-if="selectedNote" label="更新时间">
          <span>{{ formatDate(selectedNote.updatedAt) }}</span>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="noteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNoteForm" :loading="noteFormSubmitting">
          {{ isEditNoteMode ? '保存修改' : '创建笔记' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 笔记详情对话框（只读模式） -->
    <el-dialog title="笔记详情" :visible.sync="noteDetailDialogVisible" width="700px">
      <div v-if="selectedNote" class="note-detail">
        <div class="detail-header">
          <h2>{{ selectedNote.title }}</h2>

          <div v-if="selectedNote.bookInfo" class="note-book-info">
            <i class="el-icon-notebook-2"></i>
            <span>关联书籍：{{ selectedNote.bookInfo.title }}</span>
          </div>
          <div v-else class="note-book-info">
            <i class="el-icon-document"></i>
            <span>未关联书籍</span>
          </div>
        </div>

        <div class="detail-meta">
          <span class="meta-item">
            <i class="el-icon-time"></i>
            创建时间：{{ formatDate(selectedNote.createdAt) }}
          </span>
          <span class="meta-item">
            <i class="el-icon-time"></i>
            更新时间：{{ formatDate(selectedNote.updatedAt) }}
          </span>
        </div>

        <div class="detail-content">
          <h3>内容</h3>
          <div class="content-text">
            {{ selectedNote.content }}
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="noteDetailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="editNote(selectedNote)">编辑</el-button>
      </div>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog title="删除确认" :visible.sync="deleteDialogVisible" width="400px">
      <div v-if="noteToDelete" class="delete-confirm">
        <p>确定要删除笔记《{{ noteToDelete.title }}》吗？</p>
        <p class="warning-text">此操作不可撤销！</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDeleteNote" :loading="deletingNote">
          确定删除
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { userApi } from '@/api/user'
import { noteApi } from '@/api/note'
import { bookApi } from '@/api/book'
import '@/assets/ancient-form.css'
import { BOOK_CATEGORIES } from '@/constants/bookCategories'

export default {
  name: 'Personal',
  data() {
    return {
      // 用户信息
      user: {},

      // 个人信息编辑
      editProfileDialogVisible: false,
      profileForm: {
          password: '',
        email: ''
      },
      profileRules: {
        password: [
  { required: false, message: '请输入新密码', trigger: 'blur' },
  { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' }
],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ]
      },
      updatingProfile: false,

      // 笔记数据
      notes: [],
      notesLoading: false,
      noteStats: {
        total: 0
      },
      notesPagination: {
        page: 1,
        size: 12
      },
      noteFilter: {
        keyword: ''
      },

      // 笔记对话框
      noteDialogVisible: false,
      noteDetailDialogVisible: false,
      isEditNoteMode: false,
      noteDialogTitle: '新建笔记',
      noteForm: {
        id: '',
        title: '',
        content: '',
        bookId: null
      },
      noteRules: {
        title: [
          { required: true, message: '请输入笔记标题', trigger: 'blur' },
          { min: 1, max: 200, message: '标题长度在1-200个字符之间', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入笔记内容', trigger: 'blur' }
        ]
      },
      noteFormLoading: false,
      noteFormSubmitting: false,
      selectedNote: null,

      // 删除对话框
      deleteDialogVisible: false,
      noteToDelete: null,
      deletingNote: false,

      // 所有可用书籍（用于关联选择）
      availableBooks: [],

      // 页面状态
      activeNav: 'personal',
      loadingUserInfo: false,
      pageLoading: true
    }
  },
  computed: {
    // 当前用户可借阅的最大数量
    userMaxBorrow() {
      if (!this.user) return 5
      return this.user.role === 'ADMIN' ? 20 : 5
    },

    // 用户借阅统计
    borrowStats() {
      if (!this.user) return { borrowed: 0, remaining: 5 }
      const borrowed = this.user.borrowedCount || 0
      const max = this.userMaxBorrow
      return {
        borrowed,
        remaining: Math.max(0, max - borrowed)
      }
    }
  },
  mounted() {
    this.initPage()
  },
  methods: {
    // 初始化页面
    async initPage() {
      this.pageLoading = true

      // 检查用户是否登录
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        this.$message.warning('请先登录')
        this.$router.push('/user/login')
        return
      }

      try {
        const user = JSON.parse(userStr)
        if (!user || !user.id) {
          this.$message.warning('用户信息不完整，请重新登录')
          localStorage.removeItem('user')
          this.$router.push('/user/login')
          return
        }

        // 设置初始用户数据
        this.user = user

        // 修改：先加载用户信息，确保登录状态有效
        try {
          await this.loadUserInfo()
        } catch (userError) {
          // 用户信息加载失败，但不要阻止页面加载
          // 继续使用缓存数据
          this.$message.warning('使用缓存用户信息')
        }

        // 修改：并行加载其他数据（笔记、书籍）
        await Promise.all([
          this.loadNotes(),
          this.loadAvailableBooks()
        ])

      } catch (error) {
        this.$message.error('页面加载失败，请刷新重试')
      } finally {
        this.pageLoading = false
      }
    },

    // 导航处理
    handleNavSelect(index) {
      this.activeNav = index
      const routes = {
        'home': '/user',
        'books': '/user/books',
        'borrow': '/user/borrow',
        'personal': '/user/personal'
      }

      if (routes[index] && this.$route.path !== routes[index]) {
        this.$router.push(routes[index])
      }
    },

    handleCommand(command) {
      if (command === 'logout') {
        this.logout()
      } else if (command === 'profile' || command === 'notes') {
        if (this.$route.path !== '/user/personal') {
          this.$router.push('/user/personal')
        }
      }
    },

    logout() {
      localStorage.removeItem('user')
      this.$router.push('/user/login')
    },

    // 加载用户信息
    async loadUserInfo() {
      this.loadingUserInfo = true
      try {
        var response = await userApi.getCurrentUser()
        response = response.data
        if (response.code === 200) {
          // 合并新旧用户数据
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
          const updatedUser = {
            ...currentUser,
            ...response.data,
            // 确保重要字段不被覆盖
            token: currentUser.token || response.data.token,
            id: currentUser.id || response.data.id,
            username: currentUser.username || response.data.username
          }

          this.user = updatedUser
          // 更新本地存储
          localStorage.setItem('user', JSON.stringify(updatedUser))
        } else {
          // API返回错误，但不抛出异常
          console.warn('获取用户信息API返回错误:', response.message)
        }
      } catch (error) {
        // 捕获错误但不抛出，只记录日志
        // 保持使用现有用户数据
        this.$message.warning('无法获取最新用户信息，使用缓存数据')
      } finally {
        this.loadingUserInfo = false
      }
    },

    // 加载笔记列表
    async loadNotes() {
  this.notesLoading = true
  try {
    const params = {
      page: this.notesPagination.page,
      size: this.notesPagination.size,
      keyword: this.noteFilter.keyword || ''
    }

    const response = await noteApi.getNotes(params)

    // 确保使用正确的数据结构
    const res = response

    if (res.code === 200) {
      let notes = []
      
      // 现在res.data应该是 { total, page, size, list } 结构
      if (res.data && res.data.list) {
        notes = res.data.list || []
        this.noteStats.total = res.data.total || 0
      } else {
        // 兼容旧格式
        notes = res.data || []
        this.noteStats.total = notes.length
      }
      
      
      // 为有bookId的笔记获取图书信息
      const notesWithBookInfo = await Promise.all(
        notes.map(async note => {
          // 如果没有关联书籍，直接返回原笔记数据
          if (!note.bookId) {
            return {
              ...note,
              bookTitle: '未关联书籍',
              bookInfo: null
            }
          }
          
          try {
            // 获取图书详情
            const bookResponse = await bookApi.getBookDetail(note.bookId)
            const bookRes = bookResponse.data || bookResponse
            
            if (bookRes.code === 200 && bookRes.data) {
              return {
                ...note,
                bookTitle: bookRes.data.title || '未知图书',
                bookInfo: bookRes.data
              }
            } else {
              // 如果API返回了图书信息但在bookTitle字段中
              return {
                ...note,
                bookTitle: note.bookTitle || '图书信息获取失败',
                bookInfo: null
              }
            }
          } catch (error) {
            console.error(`获取图书 ${note.bookId} 信息失败:`, error)
            // 使用原有数据或默认值
            return {
              ...note,
              bookTitle: note.bookTitle || '图书信息获取失败',
              bookInfo: null
            }
          }
        })
      )
      
      this.notes = notesWithBookInfo
    } else {
      this.$message.warning(res.message || '加载笔记失败')
    }
  } catch (error) {
    console.error('加载笔记失败:', error)
    this.$message.error('加载失败，请稍后重试')
  } finally {
    this.notesLoading = false
  }
},

    // 加载所有可用书籍（用于关联选择）
    async loadAvailableBooks() {
      try {
        var res = await bookApi.getBooks({ page: 1, size: 50 })
        res = res.data
        if (res.code === 200) {
          this.availableBooks = res.data || []
        }
      } catch (error) {
        // 静默失败，不影响主流程
      }
    },

    // 重置笔记筛选
    resetNoteFilter() {
      this.noteFilter = {
        keyword: ''
      }
      this.notesPagination.page = 1
      this.loadNotes()
    },

    // 笔记分页
    handleNotesSizeChange(size) {
      this.notesPagination.size = size
      this.notesPagination.page = 1
      this.loadNotes()
    },

    handleNotesPageChange(page) {
      this.notesPagination.page = page
      this.loadNotes()
    },

    // 显示编辑资料对话框
    showEditProfile() {
      if (!this.user) return

      this.profileForm = {
        email: this.user.email || '',
        maxBorrowCount: this.user.maxBorrowCount || 5
      }

      this.editProfileDialogVisible = true

      this.$nextTick(() => {
        if (this.$refs.profileFormRef) {
          this.$refs.profileFormRef.clearValidate()
        }
      })
    },

    // 更新个人资料
    // 在 Personal.vue 中修改 updateProfile 方法
    async updateProfile() {
      if (!this.$refs.profileFormRef) return

      const valid = await this.$refs.profileFormRef.validate()
      if (!valid) return

      this.updatingProfile = true

      try {
        // 构建更新数据
        const updateData = {}

        // 只允许修改邮箱
        if (this.profileForm.email && this.profileForm.email.trim() !== this.user.email) {
          updateData.email = this.profileForm.email.trim()
        }
        // 如果用户输入了新密码，则添加到更新数据中
        if (this.profileForm.password) {
          updateData.password = this.profileForm.password
        }
        // 如果没有需要更新的字段，直接返回
        if (Object.keys(updateData).length === 0) {
          this.$message.info('没有需要更新的内容')
          this.editProfileDialogVisible = false
          return
        }


        // 调用更新接口
        const response = await userApi.updateUser(this.user.id, updateData)

        // 更新成功后处理
        this.$message.success('更新成功')
        this.editProfileDialogVisible = false

        // 更新本地用户信息中的邮箱
        this.user.email = updateData.email
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        currentUser.email = updateData.email
        localStorage.setItem('user', JSON.stringify(currentUser))

      } catch (error) {
        console.error('更新邮箱失败:', error)

        if (error.response) {
          const status = error.response.status
          const errorData = error.response.data

          console.log('错误详情:', {
            status: status,
            data: errorData
          })

          switch (status) {
            case 400:
              this.$message.error(errorData?.message || '邮箱格式错误')
              break
            case 401:
              // token无效或过期，只提示不跳转
              this.$message.error('登录状态已过期，请刷新页面重新登录')
              break
            case 403:
              this.$message.error('权限错误，无法修改用户信息')
              break
            case 404:
              this.$message.error('用户不存在')
              break
            case 500:
              this.$message.error('服务器内部错误，请稍后重试')
              break
            default:
              this.$message.error(`更新失败: ${status}`)
          }
        } else if (error.message === 'Network Error') {
          this.$message.error('网络错误，请检查网络连接')
        } else {
          this.$message.error('更新失败: ' + error.message)
        }
      } finally {
        this.updatingProfile = false
      }
    },

    // 处理500错误
    async handle500Error() {
      this.$message.warning('服务器内部错误，正在验证更新状态...')

      // 等待一下，让后端有时间处理
      setTimeout(async () => {
        try {
          // 重新获取用户信息
          const recheck = await userApi.getCurrentUser()

          if (recheck.code === 200) {
            const recheckUser = recheck.data

            // 检查邮箱是否已更新
            const emailUpdated = this.profileForm.email &&
              recheckUser.email === this.profileForm.email

            // 检查最大借阅数是否已更新（仅管理员）
            const maxBorrowCountUpdated = this.user.role === 'ADMIN' &&
              this.profileForm.maxBorrowCount !== undefined &&
              recheckUser.maxBorrowCount === this.profileForm.maxBorrowCount

            if (emailUpdated || maxBorrowCountUpdated) {
              this.$message.success('资料已更新成功！')
              this.editProfileDialogVisible = false

              // 更新本地存储
              const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
              const updatedUser = { ...currentUser, ...recheckUser }
              localStorage.setItem('user', JSON.stringify(updatedUser))
              this.user = updatedUser
            } else {
              this.$message.error('服务器错误，更新未生效')
            }
          } else {
            this.$message.error('服务器错误，请稍后重试')
          }
        } catch (recheckError) {
          this.$message.error('验证失败，请稍后重试')
        }
      }, 1500)
    },

    // 处理500错误
    handle500Error() {
      this.$message.warning('服务器内部错误，正在验证更新状态...')

      // 等待一下，让后端有时间处理
      setTimeout(async () => {
        try {
          // 重新获取用户信息
          const recheck = await userApi.getCurrentUser()

          if (recheck.code === 200) {
            const recheckUser = recheck.data

            // 检查邮箱是否已更新
            if (recheckUser.email === this.profileForm.email) {
              this.$message.success('邮箱已更新成功！')
              this.editProfileDialogVisible = false

              // 更新本地存储
              const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
              const updatedUser = { ...currentUser, email: recheckUser.email }
              localStorage.setItem('user', JSON.stringify(updatedUser))
              this.user = updatedUser
            } else {
              this.$message.error('服务器错误，更新未生效')
            }
          } else {
            this.$message.error('服务器错误，请稍后重试')
          }
        } catch (recheckError) {
          this.$message.error('验证失败，请稍后重试')
        }
      }, 1500)
    },

    // 显示创建笔记对话框
    showCreateNote() {
      this.isEditNoteMode = false
      this.noteDialogTitle = '新建笔记'
      this.selectedNote = null

      this.noteForm = {
        id: '',
        title: '',
        content: '',
        bookId: null
      }

      this.noteDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.noteFormRef) {
          this.$refs.noteFormRef.clearValidate()
        }
      })
    },

    // 查看笔记详情
    async viewNoteDetail(note) {
  this.noteFormLoading = true
  try {
    // 直接使用列表中已有的图书信息
    // 因为我们在loadNotes中已经获取了图书信息
    this.selectedNote = {
      ...note,
      bookTitle: note.bookTitle || (note.bookId ? '正在加载...' : '未关联书籍'),
      bookInfo: note.bookInfo || null
    }
    
    // 如果列表中没有图书信息但有bookId，再尝试获取
    if (note.bookId && !note.bookInfo) {
      try {
        const bookResponse = await bookApi.getBookDetail(note.bookId)
        const bookRes = bookResponse.data || bookResponse
        
        if (bookRes.code === 200 && bookRes.data) {
          this.selectedNote = {
            ...this.selectedNote,
            bookTitle: bookRes.data.title || '未知图书',
            bookInfo: bookRes.data
          }
        }
      } catch (bookError) {
        // 保持原有数据
      }
    }
    
    this.noteDetailDialogVisible = true
  } catch (error) {
    this.$message.error('打开详情失败，请稍后重试')
  } finally {
    this.noteFormLoading = false
  }
},

    // 编辑笔记
    editNote(note) {
      this.isEditNoteMode = true
      this.noteDialogTitle = '编辑笔记'
      this.selectedNote = note

      this.noteForm = {
        id: note.id,
        title: note.title || '',
        content: note.content || '',
        bookId: note.bookId || null
      }

      this.noteDetailDialogVisible = false
      this.noteDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.noteFormRef) {
          this.$refs.noteFormRef.clearValidate()
        }
      })
    },

    // 笔记对话框关闭
    handleNoteDialogClose() {
      if (this.$refs.noteFormRef) {
        this.$refs.noteFormRef.clearValidate()
      }
    },

    // 提交笔记表单
    submitNoteForm() {
      if (!this.$refs.noteFormRef) return

      this.$refs.noteFormRef.validate(async (valid) => {
        if (!valid) return

        this.noteFormSubmitting = true

        try {
          const noteData = {
            title: this.noteForm.title.trim(),
            content: this.noteForm.content.trim(),
            bookId: this.noteForm.bookId || null
          }

          let res
          if (this.isEditNoteMode) {
            res = await noteApi.updateNote(this.noteForm.id, noteData)
          } else {
            res = await noteApi.createNote(noteData)
          }
          res = res.data
          if (res.code === 200) {
            this.$message.success(this.isEditNoteMode ? '笔记更新成功' : '笔记创建成功')
            this.noteDialogVisible = false
            this.loadNotes()
          } else {
            this.$message.error(res.message || '操作失败')
          }
        } catch (error) {
          this.$message.error('操作失败，请稍后重试')
        } finally {
          this.noteFormSubmitting = false
        }
      })
    },

    // 删除笔记
    deleteNote(note) {
      this.noteToDelete = note
      this.deleteDialogVisible = true
    },

    // 确认删除笔记
    async confirmDeleteNote() {
      if (!this.noteToDelete) return

      this.deletingNote = true
      try {
        var res = await noteApi.deleteNote(this.noteToDelete.id)
        res=res.data
        if (res.code === 200) {
          this.$message.success('笔记删除成功')
          this.deleteDialogVisible = false
          this.loadNotes()
        } else {
          this.$message.error(res.message || '删除失败')
        }
      } catch (error) {
        this.$message.error('删除失败，请稍后重试')
      } finally {
        this.deletingNote = false
        this.noteToDelete = null
      }
    },

    // 工具函数
    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return dateString
      }
    },

    getContentPreview(content) {
      if (!content) return '无内容'
      const preview = content.substring(0, 100)
      return preview.length < content.length ? preview + '...' : preview
    },

    getCategoryName(categoryCode) {
      return BOOK_CATEGORIES[categoryCode] || '未知分类'
    },

    // 刷新数据
    refreshData() {
      this.loadUserInfo()
      this.loadNotes()
    }
  }
}
</script>
<style scoped>
.personal-center {
  min-height: 100vh;
  background-image: url('../../assets/image/home2.jpg');
  background-size: 110% 110%;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

/* 添加半透明遮罩层，让内容更清晰 */
.personal-center::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  /* 半透明白色遮罩 */
  z-index: -1;
  /* 确保在内容下面 */
}

p,
h1,
h2 {
  font-family: "STKaiti", "KaiTi", serif;
}



.user-home {
  height: 100vh;
}

.user-header {
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
  margin: 2px 20px;
}

.logo-img {
  width: 25px;
  /* 根据你的图标调整 */
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

.empty-container :deep(.ancient-primary-btn) {
  background: linear-gradient(135deg, #a7874b, #8b7355) !important;
  border: 1px solid #8b7355 !important;
  color: white !important;
  border-radius: 20px !important;
  padding: 10px 28px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 4px rgba(155, 135, 110, 0.1) !important;
}

.empty-container :deep(.ancient-primary-btn:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(155, 135, 110, 0.25) !important;
  background: linear-gradient(135deg, #8b7355, #a7874b) !important;
}

.empty-container :deep(.ancient-primary-btn:active) {
  transform: translateY(0) !important;
  box-shadow: 0 2px 4px rgba(155, 135, 110, 0.1) !important;
}

/* 用户信息区域样式 */
.user-info .el-dropdown-link {
  cursor: pointer;
  color: #8b7355;
  /* 深棕色，与古籍风格一致 */
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(250, 248, 245, 0.9);
  /* 半透明米白背景 */
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
  /* 图标使用金色 */
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




/* 个人信息卡片 */
.profile-card {
  background-color: rgba(255, 255, 255, 0.5);
  /* 85%不透明度，15%透明 */
  padding: 40px 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(155, 135, 110, 0.15);
  border: 1px solid #e8d4b8;
  backdrop-filter: blur(10px);
  /* 可选：添加毛玻璃效果 */
}

.avatar-center-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-section {
  display: flex;
  align-items: center;
}

.user-avatar {
  background: linear-gradient(135deg, #a7874b, #8b7355);
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 15px;
  border: 3px solid #e8d4b8;
  box-shadow: 0 4px 12px rgba(155, 135, 110, 0.2);
}

.user-name-tag {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.user-name-tag h2 {
  margin: 0;
  color: #5b4636;
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 24px;
}


.user-basic h2 {
  margin: 0 0 5px 0;
  color: #303133;
}

.user-email {
  margin: 0 0 25px 0;
  color: #8b7355;
  font-size: 14px;
}

.profile-stats {
  display: flex;
  gap: 20px;
}

.profile-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 500px;
  margin-bottom: 25px;
}

.stat-item {
  text-align: center;
  padding: 15px 10px;
  background: rgba(250, 248, 245, 0.8);
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(155, 135, 110, 0.15);
  background: rgba(250, 248, 245, 1);
}

.stat-label {
  color: #8b7355;
  font-size: 12px;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #a7874b;
  margin-bottom: 5px;
}

.stat-value.available {
  color: #dcb716;
}

.profile-actions {
  margin-top: 15px;
}

/* Vue 2 使用 /deep/ */
.note-detail /deep/ .el-textarea__inner:focus {
  border-color: #e8d4b8 !important;
  box-shadow: 0 0 0 2px rgba(232, 212, 184, 0.2) !important;
}

/* 或者更通用的，修改所有文本域 */
.el-dialog__wrapper /deep/ .el-textarea__inner:focus {
  border-color: #e8d4b8 !important;
  box-shadow: 0 0 0 2px rgba(232, 212, 184, 0.2) !important;
}

/* 所有对话框的底部按钮 - 古籍风格 */
.el-dialog__wrapper /deep/ .el-dialog__footer .el-button {
  background: #f5f0e6 !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
  font-weight: 500;
  padding: 10px 20px !important;
  border-radius: 20px !important;
  transition: all 0.3s;
}

.el-dialog__wrapper /deep/ .el-dialog__footer .el-button.el-button--primary {
  background: linear-gradient(135deg, #a7874b, #8b7355) !important;
  border: 1px solid #8b7355 !important;
  color: white !important;
}

.el-dialog__wrapper /deep/ .el-dialog__footer .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.2);
}

.el-dialog__wrapper /deep/ .el-dialog__footer .el-button.el-button--primary:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b) !important;
  border-color: #a7874b !important;
  box-shadow: 0 6px 12px rgba(155, 135, 110, 0.3);
}

/* 笔记操作按钮 - 使用Vue 2深度选择器 */

/* 编辑按钮样式 */
.note-actions /deep/ .el-button.el-button--text:first-child {
  color: #5b7d5b !important;
  /* 绿色系，表示编辑 */
}

.note-actions /deep/ .el-button.el-button--text:first-child:hover {
  color: #7aa57a !important;
  /* 悬停时更亮 */
  background-color: rgba(91, 125, 91, 0.1) !important;
}

/* 删除按钮样式 */
.note-actions /deep/ .el-button.el-button--text:last-child {
  color: #c77 !important;
  /* 红色系，表示删除 */
}

.note-actions /deep/ .el-button.el-button--text:last-child:hover {
  color: #a55 !important;
  /* 悬停时更深 */
  background-color: rgba(204, 119, 119, 0.1) !important;
}

/* 在scoped样式中使用/deep/ */
.notes-filter /deep/ .el-input__inner:focus {
  border-color: #e8d4b8 !important;
  box-shadow: 0 0 0 2px rgba(232, 212, 184, 0.2) !important;
}

.notes-filter /deep/ .el-input-group__append .el-button:hover {
  background-color: #cabaa4 !important;
  border-color: #c6b7a3 !important;
  color: #5b4636 !important;
}

/* 古籍风格编辑按钮 */
.profile-actions .el-button.ancient-btn {
  background: linear-gradient(135deg, #a7874b, #8b7355);
  border: 1px solid #8b7355;
  color: white;

  font-weight: bold;
  padding: 10px 24px;
  border-radius: 20px;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.2);
}

.profile-actions .el-button.ancient-btn:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b);
  border-color: #a7874b;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(155, 135, 110, 0.3);
}

.profile-actions .el-button.ancient-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(155, 135, 110, 0.2);
}

.profile-actions .el-button.ancient-btn i {
  margin-right: 5px;
}

/* 新建笔记按钮 - 使用相同的棕色系古籍风格 */
.section-actions .el-button.custom-note-btn.el-button--warning {
  background: linear-gradient(135deg, #a7874b, #8b7355);
  border: 1px solid #8b7355;
  color: white;
  font-weight: bold;
  padding: 10px 24px;
  border-radius: 20px;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.2);
}

.section-actions .el-button.custom-note-btn.el-button--warning:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b);
  border-color: #a7874b;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(155, 135, 110, 0.3);
}

.section-actions .el-button.custom-note-btn.el-button--warning:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(155, 135, 110, 0.2);
}

.section-actions .el-button.custom-note-btn.el-button--warning i {
  margin-right: 5px;
}


/* 响应式调整 */
@media (max-width: 768px) {
  .profile-stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .profile-card {
    padding: 30px 20px;
  }
}

@media (max-width: 480px) {
  .profile-stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .user-name-tag {
    flex-direction: column;
    gap: 5px;
  }
}

/* 笔记管理区域 */
.notes-section {
  background-color: rgba(255, 255, 255, 0.8);
  /* 85%不透明度，15%透明 */
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #eddebd;
  /* 添加这行，确保有宽度、样式和颜色 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  /* 可选：添加毛玻璃效果 */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #5b4636;
  font-size: 20px;
}

.notes-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}


/* 笔记筛选区域 */
.notes-filter .el-input__inner {
  /* 输入框边框颜色 */

  border: 1px solid #e8d4b8;
  border-radius: 4px;
}

.notes-filter .el-button {
  background: #f5f0e6;
  border: 1px solid #e8d4b8;
  color: #5b4636;
  transition: all 0.3s;
}

.notes-filter .el-button:hover {
  background: #dbccb4;
  color: #3c2c1e;

  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.2);
}

.notes-filter .el-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(155, 135, 110, 0.1);
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

/* 空状态容器 */
.empty-container .el-empty__description {
  color: #8b7355;
  font-family: "STKaiti", "KaiTi", serif;
}

/* 加载状态 */
.loading-container .el-skeleton__item {
  background: linear-gradient(90deg, #f5f0e6 25%, #e8d4b8 37%, #f5f0e6 63%);
}

/* 笔记网格布局 */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

/* 笔记卡片样式 */
.note-card {
  border: 1px solid #e8d4b8;
  /* 浅棕色边框 */
  border-radius: 8px;
  padding: 20px;
  background: #ffffff;
  /* 淡米色背景 */
  transition: all 0.3s;
  cursor: pointer;
}

.note-card:hover {
  box-shadow: 0 4px 12px rgba(155, 135, 110, 0.2);
  /* 暖色阴影 */
  transform: translateY(-2px);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.note-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #5b4636;
  /* 深棕色标题 */
  flex: 1;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-actions {
  flex-shrink: 0;
}

.note-content-preview {
  color: #8b7355;
  /* 中棕色内容 */
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
  height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;

  -webkit-box-orient: vertical;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #51401f;
  /* 金色元数据 */
}

.note-book,
.note-date {
  display: flex;
  align-items: center;
}

.note-book i,
.note-date i {
  margin-right: 5px;
}

/* 分页样式 */
.pagination-container {
  margin-top: 20px;
  text-align: center;
}

/* 分页样式 */
/* 分页样式 - Vue 2 /deep/ 深度选择器 */
.pagination-container /deep/ .el-pagination.is-background .btn-prev,
.pagination-container /deep/ .el-pagination.is-background .btn-next,
.pagination-container /deep/ .el-pagination.is-background .el-pager li {
  color: #8b7355;
  border: 1px solid #e8d4b8;
  background: #fffbf6;

  font-weight: 500;
  transition: all 0.3s;
}

.pagination-container /deep/ .el-pagination.is-background .btn-prev:hover,
.pagination-container /deep/ .el-pagination.is-background .btn-next:hover,
.pagination-container /deep/ .el-pagination.is-background .el-pager li:hover {
  color: #5b4636;
  background: #e8dbc9;
  border-color: #d4b483;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(155, 135, 110, 0.2);
}

/* 当前选择页面 - 更深的效果 */
.pagination-container /deep/ .el-pagination.is-background .el-pager li.active {
  background: #8b7355;
  border-color: #3c2c1e !important;
  color: white !important;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(91, 70, 54, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 当前选择页面悬停效果 */
.pagination-container /deep/ .el-pagination.is-background .el-pager li.active:hover {
  background: #554d39 !important;
  border-color: #4e3e31 !important;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(91, 70, 54, 0.5);
}



/* 每页显示条数选择器 */
.pagination-container /deep/ .el-pagination__sizes .el-input .el-input__inner {
  border: 1px solid #e8d4b8;
  color: #5b4636;
  background: #f9f4ee;

}

.pagination-container /deep/ .el-pagination__sizes .el-input .el-input__inner:focus {
  border-color: #d4b483;
}

/* 分页总条数文字样式 */
.pagination-container /deep/ .el-pagination__total {
  color: #8b7355;

}

/* 分页跳转文字样式 */
.pagination-container /deep/ .el-pagination__jump {
  color: #8b7355;
}

/* 笔记详情样式 */
.note-detail {
  line-height: 1.6;
}

.detail-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

.note-book-info {
  color: #9b7b3a;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.note-book-info i {
  margin-right: 5px;
}

.detail-meta {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  color: #909399;
}

.meta-item {
  margin-right: 20px;
}

.meta-item i {
  margin-right: 5px;
}

.detail-content h3 {
  color: #303133;
  margin-bottom: 10px;
}

.content-text {
  color: #606266;
  line-height: 1.8;
  white-space: pre-line;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

/* 删除确认样式 */
.delete-confirm p {
  margin: 10px 0;
  color: #606266;
}

.warning-text {
  color: #f56c6c;
  font-weight: bold;
}

/* 表单提示 */
.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
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

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-stats {
    margin-top: 20px;
    width: 100%;
    justify-content: space-between;
  }

  .stat-item {
    min-width: auto;
    flex: 1;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }
}
</style>