import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import createTables from './config/initDatabase';
import { errorHandler } from './middleware/errorHandler';

import userRoutes from './routes/userRoutes';
import itemRoutes from './routes/itemRoutes';
import claimRoutes from './routes/claimRoutes';
import notificationRoutes from './routes/notificationRoutes';
import messageRoutes from './routes/messageRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.json({
    message: '校园失物招领系统 API',
    version: '1.0.0'
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await createTables();
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    console.log('服务器将在无数据库模式下启动');
  }
  
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`API 文档: http://localhost:${PORT}/api`);
  });
};

startServer();
