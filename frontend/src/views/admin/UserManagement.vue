<template>
  <div class="user-management">
    <el-container style="height: 100vh;">
      <!-- 侧边栏（复用BookManagement的侧边栏） -->
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
          <div class="user-container">
            <!-- 页面标题和添加按钮 - 与BookManagement完全一致 -->
            <div class="page-header">
              <h2>用户管理</h2>
              <el-button type="primary" icon="el-icon-plus" @click="handleAddUser" class="add-user-btn">
                添加用户
              </el-button>
            </div>

            <!-- 搜索和筛选区域 - 与BookManagement完全一致 -->
            <div class="search-bar ancient-section">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="6">
                  <el-input v-model="searchForm.username" placeholder="按用户名搜索" prefix-icon="el-icon-search" clearable
                    @clear="handleSearch" @keyup.enter.native="handleSearch" class="ancient-input"></el-input>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                  <el-input v-model="searchForm.email" placeholder="按邮箱搜索" prefix-icon="el-icon-user" clearable
                    @clear="handleSearch" @keyup.enter.native="handleSearch" class="ancient-input"></el-input>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                  <el-select v-model="searchForm.role" placeholder="角色筛选" clearable style="width: 100%"
                    @change="handleSearch" class="ancient-select">
                    <el-option label="普通用户" value="USER"></el-option>
                    <el-option label="管理员" value="ADMIN"></el-option>
                  </el-select>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6" class="button-group">
                  <el-button @click="handleSearch" class="search-btn">搜索</el-button>
                  <el-button @click="resetSearch" class="reset-btn">重置</el-button>
                </el-col>
              </el-row>
            </div>

            <!-- 用户列表表格 -->
            <div class="table-container">
              <el-table :data="paginatedUsers" border stripe style="width: 100%; margin-top: 20px;" v-loading="loading"
                @sort-change="handleSortChange" class="ancient-table">
                <el-table-column prop="id" label="ID" width="80" align="center" sortable
                  :sort-orders="['ascending', 'descending']"></el-table-column>
                <el-table-column prop="username" label="用户名" min-width="150" sortable
                  :sort-orders="['ascending', 'descending']"></el-table-column>
                <el-table-column prop="email" label="邮箱" min-width="200" sortable
                  :sort-orders="['ascending', 'descending']"></el-table-column>
                <el-table-column prop="role" label="角色" width="120" align="center">
                  <template slot-scope="scope">
                    <div class="role-tag"
                      :class="{ 'admin-role': scope.row.role === 'ADMIN', 'user-role': scope.row.role === 'USER' }">
                      {{ scope.row.role === 'ADMIN' ? '管理员' : '普通用户' }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="借阅状态" width="140" align="center">
                  <template slot-scope="scope">
                    <div class="borrow-status">
                      <span :class="{ 'warning': scope.row.borrowedCount >= scope.row.maxBorrowCount }">
                        {{ scope.row.borrowedCount }}/{{ scope.row.maxBorrowCount }}
                      </span>
                      <el-progress :percentage="getBorrowPercentage(scope.row)" :stroke-width="10"
                        :color="scope.row.borrowedCount >= scope.row.maxBorrowCount ? '#f56c6c' : '#67c23a'"
                        style="margin-top: 5px;"></el-progress>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="注册时间" width="180" sortable
                  :sort-orders="['ascending', 'descending']">
                  <template slot-scope="scope">
                    {{ formatDate(scope.row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="280" fixed="right" align="center">
                  <template slot-scope="scope">
                    <div class="action-buttons-container">
                      <el-button size="small" type="primary" @click="handleViewDetail(scope.row)"
                        class="action-btn detail-btn">
                        详情
                      </el-button>
                      <el-button size="small" type="warning" @click="handleEditUser(scope.row)"
                        class="action-btn edit-btn">
                        编辑
                      </el-button>
                      <el-button size="small" type="danger" @click="handleDeleteUser(scope.row)"
                        class="action-btn delete-btn">
                        删除
                      
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 分页组件 -->
            <div class="pagination">
              <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="pagination.page" :page-sizes="[10, 20, 50, 100]" :page-size="pagination.size"
                layout="total, sizes, prev, pager, next, jumper" :total="filteredUsers.length" :background="true"
                class="ancient-pagination">
              </el-pagination>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>

    <!-- 用户详情对话框 -->
    <el-dialog title="用户详情" :visible.sync="detailDialogVisible" width="700px" class="ancient-dialog">
      <div v-if="selectedUser" class="user-detail">
        <el-tabs v-model="detailActiveTab" class="ancient-tabs">
          <el-tab-pane label="基本信息" name="info">
            <el-descriptions :column="2" border class="ancient-descriptions">
              <el-descriptions-item label="用户ID">{{ selectedUser.id }}</el-descriptions-item>
              <el-descriptions-item label="用户名">{{ selectedUser.username }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ selectedUser.email }}</el-descriptions-item>
              <el-descriptions-item label="角色">
                <div class="role-tag"
                  :class="{ 'admin-role': selectedUser.role === 'ADMIN', 'user-role': selectedUser.role === 'USER' }">
                  {{ selectedUser.role === 'ADMIN' ? '管理员' : '普通用户' }}
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="最大借阅数">{{ selectedUser.maxBorrowCount }} 本</el-descriptions-item>
              <el-descriptions-item label="当前借阅数">{{ selectedUser.borrowedCount }} 本</el-descriptions-item>
              <el-descriptions-item label="注册时间">{{ formatDate(selectedUser.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ formatDate(selectedUser.updatedAt) }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane label="借阅记录" name="borrow">
            <div v-if="selectedUser.borrowRecords && selectedUser.borrowRecords.length > 0">
              <el-table :data="selectedUser.borrowRecords" border stripe style="width: 100%;" size="small"
                class="ancient-table">
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
                    <el-tag :type="getStatusTagType(scope.row.status)" size="mini" class="ancient-tag">
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
      <div slot="footer" class="dialog-footer ancient-dialog-footer">
        <el-button @click="detailDialogVisible = false" class="cancel-btn">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog :title="editDialogTitle" :visible.sync="editDialogVisible" width="500px" @close="handleEditDialogClose"
      class="ancient-dialog">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px" class="ancient-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" :disabled="isEditMode"
            class="ancient-input"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" class="ancient-input"></el-input>
        </el-form-item>

        <el-form-item  label="密码" prop="password">
          <el-input v-model="editForm.password" type="password" placeholder="请输入密码" class="ancient-input"></el-input>
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="请选择角色" class="ancient-select" style="width: 100%;">
            <el-option label="普通用户" value="USER"></el-option>
            <el-option v-if="!isEditMode" label="管理员" value="ADMIN"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="最大借阅数" prop="maxBorrowCount">
          <el-input-number v-model="editForm.maxBorrowCount" :min="selectedUser ? selectedUser.borrowedCount : 0"
            :max="getMaxBorrowLimitByRole(editForm.role)" controls-position="right"
            class="ancient-input-number"></el-input-number>
          <span class="form-tip">
            {{ editForm.role === 'ADMIN' ? '管理员最多可借50本' : '普通用户最多可借20本' }}
            (当前借阅数：{{ selectedUser ? selectedUser.borrowedCount : 0 }})
          </span>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer ancient-dialog-footer">
        <el-button @click="editDialogVisible = false" class="cancel-btn">取消</el-button>
        <el-button type="primary" @click="submitEditForm" :loading="editing" class="confirm-btn">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { userApi } from '@/api/user'
import { borrowApi } from '@/api/borrow'

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

      // 排序
      sortField: '',
      sortOrder: '',

      // 用户列表数据
      userList: [],
      loading: false,
      allUsers: [],

      // 分页
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
      isEditMode: false,
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
          { min: 1, max: 20, message: '用户名长度在1-20个字符之间', trigger: 'blur' }
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
          {
            type: 'number',
            min: 1,
            message: '最大借阅数量必须大于0',
            trigger: 'blur'
          },
          {
            validator: (rule, value, callback) => {
              if (this.editForm.role === 'ADMIN') {
                if (value > 50) {
                  callback(new Error('管理员最大借阅数不能超过50本'))
                } else {
                  callback()
                }
              } else {
                if (value > 20) {
                  callback(new Error('普通用户最大借阅数不能超过20本'))
                } else {
                  callback()
                }
              }
            },
            trigger: 'blur'
          }
        ]
      },
      editing: false
    }
  },
  computed: {
    // 过滤后的用户数据
    filteredUsers() {
      let result = [...this.allUsers]

      // 应用搜索过滤
      if (this.searchForm.username) {
        result = result.filter(user =>
          user.username.toLowerCase().includes(this.searchForm.username.toLowerCase())
        )
      }

      if (this.searchForm.email) {
        result = result.filter(user =>
          user.email.toLowerCase().includes(this.searchForm.email.toLowerCase())
        )
      }

      if (this.searchForm.role) {
        result = result.filter(user => user.role === this.searchForm.role)
      }

      // 应用排序
      if (this.sortField && this.sortOrder) {
        result.sort((a, b) => {
          let aValue = a[this.sortField]
          let bValue = b[this.sortField]

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          if (this.sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
          }
        })
      }

      return result
    },

    // 当前页的数据
    paginatedUsers() {
      const start = (this.pagination.page - 1) * this.pagination.size
      const end = start + this.pagination.size
      return this.filteredUsers.slice(start, end)
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
    // 下拉菜单命令处理
    handleCommand(command) {
      if (command === 'logout') {
        this.logout()
      } else if (command === 'profile') {
        this.$message.info('管理员个人资料功能开发中')
      }
    },

    // 获取角色对应的最大借阅限制
    getMaxBorrowLimitByRole(role) {
      return role === 'ADMIN' ? 50 : 20;
    },

    // 获取借阅百分比
    getBorrowPercentage(user) {
      const percentage = (user.borrowedCount / user.maxBorrowCount) * 100
      return Math.round(Math.min(percentage, 100))
    },

    adjustMaxBorrowCountByRole(newRole) {
      if (!newRole) return

      const currentBorrowed = this.selectedUser ? this.selectedUser.borrowedCount : 0
      const maxLimit = this.getMaxBorrowLimitByRole(newRole)

      if (newRole === 'ADMIN') {
        const defaultMax = Math.max(10, currentBorrowed)
        this.editForm.maxBorrowCount = Math.min(defaultMax, maxLimit)
      } else {
        const defaultMax = Math.max(5, currentBorrowed)
        this.editForm.maxBorrowCount = Math.min(defaultMax, maxLimit)
      }
    },

    // 加载用户列表
    async loadUsers() {
      this.loading = true
      try {
        // 获取所有用户数据用于前端筛选
        const params = {
          size: 1000,
          ...this.searchForm
        }
        var res = await userApi.getUsers(params)
        res = res.data
        console.log(res)
        if (res.code === 200) {
          this.allUsers = res.data
          this.pagination.total = res.data.length

          if (this.pagination.page > Math.ceil(res.data.total / this.pagination.size)) {
            this.pagination.page = 1
          }
        } else {
          this.$message.error(res.message)
          this.allUsers = []
          this.pagination.total = 0
        }
      } catch (error) {
        console.error('加载用户列表失败:', error)
        this.$message.error('加载失败，请稍后重试')
        this.allUsers = []
        this.pagination.total = 0
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
      this.sortField = ''
      this.sortOrder = ''
      this.pagination.page = 1
      this.loadUsers()
    },

    // 分页处理
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.page = 1
    },

    handleCurrentChange(page) {
      this.pagination.page = page
    },

    // 排序处理
    handleSortChange({ prop, order }) {
      this.sortField = prop
      this.sortOrder = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : ''
    },

    // 查看用户详情
    async handleViewDetail(user) {
      try {
        var res = await userApi.getUserDetail(user.id)
        res = res.data
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

      this.editForm = {
        id: user.id,
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        maxBorrowCount: user.maxBorrowCount
      }

      this.selectedUser = user

      this.$nextTick(() => {
        this.adjustMaxBorrowCountByRole(user.role)
      })

      this.editDialogVisible = true
    },

    // 添加用户
    handleAddUser() {
      this.isEditMode = false
      this.editDialogTitle = '添加用户'
      this.selectedUser = null

      this.editForm = {
        id: '',
        username: '',
        email: '',
        password: '',
        role: 'USER',
        maxBorrowCount: 5
      }

      this.editDialogVisible = true

      this.$nextTick(() => {
        this.adjustMaxBorrowCountByRole('USER')
      })
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
              password: this.editForm.password,
              maxBorrowCount: this.editForm.maxBorrowCount
            }

            var res = await userApi.updateUser(this.editForm.id, updateData)
            res = res.data
            if (res.code === 200) {
              this.$message.success('用户更新成功')
              this.editDialogVisible = false
              this.loadUsers()
            } else {
              this.$message.error(res.message)
            }
          } else {
            // 添加用户
            const addData = {
              username: this.editForm.username,
              email: this.editForm.email,
              password: this.editForm.password,
              role: this.editForm.role,
              maxBorrowCount: this.editForm.maxBorrowCount
            }
            var res = await userApi.addUser(addData)
            res = res.data
            if (res.code === 200) {
              this.$message.success('用户添加成功')
              this.editDialogVisible = false
              this.loadUsers()
            } else {
              this.$message.error(res.message)
            }
          }
        } catch (error) {
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

    // 删除用户

handleDeleteUser(userRow) {
   // 检查当前借阅数量
   const borrowedCount = userRow.borrowedCount || 0
  
  if (borrowedCount > 0) {
    // 如果有借阅记录，尝试获取详细的借阅状态
    this.$confirm(
      `用户"${userRow.username}"还有${borrowedCount}本图书未归还<br/>请先归还所有图书再删除用户`,
      '无法删除用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    ).then(() => {
      // 可以在这里调用API获取用户的具体借阅记录
      this.loadUserBorrowDetails(userRow.id)
    }).catch(() => {})
    
    return
  }
  const isSelf = userRow.id === this.user.id
  
  const confirmMessage = isSelf 
    ? '⚠️ 警告：您正在尝试删除自己的账户！\n\n删除后您将无法登录系统。\n确定要继续吗？'
    : `确定要删除用户 "${userRow.username}" 吗？`
    
  const confirmType = isSelf ? 'warning' : 'warning'
  
  this.$confirm(confirmMessage, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: confirmType,
    customClass: 'ancient-confirm-dialog',
    dangerouslyUseHTMLString: isSelf // 允许HTML格式的提示
  }).then(async () => {
    try {
      var res = await userApi.deleteUser(userRow.id)
      res = res.data
      
      if (res.code === 200) {
        this.$message.success('删除成功')
        
        if (isSelf) {
          // 如果是删除自己，跳转到登录页
          this.$message.info('您的账户已被删除，正在跳转到登录页...')
          setTimeout(() => {
            localStorage.removeItem('user')
            this.$router.push('/admin/login')
          }, 1500)
        } else {
          // 刷新用户列表
          this.loadUsers()
        }
      } else {
        this.$message.error(res.message)
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      this.$message.error('删除失败，请稍后重试')
    }
  }).catch(() => {})
},

// 新增方法：获取用户的借阅详情
async loadUserBorrowDetails(userId) {
  try {
    const params = {
      page: 1,
      size: 100,
      userId: userId,
      status: 'BORROWED'
    }
    
    const response = await borrowApi.getBorrowRecords(params)
    const res = response.data || response
    
    if (res.code === 200 && res.data) {
      let records = []
      if (Array.isArray(res.data)) {
        records = res.data
      } else if (Array.isArray(res.data.list)) {
        records = res.data.list
      }
      
      if (records.length > 0) {
        // 显示借阅详情
        this.showBorrowDetailsDialog(userId, records)
      }
    }
  } catch (error) {
    console.error('获取用户借阅详情失败:', error)
  }
},

// 显示借阅详情对话框
showBorrowDetailsDialog(userId, records) {
  // 这里可以弹出一个对话框显示用户的借阅记录
  // 或者跳转到借阅管理页面
  this.$message.info(`用户还有${records.length}本未还图书，请先处理`)
  
  // 示例：跳转到借阅管理页面
  // this.$router.push({ path: '/admin/borrow', query: { userId: userId } })
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
/* 导入古籍风格表单样式 */
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
.user-management {
  min-height: 100vh;
  background-image: url('@/assets/image/home2.jpg');
  background-size: 110% 110%;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.user-management::before {
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
  font-size: 14px;
  font-family: "STKaiti", "KaiTi", serif;
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

/* 用户容器 */
.user-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 - 与BookManagement完全一致 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 添加用户按钮 - 与BookManagement的添加图书按钮完全一致 */
.add-user-btn {
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

.add-user-btn:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b) !important;
  border-color: #a7874b !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(155, 135, 110, 0.4);
}

.add-user-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(91, 125, 91, 0.3);
}

.add-user-btn i {
  margin-right: 5px;
}

/* 搜索栏 - 与BookManagement完全一致 */
.search-bar {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-bar .el-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

/* 按钮样式 - 使用系统默认字体确保清晰度 */
.search-btn,
.reset-btn {
  padding: 10px 20px !important;
  border-radius: 20px !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
  transition: all 0.3s;
  font-size: 14px;
}

.search-btn {
  background: #f5f0e6 !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
}

.search-btn:hover {
  background: #e8dbc9 !important;
  border-color: #d4b483 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.2);
}

.reset-btn {
  background: #f5f0e6 !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
}

.reset-btn:hover {
  background: #e8dbc9 !important;
  border-color: #d4b483 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.2);
}

/* 表格容器 - 与BookManagement完全一致 */
.table-container {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

/* 表格样式 - 与BookManagement完全一致 */
.ancient-table {
  background: transparent;
  border: none;
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
  padding: 12px 0 !important;
}

.ancient-table td {
  color: #333 !important;
  border-bottom: 1px solid #f0e9dd !important;
  padding: 12px 0 !important;
  font-size: 13px;
}

.ancient-table .el-table__row:hover td {
  background: rgba(232, 212, 184, 0.1) !important;
}

/* 借阅状态样式 */
.borrow-status {
  display: flex;
  flex-direction: column;
}

.borrow-status .warning {
  color: #f56c6c;
  font-weight: bold;
}

/* 操作按钮容器 */
.action-buttons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  gap: 12px;
  padding: 4px 0;
}

/* 操作按钮 - 与BookManagement完全一致 */
.action-btn {
  padding: 10px 16px !important;
  border-radius: 16px !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
  transition: all 0.3s;
  font-size: 13px;
  height: 36px !important;
  line-height: 16px !important;
  min-width: 70px !important;
  margin: 0 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

/* 详情按钮 */
.detail-btn {
  background: #76b989 !important;
  border: 1px solid #6f9f6f !important;
  color: white !important;
}

.detail-btn:hover {
  background: #5d865d !important;
  border-color: #5b7d5b !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(91, 125, 91, 0.3);
}

/* 编辑按钮 */
.edit-btn {
  background: #a7874b !important;
  /* 使用之前的棕色系 */
  border: 1px solid #8b7355 !important;
  color: white !important;
}

.edit-btn:hover {
  background: #8b7355 !important;
  border-color: #a7874b !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(167, 135, 75, 0.3);
}

/* 删除按钮 - 换成灰一点的红色 */
.delete-btn {
  background: #c77 !important;
  border: 1px solid #a55 !important;
  color: white !important;
}

.delete-btn:hover {
  background: #a55 !important;
  border-color: #c77 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(204, 119, 119, 0.3);
}

/* 角色标签样式 */
.role-tag {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  text-align: center;
  min-width: 70px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid transparent;
}

/* 管理员角色样式 - 使用更符合古籍风格的 */
.admin-role {
  background: #f5eadb;
  color: #a17b4a;
  font-weight: 600;
  font-size: 12px;
  border: 1px solid #ebd5b7;
  box-shadow: 0 2px 4px rgba(232, 164, 164, 0.3);
}

/* 普通用户角色样式 - 更柔和 */
.user-role {
  background: #fffcf9;
  /* 米色渐变 */
  color: #5b4636;
  /* 深棕色文字 */
  font-weight: 500;
  font-size: 12px;
  border: 1px solid #edcfa4;
  /* 浅金色边框 */
  box-shadow: 0 1px 3px rgba(155, 135, 110, 0.15);
}

/* 悬停效果 */
.role-tag:hover {
  transform: translateY(-1px);
}

.admin-role:hover {
  box-shadow: 0 3px 6px rgba(232, 164, 164, 0.4);
}

.user-role:hover {
  box-shadow: 0 2px 5px rgba(155, 135, 110, 0.2);
}

/* 表格中角色标签的特殊样式 */
.el-table__row .role-tag {
  margin: 0 auto;
}

/* 详情对话框中的角色标签样式 */
.ancient-descriptions .role-tag {
  margin: 0;
}

/* 分页 - 与BookManagement完全一致 */
.pagination {
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 使用更具体的选择器来覆盖默认样式 */
.ancient-pagination .el-pagination.is-background .btn-prev,
.ancient-pagination .el-pagination.is-background .btn-next,
.ancient-pagination .el-pagination.is-background .el-pager li {
  background: #f5f0e6 !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
  transition: all 0.3s !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif !important;
}

.ancient-pagination .el-pagination.is-background .btn-prev:hover,
.ancient-pagination .el-pagination.is-background .btn-next:hover,
.ancient-pagination .el-pagination.is-background .el-pager li:hover {
  background: #e8dbc9 !important;
  border-color: #d4b483 !important;
  color: #5b4636 !important;
}

.ancient-pagination .el-pagination.is-background .el-pager li.active {
  background: #8b7355 !important;
  border-color: #8b7355 !important;
  color: white !important;
}

/* 覆盖默认的蓝色焦点/活动状态 */
.ancient-pagination .el-pagination.is-background .el-pager li.active:hover {
  background: #8b7355 !important;
  border-color: #8b7355 !important;
  color: white !important;
}

/* 特别确保第一页和第二页的样式 */
.ancient-pagination .el-pagination.is-background .el-pager li.number:hover,
.ancient-pagination .el-pagination.is-background .el-pager li.number.active {
  background: #8b7355 !important;
  border-color: #8b7355 !important;
  color: white !important;
}

/* 分页样式 - 全局生效 */
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
  font-size: 18px;
}

/* 详情对话框样式 */
.user-detail {
  line-height: 1.8;
}

/* 标签页样式 */
.ancient-tabs /deep/ .el-tabs__nav-wrap::after {
  background-color: #e8d4b8 !important;
}

.ancient-tabs /deep/ .el-tabs__active-bar {
  background-color: #a7874b !important;
}

.ancient-tabs /deep/ .el-tabs__item {
  color: #8b7355 !important;
}

.ancient-tabs /deep/ .el-tabs__item.is-active {
  color: #5b4636 !important;
  font-weight: bold;
}

.ancient-tabs /deep/ .el-tabs__item:hover {
  color: #a7874b !important;
}

/* 描述列表样式 */
.ancient-descriptions /deep/ .el-descriptions__label {
  background-color: #f5f0e6 !important;
  color: #5b4636 !important;
  font-weight: bold;
  border: 1px solid #e8d4b8 !important;
}

.ancient-descriptions /deep/ .el-descriptions__content {
  background-color: #fffffe !important;
  color: #333 !important;
  border: 1px solid #e8d4b8 !important;
}

/* 标签样式 */
.ancient-tag {
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
  border: none !important;
}

/* 空数据样式 */
.empty-data {
  padding: 40px 0;
  text-align: center;
}

/* 对话框底部按钮 */
.ancient-dialog-footer .cancel-btn,
.ancient-dialog-footer .confirm-btn {
  background: #f5f0e6 !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
  font-weight: 500;
  padding: 10px 20px !important;
  border-radius: 20px !important;
  transition: all 0.3s;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
}

.ancient-dialog-footer .confirm-btn {
  background: linear-gradient(135deg, #a7874b, #8b7355) !important;
  border: 1px solid #8b7355 !important;
  color: white !important;
}

.ancient-dialog-footer .cancel-btn:hover,
.ancient-dialog-footer .confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.2);
}

.ancient-dialog-footer .confirm-btn:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b) !important;
  border-color: #a7874b !important;
  box-shadow: 0 6px 12px rgba(155, 135, 110, 0.3);
}

/* 表单提示 */
.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

/* 数字输入框 */
.ancient-input-number /deep/ .el-input-number__decrease,
.ancient-input-number /deep/ .el-input-number__increase {
  background: #f5f0e6 !important;
  border-color: #e8d4b8 !important;
  color: #5b4636 !important;
}

.ancient-input-number /deep/ .el-input__inner {
  background-color: #fffffe !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
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

  .page-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .button-group {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .search-bar .el-col {
    margin-bottom: 10px;
  }

  .action-btn {
    padding: 6px 12px !important;
    font-size: 12px;
    min-width: 60px !important;
  }

  .role-tag {
    padding: 5px 10px;
    font-size: 12px;
    min-width: 65px;
  }

  .admin-role {
    font-size: 12px;
  }

  .user-role {
    font-size: 11px;
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

  .action-buttons-container {
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .action-btn {
    padding: 5px 10px !important;
    font-size: 11px;
    min-width: 55px !important;
  }

  .ancient-table th,
  .ancient-table td {
    padding: 8px 0 !important;
    font-size: 12px;
  }

  .add-user-btn {
    padding: 8px 16px !important;
    font-size: 13px;
  }

  .role-tag {
    padding: 4px 8px;
    font-size: 11px;
    min-width: 60px;
  }

  .admin-role {
    font-size: 11px;
  }

  .user-role {
    font-size: 10px;
  }
}
</style>