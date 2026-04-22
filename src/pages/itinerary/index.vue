<script setup lang="ts">
import { computed, ref } from "vue";
import TripItemEditorPopup from "../../components/editor/TripItemEditorPopup.vue";
import SectionCard from "../../components/journal/SectionCard.vue";
import TimelineActivityCard from "../../components/journal/TimelineActivityCard.vue";
import TimelineTransportCard from "../../components/journal/TimelineTransportCard.vue";
import TravelPageShell from "../../components/journal/TravelPageShell.vue";
import { useItinerary } from "../../composables/useItinerary";
import type { ItineraryItem } from "../../types/itinerary";
import { goToTab, type TabKey } from "../../utils/navigation";

const {
  days,
  activeDayIndex,
  activeView,
  ready,
  setActiveDay,
  setActiveView,
  addItem,
  updateItem,
  removeItem,
} = useItinerary();

const editorOpen = ref(false);
const editingItem = ref<Partial<ItineraryItem> & { kind?: ItineraryItem["kind"] }>({ kind: "activity" });

const activeDay = computed(() => days.value[activeDayIndex.value]);
const hasItems = computed(() => (activeDay.value?.items.length ?? 0) > 0);

function openCreate(kind: ItineraryItem["kind"] = "activity") {
  editingItem.value = { kind };
  editorOpen.value = true;
}

function openEdit(item: ItineraryItem) {
  editingItem.value = { ...item };
  editorOpen.value = true;
}

async function saveItem(item: ItineraryItem) {
  const day = activeDay.value;

  if (!day) {
    return;
  }

  const exists = day.items.some((currentItem) => currentItem.id === item.id);

  if (exists) {
    await updateItem(day.date, item);
  } else {
    await addItem(day.date, item);
  }

  editorOpen.value = false;
}

async function deleteItem(id: string) {
  const day = activeDay.value;

  if (!day) {
    return;
  }

  await removeItem(day.date, id);
  editorOpen.value = false;
}

function goChecklist() {
  uni.navigateTo({ url: "/pages/checklist/index" });
}
</script>

<template>
  <TravelPageShell active-tab="itinerary" @change="(tab: TabKey) => goToTab(tab)">
    <view class="itinerary-page">
      <view class="itinerary-page__header">
        <view>
          <text class="itinerary-page__eyebrow">Journey plan</text>
          <text class="itinerary-page__title">行程安排</text>
        </view>
        <button class="itinerary-page__checklist" type="button" @click="goChecklist">清单</button>
      </view>

      <view class="itinerary-page__switch">
        <button :data-active="activeView === 'list'" type="button" @click="setActiveView('list')">列表</button>
        <button :data-active="activeView === 'map'" type="button" @click="setActiveView('map')">地图</button>
      </view>

      <scroll-view class="day-tabs" scroll-x>
        <button
          v-for="(day, index) in days"
          :key="day.date"
          class="day-tabs__item"
          :data-active="index === activeDayIndex"
          type="button"
          @click="setActiveDay(index)"
        >
          <text>{{ day.label ?? `Day ${index + 1}` }}</text>
          <text>{{ day.date.slice(5) }}</text>
        </button>
      </scroll-view>

      <SectionCard v-if="activeView === 'map'" title="地图视图" description="第一版先保留景点结构，后续接入地图 SDK。">
        <view class="map-placeholder">
          <text class="map-placeholder__icon">⌖</text>
          <text>{{ activeDay?.label ?? "暂无日期" }} · 已安排 {{ activeDay?.items.length ?? 0 }} 项</text>
        </view>
      </SectionCard>

      <SectionCard v-else :title="activeDay?.label ?? '暂无日期'" description="点击卡片编辑，或添加新的安排。">
        <view v-if="hasItems" class="timeline">
          <view v-for="item in activeDay?.items" :key="item.id" class="timeline__row">
            <view class="timeline__dot" />
            <TimelineTransportCard
              v-if="item.kind === 'transport'"
              :item="item"
              @edit="openEdit"
            />
            <TimelineActivityCard
              v-else
              :item="item"
              @edit="openEdit"
            />
          </view>
        </view>
        <view v-else class="itinerary-empty">
          <text>这一天还没有安排。</text>
        </view>
        <view class="itinerary-actions">
          <button type="button" @click="openCreate('activity')">添加活动</button>
          <button type="button" @click="openCreate('transport')">添加交通</button>
        </view>
      </SectionCard>
    </view>

    <TripItemEditorPopup
      v-model="editorOpen"
      :draft="editingItem"
      @save="saveItem"
      @delete="deleteItem"
    />
  </TravelPageShell>
</template>

<style scoped>
.itinerary-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 8px;
}

.itinerary-page__header,
.itinerary-page__switch,
.itinerary-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.itinerary-page__header {
  justify-content: space-between;
}

.itinerary-page__eyebrow,
.itinerary-page__title {
  display: block;
}

.itinerary-page__eyebrow {
  color: var(--journal-primary, #c96040);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.itinerary-page__title {
  margin-top: 4px;
  color: var(--journal-text, #3a2218);
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 26px;
  font-weight: 900;
}

.itinerary-page__checklist,
.itinerary-page__switch button,
.itinerary-actions button,
.day-tabs__item {
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
}

.itinerary-page__checklist {
  padding: 10px 14px;
  color: #fffdf8;
  background: var(--journal-gradient, linear-gradient(140deg, #c96040 0%, #e8a050 100%));
  box-shadow: 0 4px 14px rgba(201, 96, 64, 0.28);
}

.itinerary-page__switch button,
.itinerary-actions button {
  flex: 1;
  padding: 10px 12px;
  color: var(--journal-muted, #9a7050);
  background: var(--journal-card, #fef8ee);
  border: 1px dashed var(--journal-soft, #e8d4b4);
}

.itinerary-page__switch button[data-active="true"],
.itinerary-actions button:first-child {
  color: #fffdf8;
  background: var(--journal-primary, #c96040);
  border-color: var(--journal-primary, #c96040);
}

.day-tabs {
  white-space: nowrap;
}

.day-tabs__item {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  min-width: 74px;
  margin-right: 8px;
  padding: 10px 12px;
  color: var(--journal-muted, #9a7050);
  background: var(--journal-card, #fef8ee);
  border: 1px dashed var(--journal-soft, #e8d4b4);
  box-shadow: 0 2px 8px rgba(60, 30, 10, 0.04);
}

.day-tabs__item[data-active="true"] {
  color: #fffdf8;
  background: var(--journal-primary, #c96040);
  border-color: var(--journal-primary, #c96040);
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline__row {
  position: relative;
  display: flex;
  gap: 10px;
  padding-bottom: 12px;
}

.timeline__row::after {
  position: absolute;
  top: 26px;
  bottom: -2px;
  left: 8px;
  width: 2px;
  content: "";
  background: rgba(201, 96, 64, 0.18);
}

.timeline__row:last-child {
  padding-bottom: 0;
}

.timeline__row:last-child::after {
  display: none;
}

.timeline__dot {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  margin-top: 18px;
  background: var(--journal-primary, #c96040);
  border: 3px solid rgba(201, 96, 64, 0.18);
  border-radius: 50%;
  box-sizing: border-box;
}

.itinerary-empty,
.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  gap: 8px;
  color: var(--journal-muted, #9a7050);
  background:
    repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0, 0, 0, 0.04) 39px, rgba(0, 0, 0, 0.04) 40px),
    repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0, 0, 0, 0.04) 39px, rgba(0, 0, 0, 0.04) 40px),
    #e8e4dc;
  border: 1px dashed var(--journal-soft, #e8d4b4);
  border-radius: 18px;
}

.map-placeholder__icon {
  color: var(--journal-primary, #c96040);
  font-size: 34px;
}

.itinerary-actions {
  margin-top: 14px;
}
</style>
