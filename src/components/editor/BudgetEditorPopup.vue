<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  modelValue: boolean;
  budget: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  save: [amount: number];
}>();

const inputValue = ref(String(props.budget || ""));

watch(
  () => props.budget,
  (budget) => {
    inputValue.value = String(budget || "");
  },
);

function close() {
  emit("update:modelValue", false);
}

function save() {
  const amount = Number.parseInt(inputValue.value.replace(/[^\d]/g, ""), 10);

  if (Number.isFinite(amount) && amount > 0) {
    emit("save", amount);
  }
}
</script>

<template>
  <view v-if="modelValue" class="budget-editor">
    <view class="budget-editor__panel">
      <text class="budget-editor__title">设置旅行预算</text>
      <label class="budget-editor__field">
        <text>预算金额</text>
        <input v-model="inputValue" type="number" placeholder="输入预算" />
      </label>
      <view class="budget-editor__actions">
        <button type="button" @click="close">取消</button>
        <button class="budget-editor__primary" type="button" @click="save">确认</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.budget-editor {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  padding: 24px;
  background: rgba(58, 34, 24, 0.34);
}

.budget-editor__panel {
  box-sizing: border-box;
  width: 100%;
  padding: 22px;
  background: var(--journal-card, #fef8ee);
  border-radius: 24px;
  box-shadow: 0 18px 42px rgba(58, 34, 24, 0.18);
}

.budget-editor__title {
  display: block;
  color: var(--journal-text, #3a2218);
  font-size: 18px;
  font-weight: 900;
}

.budget-editor__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  color: var(--journal-muted, #9a7050);
  font-size: 12px;
  font-weight: 800;
}

.budget-editor__field input {
  min-height: 44px;
  padding: 10px 12px;
  color: var(--journal-text, #3a2218);
  background: rgba(255, 252, 246, 0.76);
  border: 1px dashed rgba(154, 112, 80, 0.32);
  border-radius: 14px;
}

.budget-editor__actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 18px;
}

.budget-editor__actions button {
  padding: 10px 16px;
  color: var(--journal-muted, #9a7050);
  font-size: 13px;
  font-weight: 800;
  background: rgba(154, 112, 80, 0.1);
  border: 0;
  border-radius: 999px;
}

.budget-editor__actions .budget-editor__primary {
  color: #fffdf8;
  background: var(--journal-primary, #c96040);
}
</style>
