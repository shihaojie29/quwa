type StorageValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

export interface StorageAdapter {
  get<T>(key: string): T | undefined;
  set<T extends StorageValue>(key: string, value: T): void;
  remove(key: string): void;
}

export const localStorageAdapter: StorageAdapter = {
  get<T>(key: string): T | undefined {
    return uni.getStorageSync(key) as T | undefined;
  },
  set<T extends StorageValue>(key: string, value: T): void {
    uni.setStorageSync(key, value);
  },
  remove(key: string): void {
    uni.removeStorageSync(key);
  },
};
