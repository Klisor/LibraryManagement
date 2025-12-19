<template>
  <div class="user-management">
    <el-container style="height: 100vh;">
      <!-- 侧边栏（复用借阅管理的侧边栏） -->
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
          <div class="user-container">
            <!-- 搜索和操作栏 -->
            <div class="toolbar">
              <div class="search-box">
                <el-input
                  v-model="searchForm.username"
                  placeholder="搜索用户名"
                  style="width: 200px; margin-right: 10px;"
                  @keyup.enter.native="handleSearch"
                >
                  <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
                </el-input>
                
                <el-input
                  v-model="searchForm.email"
                  placeholder="搜索邮箱"
                  style="width: 200px; margin-right: 10px;"
                  @keyup.enter.native="handleSearch"
                >
                  <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
                </el-input>
                
                <el-select
                  v-model="searchForm.role"
                  placeholder="角色筛选"
                  clearable
                  style="width: 120px; margin-right: 10px;"
                  @change="handleSearch"
                >
                  <el-option label="普通用户" value="USER"></el-option>
                  <el-option label="管理员" value="ADMIN"></el-option>
                </el-select>
                
                <el-button @click="resetSearch">重置</el-button>
              </div>
              
              <div class="action-buttons">
                <el-button type="primary" icon="el-icon-plus" @click="handleAddUser">
                  添加用户
                </el-button>
              </div>
            </div>
            
            <!-- 用户列表表格 -->
            <el-table
              :data="userList"
              border
              stripe
              style="width: 100%; margin-top: 20px;"
              v-loading="loading"
            >
              <el-table-column prop="id" label="ID" width="80"></el-table-column>
              <el-table-column prop="username" label="用户名" width="150"></el-table-column>
              <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
              <el-table-column prop="role" label="角色" width="100">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.role === 'ADMIN' ? 'danger' : 'primary'" size="small">
                    {{ scope.row.role === 'ADMIN' ? '管理员' : '普通用户' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="borrowedCount" label="已借数量" width="100">
                <template slot-scope="scope">
                  <span :class="{ 'warning': scope.row.borrowedCount >= scope.row.maxBorrowCount }">
                    {{ scope.row.borrowedCount }}/{{ scope.row.maxBorrowCount }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="注册时间" width="180">
                <template slot-scope="scope">
                  {{ formatDate(scope.row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="primary"
                    @click="handleViewDetail(scope.row)"
                  >
                    详情
                  </el-button>
                  <el-button
                    size="mini"
                    type="warning"
                    @click="handleEditUser(scope.row)"
                  >
                    编辑
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handlePageChange"
                :current-page="pagination.page"
                :page-sizes="[10, 20, 50]"
                :page-size="pagination.size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="pagination.total"
                :background="true"
              >
              </el-pagination>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 用户详情对话框 -->
    <el-dialog
      title="用户详情"
      :visible.sync="detailDialogVisible"
      width="700px"
    >
      <div v-if="selectedUser" class="user-detail">
        <el-tabs v-model="detailActiveTab">
          <el-tab-pane label="基本信息" name="info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户ID">{{ selectedUser.id }}</el-descriptions-item>
              <el-descriptions-item label="用户名">{{ selectedUser.username }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ selectedUser.email }}</el-descriptions-item>
              <el-descriptions-item label="角色">
                <el-tag :type="selectedUser.role === 'ADMIN' ? 'danger' : 'primary'" size="small">
                  {{ selectedUser.role === 'ADMIN' ? '管理员' : '普通用户' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="最大借阅数">{{ selectedUser.maxBorrowCount }} 本</el-descriptions-item>
              <el-descriptions-item label="当前借阅数">{{ selectedUser.borrowedCount }} 本</el-descriptions-item>
              <el-descriptions-item label="注册时间">{{ formatDate(selectedUser.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ formatDate(selectedUser.updatedAt) }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          
          <el-tab-pane label="借阅记录" name="borrow">
            <div v-if="selectedUser.borrowRecords && selectedUser.borrowRecords.length > 0">
              <el-table
                :data="selectedUser.borrowRecords"
                border
                stripe
                style="width: 100%;"
                size="small"
              >
                <el-table-column prop="bookTitle" label="图书名称" min-width="150"></el-table-column>
                <el-table-column prop="borrowDate" label="借阅日期" width="120">
                  <template slot-scope="scope">
                    {{ formatDate(scope.row.borrowDate) }}
                  </template>
                </el-table-column>
                <el-table-column prop="dueDate" label="应还日期" width="120">
                  <template slot-scope="scope">
                    {{ formatDate(scope.row.dueDate) }}
                  </template>
                </el-table-column>
                <el-table-column prop="returnDate" label="归还日期" width="120">
                  <template slot-scope="scope">
                    {{ scope.row.returnDate ? formatDate(scope.row.returnDate) : '未归还' }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                  <template slot-scope="scope">
                    <el-tag :type="getStatusTagType(scope.row.status)" size="mini">
                      {{ getStatusText(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-else class="empty-data">
              <el-empty description="暂无借阅记录"></el-empty>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
    
    <!-- 编辑用户对话框 -->
    <el-dialog
      :title="editDialogTitle"
      :visible.sync="editDialogVisible"
      width="500px"
      @close="handleEditDialogClose"
    >
      <el-form 
        :model="editForm" 
        :rules="editRules" 
        ref="editFormRef" 
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="editForm.username" 
            placeholder="请输入用户名"
            :disabled="isEditMode"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="editForm.email" 
            placeholder="请输入邮箱"
          ></el-input>
        </el-form-item>
        
        <el-form-item v-if="!isEditMode" label="密码" prop="password">
          <el-input 
            v-model="editForm.password" 
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="请选择角色">
            <el-option label="普通用户" value="USER"></el-option>
            <el-option label="管理员" value="ADMIN"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="最大借阅数" prop="maxBorrowCount">
        <el-input-number
            v-model="editForm.maxBorrowCount"
            :min="selectedUser ? selectedUser.borrowedCount : 0"
            :max="50"
            controls-position="right"
        ></el-input-number>
        <span class="form-tip">
            {{ editForm.role === 'ADMIN' ? '管理员默认10本' : '普通用户默认5本' }}
            (当前借阅数：{{ selectedUser ? selectedUser.borrowedCount : 0 }})
        </span>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm" :loading="editing">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { userApi } from '@/api/user'

export default {
  name: 'UserManagement',
  data() {
    return {
      // 用户信息
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      
      // 搜索表单
      searchForm: {
        username: '',
        email: '',
        role: ''
      },
      
      // 用户列表数据
      userList: [],
      loading: false,
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      
      // 详情对话框
      detailDialogVisible: false,
      selectedUser: null,
      detailActiveTab: 'info',
      
      // 编辑/添加对话框
      editDialogVisible: false,
      isEditMode: false, // true为编辑模式，false为添加模式
      editDialogTitle: '编辑用户',
      editForm: {
        id: '',
        username: '',
        email: '',
        password: '',
        role: 'USER',
        maxBorrowCount: 5
      },
      editRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        maxBorrowCount: [
          { required: true, message: '请输入最大借阅数量', trigger: 'blur' },
          { type: 'number', min: 1, message: '最大借阅数量必须大于0', trigger: 'blur' }
        ]
      },
      editing: false
    }
  },
  watch: {
    'editForm.role': {
        handler(newRole, oldRole) {
        if (newRole !== oldRole) {
            this.adjustMaxBorrowCountByRole(newRole)
        }
        },
        immediate: false
    }
    },
  mounted() {
    // 检查权限
    if (!this.user.id || this.user.role !== 'ADMIN') {
      this.$router.push('/admin/login')
      return
    }
    
    // 加载用户列表
    this.loadUsers()
  },
  methods: {
    adjustMaxBorrowCountByRole(newRole) {
        if (!newRole) return
        
        // 获取当前借阅数
        const currentBorrowed = this.selectedUser ? this.selectedUser.borrowedCount : 0
        
        // 根据角色设置默认最大借阅数
        if (newRole === 'ADMIN') {
            // 管理员默认10本，但不能小于当前借阅数
            const defaultMax = Math.max(10, currentBorrowed)
            if (this.editForm.maxBorrowCount < defaultMax) {
            this.editForm.maxBorrowCount = defaultMax
            }
        } else {
            // 普通用户默认5本，但不能小于当前借阅数
            const defaultMax = Math.max(5, currentBorrowed)
            if (this.editForm.maxBorrowCount < defaultMax) {
            this.editForm.maxBorrowCount = defaultMax
            }
        }
    },
    // 加载用户列表
    async loadUsers() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          size: this.pagination.size,
          ...this.searchForm
        }
        
        const res = await userApi.getUsers(params)
        
        if (res.code === 200) {
          this.userList = res.data.list
          this.pagination.total = res.data.total
        } else {
          this.$message.error(res.message)
        }
      } catch (error) {
        console.error('加载用户列表失败:', error)
        this.$message.error('加载失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    
    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.loadUsers()
    },
    
    // 重置搜索
    resetSearch() {
      this.searchForm = {
        username: '',
        email: '',
        role: ''
      }
      this.pagination.page = 1
      this.loadUsers()
    },
    
    // 分页
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.page = 1
      this.loadUsers()
    },
    
    handlePageChange(page) {
      this.pagination.page = page
      this.loadUsers()
    },
    
    // 查看用户详情
    async handleViewDetail(user) {
      try {
        const res = await userApi.getUserDetail(user.id)
        
        if (res.code === 200) {
          this.selectedUser = res.data
          this.detailActiveTab = 'info'
          this.detailDialogVisible = true
        } else {
          this.$message.error(res.message)
        }
      } catch (error) {
        console.error('获取用户详情失败:', error)
        this.$message.error('获取详情失败，请稍后重试')
      }
    },
    
    // 编辑用户
    handleEditUser(user) {
    this.isEditMode = true
    this.editDialogTitle = '编辑用户'
    
    // 填充表单数据
    this.editForm = {
        id: user.id,
        username: user.username,
        email: user.email,
        password: '', // 编辑时不显示密码
        role: user.role,
        maxBorrowCount: user.maxBorrowCount
    }
    
    this.selectedUser = user
    this.editDialogVisible = true
    
    // 确保表单显示正确的最大借阅数提示
    console.log('编辑用户:', user.username, '角色:', user.role, '最大借阅数:', user.maxBorrowCount)
    },
    
    // 添加用户
    handleAddUser() {
    this.isEditMode = false
    this.editDialogTitle = '添加用户'
    this.selectedUser = null
    
    // 重置表单，根据角色设置默认最大借阅数
    this.editForm = {
        id: '',
        username: '',
        email: '',
        password: '',
        role: 'USER',
        maxBorrowCount: 5  // 普通用户默认5本
    }
    
    this.editDialogVisible = true
    },
    
    // 编辑对话框关闭
    handleEditDialogClose() {
      if (this.$refs.editFormRef) {
        this.$refs.editFormRef.clearValidate()
      }
    },
    
    // 提交编辑/添加表单
    submitEditForm() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        
        this.editing = true
        
        try {
          if (this.isEditMode) {
            // 编辑用户
            const updateData = {
              email: this.editForm.email,
              role: this.editForm.role,
              maxBorrowCount: this.editForm.maxBorrowCount
            }
            
            const res = await userApi.updateUser(this.editForm.id, updateData)
            
            if (res.code === 200) {
              this.$message.success('用户更新成功')
              this.editDialogVisible = false
              this.loadUsers() // 刷新列表
            } else {
              this.$message.error(res.message)
            }
          } else {
            // 添加用户
            const addData = {
              username: this.editForm.username,
              email: this.editForm.email,
              password: this.editForm.password,
              role: this.editForm.role
            }
            
            const res = await userApi.addUser(addData)
            
            if (res.code === 200) {
              this.$message.success('用户添加成功')
              this.editDialogVisible = false
              this.loadUsers() // 刷新列表
            } else {
              this.$message.error(res.message)
            }
          }
        } catch (error) {
          console.error('操作失败:', error)
          this.$message.error('操作失败，请稍后重试')
        } finally {
          this.editing = false
        }
      })
    },
    
    // 工具函数
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
.user-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

/* 已借数量警告样式 */
.warning {
  color: #f56c6c;
  font-weight: bold;
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
.user-detail {
  line-height: 1.8;
}

.empty-data {
  padding: 40px 0;
  text-align: center;
}

/* 表单提示 */
.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
</style>