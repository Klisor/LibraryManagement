const { defineConfig } = require('@vue/cli-service')
// vue.config.js
module.exports = {
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'  // 保持路径不变
        },
        secure: false
      }
    }
  }
}