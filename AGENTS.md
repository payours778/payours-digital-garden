<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

> **注意**：以下内容不是规则约束，仅作为项目架构说明，帮助你更快了解这个项目。

# 项目说明

## 项目结构

```
blog-test/
├── frontend/           # Next.js 前端
├── backend/            # Express 后端
└── database/           # 数据库相关文件
```

## 技术栈

### 前端 (frontend/)
- Next.js 16.2.6 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- next-themes (暗色/亮色主题)
- Lucide React (图标库)

### 后端 (backend/)
- Express.js
- TypeScript
- better-sqlite3 (SQLite 数据库)

## 目录说明

| 目录 | 说明 |
|------|------|
| `frontend/` | Next.js 前端项目（页面、组件、状态管理） |
| `backend/` | Express 后端项目（API、数据库） |
| `database/` | 数据库文件（schema.sql） |

## 后端目录结构

```
backend/
├── src/
│   ├── routes/        # 路由定义
│   ├── controllers/   # 控制器
│   ├── models/        # 数据模型
│   ├── middleware/    # 中间件
│   ├── db/            # 数据库连接
│   └── app.ts         # 入口文件
├── data/              # SQLite 数据库文件目录
└── package.json
```

## 数据库

- 数据库文件存放在 `backend/data/` 目录
- 表结构定义在 `database/schema.sql`
- 初始化命令：`cd backend && npm run db:init`

## 开发命令

### 前端
```bash
cd frontend
npm install
npm run dev
```

### 后端
```bash
cd backend
npm install
npm run dev
```

### 统一命令（根目录）
```bash
npm run dev:frontend   # 启动前端
npm run dev:backend    # 启动后端
```
