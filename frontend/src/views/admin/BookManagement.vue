<template>
  <div class="book-management">
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
          <div class="page-header">
            <h2>图书管理</h2>
            <el-button type="primary" icon="el-icon-plus" @click="handleAddBook">
              添加图书
            </el-button>
          </div>
          
          <!-- 搜索和筛选区域 -->
          <div class="search-bar">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-input
                  v-model="searchForm.title"
                  placeholder="按书名搜索"
                  prefix-icon="el-icon-search"
                  clearable
                  @clear="handleSearch"
                  @keyup.enter.native="handleSearch"
                ></el-input>
              </el-col>
              <el-col :span="6">
                <el-input
                  v-model="searchForm.author"
                  placeholder="按作者搜索"
                  prefix-icon="el-icon-user"
                  clearable
                  @clear="handleSearch"
                  @keyup.enter.native="handleSearch"
                ></el-input>
              </el-col>
              <el-col :span="6">
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
              <el-col :span="6">
                <el-checkbox v-model="searchForm.availableOnly" @change="handleSearch">
                  仅显示有库存
                </el-checkbox>
                <el-button type="primary" @click="handleSearch" style="margin-left: 10px;">
                  搜索
                </el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-col>
            </el-row>
          </div>
          
          <!-- 图书表格 -->
          <el-table
            :data="paginatedBooks"
            border
            stripe
            style="width: 100%; margin-top: 20px;"
            v-loading="loading"
            @sort-change="handleSortChange"
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
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="handleEditBook(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="handleDeleteBook(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
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
    >
      <el-form
        ref="bookForm"
        :model="form"
        :rules="rules"
        label-width="100px"
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
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
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
      bookList: [], // 初始化为空数组，通过API加载
      loading: false,
      allBooks: [], // 所有图书数据
      bookList: [], // 当前页的图书数据
      
      // 分页
      pagination: {
        page: 1,
        size: 10,
        total: 0 // 添加total字段
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
    
    // 加载图书列表
    async loadBooks() {
      this.loading = true
      try {
        // 移除分页参数，加载所有数据
        const params = {}
        
        // 添加搜索条件
        if (this.searchForm.title) {
          params.title = this.searchForm.title
        }
        
        if (this.searchForm.author) {
          params.author = this.searchForm.author
        }
        
        if (this.searchForm.category) {
          params.category = this.searchForm.category
        }
        
        if (this.searchForm.availableOnly) {
          params.availableOnly = this.searchForm.availableOnly
        }
        
        // 设置一个较大的size，获取所有符合条件的图书
        params.size = 1000  // 假设最多1000本
        
        const res = await bookApi.getBooks(params)
        
        if (res.code === 200) {
          // 保存所有过滤后的数据
          this.allBooks = res.data.list
          this.pagination.total = res.data.total
          
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
      // 不需要重新加载数据，因为已经有所有数据了
    },
    
    handleCurrentChange(page) {
      this.pagination.page = page
      // 不需要重新加载数据，因为已经有所有数据了
    },
    
    // 排序处理
    handleSortChange({ prop, order }) {
      this.sortField = prop
      this.sortOrder = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : ''
      // 不需要重新加载数据，排序在计算属性中处理
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
          const res = await bookApi.deleteBook(book.id)
          
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadBooks() // 重新加载列表
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
            const { id, ...bookData } = this.form
            const res = await bookApi.updateBook(id, bookData)
            
            if (res.code === 200) {
              this.$message.success('更新成功')
              this.dialogVisible = false
              this.loadBooks() // 重新加载列表
            } else {
              this.$message.error(res.message)
            }
          } else {
            // 添加图书
            const res = await bookApi.addBook(this.form)
            
            if (res.code === 200) {
              this.$message.success('添加成功')
              this.dialogVisible = false
              this.loadBooks() // 重新加载列表
            } else {
              this.$message.error(res.message)
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
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.inventory-info {
  display: flex;
  flex-direction: column;
}

.available {
  color: #67c23a;
  font-weight: bold;
}

.unavailable {
  color: #f56c6c;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
  text-align: center;
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

/* 响应式调整 */
@media (max-width: 1200px) {
  .search-bar .el-col {
    margin-bottom: 10px;
  }
  
  .search-bar .el-col:last-child {
    margin-bottom: 0;
  }
}
</style>