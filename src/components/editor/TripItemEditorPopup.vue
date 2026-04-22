<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { ItineraryItem } from "../../types/itinerary";

type Draft = Partial<ItineraryItem> & { kind?: ItineraryItem["kind"] };

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    draft?: Draft;
  }>(),
  {
    draft: () => ({ kind: "activity" }),
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  save: [item: ItineraryItem];
  delete: [id: string];
}>();

const form = reactive({
  id: "",
  kind: "activity" as ItineraryItem["kind"],
  title: "",
  time: "",
  timeEnd: "",
  from: "",
  to: "",
  location: "",
  note: "",
});

watch(
  () => props.draft,
  (draft) => {
    form.id = draft?.id ?? "";
    form.kind = draft?.kind ?? "activity";
    form.title = draft?.title ?? "";
    form.time = draft?.time ?? "";
    form.note = draft?.note ?? "";
    form.timeEnd = draft?.kind === "transport" ? draft.timeEnd ?? "" : "";
    form.from = draft?.kind === "transport" ? draft.from ?? "" : "";
    form.to = draft?.kind === "transport" ? draft.to ?? "" : "";
    form.location = draft?.kind === "activity" ? draft.location ?? "" : "";
  },
  { immediate: true, deep: true },
);

const canSave = computed(() => form.title.trim().length > 0 && form.time.trim().length > 0);

function close() {
  emit("update:modelValue", false);
}

function save() {
  if (!canSave.value) {
    return;
  }

  const base = {
    id: form.id || `itinerary-${Date.now()}`,
    title: form.title.trim(),
    time: form.time.trim(),
    note: form.note.trim() || undefined,
  };

  emit(
    "save",
    form.kind === "transport"
      ? {
          ...base,
          kind: "transport",
          timeEnd: form.timeEnd.trim() || undefined,
          from: form.from.trim() || undefined,
          to: form.to.trim() || undefined,
        }
      : {
          ...base,
          kind: "activity",
          location: form.location.trim() || undefined,
        },
  );
}
</script>

<template>
  <view v-if="modelValue" class="trip-editor">
    <view class="trip-editor__sheet">
      <view class="trip-editor__header">
        <text class="trip-editor__title">{{ form.id ? "编辑行程" : "添加安排" }}</text>
        <button class="trip-editor__ghost" type="button" @click="close">关闭</button>
      </view>

      <view class="trip-editor__segment">
        <button :data-active="form.kind === 'activity'" type="button" @click="form.kind = 'activity'">活动</button>
        <button :data-active="form.kind === 'transport'" type="button" @click="form.kind = 'transport'">交通</button>
      </view>

      <label class="trip-editor__field">
        <text>名称</text>
        <input v-model="form.title" placeholder="例如 外滩散步" />
      </label>

      <label class="trip-editor__field">
        <text>{{ form.kind === "transport" ? "出发时间" : "时间" }}</text>
        <input v-model="form.time" placeholder="09:00" />
      </label>

      <template v-if="form.kind === 'transport'">
        <label class="trip-editor__field">
          <text>到达时间</text>
          <input v-model="form.timeEnd" placeholder="10:30" />
        </label>
        <label class="trip-editor__field">
          <text>出发站</text>
          <input v-model="form.from" placeholder="出发地" />
        </label>
        <label class="trip-editor__field">
          <text>到达站</text>
          <input v-model="form.to" placeholder="目的地" />
        </label>
      </template>

      <label v-else class="trip-editor__field">
        <text>地点</text>
        <input v-model="form.location" placeholder="可选" />
      </label>

      <label class="trip-editor__field">
        <text>备注</text>
        <input v-model="form.note" placeholder="可选" />
      </label>

      <view class="trip-editor__actions">
        <button v-if="form.id" class="trip-editor__danger" type="button" @click="$emit('delete', form.id)">删除</button>
        <button class="trip-editor__ghost" type="button" @click="close">取消</button>
        <button class="trip-editor__primary" :disabled="!canSave" type="button" @click="save">保存</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.trip-editor {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  background: rgba(58, 34, 24, 0.34);
}

.trip-editor__sheet {
  width: 100%;
  padding: 20px 18px calc(env(safe-area-inset-bottom) + 18px);
  background: var(--journal-card, #fef8ee);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -18px 42px rgba(58, 34, 24, 0.18);
}

.trip-editor__header,
.trip-editor__actions,
.trip-editor__segment {
  display: flex;
  gap: 10px;
  align-items: center;
}

.trip-editor__header {
  justify-content: space-between;
  margin-bottom: 16px;
}

.trip-editor__title {
  color: var(--journal-text, #3a2218);
  font-size: 18px;
  font-weight: 900;
}

.trip-editor__segment {
  margin-bottom: 14px;
}

.trip-editor__segment button,
.trip-editor__ghost,
.trip-editor__primary,
.trip-editor__danger {
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
}

.trip-editor__segment button {
  flex: 1;
  padding: 10px 12px;
  color: var(--journal-muted, #9a7050);
  background: rgba(154, 112, 80, 0.1);
}

.trip-editor__segment button[data-active="true"],
.trip-editor__primary {
  color: #fffdf8;
  background: var(--journal-primary, #c96040);
}

.trip-editor__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  color: var(--journal-muted, #9a7050);
  font-size: 12px;
  font-weight: 800;
}

.trip-editor__field input {
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  padding: 9px 12px;
  color: var(--journal-text, #3a2218);
  background: rgba(255, 252, 246, 0.72);
  border: 1px dashed rgba(154, 112, 80, 0.32);
  border-radius: 13px;
}

.trip-editor__actions {
  justify-content: flex-end;
  margin-top: 4px;
}

.trip-editor__ghost {
  padding: 10px 14px;
  color: var(--journal-muted, #9a7050);
  background: rgba(154, 112, 80, 0.1);
}

.trip-editor__primary {
  padding: 10px 18px;
}

.trip-editor__danger {
  margin-right: auto;
  padding: 10px 14px;
  color: #bf4d3a;
  background: rgba(191, 77, 58, 0.1);
}
</style>
