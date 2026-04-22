<script setup lang="ts">
import { ref } from "vue";
import ChatBubble from "../../components/journal/ChatBubble.vue";
import SectionCard from "../../components/journal/SectionCard.vue";
import TravelPageShell from "../../components/journal/TravelPageShell.vue";
import { useNotes } from "../../composables/useNotes";
import { goToTab, type TabKey } from "../../utils/navigation";

const {
  notes,
  pinnedReminderDraft,
  ready,
  send,
  savePinnedReminder,
} = useNotes();

const inputText = ref("");

async function sendMessage() {
  const content = inputText.value.trim();

  if (!content) {
    return;
  }

  await send(content);
  inputText.value = "";
}
</script>

<template>
  <TravelPageShell active-tab="notes" @change="(tab: TabKey) => goToTab(tab)">
    <view class="notes-page">
      <view class="notes-page__header">
        <text class="notes-page__eyebrow">Travel notes</text>
        <text class="notes-page__title">旅行备注</text>
      </view>

      <SectionCard title="📌 置顶提醒" description="写下出发前最容易遗漏的事。">
        <label class="pinned-editor">
          <input v-model="pinnedReminderDraft" placeholder="例如 检查证件和酒店订单" />
          <button type="button" @click="savePinnedReminder">保存</button>
        </label>
      </SectionCard>

      <view class="notes-list">
        <ChatBubble
          v-for="note in notes"
          :key="note.id"
          :title="note.title"
          :content="note.content"
          :time="note.updatedAt.slice(0, 10)"
          :mine="!note.pinned"
        />
        <view v-if="!notes.length" class="notes-empty">
          <text>暂无备注，先写下一条旅行提醒。</text>
        </view>
      </view>

      <view class="notes-input">
        <input v-model="inputText" placeholder="写点什么..." @confirm="sendMessage" />
        <button type="button" @click="sendMessage">发送</button>
      </view>
    </view>
  </TravelPageShell>
</template>

<style scoped>
.notes-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 8px;
}

.notes-page__eyebrow,
.notes-page__title {
  display: block;
}

.notes-page__eyebrow {
  color: var(--journal-primary, #c96040);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.notes-page__title {
  margin-top: 4px;
  color: var(--journal-text, #3a2218);
  font-family: Georgia, "Palatino Linotype", serif;
  font-size: 26px;
  font-weight: 900;
}

.pinned-editor,
.notes-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pinned-editor input,
.notes-input input {
  flex: 1;
  min-height: 40px;
  padding: 9px 12px;
  color: var(--journal-text, #3a2218);
  background: #f5ead4;
  border: 1px dashed var(--journal-soft, #e8d4b4);
  border-radius: 10px;
}

.pinned-editor button,
.notes-input button {
  padding: 10px 14px;
  color: #fffdf8;
  font-size: 13px;
  font-weight: 800;
  background: var(--journal-gradient, linear-gradient(140deg, #c96040 0%, #e8a050 100%));
  border: 0;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(201, 96, 64, 0.24);
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 260px;
  padding: 14px 0 8px;
  background-image: repeating-linear-gradient(transparent, transparent 27px, rgba(180, 140, 100, 0.08) 27px, rgba(180, 140, 100, 0.08) 28px);
  background-position: 0 16px;
}

.notes-empty {
  padding: 18px;
  color: var(--journal-muted, #9a7050);
  background: rgba(255, 252, 246, 0.58);
  border: 1px dashed rgba(154, 112, 80, 0.3);
  border-radius: 18px;
}

.notes-input {
  position: sticky;
  bottom: 0;
  padding: 10px 0 2px;
  background: linear-gradient(180deg, rgba(221, 211, 196, 0), var(--journal-tab-bg, #fbf2e0) 38%);
  border-top: 1px solid rgba(228, 207, 166, 0.6);
}
</style>
