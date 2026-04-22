import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { seedExpenses, seedItinerary, seedTrip } from "../../src/mock/seed";
import HomePage from "../../src/pages/home/index.vue";

describe("HomePage", () => {
  it("renders seed-backed trip identity, transport, reminder, and budget totals from composables", async () => {
    const wrapper = mount(HomePage);

    await Promise.all([
      (wrapper.vm as unknown as { tripReady: Promise<void> }).tripReady,
      (wrapper.vm as unknown as { expenseReady: Promise<void> }).expenseReady,
      (wrapper.vm as unknown as { notesReady: Promise<void> }).notesReady,
    ]);
    await wrapper.vm.$nextTick();

    const text = wrapper.text();
    const spentTotal = seedExpenses.reduce((total, expense) => total + expense.amount, 0);
    const remainingBudget = seedTrip.budget - spentTotal;

    expect(text).toContain(seedTrip.destination);
    expect(text).toContain(seedTrip.members[0].initial);
    expect(text).toContain(seedTrip.members[1].initial);
    expect(text).toContain(seedItinerary[0].items[0].title);
    expect(text).toContain(seedTrip.reminders[0].note);
    expect(text).toContain(`已花 ¥${Math.round(spentTotal).toLocaleString("zh-CN")}`);
    expect(text).toContain(`剩余 ¥${Math.round(remainingBudget).toLocaleString("zh-CN")}`);
  });
});
