<script setup lang="ts">
import { TAB_ROUTES, type TabKey } from "../../utils/navigation";

defineProps<{
  activeTab: TabKey;
}>();

const emit = defineEmits<{
  change: [tab: TabKey];
}>();

const tabs = Object.keys(TAB_ROUTES) as TabKey[];
const tabMeta: Record<TabKey, { label: string; icon: string }> = {
  home: { label: "首页", icon: "⌂" },
  itinerary: { label: "行程", icon: "▦" },
  expense: { label: "账单", icon: "¥" },
  notes: { label: "备注", icon: "✎" },
};

function handleClick(tab: TabKey) {
  emit("change", tab);
}
</script>

<template>
  <view class="journal-tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab"
      class="journal-tab-bar__button"
      :class="{ 'journal-tab-bar__button--active': tab === activeTab }"
      :data-tab="tab"
      :data-active="tab === activeTab ? 'true' : 'false'"
      :aria-pressed="tab === activeTab"
      type="button"
      @click="handleClick(tab)"
    >
      <text class="journal-tab-bar__icon">{{ tabMeta[tab].icon }}</text>
      <text class="journal-tab-bar__label">{{ tabMeta[tab].label }}</text>
    </button>
  </view>
</template>

<style scoped>
.journal-tab-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.journal-tab-bar__button {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 4px 0;
  color: var(--journal-muted, #9a7050);
  line-height: 1;
  background: transparent;
  border: 0;
  border-radius: 14px;
  box-shadow: none;
  gap: 4px;
}

.journal-tab-bar__button::after {
  border: 0;
}

.journal-tab-bar__icon {
  display: flex;
  width: 24px;
  height: 22px;
  align-items: center;
  justify-content: center;
  color: currentColor;
  font-family: Georgia, serif;
  font-size: 19px;
  font-weight: 800;
  line-height: 1;
}

.journal-tab-bar__label {
  color: currentColor;
  font-size: 10px;
  font-weight: 500;
}

.journal-tab-bar__button--active {
  color: var(--journal-primary, #c96040);
}

.journal-tab-bar__button:active {
  background-color: rgba(201, 96, 64, 0.08);
}

.journal-tab-bar__button--active .journal-tab-bar__icon {
  color: #fffdf8;
  background: var(--journal-primary, #c96040);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(201, 96, 64, 0.28);
}

.journal-tab-bar__button--active .journal-tab-bar__label {
  font-weight: 800;
}
</style>
