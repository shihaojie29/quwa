<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    content: string;
    time?: string;
    mine?: boolean;
  }>(),
  {
    title: "",
    time: "",
    mine: false,
  },
);
</script>

<template>
  <view class="chat-bubble" :data-mine="mine">
    <view class="chat-bubble__body">
      <text v-if="title" class="chat-bubble__title">{{ title }}</text>
      <text class="chat-bubble__content">{{ content }}</text>
    </view>
    <text v-if="time" class="chat-bubble__time">{{ time }}</text>
  </view>
</template>

<style scoped>
.chat-bubble {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.chat-bubble[data-mine="true"] {
  align-items: flex-end;
}

.chat-bubble__body {
  max-width: 78%;
  padding: 11px 14px;
  color: var(--journal-text, #3a2218);
  background: var(--journal-card, #fef8ee);
  border: 1px dashed var(--journal-soft, #e8d4b4);
  border-radius: 6px 16px 16px;
  box-shadow: 0 2px 8px rgba(60, 30, 10, 0.04);
}

.chat-bubble[data-mine="true"] .chat-bubble__body {
  color: #fffdf8;
  background: var(--journal-gradient, linear-gradient(140deg, #c96040 0%, #e8a050 100%));
  border: 0;
  border-radius: 16px 6px 16px 16px;
  box-shadow: 0 4px 14px rgba(201, 96, 64, 0.22);
}

.chat-bubble__title {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 900;
}

.chat-bubble__content {
  font-size: 14px;
  line-height: 1.5;
}

.chat-bubble__time {
  color: var(--journal-muted, #9a7050);
  font-size: 11px;
}
</style>
