import { seedNotes } from "../mock/seed";
import type { Note } from "../types/notes";
import { localStorageAdapter } from "./storage/localStorageAdapter";
import { STORAGE_KEYS } from "./storage/storageKeys";

function cloneNotes(notes: Note[]): Note[] {
  return notes.map((note) => ({ ...note }));
}

function persistNotes(notes: Note[]): Note[] {
  const nextNotes = cloneNotes(notes);
  localStorageAdapter.set(STORAGE_KEYS.notes, nextNotes);

  return nextNotes;
}

export async function getNotes(): Promise<Note[]> {
  const storedNotes = localStorageAdapter.get<Note[]>(STORAGE_KEYS.notes);

  if (storedNotes) {
    return cloneNotes(storedNotes);
  }

  return persistNotes(seedNotes);
}

export async function addNote(note: Note): Promise<Note> {
  const notes = await getNotes();
  const nextNote = { ...note };

  persistNotes([...notes, nextNote]);

  return nextNote;
}

export async function updateNote(note: Note): Promise<Note> {
  const notes = await getNotes();
  const nextNote = { ...note };

  persistNotes(notes.map((currentNote) => (currentNote.id === note.id ? nextNote : currentNote)));

  return nextNote;
}

export async function removeNote(id: string): Promise<Note[]> {
  const notes = await getNotes();

  return persistNotes(notes.filter((note) => note.id !== id));
}
