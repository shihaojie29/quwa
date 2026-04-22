<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    detail?: string;
    tone?: "primary" | "accent" | "muted";
  }>(),
  {
    detail: "",
    tone: "primary",
  },
);
</script>

<template>
  <view class="stat-card" :class="`stat-card--${tone}`">
    <text class="stat-card__label">{{ label }}</text>
    <text class="stat-card__value">{{ value }}</text>
    <text v-if="detail" class="stat-card__detail">{{ detail }}</text>
  </view>
</template>

<style scoped>
.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-height: 74px;
  padding: 15px 8px 12px;
  background-color: var(--journal-card, #fef8ee);
  border: 1px dashed var(--journal-soft, #e8d4b4);
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(60, 30, 10, 0.06);
  overflow: hidden;
  text-align: center;
}

.stat-card::before {
  position: absolute;
  top: -4px;
  left: 14px;
  width: 32px;
  height: 8px;
  content: "";
  background: rgba(232, 160, 80, 0.5);
  border-radius: 2px;
  transform: rotate(-2deg);
}

.stat-card__label {
  color: var(--journal-muted, #9a7050);
  font-size: 10px;
  font-weight: 600;
}

.stat-card__value {
  color: var(--journal-text, #3a2218);
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 23px;
  font-weight: 900;
  line-height: 1.1;
}

.stat-card__detail {
  color: var(--journal-muted, #9a7050);
  font-size: 10px;
  line-height: 1.35;
}

.stat-card--primary {
  border-color: var(--journal-soft, #e8d4b4);
}

.stat-card--accent {
  border-color: rgba(232, 160, 80, 0.52);
}

.stat-card--muted {
  background-color: rgba(254, 248, 238, 0.72);
}
</style>
