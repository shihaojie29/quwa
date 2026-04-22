import { computed, ref } from "vue";
import { addNote, getNotes, removeNote, updateNote } from "../repositories/notesRepository";
import { getTrip, updateTrip } from "../repositories/tripRepository";
import type { Note } from "../types/notes";
import type { Trip, TripReminder } from "../types/trip";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function noteTitleFromContent(content: string): string {
  const title = content.trim().split(/\s+/).slice(0, 8).join(" ");

  return title || "未命名笔记";
}

export function useNotes() {
  const trip = ref<Trip>();
  const notes = ref<Note[]>([]);
  const pinnedReminderDraft = ref("");
  const loading = ref(false);

  async function refresh(): Promise<void> {
    loading.value = true;

    try {
      const [nextTrip, nextNotes] = await Promise.all([getTrip(), getNotes()]);
      trip.value = nextTrip;
      notes.value = nextNotes;
      pinnedReminderDraft.value = nextTrip.reminders.find((reminder) => reminder.pinned)?.note ?? "";
    } finally {
      loading.value = false;
    }
  }

  const ready = refresh();

  const messages = notes;

  const recentPreviewMessages = computed(() =>
    [...notes.value]
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
      .slice(0, 3),
  );

  async function send(content: string, title = noteTitleFromContent(content)): Promise<Note> {
    const now = new Date().toISOString();
    const note: Note = {
      id: createId("note"),
      title,
      content,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    const nextNote = await addNote(note);
    notes.value = [...notes.value, nextNote];

    return nextNote;
  }

  async function update(nextNote: Note): Promise<Note> {
    const savedNote = await updateNote({
      ...nextNote,
      updatedAt: new Date().toISOString(),
    });
    notes.value = notes.value.map((note) => (note.id === savedNote.id ? savedNote : note));

    return savedNote;
  }

  async function remove(id: string): Promise<void> {
    notes.value = await removeNote(id);
  }

  async function savePinnedReminder(): Promise<TripReminder | undefined> {
    if (!trip.value) {
      return undefined;
    }

    const currentPinned = trip.value.reminders.find((reminder) => reminder.pinned);
    const nextReminder: TripReminder = {
      id: currentPinned?.id ?? createId("reminder"),
      title: currentPinned?.title ?? "置顶提醒",
      note: pinnedReminderDraft.value,
      pinned: true,
      remindAt: currentPinned?.remindAt,
    };
    const nextTrip = await updateTrip({
      ...trip.value,
      reminders: currentPinned
        ? trip.value.reminders.map((reminder) => (reminder.id === currentPinned.id ? nextReminder : reminder))
        : [nextReminder, ...trip.value.reminders],
    });
    trip.value = nextTrip;

    return nextReminder;
  }

  return {
    trip,
    notes,
    messages,
    loading,
    ready,
    refresh,
    recentPreviewMessages,
    send,
    update,
    remove,
    pinnedReminderDraft,
    savePinnedReminder,
  };
}
