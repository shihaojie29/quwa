export type ExpenseCategory = "交通" | "住宿" | "餐饮" | "景点" | "其他";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidBy: string;
  isAA: boolean;
  note?: string;
}
