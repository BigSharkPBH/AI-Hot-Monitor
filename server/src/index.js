require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const { initWebPush, initMailer } = require('./lib/notifier');
const { startScheduler } = require('./services/scheduler');

// 路由
const keywordsRouter = require('./routes/keywords');
const topicsRouter = require('./routes/topics');
const notificationsRouter = require('./routes/notifications');
const pushRouter = require('./routes/push');
const configRouter = require('./routes/config');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// API 路由
app.use('/api/keywords', keywordsRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/push', pushRouter);
app.use('/api/config', configRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动
async function start() {
  // 初始化数据库
  await initDb();
  console.log('[Server] 数据库初始化完成');

  // 初始化通知服务
  initWebPush();
  initMailer();

  // 读取采集间隔配置
  const { db } = require('./db');
  const intervalRes = await db.execute(
    "SELECT value FROM config WHERE key = 'collect_interval_minutes'"
  );
  const interval = parseInt(intervalRes.rows[0]?.value || '30');

  // 启动定时任务
  startScheduler(interval);

  app.listen(PORT, () => {
    console.log(`[Server] Hot-Monitor 后端运行在 http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('[Server] 启动失败:', err);
  process.exit(1);
});
