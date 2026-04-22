<script setup lang="ts">
import { computed } from "vue";
import BudgetProgressCard from "../../components/journal/BudgetProgressCard.vue";
import HeroTicket from "../../components/journal/HeroTicket.vue";
import SectionCard from "../../components/journal/SectionCard.vue";
import StatCard from "../../components/journal/StatCard.vue";
import TravelPageShell from "../../components/journal/TravelPageShell.vue";
import { useExpense } from "../../composables/useExpense";
import { useNotes } from "../../composables/useNotes";
import { useTripData } from "../../composables/useTripData";
import { goToTab, type TabKey } from "../../utils/navigation";

const {
  trip,
  daysLeft,
  totalDays,
  statCards,
  upcomingTransport,
  dayPreview,
  pinnedReminder,
  ready: tripReady,
} = useTripData();
const { expenses, spentTotal, remainingBudget, aaSummary, ready: expenseReady } = useExpense();
const { recentPreviewMessages, pinnedReminderDraft, ready: notesReady } = useNotes();

const heroMeta = computed(() => {
  if (!trip.value) {
    return "";
  }

  return `${trip.value.startDate.slice(5)} - ${trip.value.endDate.slice(5)} / ${totalDays.value}天`;
});

const heroOrigin = computed(() => {
  if (upcomingTransport.value?.kind !== "transport") {
    return "";
  }

  return upcomingTransport.value.from ?? "";
});

const budgetProgress = computed(() => {
  const budget = trip.value?.budget ?? 0;

  return budget > 0 ? (spentTotal.value / budget) * 100 : 0;
});

const budgetCaption = computed(() => {
  const aaTotal = aaSummary.value.total;

  return aaTotal > 0 ? `AA ¥${formatAmount(aaTotal)}` : "暂无AA支出";
});

const upcomingTransportRoute = computed(() => {
  if (upcomingTransport.value?.kind !== "transport") {
    return "路线待定";
  }

  return `${upcomingTransport.value.from ?? "出发地待定"} -> ${upcomingTransport.value.to ?? "目的地待定"}`;
});

const reminderText = computed(() => pinnedReminder.value?.note ?? pinnedReminderDraft.value);
const hasExpenses = computed(() => expenses.value.length > 0);

function formatAmount(amount: number): string {
  return Math.round(amount).toLocaleString("zh-CN");
}

function handleTabChange(tab: TabKey): void {
  goToTab(tab);
}

function goChecklist(): void {
  uni.navigateTo({ url: "/pages/checklist/index" });
}
</script>

<template>
  <TravelPageShell active-tab="home" @change="handleTabChange">
    <view class="home-page">
      <HeroTicket
        class="home-page__hero"
        :title="trip?.destination ?? '目的地待定'"
        :subtitle="trip?.name ?? '完善旅行信息后开始计划'"
        :origin="heroOrigin"
        :destination="trip?.destination ?? ''"
        :meta="heroMeta"
      />

      <view class="home-page__identity">
        <view class="member-stack" aria-label="members">
          <view
            v-for="member in trip?.members ?? []"
            :key="member.id"
            class="member-stack__avatar"
            :style="{ backgroundColor: member.color }"
          >
            <text class="member-stack__initial">{{ member.initial }}</text>
          </view>
          <view v-if="!trip?.members.length" class="home-empty home-empty--inline">
            <text>暂无同行人</text>
          </view>
        </view>
        <view class="countdown-strip">
          <text class="countdown-strip__label">距离出发</text>
          <text class="countdown-strip__value">{{ daysLeft }}天</text>
        </view>
      </view>

      <view class="stat-row">
        <StatCard
          v-for="(stat, index) in statCards"
          :key="stat.label"
          :label="stat.label"
          :value="stat.value"
          :detail="index === 2 ? '按当前支出估算' : ''"
          :tone="index === 1 ? 'accent' : index === 2 ? 'muted' : 'primary'"
        />
      </view>

      <SectionCard eyebrow="Next" title="即将出发" description="先确认最近一段移动安排。">
        <view v-if="upcomingTransport" class="transport-card" @click="goToTab('itinerary')">
          <view class="transport-card__head">
            <text class="transport-card__title">{{ upcomingTransport.title }}</text>
            <text v-if="upcomingTransport.note" class="transport-card__tag">{{ upcomingTransport.note }}</text>
          </view>
          <view class="transport-card__route">
            <view class="transport-card__station">
              <text class="transport-card__time">{{ upcomingTransport.time }}</text>
              <text class="transport-card__place">{{ upcomingTransport.from || "出发地待定" }}</text>
            </view>
            <view class="transport-card__plane">
              <text class="transport-card__plane-icon">✈</text>
              <view class="transport-card__plane-line" />
            </view>
            <view class="transport-card__station transport-card__station--end">
              <text class="transport-card__time">{{ upcomingTransport.timeEnd || "--:--" }}</text>
              <text class="transport-card__place">{{ upcomingTransport.to || "目的地待定" }}</text>
            </view>
          </view>
          <text class="transport-card__route-text">{{ upcomingTransportRoute }}</text>
        </view>
        <view v-else class="home-empty" @click="goToTab('itinerary')">
          <text>暂无交通安排，去行程页添加第一段路。</text>
        </view>
      </SectionCard>

      <BudgetProgressCard
        title="预算"
        :spent-label="hasExpenses ? `已花 ¥${formatAmount(spentTotal)}` : '暂无支出记录'"
        :total-label="`剩余 ¥${formatAmount(remainingBudget)}`"
        :progress="budgetProgress"
        :caption="budgetCaption"
        @click="goToTab('expense')"
      />

      <SectionCard eyebrow="Plan" title="近日安排" description="预览前三天，每天只显示最重要的两项。">
        <view v-if="dayPreview.length" class="day-list">
          <view v-for="day in dayPreview" :key="day.date" class="day-list__item" @click="goToTab('itinerary')">
            <view class="day-list__date">
              <text class="day-list__label">{{ day.label ?? day.date }}</text>
              <text class="day-list__sub">{{ day.date.slice(5) }}</text>
            </view>
            <view class="day-list__body">
              <view v-for="item in day.items" :key="item.id" class="day-list__event">
                <text class="day-list__time">{{ item.time }}</text>
                <text class="day-list__title">{{ item.title }}</text>
              </view>
              <text v-if="!day.items.length" class="day-list__empty">这一天还没有安排</text>
              <text v-if="day.totalItems > day.items.length" class="day-list__more">还有 {{ day.totalItems - day.items.length }} 项</text>
            </view>
          </view>
        </view>
        <view v-else class="home-empty" @click="goToTab('itinerary')">
          <text>暂无日程预览，去行程页添加计划。</text>
        </view>
      </SectionCard>

      <SectionCard eyebrow="Notes" title="提醒和笔记" description="把出发前最容易遗漏的事放在这里。">
        <view class="notes-panel">
          <view class="pinned-note" @click="goToTab('notes')">
            <text class="pinned-note__label">置顶提醒</text>
            <text class="pinned-note__title">{{ pinnedReminder?.title ?? "暂无置顶提醒" }}</text>
            <text class="pinned-note__text">{{ reminderText || "去笔记页写下需要反复确认的事项。" }}</text>
          </view>
          <view class="recent-notes">
            <view v-for="note in recentPreviewMessages" :key="note.id" class="recent-notes__item" @click="goToTab('notes')">
              <text class="recent-notes__title">{{ note.title }}</text>
              <text class="recent-notes__content">{{ note.content }}</text>
            </view>
            <view v-if="!recentPreviewMessages.length" class="home-empty home-empty--soft" @click="goToTab('notes')">
              <text>暂无最近笔记。</text>
            </view>
          </view>
        </view>
      </SectionCard>

      <view class="checklist-shortcut" @click="goChecklist">
        <view>
          <text class="checklist-shortcut__eyebrow">Before leaving</text>
          <text class="checklist-shortcut__title">检查清单</text>
          <text class="checklist-shortcut__description">证件、衣物、充电器，出发前逐项确认。</text>
        </view>
        <text class="checklist-shortcut__action">打开</text>
      </view>
    </view>
  </TravelPageShell>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 8px;
}

.home-page__hero {
  margin-right: -16px;
  margin-left: -16px;
}

.home-page__identity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: -2px;
  padding: 0 4px;
}

.member-stack {
  display: flex;
  align-items: center;
  min-height: 42px;
}

.member-stack__avatar {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  margin-right: -8px;
  border: 2px solid rgba(255, 255, 255, 0.82);
  border-radius: 50%;
  box-shadow: 0 8px 18px rgba(58, 34, 24, 0.12);
}

.member-stack__initial {
  color: #fffdf8;
  font-size: 15px;
  font-weight: 900;
}

.countdown-strip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 13px;
  background-color: rgba(255, 255, 255, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(60, 30, 10, 0.05);
}

.countdown-strip__label {
  color: var(--journal-muted, #9a7050);
  font-size: 10px;
  font-weight: 600;
}

.countdown-strip__value {
  color: var(--journal-text, #3a2218);
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 22px;
  font-weight: 900;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.transport-card,
.day-list__item,
.checklist-shortcut {
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease;
}

.transport-card:active,
.day-list__item:active,
.checklist-shortcut:active {
  transform: translateY(1px);
}

.transport-card {
  overflow: hidden;
  padding: 0;
  background-color: transparent;
  border: 1px solid rgba(74, 132, 196, 0.18);
  border-radius: 14px;
}

.transport-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
  background: rgba(74, 132, 196, 0.08);
}

.transport-card__tag {
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
  padding: 12px 14px 10px;
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
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
}

.transport-card__place {
  display: block;
  margin-top: 4px;
  color: var(--journal-muted, #9a7050);
  font-size: 9px;
  line-height: 1.3;
}

.transport-card__plane {
  position: relative;
  display: flex;
  flex: 0 0 58px;
  align-items: center;
  justify-content: center;
}

.transport-card__plane-line {
  position: absolute;
  right: 0;
  left: 0;
  height: 1px;
  border-top: 1px dashed rgba(74, 132, 196, 0.5);
}

.transport-card__plane-line::before,
.transport-card__plane-line::after {
  position: absolute;
  top: -3px;
  width: 6px;
  height: 6px;
  content: "";
  background: #4a84c4;
  border-radius: 50%;
}

.transport-card__plane-line::before {
  left: 0;
}

.transport-card__plane-line::after {
  right: 0;
}

.transport-card__plane-icon {
  position: relative;
  z-index: 1;
  padding: 0 6px;
  color: #4a84c4;
  font-size: 16px;
  background: var(--journal-card, #fef8ee);
}

.transport-card__route-text {
  display: block;
  padding: 0 14px 12px;
  color: var(--journal-muted, #9a7050);
  font-size: 11px;
  background: var(--journal-card, #fef8ee);
}

.notes-panel,
.recent-notes,
.day-list__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transport-card__title,
.pinned-note__title,
.recent-notes__title,
.day-list__title,
.checklist-shortcut__title {
  color: var(--journal-text, #3a2218);
  font-weight: 800;
}

.pinned-note__text,
.recent-notes__content,
.day-list__sub,
.day-list__empty,
.day-list__more,
.checklist-shortcut__description {
  color: var(--journal-muted, #9a7050);
  font-size: 13px;
  line-height: 1.45;
}

.day-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.day-list__item {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid rgba(154, 112, 80, 0.18);
}

.day-list__item:first-child {
  padding-top: 0;
  border-top: 0;
}

.day-list__date {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day-list__label,
.pinned-note__label,
.checklist-shortcut__eyebrow {
  color: var(--journal-primary, #c96040);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.day-list__event {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 8px;
}

.day-list__time {
  color: var(--journal-muted, #9a7050);
  font-size: 12px;
  font-weight: 700;
}

.pinned-note,
.recent-notes__item,
.home-empty {
  padding: 14px;
  background-color: rgba(255, 252, 246, 0.62);
  border: 1px dashed rgba(154, 112, 80, 0.26);
  border-radius: 16px;
}

.pinned-note {
  display: flex;
  flex-direction: column;
  gap: 7px;
  border-style: solid;
  border-color: rgba(201, 96, 64, 0.24);
}

.recent-notes__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.home-empty {
  color: var(--journal-muted, #9a7050);
  font-size: 13px;
  line-height: 1.45;
}

.home-empty--inline {
  margin-left: 0;
  padding: 10px 12px;
}

.home-empty--soft {
  background-color: rgba(255, 252, 246, 0.38);
}

.checklist-shortcut {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 17px 16px;
  color: var(--journal-text, #3a2218);
  background:
    linear-gradient(135deg, rgba(201, 96, 64, 0.14), rgba(232, 160, 80, 0.18)),
    var(--journal-card, #fef8ee);
  border: 1px dashed rgba(201, 96, 64, 0.28);
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(60, 30, 10, 0.06);
}

.checklist-shortcut__title,
.checklist-shortcut__description {
  display: block;
  margin-top: 6px;
}

.checklist-shortcut__action {
  flex: 0 0 auto;
  padding: 9px 14px;
  color: #fffdf8;
  font-size: 13px;
  font-weight: 800;
  background-color: var(--journal-primary, #c96040);
  border-radius: 999px;
}

@media (max-width: 360px) {
  .stat-row {
    grid-template-columns: 1fr;
  }

  .day-list__item {
    grid-template-columns: 1fr;
  }
}
</style>
