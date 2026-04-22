# 去哇 uniapp 微信小程序设计文档

- 日期：2026-04-21
- 项目：`quwa`
- 主题：基于 `docs/去哇 v2 手账风.html` 实现 uniapp 微信小程序
- 状态：已确认设计，待用户审阅，未进入实现

## 1. 背景与目标

当前项目是一个空的 uniapp 模板，已有页面仅包含默认示例内容。目标是在该项目中实现一版微信小程序，视觉气质参考 [docs/去哇 v2 手账风.html](/Users/shihaojie/project/quwa/docs/去哇%20v2%20手账风.html)，但不是简单做静态稿，而是落成可交互、可持久化、后续可接后端的多页面产品原型。

本次设计的目标优先级如下：

1. 高保真继承参考稿的手账风视觉语言。
2. 按微信小程序和 uniapp 的交互习惯重构为真实可用页面。
3. 首页默认进入，底部使用自定义 tab bar。
4. 采用 4 个主 tab：`首页`、`行程`、`账单`、`备注`。
5. 支持接近真实产品的一版本地交互，包括增删改、计算和持久化。
6. 预留统一 repository 接口层，当前底层使用本地存储，后续可切换到后端。

## 2. 范围

### 2.1 本期范围

- 4 个主 tab 页面：
  - 首页
  - 行程
  - 账单
  - 备注
- 1 个非主 tab 二级页面：
  - 出发清单
- 自定义底部导航
- 本地 demo seed 数据初始化
- 本地持久化
- 页面内新增、编辑、删除、状态更新
- 汇总统计和衍生计算

### 2.2 不在本期范围

- 真实后端联调
- 用户登录
- 多人实时同步
- 图片上传、语音消息、地图 SDK
- 分享、支付、通知等平台能力
- 复杂权限系统

## 3. 设计决策摘要

### 3.1 选定方案

采用“页面壳 + 领域模块”的实现方式。

理由：

- 比直接把参考稿翻译成单页更适合 uniapp 多页面小程序结构。
- 视觉可以尽量还原参考稿，同时把状态和数据读写从页面中拆出来。
- 后续接接口时可以替换 repository 实现，而不需要重写页面。

### 3.2 关键设计决策

- 主结构采用 4 个主 tab，而不是参考稿原本的 5 个 tab。
- 原 `packing` 能力降级为二级页面“出发清单”，从首页和行程页进入。
- 不使用原生 `tabBar`，改用自定义底部导航以保留参考稿视觉。
- 不引入 Pinia，当前阶段用 `composables + repository` 组织状态和读写。
- 所有 repository API 统一使用异步接口签名，底层先用 `uni.setStorage`。

## 4. 信息架构

### 4.1 页面结构

- `pages/home/index`
- `pages/itinerary/index`
- `pages/expense/index`
- `pages/notes/index`
- `pages/checklist/index`

### 4.2 导航结构

- 启动页：`首页`
- 主导航：底部自定义 tab bar
- 二级导航：
  - 首页进入清单页
  - 行程页进入清单页
  - 首页“查看全部行程”跳转到 `pages/itinerary/index`
  - 首页预算区域跳转到 `pages/expense/index`
  - 首页备注预览跳转到 `pages/notes/index`

说明：

- 首页中的这些入口都只跳转到已存在的 4 个主 tab 页面，不新增同类详情页。
- 由于本项目不使用原生 `tabBar`，主 tab 间页面切换由自定义导航组件统一处理。
- 主 tab 之间统一采用页面级跳转，不保留原生 `tabBar` 的历史栈语义。

## 5. 视觉设计方向

目标是把参考稿中的“手账风”迁移到小程序语境，而不是逐像素复刻 Web 布局。

### 5.1 保留的视觉语言

- 暖色纸张背景
- 票据感 Hero 区
- 胶带、印章、虚线边框、便签等装饰语义
- 高饱和暖橙主色渐变
- 圆角卡片与轻阴影
- 标题与正文的层级对比

### 5.2 小程序化调整

- 绝对定位装饰减少，改成流式布局
- 输入、弹层、底部导航按小程序触控习惯调整
- 长按编辑改成点击进入弹层编辑
- 所有交互控件确保可见、可发现、可点击

### 5.3 样式组织

- 在 `src/uni.scss` 中定义主题变量和基础工具类
- 各页面和组件内部使用 `scss` scoped
- 抽取公共视觉组件，避免在多个页面重复手写票根、虚线描边和卡片结构

## 6. 架构设计

### 6.1 总体架构

```text
Page
  -> Composable
    -> Repository
      -> Local Storage Adapter
```

说明：

- `Page` 负责布局、事件绑定和展示。
- `Composable` 负责状态管理、计算属性和页面动作。
- `Repository` 负责数据读写边界。
- `Local Storage Adapter` 负责本地持久化。

### 6.2 目录建议

```text
src/
  components/
    journal/
      TravelPageShell.vue
      JournalTabBar.vue
      HeroTicket.vue
      SectionCard.vue
      StatCard.vue
      BudgetProgressCard.vue
      ChatBubble.vue
      TimelineTransportCard.vue
      TimelineActivityCard.vue
    editor/
      TripItemEditorPopup.vue
      ExpenseEditorPopup.vue
      BudgetEditorPopup.vue
  composables/
    useTripData.ts
    useItinerary.ts
    useExpense.ts
    useNotes.ts
    useChecklist.ts
  pages/
    home/index.vue
    itinerary/index.vue
    expense/index.vue
    notes/index.vue
    checklist/index.vue
  repositories/
    tripRepository.ts
    itineraryRepository.ts
    expenseRepository.ts
    notesRepository.ts
    checklistRepository.ts
    storage/
      storageKeys.ts
      localStorageAdapter.ts
  types/
    trip.ts
    itinerary.ts
    expense.ts
    notes.ts
```

## 7. 数据模型

### 7.1 Trip

用途：承载旅行级别元信息，供首页和多个页面共用。

建议字段：

- `id`
- `name`
- `city`
- `destination`
- `dateStart`
- `dateEnd`
- `daysLeft`
- `totalDays`
- `budget`
- `spots`
- `members`
- `pinnedReminder`

`pinnedReminder` 是置顶提醒卡片的唯一数据源，不从消息列表反向推导。
备注页可以更新这个字段，但首页和备注页都只读取这一份数据。

字段归属说明：

- `budget` 是持久化字段，保存在 `quwa.trip` 中，是预算的唯一数据源。
- `daysLeft` 不单独持久化，由 `dateStart` 和当前日期在 composable 层实时计算。
- `totalDays` 不单独持久化，由 `dateStart` 和 `dateEnd` 计算得出。

### 7.2 Member

- `id`
- `name`
- `initial`
- `color`

### 7.3 ItineraryDay

- `id`
- `label`
- `date`
- `items`

生命周期规则：

- 第一版的 `ItineraryDay` 由 `Trip.dateStart` 和 `Trip.dateEnd` 初始化生成。
- 初始化后，用户只编辑每一天的 `items`。
- 第一版不支持新增、删除或重排行程天数。
- 当旅行日期范围被修改时，repository 负责重新同步 day 列表，并尽量保留同日期的既有 `items`。

### 7.4 ItineraryItem

公共字段：

- `id`
- `kind`
- `title`
- `time`
- `note`
- `location`

字段约束：

- `kind` 是行程项的唯一判别字段，枚举值固定为 `transport | activity`
- 当 `kind = transport` 时，渲染交通卡片，并允许使用交通扩展字段
- 当 `kind = activity` 时，渲染普通活动卡片，不使用交通扩展字段

交通项扩展字段：

- `timeEnd`
- `from`
- `to`

### 7.5 Expense

- `id`
- `title`
- `amount`
- `category`
- `paidBy`
- `date`
- `isAA`

分类规则：

- 第一版采用固定分类枚举：`交通`、`住宿`、`餐饮`、`景点`、`其他`
- 用户可以在新增和编辑支出时从固定分类中选择
- 第一版不支持自定义、重命名或删除账单分类
- 分类占比图严格基于这套固定分类聚合

### 7.6 NoteMessage

- `id`
- `from`
- `text`
- `time`
- `isMine`

### 7.7 ChecklistItem

- `id`
- `category`
- `name`
- `done`

分类规则：

- 第一版采用固定分类枚举：`证件证卡`、`衣物`、`电子`、`其他`
- 用户可以在既有分类下新增项目
- 第一版不支持新增、重命名或删除清单分类

## 8. Repository 设计

所有 repository 先提供本地实现，但接口按未来远端模式设计为异步。

### 8.1 TripRepository

- `getTrip(): Promise<Trip>`
- `updateTrip(payload): Promise<Trip>`
- `updateBudget(amount): Promise<Trip>`

### 8.2 ItineraryRepository

- `getDays(): Promise<ItineraryDay[]>`
- `syncDaysFromTripRange(trip): Promise<ItineraryDay[]>`
- `addItem(dayId, payload): Promise<void>`
- `updateItem(dayId, itemId, payload): Promise<void>`
- `removeItem(dayId, itemId): Promise<void>`

### 8.3 ExpenseRepository

- `getExpenses(): Promise<Expense[]>`
- `addExpense(payload): Promise<void>`
- `updateExpense(id, payload): Promise<void>`
- `removeExpense(id): Promise<void>`

### 8.4 NotesRepository

- `getMessages(): Promise<NoteMessage[]>`
- `addMessage(payload): Promise<void>`

### 8.5 ChecklistRepository

- `getChecklist(): Promise<ChecklistItem[]>`
- `addChecklistItem(payload): Promise<void>`
- `toggleChecklistItem(id): Promise<void>`
- `removeChecklistItem(id): Promise<void>`

### 8.6 Storage Key

- `quwa.trip`
- `quwa.itinerary`
- `quwa.expense`
- `quwa.notes`
- `quwa.checklist`

## 9. 页面设计

### 9.1 首页

定位：总览页，提供状态预览和入口，不承担重编辑。

内容：

- 顶部 Hero 票据区
- 成员信息和倒计时
- 行程天数 / 总预算 / 景点数统计
- 即将出发交通卡片
- 预算进度卡片
- Day 1 预览
- 最近动态 / 备注预览
- 出发清单入口

交互：

- 点击行程预览进入行程页
- 点击预算卡进入账单页
- 点击备注卡进入备注页
- 点击清单入口进入二级清单页

### 9.2 行程页

定位：行程管理中心。

内容：

- 页头
- 列表 / 地图视图切换
- Day selector
- 时间线列表
- 添加安排入口

交互：

- 切换日期
- 切换列表 / 地图视图
- 新增行程项
- 编辑行程项
- 删除行程项

交互说明：

- 不采用长按编辑，改为点击卡片或显式操作按钮进入编辑弹层。
- 地图视图第一版用静态占位表达信息结构，不接 SDK。
- 新增或编辑行程项时必须先选择 `transport` 或 `activity`，再展示对应字段表单

### 9.3 账单页

定位：预算、支出和结算中心。

内容：

- 预算总览卡
- 预算设置入口
- AA 结算卡
- 分类占比图
- 支出明细列表
- 记一笔入口

交互：

- 修改总预算
- 新增支出
- 编辑支出
- 删除支出
- 切换某条支出是否参与 AA

计算规则：

- 总额、剩余预算、超支提示均由支出列表实时计算
- AA 仅统计 `isAA = true` 的条目
- 分类占比由当前支出数据聚合生成
- 分类仅允许使用固定枚举，避免本地假数据阶段出现聚合口径漂移

### 9.4 备注页

定位：旅行备注和轻聊天。

内容：

- 页头
- 置顶提醒卡
- 消息列表
- 输入区域

交互：

- 发送消息
- 自动滚动到底部
- 更新置顶提醒

约束：

- 第一版不做图片、语音、已读和多媒体消息
- 置顶提醒卡片不等于某条消息的置顶态；它是 `Trip.pinnedReminder` 的独立字段

### 9.5 清单页

定位：出发前准备清单，作为二级页面存在。

内容：

- 打包进度环
- 分类列表
- 勾选状态
- 新增清单项

交互：

- 勾选 / 取消勾选
- 新增项目
- 删除项目

约束：

- 新增清单项时，用户只能选择已存在的固定分类

## 10. 组件设计

### 10.1 布局组件

- `TravelPageShell`
  - 统一背景
  - 顶部安全区
  - 底部 tab bar 占位
  - 内容滚动区域

### 10.2 导航组件

- `JournalTabBar`
  - 当前页高亮
  - 页面切换
  - 自定义图标和标签

### 10.3 公共视觉组件

- `HeroTicket`
- `SectionCard`
- `StatCard`
- `BudgetProgressCard`
- `TimelineTransportCard`
- `TimelineActivityCard`
- `ChatBubble`

### 10.4 编辑弹层组件

- `TripItemEditorPopup`
- `ExpenseEditorPopup`
- `BudgetEditorPopup`

约束：

- 组件只负责展示和局部交互，不直接读写 storage
- 所有读写由 composable 调用 repository 完成

## 11. 状态与数据流

### 11.1 读取流程

```text
页面加载
  -> composable 初始化
  -> repository 读取 storage
  -> 若无数据则写入 demo seed
  -> composable 暴露响应式数据给页面
```

### 11.2 写入流程

```text
用户操作
  -> composable 执行业务动作
  -> repository 更新内存对象与 storage
  -> composable 刷新响应式视图
  -> 关联页面读取到最新衍生结果
```

### 11.3 页面联动

- 首页预算进度依赖账单数据
- 首页 Day 1 预览依赖行程数据
- 首页最近动态和备注预览依赖备注数据
- 修改数据后，返回首页应看到最新状态

## 12. 错误处理

### 12.1 本地存储异常

- 读取失败：回退到 demo seed，并提示本地初始化失败
- 写入失败：提示保存失败，不默默吞掉错误

### 12.2 表单校验

- 金额必须大于 0
- 标题不能为空
- 时间字段格式为空时允许保存，但需要显式处理展示
- 文本输入需要 `trim`

### 12.3 空状态处理

- 无行程：展示空提示和新增入口
- 无账单：展示空账单状态
- 无备注：展示空对话提示
- 无清单：展示空清单提示

## 13. 测试与验收

### 13.1 技术验证

- `npm run type-check`
- `npm run build:mp-weixin` 或最少 `npm run dev:mp-weixin` 编译通过

### 13.2 手动验收

- 4 个主 tab 可以稳定切换
- 自定义 tab bar 与安全区适配正常
- 新增、编辑、删除行程后首页预览同步
- 修改预算和账单后预算卡、AA 卡、分类占比同步
- 发送备注后消息列表即时刷新
- 清单勾选和新增可以持久化
- 重启应用后本地数据仍存在

### 13.3 视觉验收

- 整体气质接近参考稿
- 小程序下排版不挤压
- 卡片、圆角、虚线、渐变和票据感一致
- 输入和弹层在触控场景下表现稳定

## 14. 风险与取舍

### 14.1 自定义 tab bar

风险：

- 与原生 `tabBar` 相比，需要手动处理跳转态和底部安全区。

取舍：

- 为了还原手账风视觉，接受这一实现成本。

### 14.2 不引入全局状态库

风险：

- 页面联动逻辑需要在 composable 层设计清楚。

取舍：

- 当前项目规模可控，先保持依赖简单，避免过早抽象。

### 14.3 地图视图

风险：

- 真实地图能力接入复杂，平台差异大。

取舍：

- 第一版只保留信息结构和视觉占位，不接 SDK。

## 15. 实施顺序建议

1. 搭建页面与路由骨架
2. 抽主题变量和公共壳组件
3. 实现自定义 tab bar
4. 实现 repository 与 demo seed
5. 完成首页
6. 完成行程页及编辑弹层
7. 完成账单页及计算逻辑
8. 完成备注页
9. 完成清单页
10. 联调页面间联动和持久化
11. 编译和手动验收

## 16. 当前阻塞

- 当前目录不是 git 仓库，因此无法按流程提交 design doc commit。
- 若后续需要保留文档提交记录，需要先在项目根目录初始化或接入 git 仓库。
