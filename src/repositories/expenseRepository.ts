import { EXPENSE_CATEGORIES } from "../constants/categories";
import { seedExpenses } from "../mock/seed";
import type { Expense } from "../types/expense";
import { localStorageAdapter } from "./storage/localStorageAdapter";
import { STORAGE_KEYS } from "./storage/storageKeys";

function cloneExpenses(expenses: Expense[]): Expense[] {
  return expenses.map((expense) => ({ ...expense }));
}

function validateExpenseCategory(expense: Expense): void {
  if (!EXPENSE_CATEGORIES.includes(expense.category)) {
    throw new Error(`Invalid expense category: ${expense.category}`);
  }
}

function persistExpenses(expenses: Expense[]): Expense[] {
  const nextExpenses = cloneExpenses(expenses);
  localStorageAdapter.set(STORAGE_KEYS.expense, nextExpenses);

  return nextExpenses;
}

export async function getExpenses(): Promise<Expense[]> {
  const storedExpenses = localStorageAdapter.get<Expense[]>(STORAGE_KEYS.expense);

  if (storedExpenses) {
    return cloneExpenses(storedExpenses);
  }

  return persistExpenses(seedExpenses);
}

export async function addExpense(expense: Expense): Promise<Expense> {
  validateExpenseCategory(expense);

  const expenses = await getExpenses();
  const nextExpense = { ...expense };

  persistExpenses([...expenses, nextExpense]);

  return nextExpense;
}

export async function updateExpense(expense: Expense): Promise<Expense> {
  validateExpenseCategory(expense);

  const expenses = await getExpenses();
  const nextExpense = { ...expense };

  persistExpenses(expenses.map((currentExpense) => (currentExpense.id === expense.id ? nextExpense : currentExpense)));

  return nextExpense;
}

export async function removeExpense(id: string): Promise<Expense[]> {
  const expenses = await getExpenses();

  return persistExpenses(expenses.filter((expense) => expense.id !== id));
}
