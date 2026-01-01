import Vue from 'vue'
import VueRouter from 'vue-router'
import UserManagement from '@/views/admin/UserManagement.vue'
import CategoryManagement from '@/views/admin/CategoryManagement.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/user/login'
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/auth/AdminLogin.vue')
  },
  {
    path: '/user/login',
    name: 'UserLogin',
    component: () => import('@/views/auth/UserLogin.vue')
  },
  {
    path: '/user/register',
    name: 'UserRegister',
    component: () => import('@/views/auth/UserRegister.vue')
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  // 在routes数组中添加借阅管理路由
  {
    path: '/admin/borrow',
    name: 'BorrowManagement',
    component: () => import('@/views/admin/BorrowManagement.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },  {
    path: '/admin/back',
    name: 'BackManagement',
    component: () => import('@/views/admin/BorrowManagement2.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, role: 'ADMIN' } 
  },
  {
    path: '/admin/books',
    name: 'BookManagement',
    component: () => import('@/views/admin/BookManagement.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/user',
    name: 'UserHome',
    component: () => import('@/views/user/Home.vue'),
    meta: { requiresAuth: true, role: 'USER' }
  },
  {
    path: '/user/books',
    name: 'BookList',
    component: () => import('@/views/user/BookList.vue'),
    meta: { requiresAuth: true, role: 'USER' }
  },
  {
    path: '/user/borrow',
    name: 'MyBorrow',
    component: () => import('@/views/user/MyBorrow.vue'),
    meta: { requiresAuth: true, role: 'USER' }
  },
  {
    path: '/user/personal',
    name: 'Personal',
    component: () => import('@/views/user/Personal.vue'),
    meta: { requiresAuth: true, role: 'USER' }
  },{
    path: '/admin/categories', 
    name: 'CategoryManagement',
    component: CategoryManagement,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫 - 权限检查
// 路由守卫 - 权限检查
// 路由守卫 - 权限检查
router.beforeEach((to, from, next) => {
  
  // 获取用户信息
  let user = null
  try {
    const userStr = localStorage.getItem('user')
    if (userStr && userStr !== 'null' && userStr !== 'undefined') {
      user = JSON.parse(userStr)
    }
  } catch (e) {
    console.error('解析用户信息失败:', e)
    localStorage.removeItem('user')
  }
  
  
  // 检查公共页面（不需要登录）
  const publicPages = ['/admin/login', '/user/login', '/user/register']
  
  if (publicPages.includes(to.path)) {
    
    // 如果用户已经登录，根据角色重定向到对应主页
    if (user && user.id) {
      
      // 避免重定向循环：检查目标是否是当前页面
      if ((user.role === 'ADMIN' && to.path === '/admin') || 
          (user.role !== 'ADMIN' && to.path === '/user')) {
        next()
        return
      }
      
      // 根据角色重定向
      if (user.role === 'ADMIN') {
        next('/admin')
      } else {
        next('/user')
      }
      return
    }
    
    // 未登录，允许访问登录/注册页
    next()
    return
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    
    if (!user || !user.id) {
      
      // 根据目标页面的类型选择登录页
      if (to.meta.role === 'ADMIN') {
        next({
          path: '/admin/login',
          query: { redirect: to.fullPath }
        })
      } else {
        next({
          path: '/user/login',
          query: { redirect: to.fullPath }
        })
      }
      return
    }
    
    
    // 检查角色权限
    if (to.meta.role === 'ADMIN' && user.role !== 'ADMIN') {
      next('/user')
      return
    }
    
    if (to.meta.role === 'USER' && user.role !== 'USER' && user.role !== 'ADMIN') {
      next('/user/login')
      return
    }
  }
  
  next()
})
export default router