import { computed, ref } from "vue";
import { EXPENSE_CATEGORIES } from "../constants/categories";
import { addExpense, getExpenses, removeExpense, updateExpense } from "../repositories/expenseRepository";
import { getTrip, updateBudget } from "../repositories/tripRepository";
import type { Expense, ExpenseCategory } from "../types/expense";
import type { Member, Trip } from "../types/trip";

interface CategoryBreakdownItem {
  category: ExpenseCategory;
  amount: number;
  count: number;
}

interface AAMemberSummary {
  member: Member;
  paid: number;
  share: number;
  balance: number;
}

interface AASettlement {
  from: Member;
  to: Member;
  amount: number;
}

interface AASummary {
  total: number;
  participants: AAMemberSummary[];
  settlements: AASettlement[];
}

function buildSettlements(participants: AAMemberSummary[]): AASettlement[] {
  const debtors = participants
    .filter((participant) => participant.balance < 0)
    .map((participant) => ({ ...participant, remaining: Math.abs(participant.balance) }));
  const creditors = participants
    .filter((participant) => participant.balance > 0)
    .map((participant) => ({ ...participant, remaining: participant.balance }));
  const settlements: AASettlement[] = [];

  for (const debtor of debtors) {
    for (const creditor of creditors) {
      if (debtor.remaining <= 0) {
        break;
      }

      if (creditor.remaining <= 0) {
        continue;
      }

      const amount = Math.min(debtor.remaining, creditor.remaining);
      debtor.remaining -= amount;
      creditor.remaining -= amount;
      settlements.push({
        from: debtor.member,
        to: creditor.member,
        amount: Number(amount.toFixed(2)),
      });
    }
  }

  return settlements;
}

export function useExpense() {
  const trip = ref<Trip>();
  const expenses = ref<Expense[]>([]);
  const loading = ref(false);

  async function refresh(): Promise<void> {
    loading.value = true;

    try {
      const [nextTrip, nextExpenses] = await Promise.all([getTrip(), getExpenses()]);
      trip.value = nextTrip;
      expenses.value = nextExpenses;
    } finally {
      loading.value = false;
    }
  }

  const ready = refresh();

  const spentTotal = computed(() => expenses.value.reduce((total, expense) => total + expense.amount, 0));

  const remainingBudget = computed(() => (trip.value?.budget ?? 0) - spentTotal.value);

  const categoryBreakdown = computed<CategoryBreakdownItem[]>(() =>
    EXPENSE_CATEGORIES.map((category) => {
      const categoryExpenses = expenses.value.filter((expense) => expense.category === category);

      return {
        category,
        amount: categoryExpenses.reduce((total, expense) => total + expense.amount, 0),
        count: categoryExpenses.length,
      };
    }),
  );

  const aaSummary = computed<AASummary>(() => {
    const participants = trip.value?.members ?? [];
    const aaExpenses = expenses.value.filter((expense) => expense.isAA);
    const total = aaExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const share = participants.length > 0 ? total / participants.length : 0;
    const summaries = participants.map((member) => {
      const paid = aaExpenses
        .filter((expense) => expense.paidBy === member.id)
        .reduce((sum, expense) => sum + expense.amount, 0);

      return {
        member,
        paid,
        share,
        balance: Number((paid - share).toFixed(2)),
      };
    });

    return {
      total,
      participants: summaries,
      settlements: buildSettlements(summaries),
    };
  });

  async function add(expense: Expense): Promise<Expense> {
    const nextExpense = await addExpense(expense);
    expenses.value = [...expenses.value, nextExpense];

    return nextExpense;
  }

  async function update(expense: Expense): Promise<Expense> {
    const nextExpense = await updateExpense(expense);
    expenses.value = expenses.value.map((currentExpense) => (currentExpense.id === nextExpense.id ? nextExpense : currentExpense));

    return nextExpense;
  }

  async function remove(id: string): Promise<void> {
    expenses.value = await removeExpense(id);
  }

  async function setBudget(amount: number): Promise<void> {
    trip.value = await updateBudget(amount);
  }

  return {
    trip,
    expenses,
    loading,
    ready,
    refresh,
    spentTotal,
    remainingBudget,
    categoryBreakdown,
    aaSummary,
    add,
    update,
    remove,
    setBudget,
  };
}
