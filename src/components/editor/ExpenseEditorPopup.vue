<script setup lang="ts">
import { reactive, watch } from "vue";
import { EXPENSE_CATEGORIES } from "../../constants/categories";
import type { Expense, ExpenseCategory } from "../../types/expense";
import type { Member } from "../../types/trip";

type ExpenseDraft = Partial<Expense>;

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    draft?: ExpenseDraft;
    members: Member[];
  }>(),
  {
    draft: () => ({}),
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  save: [expense: Expense];
  delete: [id: string];
}>();

const form = reactive({
  id: "",
  title: "",
  amount: "",
  category: "其他" as ExpenseCategory,
  paidBy: "",
  date: "",
  note: "",
  isAA: true,
});

watch(
  () => [props.draft, props.members] as const,
  ([draft, members]) => {
    form.id = draft?.id ?? "";
    form.title = draft?.title ?? "";
    form.amount = draft?.amount ? String(draft.amount) : "";
    form.category = draft?.category ?? "其他";
    form.paidBy = draft?.paidBy ?? members[0]?.id ?? "";
    form.date = draft?.date ?? new Date().toISOString().slice(0, 10);
    form.note = draft?.note ?? "";
    form.isAA = draft?.isAA ?? true;
  },
  { immediate: true, deep: true },
);

function close() {
  emit("update:modelValue", false);
}

function save() {
  const amount = Number.parseFloat(form.amount);

  if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0 || !form.paidBy) {
    return;
  }

  emit("save", {
    id: form.id || `expense-${Date.now()}`,
    title: form.title.trim(),
    amount,
    category: form.category,
    paidBy: form.paidBy,
    date: form.date,
    note: form.note.trim() || undefined,
    isAA: form.isAA,
  });
}
</script>

<template>
  <view v-if="modelValue" class="expense-editor">
    <view class="expense-editor__sheet">
      <view class="expense-editor__header">
        <text class="expense-editor__title">{{ form.id ? "编辑支出" : "记一笔" }}</text>
        <button type="button" @click="close">关闭</button>
      </view>

      <label class="expense-editor__field">
        <text>标题</text>
        <input v-model="form.title" placeholder="例如 晚餐" />
      </label>
      <label class="expense-editor__field">
        <text>金额</text>
        <input v-model="form.amount" type="digit" placeholder="0" />
      </label>

      <view class="expense-editor__group">
        <text>分类</text>
        <view class="expense-editor__chips">
          <button
            v-for="category in EXPENSE_CATEGORIES"
            :key="category"
            :data-active="form.category === category"
            type="button"
            @click="form.category = category"
          >
            {{ category }}
          </button>
        </view>
      </view>

      <view class="expense-editor__group">
        <text>付款人</text>
        <view class="expense-editor__chips">
          <button
            v-for="member in members"
            :key="member.id"
            :data-active="form.paidBy === member.id"
            type="button"
            @click="form.paidBy = member.id"
          >
            {{ member.name }}
          </button>
        </view>
      </view>

      <label class="expense-editor__field">
        <text>日期</text>
        <input v-model="form.date" placeholder="YYYY-MM-DD" />
      </label>

      <view class="expense-editor__toggle" @click="form.isAA = !form.isAA">
        <text>参与 AA</text>
        <text>{{ form.isAA ? "是" : "否" }}</text>
      </view>

      <label class="expense-editor__field">
        <text>备注</text>
        <input v-model="form.note" placeholder="可选" />
      </label>

      <view class="expense-editor__actions">
        <button v-if="form.id" class="expense-editor__danger" type="button" @click="$emit('delete', form.id)">删除</button>
        <button type="button" @click="close">取消</button>
        <button class="expense-editor__primary" type="button" @click="save">保存</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.expense-editor {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  background: rgba(58, 34, 24, 0.34);
}

.expense-editor__sheet {
  width: 100%;
  padding: 20px 18px calc(env(safe-area-inset-bottom) + 18px);
  background: var(--journal-card, #fef8ee);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -18px 42px rgba(58, 34, 24, 0.18);
}

.expense-editor__header,
.expense-editor__actions,
.expense-editor__chips,
.expense-editor__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expense-editor__header,
.expense-editor__toggle {
  justify-content: space-between;
}

.expense-editor__title {
  color: var(--journal-text, #3a2218);
  font-size: 18px;
  font-weight: 900;
}

.expense-editor__field,
.expense-editor__group {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 12px;
  color: var(--journal-muted, #9a7050);
  font-size: 12px;
  font-weight: 800;
}

.expense-editor__field input {
  min-height: 40px;
  padding: 9px 12px;
  color: var(--journal-text, #3a2218);
  background: rgba(255, 252, 246, 0.72);
  border: 1px dashed rgba(154, 112, 80, 0.32);
  border-radius: 13px;
}

.expense-editor__chips {
  flex-wrap: wrap;
}

.expense-editor button,
.expense-editor__toggle {
  padding: 9px 12px;
  color: var(--journal-muted, #9a7050);
  font-size: 13px;
  font-weight: 800;
  background: rgba(154, 112, 80, 0.1);
  border: 0;
  border-radius: 999px;
}

.expense-editor button[data-active="true"],
.expense-editor__primary {
  color: #fffdf8;
  background: var(--journal-primary, #c96040);
}

.expense-editor__actions {
  justify-content: flex-end;
  margin-top: 16px;
}

.expense-editor__danger {
  margin-right: auto;
  color: #bf4d3a !important;
  background: rgba(191, 77, 58, 0.1) !important;
}
</style>
