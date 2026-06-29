# 校园失物招领系统 - 快速启动指南

## PowerShell 命令说明

在 Windows PowerShell 中，请使用以下命令格式：

### 安装依赖
```powershell
# 后端
cd backend
npm install
cd ..

# 前端
cd frontend
npm install
cd ..
```

### 启动项目
```powershell
# 启动后端（新窗口）
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# 启动前端（新窗口）
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

## 或者使用提供的批处理文件

直接双击运行：
- `install.bat` - 安装所有依赖
- `start.bat` - 启动项目

## 下一步操作

1. **配置数据库**
   - 确保 MySQL 服务已启动
   - 创建数据库：`CREATE DATABASE lostfound_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
   - 或导入 `database.sql` 文件

2. **配置环境变量**
   - 编辑 `backend\.env` 文件
   - 设置数据库连接信息
   - 设置 JWT 密钥

3. **启动项目**
   - 运行 `start.bat` 或手动启动前后端服务

4. **访问系统**
   - 前端：http://localhost:5173
   - 后端：http://localhost:3000

## 常见问题

### Q: PowerShell 中 `&&` 不起作用？
A: PowerShell 使用分号 `;` 作为命令分隔符，而不是 `&&`

### Q: 端口被占用？
A: 修改 `backend\.env` 中的 PORT 和 `frontend\vite.config.ts` 中的端口配置

### Q: 数据库连接失败？
A: 检查 MySQL 服务是否启动，确认 `.env` 文件中的数据库配置正确
