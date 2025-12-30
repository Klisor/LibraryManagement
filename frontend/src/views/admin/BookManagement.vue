<template>
  <div class="book-management">
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
          <div class="page-header">
            <h2>图书管理</h2>
            <el-button type="primary" icon="el-icon-plus" @click="handleAddBook" class="add-book-btn">
              添加图书
            </el-button>
          </div>
        
          <!-- 搜索和筛选区域 -->
          <div class="search-bar ancient-section">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="6">
                <el-input
                  v-model="searchForm.title"
                  placeholder="按书名搜索"
                  prefix-icon="el-icon-search"
                  clearable
                  @clear="handleSearch"
                  @keyup.enter.native="handleSearch"
                ></el-input>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-input
                  v-model="searchForm.author"
                  placeholder="按作者搜索"
                  prefix-icon="el-icon-user"
                  clearable
                  @clear="handleSearch"
                  @keyup.enter.native="handleSearch"
                ></el-input>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-select
                  v-model="searchForm.category"
                  placeholder="选择分类"
                  clearable
                  style="width: 100%"
                  @change="handleSearch"
                >
                  <el-option
                    v-for="item in categoryOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6" class="button-group">
                <el-checkbox v-model="searchForm.availableOnly" @change="handleSearch">
                  仅显示有库存
                </el-checkbox>
                <el-button @click="handleSearch" class="search-btn">搜索</el-button>
                <el-button @click="handleReset" class="reset-btn">重置</el-button>
              </el-col>
            </el-row>
          </div>
          
          <!-- 图书表格 -->
          <div class="table-container">
            <el-table
              :data="paginatedBooks"
              border
              stripe
              style="width: 100%; margin-top: 20px;"
              v-loading="loading"
              @sort-change="handleSortChange"
              class="ancient-table"
            >
              <el-table-column 
                prop="isbn" 
                label="ISBN" 
                width="160"
                sortable
                :sort-orders="['ascending', 'descending']"
              ></el-table-column>
              <el-table-column 
                prop="title" 
                label="书名" 
                min-width="200"
                sortable
                :sort-orders="['ascending', 'descending']"
              ></el-table-column>
              <el-table-column 
                prop="author" 
                label="作者" 
                width="120"
                sortable
                :sort-orders="['ascending', 'descending']"
              ></el-table-column>
              <el-table-column prop="category" label="分类" width="100">
                <template slot-scope="scope">
                  <el-tag :color="getCategoryColor(scope.row.category)" style="border: none; color: white;">
                    {{ getCategoryName(scope.row.category) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column 
                prop="publisher" 
                label="出版社" 
                width="150"
                sortable
                :sort-orders="['ascending', 'descending']"
              ></el-table-column>
              <el-table-column 
                prop="publishYear" 
                label="年份" 
                width="80"
                sortable
                :sort-orders="['ascending', 'descending']"
              ></el-table-column>
              <el-table-column label="库存" width="120">
                <template slot-scope="scope">
                  <div class="inventory-info">
                    <span :class="scope.row.availableCopies > 0 ? 'available' : 'unavailable'">
                      {{ Math.min(scope.row.availableCopies, scope.row.totalCopies) }} / {{ scope.row.totalCopies }}
                    </span>
                    <el-progress 
                      :percentage="getAvailablePercentage(scope.row)" 
                      :stroke-width="10"
                      :color="scope.row.availableCopies > 0 ? '#67c23a' : '#f56c6c'"
                      style="margin-top: 5px;"
                    ></el-progress>
                  </div>
                </template>
              </el-table-column>
              <el-table-column 
                prop="location" 
                label="位置" 
                width="120"
                sortable
                :sort-orders="['ascending', 'descending']"
              ></el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    size="small"
                    icon="el-icon-edit"
                    @click="handleEditBook(scope.row)"
                    class="action-btn edit-btn"
                  >
                    编辑
                  </el-button>
                  <el-button
                    size="small"
                    icon="el-icon-delete"
                    @click="handleDeleteBook(scope.row)"
                    class="action-btn delete-btn"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <!-- 分页组件 -->
          <div class="pagination">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="pagination.page"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pagination.size"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredBooks.length"
              :background="true"
              class="ancient-pagination"
            >
            </el-pagination>
          </div>
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 添加/编辑图书对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="resetForm"
      class="ancient-dialog"
    >
      <el-form
        ref="bookForm"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="ancient-form"
      >
        <el-form-item label="ISBN号" prop="isbn">
          <el-input 
            v-model="form.isbn" 
            placeholder="请输入ISBN号，如：978-7-5354-1234-5"
            :disabled="isEditing"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="书名" prop="title">
          <el-input v-model="form.title" placeholder="请输入书名"></el-input>
        </el-form-item>
        
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者"></el-input>
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="出版社">
          <el-input v-model="form.publisher" placeholder="请输入出版社"></el-input>
        </el-form-item>
        
        <el-form-item label="出版年份">
          <el-input-number
            v-model="form.publishYear"
            :min="1900"
            :max="new Date().getFullYear()"
            controls-position="right"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="总副本数" prop="totalCopies">
          <el-input-number
            v-model="form.totalCopies"
            :min="1"
            :max="1000"
            controls-position="right"
            @change="handleTotalCopiesChange"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="可用副本数" prop="availableCopies">
          <el-input-number
            v-model="form.availableCopies"
            :min="0"
            :max="form.totalCopies"
            controls-position="right"
          ></el-input-number>
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">
            可用副本数不能大于总副本数
          </div>
        </el-form-item>
        
        <el-form-item label="存放位置">
          <el-input v-model="form.location" placeholder="请输入存放位置，如：A区3排2架"></el-input>
        </el-form-item>
        
        <el-form-item label="图书描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入图书描述"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer ancient-dialog-footer">
        <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting" class="confirm-btn">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 导入 bookApi
import { bookApi } from '@/api/book'
import { BOOK_CATEGORIES, CATEGORY_OPTIONS, getCategoryName, getCategoryColor } from '@/constants/bookCategories'

export default {
  name: 'BookManagement',
  data() {
    return {
      // 用户信息
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      
      // 搜索表单
      searchForm: {
        title: '',
        author: '',
        category: '',
        availableOnly: false
      },
      
      // 排序
      sortField: '',
      sortOrder: '',
      
      // 表格数据
      bookList: [],
      loading: false,
      allBooks: [],
      
      // 分页
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      
      // 对话框
      dialogVisible: false,
      dialogTitle: '添加图书',
      submitting: false,
      
      // 表单数据
      form: {
        id: null,
        isbn: '',
        title: '',
        author: '',
        category: '',
        publisher: '',
        publishYear: new Date().getFullYear(),
        totalCopies: 1,
        availableCopies: 1,
        location: '',
        description: ''
      },
      
      // 表单验证规则
      rules: {
        isbn: [
          { required: true, message: '请输入ISBN号', trigger: 'blur' },
          { min: 10, max: 20, message: '长度在10-20个字符', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '请输入书名', trigger: 'blur' },
          { min: 1, max: 255, message: '长度在1-255个字符', trigger: 'blur' }
        ],
        author: [
          { required: true, message: '请输入作者', trigger: 'blur' },
          { min: 1, max: 255, message: '长度在1-255个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        totalCopies: [
          { required: true, message: '请输入总副本数', trigger: 'blur' },
          { type: 'number', min: 1, message: '总副本数必须大于0', trigger: 'blur' }
        ],
        availableCopies: [
          { required: true, message: '请输入可用副本数', trigger: 'blur' },
          { validator: this.validateAvailableCopies, trigger: 'blur' }
        ]
      },
      
      // 分类选项
      categoryOptions: CATEGORY_OPTIONS
    }
  },
  computed: {
    // 过滤后的图书数据（根据搜索条件）
    filteredBooks() {
      let result = [...this.allBooks]
      
      // 应用搜索过滤
      if (this.searchForm.title) {
        result = result.filter(book => 
          book.title.toLowerCase().includes(this.searchForm.title.toLowerCase())
        )
      }
      
      if (this.searchForm.author) {
        result = result.filter(book => 
          book.author.toLowerCase().includes(this.searchForm.author.toLowerCase())
        )
      }
      
      if (this.searchForm.category) {
        result = result.filter(book => book.category == this.searchForm.category)
      }
      
      if (this.searchForm.availableOnly) {
        result = result.filter(book => book.availableCopies > 0)
      }
      
      // 应用排序
      if (this.sortField && this.sortOrder) {
        result.sort((a, b) => {
          let aValue = a[this.sortField]
          let bValue = b[this.sortField]
          
          // 处理字符串和数字的排序
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
    paginatedBooks() {
      const start = (this.pagination.page - 1) * this.pagination.size
      const end = start + this.pagination.size
      return this.filteredBooks.slice(start, end)
    },
    
    // 是否编辑模式
    isEditing() {
      return !!this.form.id
    }
  },
  mounted() {
    // 检查权限
    if (!this.user.id || this.user.role !== 'ADMIN') {
      this.$router.push('/admin/login')
      return
    }
    
    // 加载图书列表
    this.loadBooks()
  },
  methods: {    
    // 工具函数
    getCategoryName,
    getCategoryColor,
    
    // 下拉菜单命令处理
    handleCommand(command) {
      if (command === 'logout') {
        this.logout()
      } else if (command === 'profile') {
        this.$message.info('管理员个人资料功能开发中')
      }
    },
    
    // 加载图书列表
    async loadBooks() {
      this.loading = true
      try {
        // 设置一个较大的size，获取所有符合条件的图书
        const params = {
          size: 1000,
          ...this.searchForm
        }
        
        var res = await bookApi.getBooks(params)
        res=res.data
        if (res.code === 200) {
          // 保存所有过滤后的数据
          this.allBooks = res.data
          this.pagination.total = res.data.length
          
          // 重置当前页到第一页
          if (this.pagination.page > Math.ceil(res.data.total / this.pagination.size)) {
            this.pagination.page = 1
          }
        } else {
          this.$message.error(res.message)
          this.allBooks = []
          this.pagination.total = 0
        }
      } catch (error) {
        console.error('加载图书列表失败:', error)
        this.$message.error('加载失败，请稍后重试')
        this.allBooks = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },
    
    // 计算可用百分比
    getAvailablePercentage(book) {
      const available = Math.min(book.availableCopies, book.totalCopies)
      return Math.round((available / book.totalCopies) * 100)
    },
    
    // 验证可用副本数
    validateAvailableCopies(rule, value, callback) {
      if (value > this.form.totalCopies) {
        callback(new Error('可用副本数不能大于总副本数'))
      } else if (value < 0) {
        callback(new Error('可用副本数不能小于0'))
      } else {
        callback()
      }
    },
    
    // 处理总副本数变化
    handleTotalCopiesChange(value) {
      if (this.form.availableCopies > value) {
        this.form.availableCopies = value
      }
    },
    
    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.loadBooks()
    },
    
    // 重置搜索
    handleReset() {
      this.searchForm = {
        title: '',
        author: '',
        category: '',
        availableOnly: false
      }
      this.sortField = ''
      this.sortOrder = ''
      this.pagination.page = 1
      this.loadBooks()
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
    
    // 添加图书
    handleAddBook() {
      this.dialogTitle = '添加图书'
      this.form = {
        id: null,
        isbn: '',
        title: '',
        author: '',
        category: '',
        publisher: '',
        publishYear: new Date().getFullYear(),
        totalCopies: 1,
        availableCopies: 1,
        location: '',
        description: ''
      }
      this.dialogVisible = true
    },
    
    // 编辑图书
    handleEditBook(book) {
      this.dialogTitle = '编辑图书'
      this.form = { ...book }
      this.dialogVisible = true
    },
    
    // 删除图书
    async handleDeleteBook(book) {
      this.$confirm(`确定要删除《${book.title}》吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          var res = await bookApi.deleteBook(book.id)
          res=res.data
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadBooks()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败，请稍后重试')
        }
      }).catch(() => {
        // 用户取消删除
      })
    },
    
    // 提交表单（添加/编辑）
    async submitForm() {
      this.$refs.bookForm.validate(async (valid) => {
        if (!valid) return
        
        this.submitting = true
        
        try {
          if (this.form.id) {
            // 编辑图书
            var res = await bookApi.updateBook(this.form.id, this.form)
            res=res.data
            if (res.code === 200) {
              this.$message.success('编辑成功')
              this.dialogVisible = false
              this.loadBooks()
            } else {
              this.$message.error(res.message)
            }
          } else {
            // 添加图书
            const bookData = {
              ...this.form,
              category: Number(this.form.category)
            }
            
            var res = await bookApi.addBook(bookData)
            res=res.data
            if (res.code === 200 && res.data) {
              const addedBook = res.data
              this.$message.success(`图书《${addedBook.title}》已添加成功，ID: ${addedBook.id}`)
              this.dialogVisible = false
              
              setTimeout(() => {
                this.loadBooks()
              }, 200)
              
              this.clearBookCache()
            } else if (res.code === 200 && !res.data) {
              this.$message.warning('图书添加成功，但未返回图书详情，请稍后刷新查看')
              this.dialogVisible = false
              this.loadBooks()
            } else {
              this.$message.error(res.message || '添加失败')
            }
          }
        } catch (error) {
          console.error('操作失败:', error)
          this.$message.error('操作失败，请稍后重试')
        } finally {
          this.submitting = false
        }
      })
    },
    
    // 清除图书缓存
    clearBookCache() {
      if (window.updateBookList) {
        window.updateBookList()
      }
      console.log('🔄 已通知其他页面更新图书列表')
    },
    
    // 重置表单
    resetForm() {
      this.form = {
        id: null,
        isbn: '',
        title: '',
        author: '',
        category: '',
        publisher: '',
        publishYear: new Date().getFullYear(),
        totalCopies: 1,
        availableCopies: 1,
        location: '',
        description: ''
      }
      
      if (this.$refs.bookForm) {
        this.$refs.bookForm.clearValidate()
      }
    },
    
    // 退出登录
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/admin/login')
    },
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
.book-management {
  min-height: 100vh;
  background-image: url('@/assets/image/home2.jpg');
  background-size: 110% 110%;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.book-management::before {
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

/* 页面头部 */
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

/* 添加图书按钮 - 改回偏黄色（古籍金色） */
.add-book-btn {
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

.add-book-btn:hover {
  background: linear-gradient(135deg, #8b7355, #a7874b) !important;
  border-color: #a7874b !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(155, 135, 110, 0.4);
}

.add-book-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(91, 125, 91, 0.3);
}

.add-book-btn i {
  margin-right: 5px;
}

/* 搜索栏 */
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
.search-btn, .reset-btn {
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

/* 表格容器 */
.table-container {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e8d4b8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

/* 表格样式 */
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

/* 操作按钮 - 增大按钮尺寸，使用清晰字体 */
.action-btn {
  padding: 8px 16px !important;
  border-radius: 16px !important;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
  transition: all 0.3s;
  font-size: 13px;
  height: 32px;
  line-height: 16px;
}

/* 编辑按钮 - 改为偏黄色（原添加图书的颜色） */
/* 编辑按钮 - 纯色黄色系 */
.edit-btn {
  background: #a7874b !important;
  border: 1px solid #8b7355 !important;
  color: white !important;
}

.edit-btn:hover {
  background: #8b7355 !important;
  border-color: #a7874b !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(167, 135, 75, 0.3);
}

/* 删除按钮 - 纯色红色系 */
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

/* 库存信息 */
.inventory-info {
  display: flex;
  flex-direction: column;
}

.inventory-info .available {
  color: #67c23a;
  font-weight: bold;
}

.inventory-info .unavailable {
  color: #f56c6c;
  font-weight: bold;
}

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

.ancient-form .el-form-item__label {
  color: #5b4636;
  font-family: "STKaiti", "KaiTi", serif;
}

.ancient-dialog-footer .confirm-btn {
  background: #a7874b !important;
  border: 1px solid #a18563 !important;
  color: white !important;
  padding: 10px 20px !important;
  transition: all 0.3s;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
}

.cancel-btn {
  background: #ffffff !important;
  border: 1px solid #e8d4b8 !important;
  color: #5b4636 !important;
  font-weight: 500;
  padding: 10px 20px !important;
  transition: all 0.3s;
}

.cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.2);
  background: #fffcfa !important;
}

.ancient-dialog-footer .cancel-btn:hover,
.ancient-dialog-footer .confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(155, 135, 110, 0.2);
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
  
  .action-btn {
    padding: 5px 10px !important;
    font-size: 11px;
    margin: 2px 0;
  }
  
  .ancient-table th,
  .ancient-table td {
    padding: 8px 0 !important;
    font-size: 12px;
  }
  
  .add-book-btn {
    padding: 8px 16px !important;
    font-size: 13px;
  }
}
</style>