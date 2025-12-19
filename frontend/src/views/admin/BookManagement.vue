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
// 直接在组件内定义分类数据，避免路径问题
const BOOK_CATEGORIES = {
  1: '文学',
  2: '历史', 
  3: '科学',
  4: '技术',
  5: '教育',
  6: '艺术',
  7: '商业',
  8: '健康',
  9: '旅行',
  10: '其他'
};

const CATEGORY_OPTIONS = [
  { value: 1, label: '文学' },
  { value: 2, label: '历史' },
  { value: 3, label: '科学' },
  { value: 4, label: '技术' },
  { value: 5, label: '教育' },
  { value: 6, label: '艺术' },
  { value: 7, label: '商业' },
  { value: 8, label: '健康' },
  { value: 9, label: '旅行' },
  { value: 10, label: '其他' }
];

function getCategoryName(categoryCode) {
  return BOOK_CATEGORIES[categoryCode] || '未知分类';
}

function getCategoryColor(categoryCode) {
  const colors = [
    '#ff6b6b', '#48dbfb', '#1dd1a1', '#feca57', '#ff9ff3',
    '#f368e0', '#ff9f43', '#54a0ff', '#5f27cd', '#c8d6e5'
  ];
  return colors[(categoryCode - 1) % colors.length];
}

// 模拟图书数据
let mockBooks = [
  {
    id: 1,
    isbn: '978-7-5354-1234-5',
    title: '红楼梦',
    author: '曹雪芹',
    publisher: '人民文学出版社',
    publishYear: 2020,
    category: 1,
    totalCopies: 5,
    availableCopies: 3,
    location: 'A区3排2架',
    description: '中国古典文学名著',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    isbn: '978-7-02-001501-6',
    title: '三国演义',
    author: '罗贯中',
    publisher: '人民文学出版社',
    publishYear: 2019,
    category: 1,
    totalCopies: 3,
    availableCopies: 1,
    location: 'A区2排1架',
    description: '中国古代历史小说',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  },
  {
    id: 3,
    isbn: '978-7-02-015433-3',
    title: '西游记',
    author: '吴承恩',
    publisher: '人民文学出版社',
    publishYear: 2021,
    category: 1,
    totalCopies: 4,
    availableCopies: 4,
    location: 'A区2排3架',
    description: '中国古典神魔小说',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z'
  },
  {
    id: 4,
    isbn: '978-7-5327-8533-4',
    title: 'JavaScript高级程序设计',
    author: 'Nicholas C. Zakas',
    publisher: '人民邮电出版社',
    publishYear: 2019,
    category: 4,
    totalCopies: 10,
    availableCopies: 6,
    location: 'B区1排1架',
    description: 'JavaScript经典教程',
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z'
  },
  {
    id: 5,
    isbn: '978-7-115-51531-8',
    title: 'Vue.js设计与实现',
    author: '霍春阳',
    publisher: '人民邮电出版社',
    publishYear: 2022,
    category: 4,
    totalCopies: 8,
    availableCopies: 5,
    location: 'B区1排2架',
    description: 'Vue.js技术原理详解',
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z'
  }
];

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
      bookList: [...mockBooks],
      loading: false,
      
      // 分页
      pagination: {
        page: 1,
        size: 10
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
    // 是否正在编辑
    isEditing() {
      return !!this.form.id
    },
    
    // 过滤后的图书数据
    filteredBooks() {
      let result = [...this.bookList]
      
      // 搜索过滤
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
      
      // 排序
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
    
    // 分页后的数据
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
  },
  methods: {
    // 工具函数
    getCategoryName,
    getCategoryColor,
    
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
    handleDeleteBook(book) {
      this.$confirm(`确定要删除《${book.title}》吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            this.performDeleteBook(book.id).finally(() => {
              instance.confirmButtonLoading = false
              done()
            })
          } else {
            done()
          }
        }
      }).catch(() => {})
    },
    
    // 执行删除
    async performDeleteBook(bookId) {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 查找图书
        const index = this.bookList.findIndex(book => book.id === bookId)
        
        if (index === -1) {
          this.$message.error('图书不存在')
          return
        }
        
        const book = this.bookList[index]
        
        // 检查图书是否已被借阅
        if (book.availableCopies < book.totalCopies) {
          this.$message.error('图书已被借阅，无法删除')
          return
        }
        
        // 删除图书
        this.bookList.splice(index, 1)
        this.$message.success('删除成功')
        
        // 如果当前页没有数据了，回到上一页
        if (this.paginatedBooks.length === 0 && this.pagination.page > 1) {
          this.pagination.page -= 1
        }
        
      } catch (error) {
        console.error('删除失败:', error)
        this.$message.error('删除失败，请稍后重试')
      }
    },
    
    // 提交表单（添加/编辑）
    submitForm() {
      this.$refs.bookForm.validate(async (valid) => {
        if (!valid) return
        
        this.submitting = true
        
        try {
          // 模拟API调用延迟
          await new Promise(resolve => setTimeout(resolve, 500))
          
          if (this.form.id) {
            // 编辑图书 - 查找并更新
            const index = this.bookList.findIndex(book => book.id === this.form.id)
            
            if (index === -1) {
              this.$message.error('图书不存在')
              return
            }
            
            // 检查可用副本数不能大于总副本数
            if (this.form.availableCopies > this.form.totalCopies) {
              this.$message.error('可用副本数不能大于总副本数')
              return
            }
            
            // 更新图书
            this.bookList[index] = {
              ...this.form,
              updatedAt: new Date().toISOString()
            }
            
            this.$message.success('更新成功')
            
            // 关键修复：编辑成功后强制刷新显示
            // 通过创建一个新数组触发响应式更新
            this.bookList = [...this.bookList]
          } else {
            // 添加图书 - 检查ISBN是否已存在
            const existingBook = this.bookList.find(book => book.isbn === this.form.isbn)
            
            if (existingBook) {
              this.$message.error('ISBN已存在')
              return
            }
            
            // 检查可用副本数不能大于总副本数
            if (this.form.availableCopies > this.form.totalCopies) {
              this.form.availableCopies = this.form.totalCopies
            }
            
            // 添加新图书
            const newBook = {
              ...this.form,
              id: this.bookList.length > 0 ? Math.max(...this.bookList.map(b => b.id)) + 1 : 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            
            this.bookList.unshift(newBook)
            this.$message.success('添加成功')
            
            // 添加后重置搜索条件
            this.handleReset()
          }
          
          this.dialogVisible = false
          
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