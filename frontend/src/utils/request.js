import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'

// 创建axios实例
const request = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加token
request.interceptors.request.use(
  config => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一错误处理
request.interceptors.response.use(
  response => {
    // 这里假设后端返回 {code, message, data, timestamp}
    const res = response.data
    
    if (res.code !== 200) {
      Message.error(res.message || '请求失败')
      
      // 特殊状态码处理
      if (res.code === 401) {
        localStorage.removeItem('user')
        router.push('/user/login')
      }
      
      return Promise.reject(new Error(res.message || 'Error'))
    }
    
    return res
  },
  error => {
    Message.error('网络错误或服务器异常')
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

export default request