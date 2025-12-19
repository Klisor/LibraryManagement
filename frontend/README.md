# 图书管理系统 - 前端

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（使用模拟数据）
npm run serve

1. 模拟数据/真实API切换
修改 src/config/api.config.js：
    export const API_CONFIG = {
        USE_MOCK: true,  // true:模拟数据 | false:真实API
        BASE_URL: 'http://localhost:8080/api',  // 后端地址
        MOCK_DELAY: 500
    }

2. 测试账号
    管理员：admin / 123456

    用户1：user1 / 123456

    用户2：李四 / 123456

对接说明
1. 当前状态
✅ 所有功能已完成

✅ 使用模拟数据运行

✅ 支持切换真实API

2. 后端需要做的事
按照 项目设计文档.md 实现所有API接口

接口响应格式必须一致：
{
  "code": 200,
  "message": "成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}

3. 前端切换步骤
修改 src/config/api.config.js 中 USE_MOCK: false

修改 BASE_URL 为你的后端地址

重启项目：npm run serve

项目结构:
src/
├── api/          # API接口
├── config/       # 配置文件
├── constants/    # 常量（分类映射等）
├── mock/         # 模拟数据
├── router/       # 路由
├── utils/        # 工具函数
├── views/        # 页面组件
└── main.js       # 入口文件