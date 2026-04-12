const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/hot-monitor.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// 确保 data 目录存在
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = createClient({
  url: `file:${DB_PATH}`,
});

/**
 * 初始化数据库：执行 schema.sql
 */
async function initDb() {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  // @libsql/client 支持 executeMultiple 批量执行多条语句
  await db.executeMultiple(schema);
}

module.exports = { db, initDb };
