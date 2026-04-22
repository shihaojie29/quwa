import { z } from "zod";

export const tripSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  destination: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  budget: z.number().nonnegative(),
  status: z.enum(["planning", "active", "completed", "cancelled"]),
  members: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      initial: z.string().min(1),
      color: z.string().min(1),
    }),
  ),
  reminders: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      note: z.string().optional(),
      pinned: z.boolean(),
      remindAt: z.string().optional(),
    }),
  ),
});

export const budgetSchema = z.object({
  budget: z.number().nonnegative(),
});

export const itineraryItemSchema = z.discriminatedUnion("kind", [
  z.object({
    id: z.string().min(1),
    kind: z.literal("activity"),
    title: z.string().min(1),
    time: z.string().min(1),
    note: z.string().optional(),
    location: z.string().optional(),
  }),
  z.object({
    id: z.string().min(1),
    kind: z.literal("transport"),
    title: z.string().min(1),
    time: z.string().min(1),
    timeEnd: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    note: z.string().optional(),
  }),
]);

export const expenseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(["交通", "住宿", "餐饮", "景点", "其他"]),
  amount: z.number().nonnegative(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paidBy: z.string().min(1),
  isAA: z.boolean(),
  note: z.string().optional(),
});

export const noteSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.string(),
  pinned: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const checklistItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(["证件证卡", "衣物", "电子", "其他"]),
  done: z.boolean(),
  note: z.string().optional(),
});

