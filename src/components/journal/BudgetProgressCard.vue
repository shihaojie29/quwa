<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    spentLabel: string;
    totalLabel: string;
    progress: number;
    caption?: string;
  }>(),
  {
    caption: "",
  },
);

const progressWidth = computed(() => `${Math.max(0, Math.min(100, props.progress))}%`);
</script>

<template>
  <view class="budget-progress-card">
    <view class="budget-progress-card__header">
      <text class="budget-progress-card__title">💰 {{ title }}进度</text>
      <text class="budget-progress-card__total">{{ totalLabel }}</text>
    </view>
    <view class="budget-progress-card__track">
      <view class="budget-progress-card__fill" :style="{ width: progressWidth }" />
    </view>
    <view class="budget-progress-card__footer">
      <text class="budget-progress-card__spent">{{ spentLabel }}</text>
      <text v-if="caption" class="budget-progress-card__caption">{{ caption }}</text>
    </view>
  </view>
</template>

<style scoped>
.budget-progress-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  background-color: var(--journal-card, #fef8ee);
  border: 1px dashed var(--journal-soft, #e8d4b4);
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(60, 30, 10, 0.06);
}

.budget-progress-card__header,
.budget-progress-card__footer {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.budget-progress-card__title {
  color: var(--journal-text, #3a2218);
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 14px;
  font-weight: 800;
}

.budget-progress-card__total,
.budget-progress-card__caption {
  color: var(--journal-muted, #9a7050);
  font-size: 11px;
}

.budget-progress-card__track {
  overflow: hidden;
  height: 8px;
  background-color: var(--journal-soft, #e8d4b4);
  border-radius: 999px;
}

.budget-progress-card__fill {
  height: 100%;
  background: var(--journal-gradient, linear-gradient(140deg, #c96040 0%, #e8a050 100%));
  border-radius: inherit;
}

.budget-progress-card__spent {
  color: var(--journal-primary, #c96040);
  font-size: 12px;
  font-weight: 800;
}
</style>
