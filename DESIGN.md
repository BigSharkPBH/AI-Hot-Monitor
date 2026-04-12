# Hot-Monitor 项目设计文档

> 版本：v1.0 | 日期：2026-04-12 | 状态：**待确认**

---

## 一、项目背景与目标

面向 AI 编程博主的**热点监控工具**。核心价值：自动发现 AI/编程领域的最新热点，关键词命中时即时推送通知，让博主永远站在吃瓜第一线。

### 核心痛点

- 手动搜索效率低、容易错过时机
- 热点信息分散在多个平台
- 需要 AI 辅助过滤无效/虚假内容

---

## 二、功能需求

### 2.1 关键词监控

| 功能 | 描述 |
|------|------|
| 添加关键词 | 用户输入要监控的关键词（如 "GPT-5"、"Claude 4"） |
| 启用/暂停 | 每个关键词可单独开启或暂停 |
| 命中检测 | 系统定期扫描数据源，发现包含关键词的内容 |
| AI 真实性核验 | 用 AI 判断命中内容是否真实相关，过滤假新闻/无关内容 |
| 命中通知 | 确认命中后，立即触发浏览器 Push 通知 + 邮件通知 |

### 2.2 热点自动采集

| 功能 | 描述 |
|------|------|
| 定时采集 | 每隔 N 分钟（可配置）自动采集各数据源 |
| 领域过滤 | 用户指定范围（如 "AI 编程"），只关注该领域 |
| AI 热度评分 | AI 对每条内容打 1-10 分 |
| AI 摘要 | 一句话中文总结每条热点 |
| AI 标签提取 | 自动提取关键标签 |
| 热点展示 | 在页面中展示采集到的热点列表，支持筛选和排序 |

### 2.3 通知系统

| 功能 | 描述 |
|------|------|
| 浏览器 Push | 通过 Web Push API 发送系统级通知 |
| 邮件通知 | 通过 SMTP 发送邮件（可选配置） |
| 通知历史 | 页面内查看所有历史通知记录 |
| 通知状态 | 标记已读/未读 |

### 2.4 产品形式（两阶段）

- **第一阶段**：响应式 Web 页面（本文档涵盖范围）
- **第二阶段**：封装为 Agent Skills，供其他 AI 调用（第一阶段完成后进行）

---

## 三、技术方案

### 3.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | React 18 + Vite | 轻量快速，开发体验好 |
| 样式 | Tailwind CSS v3 | 工具类优先，响应式方便 |
| 后端框架 | Node.js + Express | 轻量、灵活 |
| 数据库 | SQLite (better-sqlite3) | 零配置，适合轻量工具项目 |
| AI 服务 | OpenRouter → deepseek/deepseek-chat | 低成本，中文能力强 |
| 定时任务 | node-cron | 服务端后台定时扫描 |
| 邮件通知 | Nodemailer + SMTP | 支持 Gmail/QQ 邮箱等 |
| 浏览器通知 | Web Push API + web-push | 系统级推送 |

### 3.2 数据源

| 数据源 | 内容类型 | 接入方式 | 备注 |
|--------|----------|----------|------|
| Twitter/X | 实时推文、热议话题 | twitterapi.io REST API | 需要 API Key |
| Hacker News | 技术热帖、评论 | 官方 Firebase API（免费） | 无需 Key |
| RSS 聚合 | TechCrunch AI、The Verge、MIT Tech Review | XML RSS 解析 | 无需 Key |
| GitHub Trending | 热门 AI/编程项目 | 页面爬取 | 无需 Key |

### 3.3 AI 功能设计（deepseek/deepseek-chat via OpenRouter）

```
输入：原始文章/推文内容 + 用户关键词
输出：
  - is_relevant: true/false（是否真实相关）
  - relevance_reason: 判断理由
  - heat_score: 1-10（热度评分）
  - summary: 一句话中文摘要
  - tags: string[]（自动标签）
```

### 3.4 数据库 Schema

```sql
-- 关键词表
CREATE TABLE keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 热点内容表
CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,          -- 'twitter' | 'hackernews' | 'rss' | 'github'
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  author TEXT,
  heat_score INTEGER DEFAULT 0,  -- AI 打分 1-10
  summary TEXT,                  -- AI 摘要
  tags TEXT,                     -- JSON 数组字符串
  published_at TEXT,
  collected_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 通知表
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword_id INTEGER,
  topic_id INTEGER,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (keyword_id) REFERENCES keywords(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- 系统配置表
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

---

## 四、项目结构

```
Hot-Monitor/
├── client/                        # 前端 (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx         # 主布局（侧边栏 + 顶栏）
│   │   │   ├── TopicCard.jsx      # 热点卡片
│   │   │   ├── KeywordTag.jsx     # 关键词标签组件
│   │   │   ├── NotificationBell.jsx
│   │   │   └── HeatBadge.jsx      # 热度徽章
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # 主页：实时热点流 + 统计
│   │   │   ├── Keywords.jsx       # 关键词管理
│   │   │   ├── Explorer.jsx       # 热点探索（按来源/标签筛选）
│   │   │   └── Notifications.jsx  # 通知中心
│   │   ├── hooks/
│   │   │   ├── useTopics.js       # 热点数据 hook
│   │   │   └── usePushNotify.js   # 浏览器推送 hook
│   │   ├── api/                   # 前端 API 请求封装
│   │   ├── styles/
│   │   │   └── globals.css        # 全局样式 + CSS 变量
│   │   └── App.jsx
│   ├── public/
│   │   └── sw.js                  # Service Worker
│   ├── index.html
│   └── vite.config.js
│
├── server/                        # 后端 (Node.js + Express)
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js           # 数据库连接 + 初始化
│   │   │   └── schema.sql         # 表结构
│   │   ├── lib/
│   │   │   ├── openrouter.js      # OpenRouter AI 客户端
│   │   │   ├── notifier.js        # 通知发送（Push + 邮件）
│   │   │   └── sources/
│   │   │       ├── twitter.js     # Twitter/X 抓取
│   │   │       ├── hackernews.js  # Hacker News 抓取
│   │   │       ├── rss.js         # RSS 聚合解析
│   │   │       └── github.js      # GitHub Trending 抓取
│   │   ├── services/
│   │   │   ├── collector.js       # 聚合采集器
│   │   │   ├── monitor.js         # 关键词匹配 + AI 核验
│   │   │   └── scheduler.js       # 定时任务管理
│   │   ├── routes/
│   │   │   ├── keywords.js        # GET/POST/DELETE /api/keywords
│   │   │   ├── topics.js          # GET /api/topics + POST /api/topics/collect
│   │   │   ├── notifications.js   # GET/PATCH /api/notifications
│   │   │   ├── push.js            # POST /api/push/subscribe
│   │   │   └── config.js          # GET/PUT /api/config
│   │   └── index.js               # Express 入口
│   └── data/
│       └── hot-monitor.db         # SQLite 数据库文件
│
├── .env.example                   # 环境变量模板
├── DESIGN.md                      # 本文档
└── README.md
```

---

## 五、页面设计

### 5.1 UI 风格：「Signal 信号」暗黑赛博主题

| 元素 | 值 |
|------|-----|
| 背景色 | `#05060f`（深空黑） |
| 主色调 | `#00f0ff`（荧光青）|
| 次要色 | `#7b2dff`（电子紫） |
| 热点警报 | `#ff4240`（警报红）|
| 热榜 | `#ff8c00`（热榜橙）|
| 标题字体 | Space Grotesk |
| 正文字体 | Inter |
| 数据字体 | JetBrains Mono |
| 卡片风格 | 玻璃态（glassmorphism）+ 霓虹边框 |
| 布局 | Bento Grid + 侧边栏导航 |

### 5.2 特色交互动效

- **信号脉冲动画**：关键词命中时，对应卡片触发扩散光环
- **霓虹边框光效**：热度评分越高，卡片发光越强
- **数字滚动**：统计数字变化时有滚动动效
- **来源徽章**：不同数据源有专属颜色标识

### 5.3 页面列表

| 路由 | 页面 | 核心内容 |
|------|------|----------|
| `/` | Dashboard | 今日热点流（Bento Grid）、统计卡（总热点数/命中次数/活跃关键词）、最近通知 |
| `/keywords` | 关键词管理 | 关键词列表、添加/删除/开关、历史命中次数 |
| `/explorer` | 热点探索 | 全量热点列表、按来源/标签/时间筛选、热度排序 |
| `/notifications` | 通知中心 | 通知历史、已读/未读、跳转原文 |

---

## 六、API 设计

### 关键词管理

```
GET    /api/keywords              # 获取所有关键词
POST   /api/keywords              # 添加关键词  { word: string }
PATCH  /api/keywords/:id          # 切换启用状态
DELETE /api/keywords/:id          # 删除关键词
```

### 热点数据

```
GET    /api/topics                # 获取热点列表（支持分页/筛选）
POST   /api/topics/collect        # 手动触发一次采集
GET    /api/topics/stats          # 统计数据
```

### 通知

```
GET    /api/notifications         # 获取通知列表
PATCH  /api/notifications/:id     # 标记已读
POST   /api/push/subscribe        # 注册浏览器 Push 订阅
```

### 配置

```
GET    /api/config                # 获取配置
PUT    /api/config                # 更新配置（采集间隔、邮件设置等）
```

---

## 七、环境变量配置

```env
# OpenRouter AI
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=deepseek/deepseek-chat

# Twitter/X (twitterapi.io)
TWITTER_API_KEY=your_key_here

# 邮件通知 (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
NOTIFY_EMAIL=recipient@gmail.com

# Web Push
VAPID_PUBLIC_KEY=（启动时自动生成）
VAPID_PRIVATE_KEY=（启动时自动生成）

# 服务配置
PORT=3001
COLLECT_INTERVAL_MINUTES=30
```

---

## 八、开发步骤计划

| 步骤 | 内容 | 产出 |
|------|------|------|
| Step 1 | 项目脚手架 + 依赖安装 + 数据库初始化 | 可运行的空项目骨架 |
| Step 2 | OpenRouter AI 模块 + 4 个数据源抓取 | 可独立测试的数据采集层 |
| Step 3 | 采集服务 + 关键词监控服务 + 定时调度 | 完整后端业务逻辑 |
| Step 4 | Express API 路由层 + 通知发送 | 后端 API 可用 |
| Step 5 | 前端布局 + 全局主题样式 | 页面骨架 + 视觉风格确立 |
| Step 6 | Dashboard 主页 | 核心页面完成 |
| Step 7 | 关键词管理 + 热点探索页 | 功能页面完成 |
| Step 8 | 通知中心 + 浏览器 Push + 邮件 | 通知系统完成 |
| Step 9 | 联调测试 + BUG 修复 | 可验收的完整产品 |
| Step 10 | Agent Skills 封装 | 第二阶段产出 |

---

## 九、待确认事项

请确认以下几点，无误后立即开始开发：

1. **技术栈**：React + Vite（前端）、Node.js + Express（后端）、SQLite（数据库）——是否确认？
2. **AI 模型**：deepseek/deepseek-chat via OpenRouter——是否确认？
3. **数据源**：Twitter/X + HackerNews + RSS + GitHub Trending——是否确认？（Twitter 需要你提供 twitterapi.io 的 API Key）
4. **通知方式**：浏览器 Push + 邮件——是否确认？
5. **UI 风格**：「Signal」暗黑赛博风格——是否确认？还是希望换其他风格？
6. **采集频率**：默认每 30 分钟采集一次——是否合适？
7. **OpenRouter API Key**：开发结束后你会提供，还是现在就给我配置好？

---

## 十、开发规范与注意事项

### 10.1 必须使用 MCP 获取最新文档

**在对接任何第三方库或 API 之前，必须通过 MCP 查询其最新官方文档，禁止依赖训练数据中的历史知识直接生成代码。**

涉及范围包括但不限于：

| 模块 | 必须查询的内容 |
|------|--------------|
| OpenRouter API | 最新的请求格式、模型 ID、认证方式 |
| twitterapi.io | 最新的接口路径、参数结构、鉴权方式 |
| web-push / VAPID | 最新的密钥生成与订阅推送写法 |
| better-sqlite3 | 当前版本的初始化与查询 API |
| node-cron | 最新的任务定义语法 |
| Vite 配置 | 当前版本的 proxy、alias 等配置写法 |

> 原因：第三方 API 和库的接口会频繁变动（尤其是 Twitter/X），使用过时写法会导致运行时报错，MCP 可拉取最新文档确保代码有效。

---

*确认无误请回复「确认开始」，如有修改请直接指出。*
