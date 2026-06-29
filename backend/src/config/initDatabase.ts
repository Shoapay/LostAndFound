import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'lostfound.db');
const db = new Database(dbPath);

const createTables = async () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      location TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'claimed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      claimer_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      claim_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      FOREIGN KEY (claimer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      type TEXT DEFAULT 'system' CHECK(type IN ('claim', 'approve', 'reject', 'system', 'message')),
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      item_id INTEGER,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
    CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
    CREATE INDEX IF NOT EXISTS idx_claims_item_id ON claims(item_id);
    CREATE INDEX IF NOT EXISTS idx_claims_claimer_id ON claims(claimer_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
  `);

  try {
    const tableInfo = db.prepare('PRAGMA table_info(items)').all() as any[];
    const hasType = tableInfo.some(col => col.name === 'type');
    
    if (!hasType) {
      console.log('添加 type 字段到 items 表...');
      db.exec('ALTER TABLE items ADD COLUMN type TEXT NOT NULL DEFAULT \'found\' CHECK(type IN (\'lost\', \'found\'))');
      console.log('type 字段添加成功');
    }
  } catch (error) {
    console.error('检查/添加 type 字段失败:', error);
  }

  const testUser = db.prepare('SELECT * FROM users WHERE username = ?').get('testuser');
  
  if (!testUser) {
    console.log('创建测试用户...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    db.prepare('INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)').run(
      'testuser',
      'test@example.com',
      hashedPassword,
      '13800138000'
    );
    console.log('测试用户 testuser 创建成功 (密码: 123456)');
  }

  const testUser2 = db.prepare('SELECT * FROM users WHERE username = ?').get('testuser2');
  
  if (!testUser2) {
    console.log('创建第二个测试用户...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    db.prepare('INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)').run(
      'testuser2',
      'test2@example.com',
      hashedPassword,
      '13800138001'
    );
    console.log('测试用户 testuser2 创建成功 (密码: 123456)');
  }
};

export default createTables;
export { db };
