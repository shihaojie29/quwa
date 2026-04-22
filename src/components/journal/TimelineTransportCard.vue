<script setup lang="ts">
import type { ItineraryItem } from "../../types/itinerary";

defineProps<{
  item: Extract<ItineraryItem, { kind: "transport" }>;
}>();

defineEmits<{
  edit: [item: Extract<ItineraryItem, { kind: "transport" }>];
}>();
</script>

<template>
  <view class="transport-card" @click="$emit('edit', item)">
    <view class="transport-card__head">
      <text class="transport-card__title">{{ item.title }}</text>
      <text v-if="item.note" class="transport-card__note-tag">{{ item.note }}</text>
    </view>
    <view class="transport-card__route">
      <view class="transport-card__station">
        <text class="transport-card__time">{{ item.time }}</text>
        <text class="transport-card__place">{{ item.from || "出发地待定" }}</text>
      </view>
      <view class="transport-card__connector">
        <text class="transport-card__icon">✈</text>
        <view class="transport-card__line" />
      </view>
      <view class="transport-card__station transport-card__station--end">
        <text class="transport-card__time">{{ item.timeEnd || "--:--" }}</text>
        <text class="transport-card__place">{{ item.to || "目的地待定" }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.transport-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  background: var(--journal-card, #fef8ee);
  border: 1px solid rgba(74, 132, 196, 0.18);
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(60, 30, 10, 0.05);
}

.transport-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
  background: rgba(74, 132, 196, 0.08);
}

.transport-card__title {
  color: var(--journal-text, #3a2218);
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 13px;
  font-weight: 900;
}

.transport-card__note-tag {
  flex: 0 0 auto;
  padding: 2px 8px;
  color: #4a84c4;
  font-size: 10px;
  font-weight: 800;
  background: rgba(74, 132, 196, 0.12);
  border-radius: 5px;
}

.transport-card__route {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  color: var(--journal-text, #3a2218);
  background: var(--journal-card, #fef8ee);
}

.transport-card__station {
  flex: 1;
  min-width: 0;
}

.transport-card__station--end {
  text-align: right;
}

.transport-card__time {
  display: block;
  color: var(--journal-text, #3a2218);
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
}

.transport-card__place {
  display: block;
  margin-top: 4px;
  color: var(--journal-muted, #9a7050);
  font-size: 10px;
  line-height: 1.3;
}

.transport-card__connector {
  position: relative;
  display: flex;
  flex: 0 0 52px;
  align-items: center;
  justify-content: center;
}

.transport-card__line {
  position: absolute;
  right: 0;
  left: 0;
  height: 1px;
  border-top: 1px dashed rgba(74, 132, 196, 0.48);
}

.transport-card__line::before,
.transport-card__line::after {
  position: absolute;
  top: -3px;
  width: 6px;
  height: 6px;
  content: "";
  background: #4a84c4;
  border-radius: 50%;
}

.transport-card__line::before {
  left: 0;
}

.transport-card__line::after {
  right: 0;
}

.transport-card__icon {
  position: relative;
  z-index: 1;
  padding: 0 5px;
  color: #4a84c4;
  font-size: 15px;
  background: var(--journal-card, #fef8ee);
}
</style>
