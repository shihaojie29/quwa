<script setup lang="ts">
import { computed, ref } from "vue";
import BudgetEditorPopup from "../../components/editor/BudgetEditorPopup.vue";
import ExpenseEditorPopup from "../../components/editor/ExpenseEditorPopup.vue";
import BudgetProgressCard from "../../components/journal/BudgetProgressCard.vue";
import SectionCard from "../../components/journal/SectionCard.vue";
import TravelPageShell from "../../components/journal/TravelPageShell.vue";
import { useExpense } from "../../composables/useExpense";
import type { Expense } from "../../types/expense";
import { goToTab, type TabKey } from "../../utils/navigation";

const {
  trip,
  expenses,
  spentTotal,
  remainingBudget,
  categoryBreakdown,
  aaSummary,
  ready,
  add,
  update,
  remove,
  setBudget,
} = useExpense();

const budgetEditorOpen = ref(false);
const expenseEditorOpen = ref(false);
const expenseDraft = ref<Partial<Expense>>({});

const budgetProgress = computed(() => {
  const budget = trip.value?.budget ?? 0;

  return budget > 0 ? (spentTotal.value / budget) * 100 : 0;
});

function formatAmount(amount: number): string {
  return Math.round(amount).toLocaleString("zh-CN");
}

function openCreateExpense() {
  expenseDraft.value = {};
  expenseEditorOpen.value = true;
}

function openEditExpense(expense: Expense) {
  expenseDraft.value = { ...expense };
  expenseEditorOpen.value = true;
}

async function saveBudget(amount: number) {
  await setBudget(amount);
  budgetEditorOpen.value = false;
}

async function saveExpense(expense: Expense) {
  const exists = expenses.value.some((currentExpense) => currentExpense.id === expense.id);

  if (exists) {
    await update(expense);
  } else {
    await add(expense);
  }

  expenseEditorOpen.value = false;
}

async function deleteExpense(id: string) {
  await remove(id);
  expenseEditorOpen.value = false;
}
</script>

<template>
  <TravelPageShell active-tab="expense" @change="(tab: TabKey) => goToTab(tab)">
    <view class="expense-page">
      <view class="expense-page__header">
        <view>
          <text class="expense-page__eyebrow">Travel ledger</text>
          <text class="expense-page__title">花费账单</text>
        </view>
        <button type="button" @click="budgetEditorOpen = true">预算</button>
      </view>

      <view class="expense-total-card">
        <view>
          <text class="expense-total-card__eyebrow">TOTAL SPENT</text>
          <text class="expense-total-card__amount">¥{{ formatAmount(spentTotal) }}</text>
        </view>
        <view class="expense-total-card__side">
          <text class="expense-total-card__side-label">预算{{ remainingBudget >= 0 ? "剩余" : "超出" }}</text>
          <text class="expense-total-card__side-value">¥{{ formatAmount(Math.abs(remainingBudget)) }}</text>
        </view>
        <view class="expense-total-card__track">
          <view class="expense-total-card__fill" :style="{ width: `${Math.min(100, budgetProgress)}%` }" />
        </view>
        <view class="expense-total-card__members">
          <view v-for="participant in aaSummary.participants" :key="participant.member.id" class="expense-total-card__member">
            <text class="expense-total-card__member-name">{{ participant.member.name }} 已付</text>
            <text class="expense-total-card__member-paid">¥{{ formatAmount(participant.paid) }}</text>
          </view>
        </view>
      </view>

      <BudgetProgressCard
        title="预算"
        :spent-label="`已花 ¥${formatAmount(spentTotal)}`"
        :total-label="`预算 ¥${formatAmount(trip?.budget ?? 0)}`"
        :progress="budgetProgress"
        :caption="remainingBudget >= 0 ? `剩余 ¥${formatAmount(remainingBudget)}` : `超出 ¥${formatAmount(Math.abs(remainingBudget))}`"
      />

      <SectionCard title="AA 结算" description="只统计标记为参与 AA 的支出。">
        <view v-if="aaSummary.participants.length" class="aa-grid">
          <view v-for="participant in aaSummary.participants" :key="participant.member.id" class="aa-grid__item">
            <text class="aa-grid__name">{{ participant.member.name }}</text>
            <text>已付 ¥{{ formatAmount(participant.paid) }}</text>
            <text>应摊 ¥{{ formatAmount(participant.share) }}</text>
            <text :data-positive="participant.balance >= 0">差额 ¥{{ formatAmount(participant.balance) }}</text>
          </view>
        </view>
        <view v-if="aaSummary.settlements.length" class="settlement-list">
          <text v-for="settlement in aaSummary.settlements" :key="`${settlement.from.id}-${settlement.to.id}`">
            {{ settlement.from.name }} 应付 ¥{{ formatAmount(settlement.amount) }} 给 {{ settlement.to.name }}
          </text>
        </view>
        <view v-else class="expense-empty">
          <text>暂无需要结算的 AA 差额。</text>
        </view>
      </SectionCard>

      <SectionCard title="分类占比" description="按固定分类聚合当前支出。">
        <view class="category-list">
          <view v-for="category in categoryBreakdown" :key="category.category" class="category-list__item">
            <text>{{ category.category }}</text>
            <text>¥{{ formatAmount(category.amount) }} · {{ category.count }}笔</text>
          </view>
        </view>
      </SectionCard>

      <SectionCard title="支出明细" description="点击条目编辑，或新增一笔支出。">
        <view v-if="expenses.length" class="expense-list">
          <view v-for="expense in expenses" :key="expense.id" class="expense-list__item" @click="openEditExpense(expense)">
            <view>
              <text class="expense-list__title">{{ expense.title }}</text>
              <text class="expense-list__meta">{{ expense.category }} · {{ expense.date }} · {{ expense.isAA ? "AA" : "不AA" }}</text>
            </view>
            <text class="expense-list__amount">¥{{ formatAmount(expense.amount) }}</text>
          </view>
        </view>
        <view v-else class="expense-empty">
          <text>还没有支出记录。</text>
        </view>
        <button class="expense-page__add" type="button" @click="openCreateExpense">记一笔</button>
      </SectionCard>
    </view>

    <BudgetEditorPopup
      v-model="budgetEditorOpen"
      :budget="trip?.budget ?? 0"
      @save="saveBudget"
    />
    <ExpenseEditorPopup
      v-model="expenseEditorOpen"
      :draft="expenseDraft"
      :members="trip?.members ?? []"
      @save="saveExpense"
      @delete="deleteExpense"
    />
  </TravelPageShell>
</template>

<style scoped>
.expense-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 8px;
}

.expense-page__header,
.category-list__item,
.expense-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.expense-page__eyebrow,
.expense-page__title,
.expense-list__title {
  display: block;
}

.expense-page__eyebrow {
  color: var(--journal-primary, #c96040);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.expense-page__title {
  margin-top: 4px;
  color: var(--journal-text, #3a2218);
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 26px;
  font-weight: 900;
}

.expense-page__header button,
.expense-page__add {
  padding: 10px 14px;
  color: #fffdf8;
  font-size: 13px;
  font-weight: 800;
  background: var(--journal-gradient, linear-gradient(140deg, #c96040 0%, #e8a050 100%));
  border: 0;
  border-radius: 999px;
  box-shadow: 0 4px 14px rgba(201, 96, 64, 0.28);
}

.expense-total-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px 16px;
  padding: 20px;
  color: #fffdf8;
  background: var(--journal-gradient, linear-gradient(140deg, #c96040 0%, #e8a050 100%));
  border-radius: 18px;
  box-shadow: 0 8px 28px rgba(201, 96, 64, 0.28);
}

.expense-total-card__eyebrow,
.expense-total-card__side-label,
.expense-total-card__member-name {
  display: block;
  color: rgba(255, 255, 255, 0.68);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

.expense-total-card__amount {
  display: block;
  margin-top: 4px;
  color: #ffffff;
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 38px;
  font-weight: 900;
  line-height: 1.08;
}

.expense-total-card__side {
  text-align: right;
}

.expense-total-card__side-value {
  display: block;
  margin-top: 4px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 900;
}

.expense-total-card__track {
  grid-column: 1 / -1;
  overflow: hidden;
  height: 6px;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 999px;
}

.expense-total-card__fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.82);
  border-radius: inherit;
}

.expense-total-card__members {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.expense-total-card__member {
  padding: 10px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
}

.expense-total-card__member-paid {
  display: block;
  margin-top: 3px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
}

.aa-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.aa-grid__item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  color: var(--journal-muted, #9a7050);
  font-size: 12px;
  background: rgba(255, 252, 246, 0.64);
  border: 1px dashed var(--journal-soft, #e8d4b4);
  border-radius: 16px;
}

.aa-grid__name,
.expense-list__title,
.expense-list__amount {
  color: var(--journal-text, #3a2218);
  font-weight: 800;
}

.settlement-list,
.category-list,
.expense-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.settlement-list,
.expense-empty {
  color: var(--journal-muted, #9a7050);
  font-size: 13px;
  line-height: 1.45;
}

.category-list__item,
.expense-list__item {
  padding: 11px 12px;
  background: rgba(255, 252, 246, 0.5);
  border: 1px dashed rgba(154, 112, 80, 0.18);
  border-radius: 14px;
}

.category-list__item:first-child,
.expense-list__item:first-child {
  border-top: 1px dashed rgba(154, 112, 80, 0.18);
}

.expense-list__meta {
  display: block;
  margin-top: 4px;
  color: var(--journal-muted, #9a7050);
  font-size: 12px;
}

.expense-page__add {
  width: 100%;
  margin-top: 14px;
}
</style>
