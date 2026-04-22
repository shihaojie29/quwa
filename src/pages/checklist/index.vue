<script setup lang="ts">
import { ref } from "vue";
import { CHECKLIST_CATEGORIES } from "../../constants/categories";
import SectionCard from "../../components/journal/SectionCard.vue";
import TravelPageShell from "../../components/journal/TravelPageShell.vue";
import { useChecklist } from "../../composables/useChecklist";
import type { ChecklistCategory } from "../../types/checklist";
import { goToTab, type TabKey } from "../../utils/navigation";

const {
  groupedItems,
  doneCount,
  totalCount,
  progressPercentage,
  progressText,
  ready,
  toggleItem,
  addItem,
  removeItem,
} = useChecklist();

const selectedCategory = ref<ChecklistCategory>("证件证卡");
const newItemTitle = ref("");

async function createItem() {
  const title = newItemTitle.value.trim();

  if (!title) {
    return;
  }

  await addItem({
    title,
    category: selectedCategory.value,
  });
  newItemTitle.value = "";
}
</script>

<template>
  <TravelPageShell active-tab="home" @change="(tab: TabKey) => goToTab(tab)">
    <view class="checklist-page">
      <view class="checklist-page__header">
        <view>
          <text class="checklist-page__eyebrow">Packing list</text>
          <text class="checklist-page__title">出发清单</text>
        </view>
        <view class="checklist-page__progress">
          <text>{{ progressText }}</text>
          <text>{{ progressPercentage }}%</text>
        </view>
      </view>

      <SectionCard title="添加物品" description="第一版使用固定分类，方便后续统计。">
        <view class="category-chips">
          <button
            v-for="category in CHECKLIST_CATEGORIES"
            :key="category"
            :data-active="selectedCategory === category"
            type="button"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </view>
        <view class="checklist-add">
          <input v-model="newItemTitle" placeholder="例如 护照" @confirm="createItem" />
          <button type="button" @click="createItem">添加</button>
        </view>
      </SectionCard>

      <SectionCard title="打包进度" :description="`已完成 ${doneCount} 项，共 ${totalCount} 项。`">
        <view v-if="totalCount" class="progress-bar">
          <view class="progress-bar__fill" :style="{ width: `${progressPercentage}%` }" />
        </view>
        <view v-else class="checklist-empty">
          <text>暂无清单项目。</text>
        </view>
      </SectionCard>

      <view class="checklist-groups">
        <SectionCard v-for="category in CHECKLIST_CATEGORIES" :key="category" :title="category">
          <view v-if="groupedItems[category].length" class="checklist-items">
            <view v-for="item in groupedItems[category]" :key="item.id" class="checklist-item">
              <view class="checklist-item__main" @click="toggleItem(item.id)">
                <view class="checklist-item__box" :data-done="item.done">{{ item.done ? "✓" : "" }}</view>
                <text :data-done="item.done">{{ item.title }}</text>
              </view>
              <button type="button" @click="removeItem(item.id)">删除</button>
            </view>
          </view>
          <view v-else class="checklist-empty">
            <text>这个分类还没有物品。</text>
          </view>
        </SectionCard>
      </view>
    </view>
  </TravelPageShell>
</template>

<style scoped>
.checklist-page,
.checklist-groups,
.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checklist-page__header,
.checklist-page__progress,
.checklist-add,
.checklist-item,
.checklist-item__main,
.category-chips {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checklist-page__header {
  justify-content: space-between;
}

.checklist-page__eyebrow,
.checklist-page__title {
  display: block;
}

.checklist-page__eyebrow {
  color: var(--journal-primary, #c96040);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.checklist-page__title {
  margin-top: 4px;
  color: var(--journal-text, #3a2218);
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 26px;
  font-weight: 900;
}

.checklist-page__progress {
  flex-direction: column;
  min-width: 64px;
  padding: 10px 12px;
  color: var(--journal-primary, #c96040);
  font-weight: 900;
  background: var(--journal-card, #fef8ee);
  border: 1px dashed var(--journal-soft, #e8d4b4);
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(60, 30, 10, 0.06);
}

.category-chips {
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.category-chips button,
.checklist-add button,
.checklist-item button {
  padding: 9px 12px;
  color: var(--journal-muted, #9a7050);
  font-size: 13px;
  font-weight: 800;
  background: var(--journal-card, #fef8ee);
  border: 1px dashed var(--journal-soft, #e8d4b4);
  border-radius: 10px;
}

.category-chips button[data-active="true"],
.checklist-add button {
  color: #fffdf8;
  background: var(--journal-primary, #c96040);
  border-color: var(--journal-primary, #c96040);
}

.checklist-add input {
  flex: 1;
  min-height: 40px;
  padding: 9px 12px;
  color: var(--journal-text, #3a2218);
  background: #f5ead4;
  border: 1px dashed var(--journal-soft, #e8d4b4);
  border-radius: 10px;
}

.progress-bar {
  overflow: hidden;
  height: 10px;
  background: var(--journal-soft, #e8d4b4);
  border-radius: 999px;
}

.progress-bar__fill {
  height: 100%;
  background: var(--journal-gradient, linear-gradient(140deg, #c96040 0%, #e8a050 100%));
  border-radius: inherit;
}

.checklist-item {
  justify-content: space-between;
  padding: 11px 12px;
  background: rgba(255, 252, 246, 0.68);
  border: 1px dashed var(--journal-soft, #e8d4b4);
  border-radius: 14px;
}

.checklist-item__main {
  flex: 1;
}

.checklist-item__box {
  display: flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  color: #fffdf8;
  font-weight: 900;
  border: 2px solid rgba(154, 112, 80, 0.34);
  border-radius: 8px;
}

.checklist-item__box[data-done="true"] {
  background: var(--journal-primary, #c96040);
  border-color: var(--journal-primary, #c96040);
}

.checklist-item text[data-done="true"] {
  color: var(--journal-muted, #9a7050);
  text-decoration: line-through;
}

.checklist-empty {
  color: var(--journal-muted, #9a7050);
  font-size: 13px;
  line-height: 1.45;
}
</style>
