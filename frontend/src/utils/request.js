// src/utils/request.js
import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'

// 创建axios实例
const request = axios.create({
  baseURL: '/api',  // 使用代理，相对路径
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加token
request.interceptors.request.use(
  config => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`
        }
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一错误处理
// request.interceptors.response.use(
//   response => {
//     // 根据设计文档，后端返回 {code, message, data, timestamp}
//     const res = response.data
//     console.log("统一拦截响应",res);
//     // 如果响应数据中没有code字段，可能是其他格式
//     if (res.code === undefined) {
//       // 直接返回原始数据
//       return res
//     }
//     // 根据设计文档，200表示成功
//     if (res.code === 200) {
//       // 如果登录成功，需要保存token
//       if (response.config.url === '/users/login' && res.data && res.data.token) {
//         const { token, user } = res.data
//         // 合并token和用户信息
//         const userInfo = { ...user, token }
//         localStorage.setItem('user', JSON.stringify(userInfo))
//       }
//       // 返回data字段，如果没有data字段，返回整个响应
//       return res.data !== undefined ? res.data : res
//     }
//     // 非200状态码处理
//     const errorMessage = res.message || '请求失败'
    
//     // 特殊状态码处理
//     switch (res.code) {
//       case 401:
//         Message.error('登录已过期，请重新登录')
//         localStorage.removeItem('user')
//         router.push('/user/login')
//         break
//       case 403:
//         Message.error('没有访问权限')
//         break
//       case 404:
//         Message.error('请求的资源不存在')
//         break
//       default:
//         Message.error(errorMessage)
//     }
    
//     return Promise.reject(new Error(errorMessage))
//   },
//   error => {
//     console.error('请求错误详情:', {
//       message: error.message,
//       response: error.response,
//       config: error.config
//     })
    
//     if (error.response) {
//       // 有响应但状态码错误
//       const status = error.response.status
//       const data = error.response.data
      
//       switch (status) {
//         case 400:
//           Message.error(data?.message || '请求参数错误')
//           break
//         case 401:
//           Message.error('登录已过期，请重新登录')
//           localStorage.removeItem('user')
//           router.push('/user/login')
//           break
//         case 403:
//           Message.error('没有访问权限')
//           break
//         case 404:
//           Message.error('请求的资源不存在')
//           break
//         case 500:
//           Message.error(data?.message || '服务器内部错误')
//           break
//         default:
//           Message.error(`请求失败: ${status}`)
//       }
//     } else if (error.request) {
//       // 请求已发送但没有响应
//       if (error.message === 'Network Error') {
//         Message.error('网络错误，请检查：\n1. 后端服务是否启动\n2. 端口号是否正确\n3. 是否跨域')
//       } else {
//         Message.error('请求超时或网络异常')
//       }
//     } else {
//       // 请求配置错误
//       Message.error('请求配置错误')
//     }
    
//     return Promise.reject(error)
//   }
// )

export default request