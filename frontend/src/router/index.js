import Vue from 'vue'
import VueRouter from 'vue-router'
import UserManagement from '@/views/admin/UserManagement.vue'

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
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫 - 权限检查
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !user.id) {
    if (to.meta.role === 'ADMIN' || to.meta.requiresAdmin) {
      next('/admin/login')
    } else {
      next('/user/login')
    }
    return
  }
  
  // 检查角色权限
  if (to.meta.requiresAuth) {
    // 如果是管理员页面，检查用户是否是管理员
    if ((to.meta.role === 'ADMIN' || to.meta.requiresAdmin)) {
      if (user.role !== 'ADMIN') {
        alert('无权访问管理员页面')
        next('/user')
        return
      }
    }
    
    // 如果是用户页面，允许普通用户和管理员访问
    if (to.meta.role === 'USER') {
      // 允许普通用户和管理员访问用户页面
      if (user.role === 'USER' || user.role === 'ADMIN') {
        next()
        return
      }
      
      alert('请以用户或管理员身份登录')
      next('/user/login')
      return
    }
  }
  
  next()
})

export default router