import { describe, expect, it } from "vitest";
import { useExpense } from "@/composables/useExpense";

async function mountExpenseComposableWithSeed() {
  const expense = useExpense();

  await expense.ready;

  return expense;
}

describe("useExpense", () => {
  it("computes AA balances from only AA expenses and allocates payments by payer", async () => {
    const { aaSummary } = await mountExpenseComposableWithSeed();
    const participantsById = new Map(aaSummary.value.participants.map((participant) => [participant.member.id, participant]));
    const settlement = aaSummary.value.settlements[0];

    expect(aaSummary.value.total).toBe(2818);
    expect(participantsById.get("member-xiaoyu")?.paid).toBe(320);
    expect(participantsById.get("member-acheng")?.paid).toBe(2498);
    expect(participantsById.get("member-xiaoyu")?.share).toBe(1409);
    expect(participantsById.get("member-acheng")?.share).toBe(1409);
    expect(participantsById.get("member-xiaoyu")?.balance).toBe(-1089);
    expect(participantsById.get("member-acheng")?.balance).toBe(1089);
    expect(settlement).toMatchObject({
      from: expect.objectContaining({ id: "member-xiaoyu" }),
      to: expect.objectContaining({ id: "member-acheng" }),
      amount: 1089,
    });
  });
});
