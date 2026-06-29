# 开发指南

## 项目架构

### 后端架构 (Node.js + Express + TypeScript)

```
backend/
├── src/
│   ├── controllers/     # 业务逻辑控制器
│   │   ├── userController.ts       # 用户相关业务
│   │   ├── itemController.ts       # 失物管理业务
│   │   ├── claimController.ts      # 招领业务
│   │   ├── notificationController.ts # 通知业务
│   │   └── statisticsController.ts # 统计业务
│   ├── routes/          # 路由定义
│   │   ├── userRoutes.ts           # 用户路由
│   │   ├── itemRoutes.ts           # 失物路由
│   │   ├── claimRoutes.ts          # 招领路由
│   │   ├── notificationRoutes.ts   # 通知路由
│   │   └── statisticsRoutes.ts     # 统计路由
│   ├── middleware/      # 中间件
│   │   ├── auth.ts                 # JWT认证中间件
│   │   └── errorHandler.ts         # 错误处理中间件
│   ├── config/          # 配置文件
│   │   ├── database.ts             # 数据库连接配置
│   │   └── initDatabase.ts         # 数据库初始化
│   ├── utils/           # 工具函数
│   │   ├── password.ts             # 密码加密工具
│   │   ├── jwt.ts                  # JWT工具
│   │   └── response.ts             # 响应格式化工具
│   ├── types/           # TypeScript类型定义
│   │   └── index.ts
│   └── app.ts           # 应用入口
├── .env                 # 环境变量配置
├── package.json
└── tsconfig.json
```

### 前端架构 (React + TypeScript + Ant Design)

```
frontend/
├── src/
│   ├── components/      # 可复用组件
│   │   └── MainLayout.tsx          # 主布局组件
│   ├── pages/           # 页面组件
│   │   ├── Login.tsx               # 登录页面
│   │   ├── Register.tsx            # 注册页面
│   │   ├── Home.tsx                # 首页
│   │   ├── ItemDetail.tsx          # 物品详情页
│   │   ├── PublishItem.tsx         # 发布失物页
│   │   ├── MyItems.tsx             # 我的发布页
│   │   ├── MyClaims.tsx            # 我的申请页
│   │   ├── ClaimManagement.tsx     # 招领管理页
│   │   └── Statistics.tsx          # 统计页面
│   ├── services/        # API服务
│   │   └── api.ts                  # API调用封装
│   ├── types/           # TypeScript类型定义
│   │   └── index.ts
│   ├── App.tsx          # 主应用组件
│   ├── main.tsx         # 应用入口
│   └── index.css        # 全局样式
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 核心业务流程

### 1. 用户注册登录流程
```
用户输入信息 → 后端验证 → 密码加密 → 存储数据库 → 返回JWT Token
```

### 2. 发布失物流程
```
用户填写信息 → 上传图片 → 后端验证 → 存储数据库 → 返回成功
```

### 3. 招领申请流程
```
用户申请招领 → 创建申请记录 → 通知物品发布者 → 等待审核
```

### 4. 招领审核流程
```
发布者审核申请 → 通过/拒绝 → 更新申请状态 → 更新物品状态 → 通知申请人
```

## 数据库设计

### 用户表 (users)
- id: 主键
- username: 用户名
- email: 邮箱
- phone: 手机号
- password: 加密密码
- created_at: 创建时间
- updated_at: 更新时间

### 失物表 (items)
- id: 主键
- user_id: 发布者ID
- title: 物品名称
- description: 描述
- category: 分类
- location: 地点
- image_url: 图片URL
- status: 状态 (pending/claimed/cancelled)
- created_at: 创建时间
- updated_at: 更新时间

### 招领记录表 (claims)
- id: 主键
- item_id: 物品ID
- claimer_id: 申请人ID
- status: 状态 (pending/approved/rejected)
- claim_message: 申请说明
- created_at: 创建时间
- updated_at: 更新时间

### 通知表 (notifications)
- id: 主键
- user_id: 用户ID
- title: 标题
- message: 消息内容
- type: 类型 (claim/approve/reject/system)
- is_read: 是否已读
- created_at: 创建时间

## 开发建议

### 后端开发
1. 使用 TypeScript 类型检查
2. 统一错误处理
3. 使用事务处理复杂业务
4. 添加适当的日志记录
5. 遵循 RESTful API 设计规范

### 前端开发
1. 组件化开发
2. 使用 TypeScript 类型检查
3. 统一状态管理
4. 响应式设计
5. 良好的用户体验

### 安全建议
1. 密码加密存储
2. JWT Token 认证
3. 输入验证
4. SQL 注入防护
5. XSS 攻击防护
6. 文件上传安全检查

## 扩展功能建议

### 短期扩展
- 邮箱验证
- 找回密码
- 用户头像上传
- 物品收藏功能
- 评论功能

### 长期扩展
- 移动端适配
- 微信小程序
- 推送通知
- 数据导出
- 管理员后台
- 数据分析报表

## 性能优化

### 后端优化
- 数据库索引优化
- SQL 查询优化
- 缓存机制
- 分页查询
- 图片压缩

### 前端优化
- 组件懒加载
- 图片懒加载
- 代码分割
- 缓存策略
- CDN 加速

## 测试建议

### 单元测试
- 测试工具：Jest
- 测试覆盖率：> 80%
- 测试内容：工具函数、业务逻辑

### 集成测试
- 测试工具：Supertest
- 测试内容：API 接口

### E2E 测试
- 测试工具：Playwright
- 测试内容：用户流程

## 部署建议

### 后端部署
- 使用 PM2 进程管理
- Nginx 反向代理
- HTTPS 证书
- 环境变量管理

### 前端部署
- 构建生产版本
- Nginx 静态文件服务
- CDN 加速
- Gzip 压缩

### 数据库部署
- 主从复制
- 定期备份
- 监控告警
