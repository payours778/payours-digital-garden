---
name: fish-room-pool-redesign
overview: 重新设计摸鱼(fish)聊天室：昵称固定为登录账号；引入房间资源池中控，支持随机不可猜的私有房(可临时/长期、公开/私密)、2个持久公开大厅房；空房间/临时房自动销毁；聊天记录按房间类型持久化。替换原有固定FISHxx编号房间逻辑。
design:
  architecture:
    framework: react
    component: shadcn
  styleKeywords:
    - Glassmorphism
    - 靛紫渐变
    - 暗亮双主题
    - 简洁高级
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 24px
      weight: 700
    subheading:
      size: 16px
      weight: 600
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#6366F1"
      - "#8B5CF6"
      - "#10B981"
    background:
      - "#F8FAFC"
      - "#0F172A"
    text:
      - "#1E293B"
      - "#F1F5F9"
    functional:
      - "#EF4444"
      - "#10B981"
todos:
  - id: explore-fish
    content: 用 [subagent:code-explorer] 复核 fish 全部引用与 db 双源一致性
    status: completed
  - id: db-schema
    content: 扩展 fish_rooms 字段并改公开房初始化，移除 FISHxx 预创建（index.ts + migrate-db.js）
    status: completed
    dependencies:
      - explore-fish
  - id: room-pool
    content: 新增 backend/src/services/roomPool.ts 资源池中控（公开房/私有房/每日清理）
    status: completed
    dependencies:
      - db-schema
  - id: controller-refactor
    content: 重构 fishController 昵称绑定账号、接入 RoomPool、临时房清理
    status: completed
    dependencies:
      - room-pool
  - id: app-timer
    content: 在 app.ts 注册每日清理定时器并启动初始化公开房
    status: completed
    dependencies:
      - room-pool
  - id: frontend-redesign
    content: 重构 fish/page.tsx：昵称固定、公开大厅区块、创房选项表单
    status: completed
    dependencies:
      - controller-refactor
  - id: verify-fish
    content: 验证入口/创房/加入/公开房/每日清理与现有模块不受影响
    status: completed
    dependencies:
      - frontend-redesign
---

## 产品概述

重新设计摸鱼（fish）聊天室，将原有「固定编号房间 + 自由昵称」模式重构为「房间资源池中控 + 随机不可猜 code + 昵称绑定账号」的模型。新增 2 个持久公开大厅房，私有房支持公开/私密与临时/长期选项，临时房每日定时清理销毁，聊天记录按房间类型持久化或随销毁清除。

## 核心功能

- 昵称固定为登录账号（`useAuth().user.username`），不再允许自由输入。
- 房间资源池（RoomPool）中控：公开房（2 个持久）、私有房（随机 code `rm_<hex>`，仅持链接可进）。
- 创房表单支持选择：公开/私密、临时/长期。
- 空房间销毁：临时房每日定时清理一次，无活跃成员即销毁房间并删除其消息；长期房与公开房持久保留。
- 聊天记录：公开房与长期私有房持久化可见；临时房保留历史直到每日清理时随房间一起删除。
- 前端摸鱼首页新增「公开大厅」区块，直接列出并可进入 2 个公开房；移除固定编号 FISHxx 入口与昵称输入框。

## 边界与约束

- 不改动 baoweiadou（保卫阿斗）、farm（农场）等其它模块；仅重构 fish 相关后端、数据库建表/初始化、前端 fish 页面。
- 房间 code 随机不可猜，杜绝 fish01 这类编号被外人进入。
- 数据库为 sql.js（内存 + saveDb 落盘），RoomPool 内存态与 DB 双写。
- 聊天记录可见性遵循确认结论：临时房保留历史至清理删除。

## 技术栈选择

- 后端：Express + sql.js（沿用 `getDb`/`saveDb`，`db.exec`/`db.run`），TypeScript
- 前端：Next.js 16 App Router + React 19 + TypeScript + Tailwind v4
- 鉴权：复用 `requireAuth`，房间归属用 `req.user.id`，昵称用 `req.user.username`
- 状态/资源池：后端内存 Map 维护 RoomPool，与 DB 双写（创建/销毁/每日清理均 `saveDb()`）

## 实现思路

核心是将「预创建固定编号房间」替换为「RoomPool 中控 + 动态创建随机 code 房间」：

1. 数据库表扩展：在 `fish_rooms` 增加 `owner_id`、`room_type`('public'|'private')、`lifecycle`('temp'|'permanent')、`is_public`(0/1)、`destroyed_at`；保留 `fish_room_participants` 与 `fish_messages`。
2. 启动时初始化 2 个公开大厅房（`PUBLIC-LOBBY-1/2`，permanent/public），移除原 `FISH00..FISH09` 预创建循环。
3. `createRoom`：随机生成 `rm_<12 hex>` code，`owner_id=req.user.id`，昵称为 `req.user.username`，按 `is_public`/`lifecycle` 选项落库；RoomPool 登记。
4. `joinRoom`：按 code 加入，昵称强制用 `req.user.username`，校验房间未被销毁、未满员。
5. 每日清理定时器：删除 `lifecycle='temp'` 且活跃参与者为 0 的房间，并级联删 `fish_messages` 与 `fish_room_participants`，`saveDb()`。
6. 消息：统一持久化；`getMessages` 返回全部房间消息（临时房历史保留至清理）。
7. 前端：`useAuth().user.username` 作为昵称；首页「公开大厅」区块列 2 公开房；创房表单加 公开/私密 + 临时/长期 选择；移除昵称输入与固定编号历史。

## 实现要点

- **RoomPool 设计**：后端模块 `backend/src/services/roomPool.ts`（[NEW]）维护内存索引（code→room、owner→rooms），提供 `ensurePublicRooms()`、`createPrivateRoom()`、`destroyTempRooms()`、`getRoomByCode()`，所有变更走 DB 并 `saveDb()`，避免内存与落盘不一致。
- **DB 双写与幂等**：建表用 `CREATE TABLE IF NOT EXISTS`；新增列用现有 `ensureCol` 模式补齐；公开房初始化用 `INSERT OR IGNORE` 按固定 code 防重复。
- **定时清理**：在 `app.ts` 启动后 `setInterval(destroyTempRooms, 24*3600*1000)`，首次启动立即跑一次；清理仅针对 temp 且无活跃成员，长期/公开房不受影响。
- **参与者活跃判定**：沿用 `last_active` + 心跳（`getRoomByCodeFull`/`getMessages` 更新），清理时按 `last_active >= datetime('now','-3600 seconds')` 判活跃。
- **聊天记录可见性**：按确认，临时房保留历史到清理删除；所有房间 `getMessages` 返回全量，不做进房后裁剪。
- **前端兼容**：移除 `LS_NICKNAME` 昵称输入逻辑；`LS_ROOMS` 历史仍可用于「我的房间」（长期私有房重连），公开房改为大厅区块直接进。
- **资源路径/性能**：RoomPool 内存 Map 查询 O(1)；每日清理为低频批处理，不影响在线轮询（前端 2s 轮询 `getMessages` 保持）。

## 架构设计

```mermaid
flowchart LR
  subgraph 前端 fish/page.tsx
    LOBBY[公开大厅区块] -->|直接进| PUB[公开房]
    CREATE[创房表单 公开/私密+临时/长期] -->|POST /api/fish/room| POOL
    JOIN[持链接进] -->|POST /api/fish/room/:code/join| POOL
  end
  subgraph 后端 RoomPool[roomPool.ts 中控]
    POOL[RoomPool] -->|读写| DB[(sql.js fish_rooms/participants/messages)]
    TIMER[每日定时器 destroyTempRooms] --> POOL
  end
  DB --> CTRL[fishController]
  POOL --> CTRL
  CTRL --> ROUTE[/api/fish/*]
```

## 目录结构

```
backend/src/
├── services/
│   └── roomPool.ts          # [NEW] 房间资源池：内存 Map + DB 双写，公开房初始化、私有房创建、每日清理、按 code 查询
├── controllers/
│   └── fishController.ts     # [MODIFY] createRoom/joinRoom/getMessages 改昵称为 req.user.username；接 RoomPool；临时房每日清理接入；移除固定编号逻辑
├── routes/
│   └── fish.ts               # [MODIFY] 路由保持稳定，新增 /rooms/public 获取公开大厅列表（可选）
├── db/
│   └── index.ts              # [MODIFY] fish_rooms 增加 owner_id/room_type/lifecycle/is_public/destroyed_at；移除 FISHxx 预创建，改为 ensurePublicRooms；索引补充
└── app.ts                    # [MODIFY] 启动后注册每日清理 setInterval

database/
└── migrate-db.js             # [MODIFY] 同步 fish_rooms 新列与公开房初始化逻辑

frontend/src/app/fish/
└── page.tsx                  # [MODIFY] 昵称固定 useAuth().user.username；新增公开大厅区块；创房表单加 公开/私密+临时/长期；移除昵称输入与固定编号历史
```

## 关键代码结构（RoomPool 接口示意）

```ts
// backend/src/services/roomPool.ts
export interface RoomRow {
  id: number; code: string; owner_id: number | null;
  room_type: 'public' | 'private'; lifecycle: 'temp' | 'permanent';
  is_public: 0 | 1; max_participants: number; destroyed_at: string | null;
  created_at: string;
}
export const roomPool: {
  ensurePublicRooms(): Promise<void>;
  createPrivateRoom(opts: { ownerId: number; username: string; isPublic: boolean; lifecycle: 'temp' | 'permanent'; maxParticipants?: number }): Promise<{ room: RoomRow; token: string }>;
  destroyTempRooms(): Promise<number>;
  getRoomByCode(code: string): Promise<RoomRow | null>;
};
```

## 设计风格

沿用现有摸鱼聊天室的玻璃拟态（Glassmorphism）+ 靛紫渐变风格，保持与博客站一致的暗/亮主题。重构后首页新增「公开大厅」区块，创房表单改为带选项卡片的模态/内联面板，整体保持简洁高级感。

## 页面区块（fish/page.tsx）

1. 顶部导航区：标题「摸鱼聊天室」+ 当前账号昵称展示（固定为 user.username）。
2. 公开大厅区块：2 个公开房卡片（房名 + 在线人数 + 直接进入按钮），玻璃卡片 + 渐变图标。
3. 创房面板：公开/私密 切换、临时/长期 切换（分段控件），「创建房间」按钮，创建后返回随机链接供复制分享。
4. 我的房间（长期私有房历史）：从 localStorage 读取，显示可重连房间。
5. 聊天视图：复用现有消息气泡/参与者栏/输入栏，仅昵称改为账号名。

## Agent Extensions

### SubAgent

- **code-explorer**
- 用途：在重构前复核 fish 全部引用点（routes/controllers/db/frontend page）、`requireAuth` 挂载结构、`authFetch` 调用约定，以及 db 建表/初始化在 `index.ts` 与 `migrate-db.js` 的 dual-source 一致性，确保 RoomPool 接入无遗漏。
- 预期结果：确认所有需修改文件清单、字段命名一致、前端调用契约，避免重构后遗漏导致运行错误。