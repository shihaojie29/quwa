# 去哇 Node.js + MySQL 后端设计

## 目标

为当前 uniapp 微信小程序实现一套独立后端服务，替代本地 mock/storage 数据源。第一版覆盖现有前端已经具备的旅行概览、行程、账单、备注、清单能力，并提供可导入 MySQL 的数据库 schema 和种子数据。

## 范围

包含：
- Node.js HTTP API 服务，放在 `server/`。
- MySQL schema、seed、迁移执行脚本。
- 当前前端数据模型对应的 CRUD API。
- 基础输入校验、错误响应、开发模式用户识别。
- 不依赖真实 MySQL 的接口测试，以及 schema 完整性测试。

不包含：
- 正式微信 `code2Session` 登录流程。
- 支付、地图 SDK、图片上传、多人实时协同。
- 前端 repository 全量切换到远端 API。

## 技术方案

使用 `Express + mysql2 + TypeScript + Zod`。Express 足够轻量，适合当前项目；`mysql2/promise` 保持 SQL 可控；Zod 负责请求体校验。后端与前端同仓但独立目录、独立 tsconfig，避免影响 uniapp 编译。

## 数据库设计

核心表：
- `users`：预留微信用户身份，包含 `openid`、昵称、头像。
- `trips`：旅行主表，包含名称、目的地、日期、预算、状态、拥有者。
- `trip_members`：旅行内成员，用于头像、AA、付款人。
- `trip_reminders`：旅行提醒，支持置顶。
- `itinerary_days`：按旅行日期拆分的行程天。
- `itinerary_items`：活动或交通条目，交通字段为空时兼容活动。
- `expenses`：支出明细，关联付款成员。
- `notes`：旅行备注。
- `checklist_items`：打包清单。

第一版以 `trips.owner_user_id` 做授权边界；请求通过 `X-User-Id` 提供开发用户。后续接微信登录时，用 `users.openid` 映射真实用户即可。

## API 设计

基础：
- `GET /health`
- `GET /api/trips/:tripId/bootstrap`：一次性返回前端首页需要的 `trip`、`itineraryDays`、`expenses`、`notes`、`checklistItems`。

旅行：
- `GET /api/trips/:tripId`
- `PUT /api/trips/:tripId`
- `PATCH /api/trips/:tripId/budget`

行程：
- `GET /api/trips/:tripId/itinerary-days`
- `POST /api/trips/:tripId/itinerary-days/:date/items`
- `PUT /api/trips/:tripId/itinerary-days/:date/items/:itemId`
- `DELETE /api/trips/:tripId/itinerary-days/:date/items/:itemId`

账单：
- `GET /api/trips/:tripId/expenses`
- `POST /api/trips/:tripId/expenses`
- `PUT /api/trips/:tripId/expenses/:expenseId`
- `DELETE /api/trips/:tripId/expenses/:expenseId`

备注：
- `GET /api/trips/:tripId/notes`
- `POST /api/trips/:tripId/notes`
- `PUT /api/trips/:tripId/notes/:noteId`
- `DELETE /api/trips/:tripId/notes/:noteId`

清单：
- `GET /api/trips/:tripId/checklist-items`
- `POST /api/trips/:tripId/checklist-items`
- `PUT /api/trips/:tripId/checklist-items/:itemId`
- `DELETE /api/trips/:tripId/checklist-items/:itemId`

## 错误处理

统一 JSON 错误：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": []
  }
}
```

常用状态码：
- `400`：请求体或参数无效。
- `404`：资源不存在或无访问权。
- `500`：未预期服务端错误。

## 测试策略

接口测试使用内存 repository，不依赖 MySQL 服务，验证路由、校验、响应结构和状态变更。数据库测试读取 `schema.sql`，确认核心表存在。实际 MySQL 连接通过启动脚本和迁移脚本验证。

