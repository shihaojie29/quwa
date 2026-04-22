<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description?: string;
  }>(),
  {
    eyebrow: "",
    description: "",
  },
);
</script>

<template>
  <view class="section-card">
    <view class="section-card__tape" />
    <view class="section-card__header">
      <text v-if="eyebrow" class="section-card__eyebrow">{{ eyebrow }}</text>
      <text class="section-card__title">{{ title }}</text>
      <text v-if="description" class="section-card__description">{{ description }}</text>
    </view>
    <view class="section-card__body">
      <slot />
    </view>
  </view>
</template>

<style scoped>
.section-card {
  position: relative;
  padding: 17px 16px 16px;
  background-color: var(--journal-card, #fef8ee);
  border: 1px dashed var(--journal-soft, #e8d4b4);
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(60, 30, 10, 0.06);
  overflow: visible;
}

.section-card__tape {
  position: absolute;
  top: -5px;
  left: 18px;
  width: 42px;
  height: 10px;
  background: rgba(232, 160, 80, 0.48);
  border-radius: 2px;
  transform: rotate(-2deg);
}

.section-card__header {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.section-card__eyebrow {
  color: var(--journal-primary, #c96040);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.section-card__title {
  color: var(--journal-text, #3a2218);
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.2;
}

.section-card__description {
  color: var(--journal-muted, #9a7050);
  font-size: 12px;
  line-height: 1.45;
}

.section-card__body {
  margin-top: 14px;
}
</style>
