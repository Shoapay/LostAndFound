# 校园失物招领系统

一个基于 React + TypeScript + Ant Design 前端和 Node.js + Express + TypeScript 后端的校园失物招领系统。

## 技术栈

### 前端
- React 18
- TypeScript
- Ant Design 5
- React Router 6
- Axios
- Vite

### 后端
- Node.js
- Express
- TypeScript
- SQLite (via better-sqlite3)
- JWT 认证
- Multer (文件上传)

## 功能特性

### 用户功能
- 用户注册/登录
- 个人信息管理
- 发布失物信息
- 查看我的发布
- 申请招领物品
- 查看我的申请
- 管理招领申请

### 核心业务
- 失物发布与浏览
- 图片上传
- 分类筛选
- 关键词搜索
- 招领申请与审核
- 状态管理（待招领/已招领/已取消）

### 扩展功能
- 数据统计面板
- 通知系统
- 热门分类统计
- 近期发布趋势

## 项目结构

```
lostfound/
├── backend/                 # 后端代码
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   ├── middleware/      # 中间件
│   │   ├── config/          # 配置文件
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # 类型定义
│   │   └── app.ts           # 应用入口
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # 前端代码
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/           # 页面
│   │   ├── services/        # API 服务
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # 类型定义
│   │   ├── App.tsx          # 主应用
│   │   └── main.tsx         # 入口文件
│   ├── package.json
│   └── vite.config.ts
└── uploads/                 # 上传文件目录
```

## 安装与运行

### 前置要求
- Node.js 16+（也可使用 setup.ps1 自动安装）

### 1. 数据库配置

本项目使用 SQLite 作为数据库，无需额外安装数据库服务。
数据库文件 `backend/data/lostfound.db` 会在首次启动后端时自动创建。

### 2. 后端配置

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
# 编辑 .env 文件，设置 JWT 密钥
```

修改 `backend/.env` 文件：
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

启动后端服务：
```bash
npm run dev
```

### 3. 前端配置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 即可使用系统。

## API 接口

### 用户相关
- POST /api/users/register - 用户注册
- POST /api/users/login - 用户登录
- GET /api/users/profile - 获取用户信息
- PUT /api/users/profile - 更新用户信息

### 失物相关
- GET /api/items - 获取失物列表
- GET /api/items/:id - 获取失物详情
- POST /api/items - 发布失物
- PUT /api/items/:id - 更新失物信息
- DELETE /api/items/:id - 删除失物
- GET /api/items/my - 获取我的发布
- POST /api/items/:id/cancel - 取消招领

### 招领相关
- POST /api/claims/:itemId - 申请招领
- GET /api/claims - 获取招领申请列表
- GET /api/claims/my - 获取我的申请
- POST /api/claims/:claimId/approve - 通过申请
- POST /api/claims/:claimId/reject - 拒绝申请

### 统计相关
- GET /api/statistics - 获取统计数据

### 通知相关
- GET /api/notifications - 获取通知列表
- POST /api/notifications/:id/read - 标记为已读
- POST /api/notifications/read-all - 全部标记为已读

## 使用说明

1. **注册账号**：使用邮箱和密码注册账号
2. **发布失物**：登录后点击"发布失物"，填写物品信息并上传照片
3. **浏览失物**：在首页浏览待招领的物品，可按分类和关键词搜索
4. **申请招领**：查看物品详情后，点击"申请招领"按钮
5. **审核申请**：在"招领管理"中审核他人的招领申请
6. **查看统计**：在"数据统计"中查看系统运营数据

## 开发说明

### 后端开发
```bash
cd backend
npm run dev    # 开发模式
npm run build  # 构建生产版本
npm start      # 运行生产版本
```

### 前端开发
```bash
cd frontend
npm run dev     # 开发模式
npm run build   # 构建生产版本
npm run preview # 预览生产版本
```

## 注意事项

1. 首次运行会自动创建数据库表结构
2. 图片上传限制为 JPG/PNG 格式，大小不超过 5MB
3. JWT Token 有效期为 7 天
4. 建议在生产环境中修改默认的 JWT 密钥



## 快速启动（PowerShell）

```powershell
# 安装依赖
cd backend; npm install; cd ..
cd frontend; npm install; cd ..

# 启动后端（新窗口）
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# 启动前端（新窗口）
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

## 项目架构

### 后端架构
```
backend/
├── src/
│   ├── controllers/      # 业务逻辑控制器
│   ├── routes/           # 路由定义
│   ├── middleware/        # 中间件（认证、错误处理）
│   ├── config/           # 配置文件（数据库连接、初始化）
│   ├── utils/            # 工具函数（密码加密、JWT）
│   ├── types/            # TypeScript 类型定义
│   └── app.ts            # 应用入口
├── .env                  # 环境变量配置
├── package.json
└── tsconfig.json
```

### 前端架构
```
frontend/
├── src/
│   ├── components/       # 可复用组件
│   ├── pages/            # 页面组件
│   ├── services/         # API 服务封装
│   ├── types/            # TypeScript 类型定义
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 应用入口
│   └── index.css         # 全局样式
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 数据库设计

### 用户表（users）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 主键，自增 |
| username | TEXT | 用户名，唯一 |
| email | TEXT | 邮箱，唯一 |
| password | TEXT | 加密密码 |
| phone | TEXT | 手机号 |
| created_at | DATETIME | 创建时间 |

### 失物表（items）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 发布者 ID |
| title | TEXT | 物品名称 |
| description | TEXT | 描述 |
| category | TEXT | 分类 |
| location | TEXT | 地点 |
| image_url | TEXT | 图片 URL |
| status | TEXT | 状态（pending/claimed/cancelled） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 招领记录表（claims）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 主键，自增 |
| item_id | INTEGER | 物品 ID |
| claimer_id | INTEGER | 申请人 ID |
| status | TEXT | 状态（pending/approved/rejected） |
| claim_message | TEXT | 申请说明 |
| created_at | DATETIME | 创建时间 |

### 通知表（notifications）
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 用户 ID |
| title | TEXT | 标题 |
| message | TEXT | 消息内容 |
| type | TEXT | 类型（claim/approve/reject/system） |
| is_read | INTEGER | 是否已读（0/1） |
| created_at | DATETIME | 创建时间 |

## 核心业务流程

```
用户注册/登录 -> JWT 认证
    |
    v
发布失物（填写信息 + 上传图片）
    |
    v
其他用户浏览 -> 申请招领
    |
    v
发布者审核申请 -> 通过 / 拒绝
    |
    +--> 通过 -> 物品标记为已招领 -> 通知申请人
    |
    +--> 拒绝 -> 物品继续保持待招领状态
```

## 常见问题

### Q: PowerShell 中 && 不起作用？
A: PowerShell 使用分号 ; 作为命令分隔符，而不是 &&

### Q: 端口被占用？
A: 修改 backend/.env 中的 PORT 和 frontend/vite.config.ts 中的端口配置

### Q: 数据库连接失败？
A: 本项目使用 SQLite，数据库文件 backend/data/lostfound.db 会在首次启动时自动创建，无需手动配置数据库

## 开发建议

### 后端
- 使用 TypeScript 类型检查
- 统一错误处理
- 使用事务处理复杂业务
- 遵循 RESTful API 设计规范

### 前端
- 组件化开发
- 响应式设计
- 良好的用户体验

### 安全
- 密码加密存储
- JWT Token 认证
- 输入验证
- 文件上传安全检查

## 部署建议

### 后端部署
- 使用 PM2 进程管理
- Nginx 反向代理
- HTTPS 证书

### 前端部署
- 构建生产版本：cd frontend && npm run build
- Nginx 静态文件服务
- Gzip 压缩

### 数据库
- 定期备份 backend/data/lostfound.db 文件

## 许可证

MIT License
