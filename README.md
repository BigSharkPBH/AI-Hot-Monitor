# Hot-Monitor — AI 热点雷达

面向 AI 编程博主的热点监控工具。自动采集 Twitter/X、Hacker News、GitHub Trending、RSS、SearXNG、Reddit 等平台的最新热点，通过 AI 评分、摘要和关键词命中，实时推送通知。

---

## 快速开始

### 环境要求

- Node.js v18+
- Git Bash（Windows）或 macOS/Linux 终端

---

## 一、首次安装

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd Hot-Monitor

# 2. 安装后端依赖
cd server
npm install

# 3. 安装前端依赖
cd ../client
npm install
```

---

## 二、配置环境变量

```bash
# 复制模板
cp .env.example server/.env
```

编辑 `server/.env`，填入以下配置：

| 变量 | 说明 | 是否必填 |
|------|------|--------|
| `OPENROUTER_API_KEY` | OpenRouter API Key（AI 分析） | ✅ 必填 |
| `TWITTER_API_KEY` | twitterapi.io API Key | 可选 |
| `SMTP_HOST/USER/PASS` | 邮件发送配置 | 可选 |
| `VAPID_PUBLIC_KEY` | 浏览器 Push 公钥 | 可选 |
| `VAPID_PRIVATE_KEY` | 浏览器 Push 私钥 | 可选 |

**生成 VAPID 密钥（浏览器 Push 推送所需）：**

```bash
cd server
npm run gen-vapid
# 将输出的两个 key 填入 server/.env
```

---

## 三、启动项目

需要开两个终端分别启动后端和前端。

### 启动后端

```bash
cd server
node src/index.js
```

启动成功后输出：

```
[Server] 数据库初始化完成
[Push] Web Push 初始化成功
[Mail] 邮件发送器初始化成功
[Scheduler] 定时任务已启动，cron: */30 * * * *
[Server] Hot-Monitor 后端运行在 http://localhost:3001
```

### 启动前端（另开一个终端）

```bash
cd client
npm run dev
```

启动成功后访问：**http://localhost:5173**

---

## 四、停止项目

### 停止方式

在各自终端中按 **`Ctrl + C`** 即可停止。

### 强制停止占用端口的进程（Windows）

如果重启时提示端口 3001 被占用：

**PowerShell：**
```powershell
# 查找占用 3001 端口的进程
netstat -ano | findstr ":3001" | findstr LISTENING

# 强制终止（替换 <PID> 为上面查到的数字）
Stop-Process -Id <PID> -Force
```

**Git Bash：**
```bash
PID=$(netstat -ano | grep ':3001 ' | grep LISTEN | awk '{print $5}')
powershell.exe -Command "Stop-Process -Id $PID -Force"
```

---

## 五、开发模式（热重载）

```bash
# 后端热重载（需安装 nodemon）
cd server
npm run dev

# 前端热重载（Vite 默认支持）
cd client
npm run dev
```

---

## 六、构建生产版

```bash
# 构建前端静态文件
cd client
npm run build
# 产物在 client/dist/
```

---

## 七、API 接口（后端 :3001）

| 接口 | 说明 |
|------|------|
| `GET /api/health` | 健康检查 |
| `GET /api/topics` | 获取热点列表 |
| `POST /api/topics/collect` | 手动触发采集 |
| `GET /api/topics/stats` | 统计数据 |
| `GET /api/keywords` | 获取关键词列表 |
| `POST /api/keywords` | 添加关键词 |
| `PATCH /api/keywords/:id` | 启用/暂停关键词 |
| `DELETE /api/keywords/:id` | 删除关键词 |
| `GET /api/notifications` | 获取通知列表 |
| `PATCH /api/notifications/:id` | 标记已读 |
| `GET /api/config` | 获取配置 |
| `PUT /api/config` | 更新配置 |
| `GET /api/push/vapid-public-key` | 获取 Push 公钥 |
| `POST /api/push/subscribe` | 注册 Push 订阅 |

---

## 八、项目结构

```
Hot-Monitor/
├── client/          # 前端 React + Vite + Tailwind CSS
├── server/          # 后端 Node.js + Express + LibSQL
│   ├── src/
│   │   └── lib/sources/  # 数据源：twitter / hackernews / rss / github / searxng / reddit
│   ├── data/        # SQLite 数据库（运行时生成，已 gitignore）
│   └── .env         # 环境变量（已 gitignore，勿提交）
├── .env.example     # 环境变量模板
└── DESIGN.md        # 完整设计文档
```

---

## 九、数据源与质量过滤

| 数据源 | 说明 | 是否需要 Key |
|--------|------|----------|
| Twitter/X | 原创推文，内置互动量过滤（点赞≥50/转发≥20/浏览≥2000） | 需要 |
| Hacker News | 技术热帖（topstories + newstories 合并） | 不需要 |
| RSS | TechCrunch AI、ArXiv CS.AI、MIT Tech Review | 不需要 |
| GitHub Trending | 热门 AI/编程项目日榜 | 不需要 |
| SearXNG | 元搜索引擎，聚合 Google/Bing/DuckDuckGo | 不需要 |
| Reddit | r/artificial、r/MachineLearning 等技术社区 | 不需要 |

---

## 十、常见问题

**Q: 采集后没有数据？**  
A: 检查 `server/.env` 中的 `OPENROUTER_API_KEY` 是否填写正确。HackerNews、RSS、GitHub 无需 Key 即可采集。

**Q: 浏览器推送不生效？**  
A: 需要先运行 `npm run gen-vapid` 生成 VAPID 密钥并填入 `.env`，重启后端，再在前端通知页面点击「开启推送」并允许浏览器通知权限。

**Q: 端口 3001 被占用？**  
A: 参考「四、停止项目」中的强制停止命令。
