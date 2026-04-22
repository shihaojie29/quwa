import { beforeEach, vi } from "vitest";

const storage = new Map<string, unknown>();

const uniMock = {
  getStorageSync: vi.fn((key: string) => storage.get(key)),
  setStorageSync: vi.fn((key: string, value: unknown) => {
    storage.set(key, value);
  }),
  removeStorageSync: vi.fn((key: string) => {
    storage.delete(key);
  }),
  navigateTo: vi.fn(),
  redirectTo: vi.fn(),
};

Object.assign(globalThis, { uni: uniMock });

beforeEach(() => {
  storage.clear();
  vi.clearAllMocks();
});
