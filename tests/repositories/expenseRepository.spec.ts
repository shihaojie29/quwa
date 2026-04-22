import { STORAGE_KEYS } from "../../src/repositories/storage/storageKeys";
import { addExpense, getExpenses, updateExpense } from "../../src/repositories/expenseRepository";

describe("expenseRepository", () => {
  it("initializes expense storage from seed when empty", async () => {
    const expenses = await getExpenses();

    expect(expenses).not.toHaveLength(0);
    expect(expenses[0]?.title).toBeTruthy();
    expect(expenses.every((expense) => expense.paidBy && typeof expense.isAA === "boolean")).toBe(true);
    expect(uni.getStorageSync(STORAGE_KEYS.expense)).toEqual(expenses);
  });

  it("rejects categories outside the fixed enum", async () => {
    await expect(
      addExpense({
        id: "expense-invalid-1",
        title: "未知支出",
        category: "购物" as never,
        amount: 88,
        date: "2026-05-22",
        paidBy: "member-xiaoyu",
        isAA: true,
      }),
    ).rejects.toThrow(/category/i);
  });

  it("persists valid expense updates", async () => {
    const [expense] = await getExpenses();
    const updatedExpense = await updateExpense({
      ...expense,
      amount: 666,
    });

    expect(updatedExpense.amount).toBe(666);
    expect((uni.getStorageSync(STORAGE_KEYS.expense) as Array<{ id: string; amount: number }>).find((item) => item.id === expense.id)?.amount).toBe(666);
  });

  it("round-trips payer and AA fields through add, update, and get", async () => {
    const addedExpense = await addExpense({
      id: "expense-aa-1",
      title: "AA晚餐",
      category: "餐饮",
      amount: 300,
      date: "2026-05-22",
      paidBy: "member-xiaoyu",
      isAA: true,
    });

    expect(addedExpense.paidBy).toBe("member-xiaoyu");
    expect(addedExpense.isAA).toBe(true);

    await updateExpense({
      ...addedExpense,
      paidBy: "member-acheng",
      isAA: false,
    });

    const expenses = await getExpenses();
    const storedExpense = expenses.find((expense) => expense.id === "expense-aa-1");

    expect(storedExpense?.paidBy).toBe("member-acheng");
    expect(storedExpense?.isAA).toBe(false);
    expect(uni.getStorageSync(STORAGE_KEYS.expense)).toEqual(expenses);
  });
});
