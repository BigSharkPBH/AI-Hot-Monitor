-- Hot-Monitor 数据库 Schema

-- 关键词监控表
CREATE TABLE IF NOT EXISTS keywords (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  word       TEXT    NOT NULL UNIQUE,
  is_active  INTEGER NOT NULL DEFAULT 1,
  hit_count  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 热点内容表
CREATE TABLE IF NOT EXISTS topics (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  source       TEXT    NOT NULL,  -- 'twitter'|'hackernews'|'rss'|'github'
  source_id    TEXT,              -- 原始平台 ID，用于去重
  title        TEXT    NOT NULL,
  content      TEXT,
  url          TEXT,
  author       TEXT,
  heat_score   INTEGER NOT NULL DEFAULT 0,  -- AI 打分 1-10
  summary      TEXT,                         -- AI 摘要
  tags         TEXT    NOT NULL DEFAULT '[]', -- JSON 数组字符串
  published_at TEXT,
  collected_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- source_id 唯一索引（同一来源同一条内容只入库一次）
CREATE UNIQUE INDEX IF NOT EXISTS idx_topics_source_id
  ON topics (source, source_id)
  WHERE source_id IS NOT NULL;

-- 通知记录表
CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword_id INTEGER NOT NULL,
  topic_id   INTEGER NOT NULL,
  message    TEXT    NOT NULL,
  is_read    INTEGER NOT NULL DEFAULT 0,
  sent_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id)   REFERENCES topics(id)   ON DELETE CASCADE
);

-- Push 订阅表 (存储浏览器 Push 订阅对象)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint     TEXT    NOT NULL UNIQUE,
  subscription TEXT    NOT NULL,  -- JSON 序列化的订阅对象
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 系统配置表 (key-value)
CREATE TABLE IF NOT EXISTS config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 预置默认配置
INSERT OR IGNORE INTO config (key, value) VALUES
  ('collect_interval_minutes', '30'),
  ('topics_domain',            'AI 编程'),
  ('max_topics_per_collect',   '50');
