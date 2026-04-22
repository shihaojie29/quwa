import request from "supertest";
import { createApp } from "../src/http/app";
import { InMemoryQuwaStore } from "../src/store/InMemoryQuwaStore";

const tripId = "trip-osaka-kyoto-2026";
const userId = "demo-user";

let client: ReturnType<typeof request>;

function api() {
  return client;
}

describe("Quwa backend API", () => {
  beforeEach(() => {
    client = request(createApp({ store: new InMemoryQuwaStore() }));
  });

  it("reports service health", async () => {
    const response = await api().get("/health").set("X-User-Id", userId).expect(200);

    expect(response.body).toEqual({ status: "ok" });
  });

  it("returns bootstrap data for the demo trip", async () => {
    const response = await api().get(`/api/trips/${tripId}/bootstrap`).set("X-User-Id", userId).expect(200);

    expect(response.body.trip).toMatchObject({
      id: tripId,
      name: "大阪·京都 6日游",
      destination: "OSAKA",
    });
    expect(response.body.trip.members).toHaveLength(2);
    expect(response.body.itineraryDays).toHaveLength(6);
    expect(response.body.expenses.length).toBeGreaterThan(0);
    expect(response.body.notes.length).toBeGreaterThan(0);
    expect(response.body.checklistItems.length).toBeGreaterThan(0);
  });

  it("updates trip budget", async () => {
    const response = await api().patch(`/api/trips/${tripId}/budget`).set("X-User-Id", userId).send({ budget: 8800 }).expect(200);

    expect(response.body.budget).toBe(8800);
  });

  it("creates updates and deletes itinerary items", async () => {
    const created = await api()
      .post(`/api/trips/${tripId}/itinerary-days/2026-05-20/items`)
      .set("X-User-Id", userId)
      .send({
        id: "item-test-dotonbori",
        kind: "activity",
        title: "道顿堀夜游",
        time: "19:30",
        location: "大阪",
        note: "晚饭后散步",
      })
      .expect(201);

    expect(created.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "item-test-dotonbori",
          title: "道顿堀夜游",
        }),
      ]),
    );

    const updated = await api()
      .put(`/api/trips/${tripId}/itinerary-days/2026-05-20/items/item-test-dotonbori`)
      .set("X-User-Id", userId)
      .send({
        id: "item-test-dotonbori",
        kind: "activity",
        title: "道顿堀夜景",
        time: "20:00",
        location: "大阪",
      })
      .expect(200);

    expect(updated.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "item-test-dotonbori",
          title: "道顿堀夜景",
        }),
      ]),
    );

    const removed = await api()
      .delete(`/api/trips/${tripId}/itinerary-days/2026-05-20/items/item-test-dotonbori`)
      .set("X-User-Id", userId)
      .expect(200);

    expect(removed.body.items).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "item-test-dotonbori" })]),
    );
  });

  it("rejects invalid expense categories", async () => {
    const response = await api()
      .post(`/api/trips/${tripId}/expenses`)
      .set("X-User-Id", userId)
      .send({
        id: "expense-invalid",
        title: "错误分类",
        category: "购物",
        amount: 50,
        date: "2026-05-21",
        paidBy: "member-xiaoyu",
        isAA: false,
      })
      .expect(400);

    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("creates updates and deletes expenses", async () => {
    const expense = {
      id: "expense-test",
      title: "拉面",
      category: "餐饮",
      amount: 88,
      date: "2026-05-21",
      paidBy: "member-xiaoyu",
      isAA: true,
    };

    await api().post(`/api/trips/${tripId}/expenses`).set("X-User-Id", userId).send(expense).expect(201);

    const updated = await api()
      .put(`/api/trips/${tripId}/expenses/expense-test`)
      .set("X-User-Id", userId)
      .send({ ...expense, title: "一兰拉面", amount: 98 })
      .expect(200);

    expect(updated.body).toMatchObject({ title: "一兰拉面", amount: 98 });

    const removed = await api().delete(`/api/trips/${tripId}/expenses/expense-test`).set("X-User-Id", userId).expect(200);

    expect(removed.body).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: "expense-test" })]));
  });

  it("creates updates and deletes notes", async () => {
    const note = {
      id: "note-test",
      title: "餐厅候选",
      content: "看看梅田附近的居酒屋",
      pinned: false,
      createdAt: "2026-05-02T08:00:00.000Z",
      updatedAt: "2026-05-02T08:00:00.000Z",
    };

    await api().post(`/api/trips/${tripId}/notes`).set("X-User-Id", userId).send(note).expect(201);

    const updated = await api()
      .put(`/api/trips/${tripId}/notes/note-test`)
      .set("X-User-Id", userId)
      .send({ ...note, content: "改成难波附近" })
      .expect(200);

    expect(updated.body.content).toBe("改成难波附近");

    const removed = await api().delete(`/api/trips/${tripId}/notes/note-test`).set("X-User-Id", userId).expect(200);

    expect(removed.body).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: "note-test" })]));
  });

  it("creates updates and deletes checklist items", async () => {
    const item = {
      id: "checklist-test",
      title: "转换插头",
      category: "电子",
      done: false,
    };

    await api().post(`/api/trips/${tripId}/checklist-items`).set("X-User-Id", userId).send(item).expect(201);

    const updated = await api()
      .put(`/api/trips/${tripId}/checklist-items/checklist-test`)
      .set("X-User-Id", userId)
      .send({ ...item, done: true })
      .expect(200);

    expect(updated.body.done).toBe(true);

    const removed = await api().delete(`/api/trips/${tripId}/checklist-items/checklist-test`).set("X-User-Id", userId).expect(200);

    expect(removed.body).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: "checklist-test" })]));
  });
});
