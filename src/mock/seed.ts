import { CHECKLIST_CATEGORIES, EXPENSE_CATEGORIES } from "../constants/categories";
import type { ChecklistItem } from "../types/checklist";
import type { Expense } from "../types/expense";
import type { ItineraryDay } from "../types/itinerary";
import type { Note } from "../types/notes";
import type { Trip } from "../types/trip";
import { buildTripDays } from "../utils/date";

export const seedTrip: Trip = {
  id: "trip-osaka-kyoto-2026",
  name: "大阪·京都 6日游",
  destination: "OSAKA",
  startDate: "2026-05-20",
  endDate: "2026-05-25",
  budget: 6800,
  status: "planning",
  members: [
    {
      id: "member-xiaoyu",
      name: "小鱼",
      initial: "鱼",
      color: "#F07A5A",
    },
    {
      id: "member-acheng",
      name: "阿橙",
      initial: "橙",
      color: "#FFB84D",
    },
  ],
  reminders: [
    {
      id: "reminder-pinned-1",
      title: "居酒屋预约",
      note: "5月21日 19:00 · 2位，出发前再确认一次。",
      pinned: true,
      remindAt: "2026-05-19",
    },
  ],
};

export const seedItinerary: ItineraryDay[] = buildTripDays(seedTrip.startDate, seedTrip.endDate).map((day, index) => ({
  ...day,
  label: `第${index + 1}天`,
  items:
    index === 0
      ? [
          {
            id: "item-flight-1",
            kind: "transport",
            title: "JL789 飞大阪",
            time: "08:50",
            timeEnd: "10:30",
            from: "上海浦东 PVG",
            to: "关西机场 KIX",
            note: "经济舱 · 约2h40m",
          },
        ]
      : [
          {
            id: `item-activity-${index + 1}`,
            kind: "activity",
            title: index === 1 ? "大阪城公园" : "京都城市漫游",
            time: "10:00",
            location: index === 1 ? "大阪" : "京都",
            note: index === 1 ? "天守阁和公园慢慢逛。" : "自由安排半天时间。",
          },
        ],
}));

export const seedExpenses: Expense[] = [
  {
    id: "expense-transport-1",
    title: "机票定金",
    category: EXPENSE_CATEGORIES[0],
    amount: 320,
    date: "2026-05-20",
    paidBy: "member-xiaoyu",
    isAA: true,
  },
  {
    id: "expense-hotel-1",
    title: "酒店 6 晚",
    category: EXPENSE_CATEGORIES[1],
    amount: 2400,
    date: "2026-05-20",
    paidBy: "member-acheng",
    isAA: true,
  },
  {
    id: "expense-food-1",
    title: "晚餐",
    category: EXPENSE_CATEGORIES[2],
    amount: 168,
    date: "2026-05-20",
    paidBy: "member-xiaoyu",
    isAA: false,
  },
  {
    id: "expense-sight-1",
    title: "大阪城门票",
    category: EXPENSE_CATEGORIES[3],
    amount: 98,
    date: "2026-05-21",
    paidBy: "member-acheng",
    isAA: true,
  },
  {
    id: "expense-other-1",
    title: "便利店零食",
    category: EXPENSE_CATEGORIES[4],
    amount: 42,
    date: "2026-05-21",
    paidBy: "member-xiaoyu",
    isAA: false,
  },
];

export const seedNotes: Note[] = [
  {
    id: "note-1",
    title: "行前提醒",
    content: "确认护照、机票和酒店订单。",
    pinned: true,
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z",
  },
];

export const seedChecklist: ChecklistItem[] = [
  {
    id: "checklist-id-1",
    title: "护照",
    category: CHECKLIST_CATEGORIES[0],
    done: false,
  },
  {
    id: "checklist-clothes-1",
    title: "换洗衣物 ×5",
    category: CHECKLIST_CATEGORIES[1],
    done: false,
  },
  {
    id: "checklist-electronic-1",
    title: "充电器",
    category: CHECKLIST_CATEGORIES[2],
    done: false,
  },
];
