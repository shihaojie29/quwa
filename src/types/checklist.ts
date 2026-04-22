export type ChecklistCategory = "证件证卡" | "衣物" | "电子" | "其他";

export interface ChecklistItem {
  id: string;
  title: string;
  category: ChecklistCategory;
  done: boolean;
  note?: string;
}
