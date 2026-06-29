# 校园失物招领系统 - 项目配置

## 开发环境要求

- Node.js: 16.x 或更高版本
- MySQL: 8.0 或更高版本
- npm: 7.x 或更高版本

## 端口配置

- 后端服务: 3000
- 前端服务: 5173

## 数据库配置

数据库名称: lostfound_db
字符集: utf8mb4
排序规则: utf8mb4_unicode_ci

## 环境变量配置

后端需要配置以下环境变量（在 backend/.env 文件中）：
- PORT: 服务器端口
- DB_HOST: 数据库主机地址
- DB_USER: 数据库用户名
- DB_PASSWORD: 数据库密码
- DB_NAME: 数据库名称
- JWT_SECRET: JWT 密钥
- JWT_EXPIRES_IN: Token 过期时间

## 开发命令

### 后端
- `npm run dev`: 启动开发服务器
- `npm run build`: 构建生产版本
- `npm start`: 启动生产服务器

### 前端
- `npm run dev`: 启动开发服务器
- `npm run build`: 构建生产版本
- `npm run preview`: 预览生产版本

## API 文档

API 基础路径: http://localhost:3000/api

### 认证相关
- POST /users/register - 用户注册
- POST /users/login - 用户登录
- GET /users/profile - 获取用户信息（需要认证）
- PUT /users/profile - 更新用户信息（需要认证）

### 失物相关
- GET /items - 获取失物列表
- GET /items/:id - 获取失物详情
- POST /items - 发布失物（需要认证）
- PUT /items/:id - 更新失物（需要认证）
- DELETE /items/:id - 删除失物（需要认证）
- GET /items/my - 获取我的发布（需要认证）
- POST /items/:id/cancel - 取消招领（需要认证）

### 招领相关
- POST /claims/:itemId - 申请招领（需要认证）
- GET /claims - 获取招领申请列表（需要认证）
- GET /claims/my - 获取我的申请（需要认证）
- POST /claims/:claimId/approve - 通过申请（需要认证）
- POST /claims/:claimId/reject - 拒绝申请（需要认证）

### 统计相关
- GET /statistics - 获取统计数据

### 通知相关
- GET /notifications - 获取通知列表（需要认证）
- POST /notifications/:id/read - 标记为已读（需要认证）
- POST /notifications/read-all - 全部标记为已读（需要认证）

## 注意事项

1. 首次运行前请确保 MySQL 服务已启动
2. 需要先创建数据库或导入 database.sql 文件
3. 图片上传限制为 JPG/PNG 格式，大小不超过 5MB
4. JWT Token 有效期为 7 天
5. 生产环境请修改默认的 JWT 密钥
6. 建议使用 HTTPS 协议部署生产环境
