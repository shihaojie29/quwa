# 去哇手账风小程序 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 uniapp 模板中实现一个基于手账风 spec 的微信小程序，包含首页、行程、账单、备注四个主 tab 和一个清单二级页，支持本地持久化与真实交互。

**Architecture:** 采用 `page -> composable -> repository -> local storage` 的分层方式。视觉上通过统一页面壳、自定义 tab bar 和复用卡片组件还原参考稿气质；数据上用 repository 隔离 `uni` 存储细节，并把预算、日期、分类等 source of truth 明确定义在数据层。

**Tech Stack:** uni-app 3、Vue 3、TypeScript、SCSS、Vitest、Vue Test Utils、uni storage API

---

## Preconditions

- 当前工作目录 `/Users/shihaojie/project/quwa` 不是 git 仓库。
- 执行本计划前，先二选一：
  - 在项目根目录初始化或接入 git，再执行文中的 commit 步骤。
  - 如果暂时不接入 git，保留每个任务的“Commit”步骤作为检查点，但不实际执行。
- 当前项目没有测试框架；任务 1 先补齐 Vitest 基础设施。

## File Map

### Create

- `vitest.config.ts`
  - Vitest 配置，开启 `jsdom`，映射 uni/vite 别名。
- `src/test/setup.ts`
  - 测试环境初始化。
- `src/types/trip.ts`
  - `Trip`、`Member`、`PinnedReminder` 类型。
- `src/types/itinerary.ts`
  - `ItineraryDay`、`ItineraryItem` 联合类型。
- `src/types/expense.ts`
  - `Expense`、`ExpenseCategory` 类型。
- `src/types/notes.ts`
  - `NoteMessage` 类型。
- `src/types/checklist.ts`
  - `ChecklistItem`、`ChecklistCategory` 类型。
- `src/constants/categories.ts`
  - 账单和清单固定分类枚举、文案和视觉配置。
- `src/mock/seed.ts`
  - demo seed 数据，作为 storage 初始化源。
- `src/utils/date.ts`
  - `daysLeft`、`totalDays`、day label/date 映射函数。
- `src/utils/navigation.ts`
  - 自定义 tab 路由表与跳转工具。
- `src/repositories/storage/storageKeys.ts`
  - storage key 常量。
- `src/repositories/storage/localStorageAdapter.ts`
  - `get/set/remove` 封装。
- `src/repositories/tripRepository.ts`
  - `Trip` 读写、预算更新。
- `src/repositories/itineraryRepository.ts`
  - day 列表同步、行程项 CRUD。
- `src/repositories/expenseRepository.ts`
  - 支出 CRUD。
- `src/repositories/notesRepository.ts`
  - 备注消息 CRUD。
- `src/repositories/checklistRepository.ts`
  - 清单项目 CRUD。
- `src/composables/useTripData.ts`
  - trip 读取、衍生字段和首页摘要。
- `src/composables/useItinerary.ts`
  - day 选择、视图切换、行程项编辑。
- `src/composables/useExpense.ts`
  - 预算、AA 结算、分类聚合。
- `src/composables/useNotes.ts`
  - 消息列表、发送消息、置顶提醒更新。
- `src/composables/useChecklist.ts`
  - 清单勾选、分组、进度统计。
- `src/components/journal/TravelPageShell.vue`
  - 页面背景、安全区、滚动容器和 tab bar 槽位。
- `src/components/journal/JournalTabBar.vue`
  - 自定义底部导航。
- `src/components/journal/HeroTicket.vue`
  - 首页顶部票据区。
- `src/components/journal/SectionCard.vue`
  - 通用卡片容器。
- `src/components/journal/StatCard.vue`
  - 首页三宫格统计卡。
- `src/components/journal/BudgetProgressCard.vue`
  - 预算进度卡。
- `src/components/journal/TimelineTransportCard.vue`
  - 交通卡片。
- `src/components/journal/TimelineActivityCard.vue`
  - 活动卡片。
- `src/components/journal/ChatBubble.vue`
  - 聊天气泡。
- `src/components/editor/BudgetEditorPopup.vue`
  - 预算编辑弹层。
- `src/components/editor/TripItemEditorPopup.vue`
  - 行程项编辑弹层。
- `src/components/editor/ExpenseEditorPopup.vue`
  - 支出编辑弹层。
- `src/pages/home/index.vue`
  - 首页。
- `src/pages/itinerary/index.vue`
  - 行程页。
- `src/pages/expense/index.vue`
  - 账单页。
- `src/pages/notes/index.vue`
  - 备注页。
- `src/pages/checklist/index.vue`
  - 清单页。
- `tests/utils/date.spec.ts`
  - 日期派生逻辑测试。
- `tests/repositories/tripRepository.spec.ts`
  - trip repository 测试。
- `tests/repositories/itineraryRepository.spec.ts`
  - day 同步与 item CRUD 测试。
- `tests/repositories/expenseRepository.spec.ts`
  - 支出 CRUD 与分类数据测试。
- `tests/composables/useExpense.spec.ts`
  - 预算与 AA 聚合测试。
- `tests/composables/useChecklist.spec.ts`
  - 清单进度与分组测试。
- `tests/components/JournalTabBar.spec.ts`
  - 自定义 tab 切换测试。

### Modify

- `package.json`
  - 添加测试脚本和测试依赖。
- `vite.config.ts`
  - 合并 vitest 友好的配置导出。
- `src/uni.scss`
  - 增加主题变量、阴影、虚线、暖色背景工具类。
- `src/pages.json`
  - 注册 5 个页面，统一关闭默认导航栏标题或设为空。
- `src/App.vue`
  - 增加全局生命周期初始化钩子，如需要可预热 seed。

## Task 1: Set Up Testing And Route Skeleton

**Files:**
- Modify: `package.json`, `vite.config.ts`, `src/pages.json`
- Create: `vitest.config.ts`, `src/test/setup.ts`, `tests/components/JournalTabBar.spec.ts`, `src/utils/navigation.ts`, `src/components/journal/JournalTabBar.vue`

- [ ] **Step 1: Add failing component test for custom tab navigation**

```ts
import { mount } from "@vue/test-utils";
import JournalTabBar from "../../src/components/journal/JournalTabBar.vue";

it("emits target tab when a nav item is clicked", async () => {
  const wrapper = mount(JournalTabBar, {
    props: { activeTab: "home" },
  });

  await wrapper.get('[data-tab="expense"]').trigger("click");
  expect(wrapper.emitted("change")?.[0]).toEqual(["expense"]);
});
```

- [ ] **Step 2: Install and wire test tooling**

Run: `npm install -D vitest @vue/test-utils jsdom`
Expected: install completes without peer dependency errors

Update `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Add Vitest config and setup**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import uni from "@dcloudio/vite-plugin-uni";

export default defineConfig({
  plugins: [uni()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
```

```ts
// src/test/setup.ts
import { vi } from "vitest";

vi.stubGlobal("uni", {
  getStorageSync: vi.fn(),
  setStorageSync: vi.fn(),
  removeStorageSync: vi.fn(),
  navigateTo: vi.fn(),
  redirectTo: vi.fn(),
});
```

- [ ] **Step 4: Create the minimal tab component and route map**

```ts
// src/utils/navigation.ts
export const TAB_ROUTES = {
  home: "/pages/home/index",
  itinerary: "/pages/itinerary/index",
  expense: "/pages/expense/index",
  notes: "/pages/notes/index",
} as const;

export function goToTab(tab: keyof typeof TAB_ROUTES) {
  return uni.redirectTo({ url: TAB_ROUTES[tab] });
}
```

```vue
<!-- src/components/journal/JournalTabBar.vue -->
<script setup lang="ts">
defineProps<{ activeTab: "home" | "itinerary" | "expense" | "notes" }>();
const emit = defineEmits<{ change: [tab: string] }>();
</script>
```

- [ ] **Step 5: Register page routes**

Update `src/pages.json` so the first page is `/pages/home/index` and include:

```json
[
  "pages/home/index",
  "pages/itinerary/index",
  "pages/expense/index",
  "pages/notes/index",
  "pages/checklist/index"
]
```

Set page style to use the custom shell instead of the native navbar:

```json
{
  "globalStyle": {
    "navigationStyle": "custom",
    "backgroundColor": "#F3E9D8"
  }
}
```

- [ ] **Step 6: Run tests and type-check**

Run: `npm run test -- JournalTabBar`
Expected: PASS for the new tab-bar test

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add package.json vite.config.ts vitest.config.ts src/test/setup.ts src/pages.json src/utils/navigation.ts src/components/journal/JournalTabBar.vue tests/components/JournalTabBar.spec.ts
git commit -m "test: add frontend test scaffolding and tab routing"
```

## Task 2: Implement Types, Seed Data, Date Utilities, And Storage Adapter

**Files:**
- Create: `src/types/trip.ts`, `src/types/itinerary.ts`, `src/types/expense.ts`, `src/types/notes.ts`, `src/types/checklist.ts`, `src/constants/categories.ts`, `src/mock/seed.ts`, `src/utils/date.ts`, `src/repositories/storage/storageKeys.ts`, `src/repositories/storage/localStorageAdapter.ts`
- Test: `tests/utils/date.spec.ts`

- [ ] **Step 1: Write failing tests for date derivation**

```ts
import { buildTripDays, getDaysLeft, getTotalDays } from "../../src/utils/date";

it("computes total days from inclusive trip dates", () => {
  expect(getTotalDays("2026-05-20", "2026-05-25")).toBe(6);
});

it("builds one itinerary day per trip date", () => {
  expect(buildTripDays("2026-05-20", "2026-05-22")).toHaveLength(3);
});
```

- [ ] **Step 2: Define domain types and fixed categories**

Use a discriminated union for itinerary items:

```ts
export type ItineraryItem =
  | { id: string; kind: "activity"; title: string; time: string; note?: string; location?: string }
  | { id: string; kind: "transport"; title: string; time: string; timeEnd?: string; from?: string; to?: string; note?: string };
```

- [ ] **Step 3: Implement date helpers and demo seed**

```ts
export function getTotalDays(start: string, end: string) {
  return Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}
```

Seed must include:
- a `Trip` record with `budget` persisted
- itinerary days generated from the date range
- fixed expense categories only
- fixed checklist categories only

- [ ] **Step 4: Add storage keys and adapter**

```ts
export const STORAGE_KEYS = {
  trip: "quwa.trip",
  itinerary: "quwa.itinerary",
  expense: "quwa.expense",
  notes: "quwa.notes",
  checklist: "quwa.checklist",
} as const;
```

- [ ] **Step 5: Run tests**

Run: `npm run test -- tests/utils/date.spec.ts`
Expected: PASS

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/types src/constants/categories.ts src/mock/seed.ts src/utils/date.ts src/repositories/storage/storageKeys.ts src/repositories/storage/localStorageAdapter.ts tests/utils/date.spec.ts
git commit -m "feat: add domain types and local storage primitives"
```

## Task 3: Build Repositories With Seed Initialization And Sync Rules

**Files:**
- Create: `src/repositories/tripRepository.ts`, `src/repositories/itineraryRepository.ts`, `src/repositories/expenseRepository.ts`, `src/repositories/notesRepository.ts`, `src/repositories/checklistRepository.ts`
- Test: `tests/repositories/tripRepository.spec.ts`, `tests/repositories/itineraryRepository.spec.ts`, `tests/repositories/expenseRepository.spec.ts`

- [ ] **Step 1: Write failing repository tests**

```ts
it("initializes trip storage from seed when empty", async () => {
  const trip = await getTrip();
  expect(trip.name).toContain("大阪");
});

it("syncs itinerary days from trip date range", async () => {
  const days = await syncDaysFromTripRange({ dateStart: "2026-05-20", dateEnd: "2026-05-22" });
  expect(days.map((day) => day.label)).toEqual(["Day 1", "Day 2", "Day 3"]);
});
```

- [ ] **Step 2: Implement trip repository**

Required behavior:
- `getTrip()` loads storage or seed
- `updateBudget(amount)` persists to `quwa.trip`
- `updateTrip(payload)` persists `pinnedReminder` edits back to `quwa.trip`
- `daysLeft` and `totalDays` are not stored; composables derive them
- `pinnedReminder` lives only on trip data

- [ ] **Step 3: Implement itinerary repository**

Required behavior:
- seed days if storage is empty
- `syncDaysFromTripRange(trip)` regenerates day shells from trip dates
- keep same-date `items` when resyncing
- item CRUD only mutates `items`, not day count

Minimal sync sketch:

```ts
const nextDays = buildTripDays(trip.dateStart, trip.dateEnd).map((day) => ({
  ...day,
  items: previousByDate.get(day.date)?.items ?? [],
}));
```

- [ ] **Step 4: Implement expense, notes, and checklist repositories**

Required behavior:
- expense category must stay inside fixed enum
- checklist category must stay inside fixed enum
- notes repository stores messages only
- checklist repository stores raw items, not derived progress

- [ ] **Step 5: Run repository tests**

Run: `npm run test -- tests/repositories`
Expected: PASS

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/repositories tests/repositories
git commit -m "feat: add repositories with seed-backed persistence"
```

## Task 4: Add Composables For Derived State And Page Actions

**Files:**
- Create: `src/composables/useTripData.ts`, `src/composables/useItinerary.ts`, `src/composables/useExpense.ts`, `src/composables/useNotes.ts`, `src/composables/useChecklist.ts`
- Test: `tests/composables/useExpense.spec.ts`, `tests/composables/useChecklist.spec.ts`

- [ ] **Step 1: Write failing composable tests**

```ts
it("computes AA balances from only AA expenses", async () => {
  const { aaSummary } = await mountExpenseComposableWithSeed();
  expect(aaSummary.total).toBeGreaterThan(0);
});

it("computes checklist completion ratio from checked items", async () => {
  const { progressText } = await mountChecklistComposableWithSeed();
  expect(progressText.value).toContain("/");
});
```

- [ ] **Step 2: Implement `useTripData` and `useItinerary`**

`useTripData` should expose:

```ts
{
  trip,
  daysLeft,
  totalDays,
  statCards,
  upcomingTransport,
  dayPreview,
  pinnedReminder,
}
```

`useItinerary` should expose:

```ts
{
  days,
  activeDayIndex,
  activeView,
  setActiveDay,
  setActiveView,
  addItem,
  updateItem,
  removeItem,
}
```

- [ ] **Step 3: Implement `useExpense`, `useNotes`, and `useChecklist`**

`useExpense` must centralize:
- `spentTotal`
- `remainingBudget`
- `categoryBreakdown`
- `aaSummary`

`useNotes` must centralize:
- `messages`
- `recentPreviewMessages`
- `send`
- `pinnedReminderDraft`
- `savePinnedReminder`

`useChecklist` must centralize:
- grouped items by fixed category
- done count
- total count
- progress percentage

- [ ] **Step 4: Run composable tests**

Run: `npm run test -- tests/composables`
Expected: PASS

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/composables tests/composables
git commit -m "feat: add composables for derived state and actions"
```

## Task 5: Build Shared Journal UI Shell And Tokens

**Files:**
- Create: `src/components/journal/TravelPageShell.vue`, `src/components/journal/SectionCard.vue`, `src/components/journal/StatCard.vue`, `src/components/journal/HeroTicket.vue`, `src/components/journal/BudgetProgressCard.vue`
- Modify: `src/uni.scss`

- [ ] **Step 1: Add a smoke test for shell layout behavior**

```ts
it("renders shell content and active tab", () => {
  const wrapper = mount(TravelPageShell, {
    slots: { default: "<div data-test='content' />" },
    props: { activeTab: "home" },
  });

  expect(wrapper.find('[data-test="content"]').exists()).toBe(true);
});
```

- [ ] **Step 2: Add global journal tokens to `src/uni.scss`**

Required variables:

```scss
$journal-bg: #f3e9d8;
$journal-card: #fef8ee;
$journal-primary: #c96040;
$journal-accent: #e8a050;
$journal-text: #3a2218;
$journal-muted: #9a7050;
```

- [ ] **Step 3: Implement the page shell**

`TravelPageShell` responsibilities:
- safe-area top padding
- scrollable content slot
- bottom tab bar slot or built-in `JournalTabBar`
- background texture / gradient wrapper

- [ ] **Step 4: Implement shared card components**

Keep these components dumb:
- receive props only
- no repository access
- no page-level navigation

- [ ] **Step 5: Run targeted tests**

Run: `npm run test -- TravelPageShell`
Expected: PASS

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/uni.scss src/components/journal
git commit -m "feat: add shared journal layout and visual components"
```

## Task 6: Implement Home Page

**Files:**
- Create: `src/pages/home/index.vue`
- Reuse: `src/components/journal/HeroTicket.vue`, `src/components/journal/StatCard.vue`, `src/components/journal/BudgetProgressCard.vue`
- Read: `src/composables/useTripData.ts`, `src/composables/useExpense.ts`, `src/composables/useNotes.ts`, `src/utils/navigation.ts`

- [ ] **Step 1: Write a failing home-page smoke test**

```ts
it("renders hero city and budget progress from composables", async () => {
  const wrapper = mount(HomePage);
  expect(wrapper.text()).toContain("OSAKA");
  expect(wrapper.text()).toContain("预算");
});
```

- [ ] **Step 2: Implement the page skeleton**

The page must include:
- ticket hero
- member avatars and countdown
- stat row
- upcoming transport
- budget progress
- day preview
- pinned reminder / recent notes preview
- checklist shortcut
- empty state placeholders for missing preview data

- [ ] **Step 3: Wire explicit navigation**

Use existing tab routes only:

```ts
goToTab("itinerary");
goToTab("expense");
goToTab("notes");
uni.navigateTo({ url: "/pages/checklist/index" });
```

- [ ] **Step 4: Verify buildability**

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/home/index.vue
git commit -m "feat: implement journal-style home page"
```

## Task 7: Implement Itinerary Page And Trip Item Editor

**Files:**
- Create: `src/pages/itinerary/index.vue`, `src/components/journal/TimelineTransportCard.vue`, `src/components/journal/TimelineActivityCard.vue`, `src/components/editor/TripItemEditorPopup.vue`
- Read: `src/composables/useItinerary.ts`

- [ ] **Step 1: Write failing tests for itinerary item mode switching**

```ts
it("shows transport-specific inputs when editing a transport item", async () => {
  const wrapper = mount(TripItemEditorPopup, {
    props: { modelValue: true, draft: { kind: "transport" } },
  });

  expect(wrapper.text()).toContain("出发站");
});
```

- [ ] **Step 2: Implement timeline cards**

Rendering rule:
- `kind === "transport"` -> transport card
- `kind === "activity"` -> activity card

- [ ] **Step 3: Implement itinerary page**

Required interactions:
- switch day
- switch list/map
- open create editor
- open edit editor
- save item
- delete item
- navigate to `/pages/checklist/index`
- show an explicit empty state when the active day has no items

- [ ] **Step 4: Implement popup with explicit kind selection**

Form order:
1. choose `transport` or `activity`
2. show matching fields
3. validate required title/time
4. emit save payload

- [ ] **Step 5: Verify itinerary behavior**

Run: `npm run type-check`
Expected: PASS

Run: `npm run test -- TripItemEditorPopup`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/itinerary/index.vue src/components/journal/TimelineTransportCard.vue src/components/journal/TimelineActivityCard.vue src/components/editor/TripItemEditorPopup.vue
git commit -m "feat: implement itinerary page and item editor"
```

## Task 8: Implement Expense Page And Budget / Expense Editors

**Files:**
- Create: `src/pages/expense/index.vue`, `src/components/editor/BudgetEditorPopup.vue`, `src/components/editor/ExpenseEditorPopup.vue`
- Read: `src/composables/useExpense.ts`, `src/constants/categories.ts`

- [ ] **Step 1: Write failing tests for AA-only aggregation**

```ts
it("excludes non-AA expenses from settlement summary", async () => {
  const state = await mountExpenseComposableWithCustomExpenses([
    { amount: 100, isAA: true, paidBy: "小鱼" },
    { amount: 80, isAA: false, paidBy: "阿橙" },
  ]);

  expect(state.aaSummary.total).toBe(100);
});
```

- [ ] **Step 2: Implement budget summary and category breakdown UI**

Required sections:
- total spent
- remaining / over-budget status
- AA summary
- category list or chart
- expense list
- empty state when there are no expenses yet

- [ ] **Step 3: Implement budget editor popup**

Validation:
- integer amount only
- must be `> 0`

- [ ] **Step 4: Implement expense editor popup**

Validation:
- title required
- amount required and `> 0`
- category restricted to fixed enum
- `paidBy` restricted to trip members

- [ ] **Step 5: Run verification**

Run: `npm run test -- tests/composables/useExpense.spec.ts`
Expected: PASS

Run: `npm run build:mp-weixin`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/expense/index.vue src/components/editor/BudgetEditorPopup.vue src/components/editor/ExpenseEditorPopup.vue
git commit -m "feat: implement expense page and editors"
```

## Task 9: Implement Notes Page And Checklist Page

**Files:**
- Create: `src/pages/notes/index.vue`, `src/pages/checklist/index.vue`, `src/components/journal/ChatBubble.vue`
- Read: `src/composables/useNotes.ts`, `src/composables/useChecklist.ts`

- [ ] **Step 1: Write failing tests for checklist progress and note submission**

```ts
it("updates checklist progress after toggling an item", async () => {
  const state = await mountChecklistComposableWithSeed();
  await state.toggleItem("passport");
  expect(state.doneCount.value).toBeGreaterThan(0);
});

it("appends a new outgoing note message", async () => {
  const state = await mountNotesComposableWithSeed();
  await state.send("测试消息");
  expect(state.messages.value.at(-1)?.text).toBe("测试消息");
});
```

- [ ] **Step 2: Implement notes page**

Required behavior:
- render pinned reminder from `Trip.pinnedReminder`
- allow editing and saving `Trip.pinnedReminder`
- render message list from notes repository
- input + send
- scroll to newest message after send
- show an empty-state prompt when there are no messages

- [ ] **Step 3: Implement checklist page**

Required behavior:
- fixed category groups
- checkbox toggle
- add item under existing category
- progress ring / percentage
- delete checklist items
- show an empty state when every category is empty

- [ ] **Step 4: Verify notes and checklist**

Run: `npm run test -- tests/composables/useChecklist.spec.ts`
Expected: PASS

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/notes/index.vue src/pages/checklist/index.vue src/components/journal/ChatBubble.vue
git commit -m "feat: implement notes and checklist pages"
```

## Task 10: End-To-End Wiring, Seed Bootstrapping, And Final Verification

**Files:**
- Modify: `src/App.vue`
- Read/verify: all previously created files

- [ ] **Step 1: Add app bootstrap if needed**

If composables do lazy initialization cleanly, keep `App.vue` minimal.
If not, add one guarded bootstrap call:

```ts
onLaunch(async () => {
  await ensureSeedData();
});
```

- [ ] **Step 2: Verify all navigation paths**

Manual checks:
- home -> itinerary
- home -> expense
- home -> notes
- home -> checklist
- each main page bottom nav switches correctly

- [ ] **Step 3: Verify persistence manually**

Manual checks:
- edit budget, restart app, value persists
- add itinerary item, restart app, item persists
- send note, restart app, message persists
- toggle checklist item, restart app, state persists

- [ ] **Step 4: Run full automated verification**

Run: `npm run test`
Expected: all tests PASS

Run: `npm run type-check`
Expected: PASS

Run: `npm run build:mp-weixin`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.vue
git add src pages tests package.json vite.config.ts vitest.config.ts
git commit -m "feat: ship quwa journal-style mini app"
```

## Execution Notes

- Keep components presentation-only; repository access belongs in composables.
- Do not reintroduce `isTransport`; use `kind` as the only itinerary discriminator.
- Do not make expense or checklist categories user-editable in this implementation.
- Do not store `daysLeft` or `totalDays`; derive them from trip dates.
- Do not add Pinia unless the implementation hits a concrete coupling problem that cannot be solved with composables.
- Re-run `syncDaysFromTripRange` whenever trip dates change.
