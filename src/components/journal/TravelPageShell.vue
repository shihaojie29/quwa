<script setup lang="ts">
import JournalTabBar from "./JournalTabBar.vue";
import type { TabKey } from "../../utils/navigation";

defineProps<{
  activeTab: TabKey;
}>();

const emit = defineEmits<{
  change: [tab: TabKey];
}>();

function handleTabChange(tab: TabKey) {
  emit("change", tab);
}
</script>

<template>
  <view class="travel-page-shell">
    <view class="travel-page-shell__top-safe" />
    <scroll-view class="travel-page-shell__content" scroll-y>
      <view class="travel-page-shell__content-inner">
        <slot />
      </view>
    </scroll-view>
    <view class="travel-page-shell__tab-area">
      <JournalTabBar :active-tab="activeTab" @change="handleTabChange" />
    </view>
  </view>
</template>

<style scoped>
.travel-page-shell {
  --journal-bg: #ddd3c4;
  --journal-card: #fef8ee;
  --journal-primary: #c96040;
  --journal-accent: #e8a050;
  --journal-text: #3a2218;
  --journal-muted: #9a7050;
  --journal-soft: #e8d4b4;
  --journal-tab-bg: #fbf2e0;
  --journal-tab-border: #e4cfa6;
  --journal-gradient: linear-gradient(140deg, #c96040 0%, #e8a050 100%);
  --journal-hero-gradient: linear-gradient(155deg, #b85438 0%, #c96040 45%, #e09850 100%);

  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(120, 80, 40, 0.04) 59px, rgba(120, 80, 40, 0.04) 60px),
    radial-gradient(ellipse at 15% 15%, #ede3d4 0%, transparent 55%),
    radial-gradient(ellipse at 85% 85%, #ccc0ae 0%, transparent 55%),
    var(--journal-bg, #f3e9d8);
  color: var(--journal-text, #3a2218);
  font-family: "PingFang SC", "Helvetica Neue", sans-serif;
  overflow: hidden;
}

.travel-page-shell::before,
.travel-page-shell::after {
  position: absolute;
  z-index: 0;
  color: rgba(123, 90, 58, 0.12);
  font-family: Georgia, serif;
  font-size: 26px;
  line-height: 1;
  content: "✈";
  pointer-events: none;
}

.travel-page-shell::before {
  top: 74px;
  right: 24px;
  transform: rotate(14deg);
}

.travel-page-shell::after {
  bottom: 124px;
  left: 22px;
  content: "✦";
  transform: rotate(-12deg);
}

.travel-page-shell__top-safe {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  height: calc(env(safe-area-inset-top) + 12px);
}

.travel-page-shell__content {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  min-height: 0;
}

.travel-page-shell__content-inner {
  padding: 0 16px 26px;
}

.travel-page-shell__tab-area {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  padding: 8px 16px calc(env(safe-area-inset-bottom) + 18px);
  background-color: rgba(251, 242, 224, 0.94);
  border-top: 1px solid var(--journal-tab-border, #e4cfa6);
  box-shadow: 0 -10px 28px rgba(60, 30, 10, 0.08);
}
</style>
