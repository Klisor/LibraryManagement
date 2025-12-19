<template>
  <div class="personal-center">
    <!-- 顶部导航栏 -->
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
      <!-- 个人信息卡片 -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <el-avatar :size="80" class="user-avatar">
              {{ user.username.charAt(0) }}
            </el-avatar>
            <div class="user-basic">
              <h2>{{ user.username }}</h2>
              <p class="user-email">{{ user.email }}</p>
              <el-tag :type="user.role === 'ADMIN' ? 'danger' : 'primary'" size="small">
                {{ user.role === 'ADMIN' ? '管理员' : '普通用户' }}
              </el-tag>
            </div>
          </div>
          
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-label">当前借阅</div>
              <div class="stat-value">{{ user.borrowedCount || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">最大借阅</div>
              <div class="stat-value">{{ user.maxBorrowCount || 5 }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">可用额度</div>
              <div class="stat-value available">
                {{ (user.maxBorrowCount || 5) - (user.borrowedCount || 0) }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">笔记数量</div>
              <div class="stat-value">{{ noteStats.total }}</div>
            </div>
          </div>
        </div>
        
        <div class="profile-actions">
          <el-button type="primary" icon="el-icon-edit" @click="showEditProfile">
            编辑资料
          </el-button>
        </div>
      </div>

      <!-- 笔记管理区域 -->
      <div class="notes-section">
        <div class="section-header">
          <h3>📝 我的笔记</h3>
          <div class="section-actions">
            <el-button type="primary" icon="el-icon-plus" @click="showCreateNote">
              新建笔记
            </el-button>
          </div>
        </div>
        
        <!-- 笔记筛选 -->
        <div class="notes-filter">
          <el-input
            v-model="noteFilter.keyword"
            placeholder="搜索笔记标题或内容"
            style="width: 300px; margin-right: 10px;"
            @keyup.enter.native="loadNotes"
          >
            <el-button slot="append" icon="el-icon-search" @click="loadNotes"></el-button>
          </el-input>
          
          <el-select
            v-model="noteFilter.bookId"
            placeholder="关联书籍筛选"
            clearable
            filterable
            style="width: 200px; margin-right: 10px;"
            @change="loadNotes"
          >
            <el-option label="全部笔记" value=""></el-option>
            <el-option label="未关联书籍" :value="0"></el-option>
            <el-option
              v-for="book in userBooks"
              :key="book.id"
              :label="book.title"
              :value="book.id"
            ></el-option>
          </el-select>
          
          <el-button @click="resetNoteFilter">重置</el-button>
        </div>
        
        <!-- 笔记列表 -->
        <div class="notes-list">
          <div v-if="notesLoading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          
          <div v-else-if="notes.length === 0" class="empty-container">
            <el-empty description="暂无笔记">
              <el-button type="primary" @click="showCreateNote">创建第一篇笔记</el-button>
            </el-empty>
          </div>
          
          <div v-else class="notes-grid">
            <div
              v-for="note in notes"
              :key="note.id"
              class="note-card"
              @click="viewNoteDetail(note)"
            >
              <div class="note-header">
                <h4 class="note-title">{{ note.title }}</h4>
                <div class="note-actions">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-edit"
                    @click.stop="editNote(note)"
                  ></el-button>
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-delete"
                    @click.stop="deleteNote(note)"
                  ></el-button>
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
            <el-pagination
              @size-change="handleNotesSizeChange"
              @current-change="handleNotesPageChange"
              :current-page="notesPagination.page"
              :page-sizes="[12, 24, 48]"
              :page-size="notesPagination.size"
              layout="total, sizes, prev, pager, next, jumper"
              :total="noteStats.total"
              :background="true"
            >
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 编辑资料对话框 -->
    <el-dialog
      title="编辑资料"
      :visible.sync="editProfileDialogVisible"
      width="500px"
    >
      <el-form 
        :model="profileForm" 
        :rules="profileRules" 
        ref="profileFormRef" 
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="user.username" disabled></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="profileForm.email" 
            placeholder="请输入邮箱"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="当前借阅">
          <el-input-number
            v-model="user.borrowedCount"
            disabled
            controls-position="right"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="最大借阅" prop="maxBorrowCount">
          <el-input-number
            v-model="profileForm.maxBorrowCount"
            :min="user.borrowedCount || 0"
            :max="user.role === 'ADMIN' ? 50 : 20"
            controls-position="right"
          ></el-input-number>
          <span class="form-tip">{{ user.role === 'ADMIN' ? '管理员' : '普通用户' }}最多可借{{ user.role === 'ADMIN' ? 50 : 20 }}本</span>
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
    <el-dialog
      :title="noteDialogTitle"
      :visible.sync="noteDialogVisible"
      width="700px"
      @close="handleNoteDialogClose"
    >
      <el-form 
        :model="noteForm" 
        :rules="noteRules" 
        ref="noteFormRef" 
        label-width="100px"
        v-loading="noteFormLoading"
      >
        <el-form-item label="笔记标题" prop="title">
          <el-input 
            v-model="noteForm.title" 
            placeholder="请输入笔记标题"
            maxlength="200"
            show-word-limit
          ></el-input>
        </el-form-item>
        
        <el-form-item label="关联书籍" prop="bookId">
          <el-select
            v-model="noteForm.bookId"
            placeholder="选择关联书籍（可选）"
            clearable
            filterable
            style="width: 100%;"
          >
            <el-option label="不关联书籍" :value="null"></el-option>
            <el-option
              v-for="book in availableBooks"
              :key="book.id"
              :label="`${book.title} - ${book.author}`"
              :value="book.id"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="笔记内容" prop="content">
          <el-input
            v-model="noteForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入笔记内容..."
            resize="vertical"
          ></el-input>
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
        <el-button 
          type="primary" 
          @click="submitNoteForm" 
          :loading="noteFormSubmitting"
        >
          {{ isEditNoteMode ? '保存修改' : '创建笔记' }}
        </el-button>
      </div>
    </el-dialog>
    
    <!-- 笔记详情对话框（只读模式） -->
    <el-dialog
      title="笔记详情"
      :visible.sync="noteDetailDialogVisible"
      width="700px"
    >
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
    <el-dialog
      title="删除确认"
      :visible.sync="deleteDialogVisible"
      width="400px"
    >
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
import { noteApi } from '@/api/note'
import { bookApi } from '@/api/book'
import { userApi } from '@/api/user'
import { BOOK_CATEGORIES } from '@/constants/bookCategories'

export default {
  name: 'Personal',
  data() {
    return {
      // 用户信息
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      
      // 个人信息编辑
      editProfileDialogVisible: false,
      profileForm: {
        email: '',
        maxBorrowCount: 5
      },
      profileRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        maxBorrowCount: [
          { required: true, message: '请输入最大借阅数量', trigger: 'blur' },
          { type: 'number', min: 1, message: '最大借阅数量必须大于0', trigger: 'blur' }
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
        keyword: '',
        bookId: ''
      },
      
      // 用户借阅过的书籍（用于筛选）
      userBooks: [],
      
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
      availableBooks: []
    }
  },
  computed: {
    // 当前用户可借阅的书籍
    userMaxBorrow() {
      return this.user.role === 'ADMIN' ? 50 : 20
    }
  },
  mounted() {
    // 检查用户是否登录
    if (!this.user.id || this.user.role !== 'USER') {
      this.$router.push('/user/login')
      return
    }
    
    // 加载数据
    this.loadUserInfo()
    this.loadNotes()
    this.loadUserBooks()
    this.loadAvailableBooks()
  },
  methods: {
    // 加载用户信息
    async loadUserInfo() {
      try {
        const res = await userApi.getUserDetail(this.user.id)
        if (res.code === 200) {
          this.user = res.data
          // 更新localStorage中的用户信息
          localStorage.setItem('user', JSON.stringify(this.user))
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    },
    
    // 加载笔记列表
    async loadNotes() {
      this.notesLoading = true
      try {
        const params = {
          page: this.notesPagination.page,
          size: this.notesPagination.size,
          ...this.noteFilter
        }
        
        // 处理未关联书籍的筛选（bookId为0）
        if (params.bookId === 0) {
          params.bookId = ''
        }
        
        const res = await noteApi.getNotes(params)
        
        if (res.code === 200) {
          this.notes = res.data.list
          this.noteStats.total = res.data.total
        } else {
          this.$message.error(res.message)
        }
      } catch (error) {
        console.error('加载笔记列表失败:', error)
        this.$message.error('加载失败，请稍后重试')
      } finally {
        this.notesLoading = false
      }
    },
    
    // 加载用户借阅过的书籍（用于筛选）
    async loadUserBooks() {
      try {
        // 这里可以调用API获取用户借阅过的书籍
        // 暂时使用所有书籍的前10本作为示例
        const res = await bookApi.getBooks({ page: 1, size: 10 })
        if (res.code === 200) {
          this.userBooks = res.data.list
        }
      } catch (error) {
        console.error('加载用户书籍失败:', error)
      }
    },
    
    // 加载所有可用书籍（用于关联选择）
    async loadAvailableBooks() {
      try {
        const res = await bookApi.getBooks({ page: 1, size: 50 })
        if (res.code === 200) {
          this.availableBooks = res.data.list
        }
      } catch (error) {
        console.error('加载可用书籍失败:', error)
      }
    },
    
    // 重置笔记筛选
    resetNoteFilter() {
      this.noteFilter = {
        keyword: '',
        bookId: ''
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
      this.profileForm = {
        email: this.user.email,
        maxBorrowCount: this.user.maxBorrowCount || 5
      }
      this.editProfileDialogVisible = true
    },
    
    // 更新个人资料
    async updateProfile() {
      this.$refs.profileFormRef.validate(async (valid) => {
        if (!valid) return
        
        this.updatingProfile = true
        
        try {
          const updateData = {
            email: this.profileForm.email,
            maxBorrowCount: this.profileForm.maxBorrowCount
          }
          
          const res = await userApi.updateUser(this.user.id, updateData)
          
          if (res.code === 200) {
            this.$message.success('资料更新成功')
            this.editProfileDialogVisible = false
            
            // 重新加载用户信息
            this.loadUserInfo()
          } else {
            this.$message.error(res.message)
          }
        } catch (error) {
          console.error('更新资料失败:', error)
          this.$message.error('更新失败，请稍后重试')
        } finally {
          this.updatingProfile = false
        }
      })
    },
    
    // 显示创建笔记对话框
    showCreateNote() {
      this.isEditNoteMode = false
      this.noteDialogTitle = '新建笔记'
      this.selectedNote = null
      
      // 重置表单
      this.noteForm = {
        id: '',
        title: '',
        content: '',
        bookId: null
      }
      
      this.noteDialogVisible = true
    },
    
    // 查看笔记详情
    async viewNoteDetail(note) {
      this.noteFormLoading = true
      try {
        const res = await noteApi.getNoteDetail(note.id)
        
        if (res.code === 200) {
          this.selectedNote = res.data
          this.noteDetailDialogVisible = true
        } else {
          this.$message.error(res.message)
        }
      } catch (error) {
        console.error('获取笔记详情失败:', error)
        this.$message.error('获取详情失败，请稍后重试')
      } finally {
        this.noteFormLoading = false
      }
    },
    
    // 编辑笔记
    editNote(note) {
      this.isEditNoteMode = true
      this.noteDialogTitle = '编辑笔记'
      this.selectedNote = note
      
      // 填充表单数据
      this.noteForm = {
        id: note.id,
        title: note.title,
        content: note.content,
        bookId: note.bookId
      }
      
      this.noteDetailDialogVisible = false
      this.noteDialogVisible = true
    },
    
    // 笔记对话框关闭
    handleNoteDialogClose() {
      if (this.$refs.noteFormRef) {
        this.$refs.noteFormRef.clearValidate()
      }
    },
    
    // 提交笔记表单（创建或更新）
    submitNoteForm() {
      this.$refs.noteFormRef.validate(async (valid) => {
        if (!valid) return
        
        this.noteFormSubmitting = true
        
        try {
          if (this.isEditNoteMode) {
            // 更新笔记
            const updateData = {
              title: this.noteForm.title,
              content: this.noteForm.content,
              bookId: this.noteForm.bookId
            }
            
            const res = await noteApi.updateNote(this.noteForm.id, updateData)
            
            if (res.code === 200) {
              this.$message.success('笔记更新成功')
              this.noteDialogVisible = false
              this.loadNotes() // 刷新列表
            } else {
              this.$message.error(res.message)
            }
          } else {
            // 创建笔记
            const createData = {
              title: this.noteForm.title,
              content: this.noteForm.content,
              bookId: this.noteForm.bookId
            }
            
            const res = await noteApi.createNote(createData)
            
            if (res.code === 200) {
              this.$message.success('笔记创建成功')
              this.noteDialogVisible = false
              this.loadNotes() // 刷新列表
            } else {
              this.$message.error(res.message)
            }
          }
        } catch (error) {
          console.error('操作失败:', error)
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
        const res = await noteApi.deleteNote(this.noteToDelete.id)
        
        if (res.code === 200) {
          this.$message.success('笔记删除成功')
          this.deleteDialogVisible = false
          this.loadNotes() // 刷新列表
        } else {
          this.$message.error(res.message)
        }
      } catch (error) {
        console.error('删除笔记失败:', error)
        this.$message.error('删除失败，请稍后重试')
      } finally {
        this.deletingNote = false
        this.noteToDelete = null
      }
    },
    
    // 工具函数
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    
    getContentPreview(content) {
      if (!content) return '无内容'
      const preview = content.substring(0, 100)
      return preview.length < content.length ? preview + '...' : preview
    },
    
    getCategoryName(categoryCode) {
      return BOOK_CATEGORIES[categoryCode] || '未知分类'
    },
    
    // 跳转到个人中心（已在当前页面）
    goToPersonal() {
      // 已经在个人中心页面
    },
    
    // 退出登录
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/user/login')
    }
  }
}
</script>

<style scoped>
.personal-center {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏样式 */
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

/* 个人信息卡片 */
.profile-card {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  margin-right: 20px;
  background-color: #409eff;
  font-size: 32px;
  font-weight: bold;
}

.user-basic h2 {
  margin: 0 0 5px 0;
  color: #303133;
}

.user-email {
  margin: 0 0 10px 0;
  color: #909399;
}

.profile-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
  min-width: 100px;
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

.stat-value.available {
  color: #67c23a;
}

.profile-actions {
  text-align: right;
}

/* 笔记管理区域 */
.notes-section {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #303133;
  font-size: 20px;
}

.notes-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
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
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
  transition: all 0.3s;
  cursor: pointer;
}

.note-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
  color: #303133;
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
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
  height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
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

/* 笔记详情样式 */
.note-detail {
  line-height: 1.6;
}

.detail-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

.note-book-info {
  color: #409eff;
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