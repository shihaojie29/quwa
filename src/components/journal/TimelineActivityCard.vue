<script setup lang="ts">
import type { ItineraryItem } from "../../types/itinerary";

defineProps<{
  item: Extract<ItineraryItem, { kind: "activity" }>;
}>();

defineEmits<{
  edit: [item: Extract<ItineraryItem, { kind: "activity" }>];
}>();
</script>

<template>
  <view class="activity-card" @click="$emit('edit', item)">
    <view class="activity-card__icon-wrap">
      <text class="activity-card__icon">✦</text>
    </view>
    <view class="activity-card__body">
    <view class="activity-card__head">
      <text class="activity-card__title">{{ item.title }}</text>
      <text class="activity-card__time">{{ item.time }}</text>
    </view>
    <text v-if="item.location" class="activity-card__location">{{ item.location }}</text>
    <text v-if="item.note" class="activity-card__note">{{ item.note }}</text>
    </view>
  </view>
</template>

<style scoped>
.activity-card {
  display: flex;
  flex: 1;
  gap: 10px;
  padding: 12px;
  background: var(--journal-card, #fef8ee);
  border: 1px dashed var(--journal-soft, #e8d4b4);
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(60, 30, 10, 0.04);
}

.activity-card__icon-wrap {
  display: flex;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  background: rgba(201, 96, 64, 0.1);
  border-radius: 10px;
}

.activity-card__icon {
  color: var(--journal-primary, #c96040);
  font-size: 16px;
  line-height: 1;
}

.activity-card__body {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.activity-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.activity-card__title {
  color: var(--journal-text, #3a2218);
  font-size: 14px;
  font-weight: 800;
}

.activity-card__time {
  color: var(--journal-primary, #c96040);
  font-size: 11px;
  font-weight: 800;
  background: rgba(201, 96, 64, 0.1);
  border-radius: 6px;
  padding: 2px 8px;
}

.activity-card__location,
.activity-card__note {
  color: var(--journal-muted, #9a7050);
  font-size: 13px;
  line-height: 1.45;
}
</style>
