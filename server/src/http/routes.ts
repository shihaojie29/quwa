import { Router, type NextFunction, type Request, type Response } from "express";
import type { z } from "zod";
import {
  budgetSchema,
  checklistItemSchema,
  expenseSchema,
  itineraryItemSchema,
  noteSchema,
  tripSchema,
} from "../validation";
import type { QuwaStore } from "../store/QuwaStore";

function userId(request: Request): string {
  return request.header("x-user-id") || "demo-user";
}

function routeParam(request: Request, name: string): string {
  const value = request.params[name];

  return Array.isArray(value) ? value[0] : value;
}

function parseBody<T extends z.ZodType>(schema: T, request: Request): z.infer<T> {
  return schema.parse(request.body) as z.infer<T>;
}

function asyncRoute(handler: (request: Request, response: Response) => Promise<void>) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response).catch(next);
  };
}

export function createRoutes(store: QuwaStore): Router {
  const router = Router();

  router.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  router.get(
    "/api/trips/:tripId/bootstrap",
    asyncRoute(async (request, response) => {
      response.json(await store.getBootstrap(userId(request), routeParam(request, "tripId")));
    }),
  );

  router.get(
    "/api/trips/:tripId",
    asyncRoute(async (request, response) => {
      response.json(await store.getTrip(userId(request), routeParam(request, "tripId")));
    }),
  );

  router.put(
    "/api/trips/:tripId",
    asyncRoute(async (request, response) => {
      response.json(await store.updateTrip(userId(request), routeParam(request, "tripId"), parseBody(tripSchema, request)));
    }),
  );

  router.patch(
    "/api/trips/:tripId/budget",
    asyncRoute(async (request, response) => {
      const { budget } = parseBody(budgetSchema, request);
      response.json(await store.updateBudget(userId(request), routeParam(request, "tripId"), budget));
    }),
  );

  router.get(
    "/api/trips/:tripId/itinerary-days",
    asyncRoute(async (request, response) => {
      response.json(await store.getItineraryDays(userId(request), routeParam(request, "tripId")));
    }),
  );

  router.post(
    "/api/trips/:tripId/itinerary-days/:date/items",
    asyncRoute(async (request, response) => {
      const day = await store.createItineraryItem(
        userId(request),
        routeParam(request, "tripId"),
        routeParam(request, "date"),
        parseBody(itineraryItemSchema, request),
      );
      response.status(201).json(day);
    }),
  );

  router.put(
    "/api/trips/:tripId/itinerary-days/:date/items/:itemId",
    asyncRoute(async (request, response) => {
      response.json(
        await store.updateItineraryItem(
          userId(request),
          routeParam(request, "tripId"),
          routeParam(request, "date"),
          routeParam(request, "itemId"),
          parseBody(itineraryItemSchema, request),
        ),
      );
    }),
  );

  router.delete(
    "/api/trips/:tripId/itinerary-days/:date/items/:itemId",
    asyncRoute(async (request, response) => {
      response.json(
        await store.deleteItineraryItem(
          userId(request),
          routeParam(request, "tripId"),
          routeParam(request, "date"),
          routeParam(request, "itemId"),
        ),
      );
    }),
  );

  router.get(
    "/api/trips/:tripId/expenses",
    asyncRoute(async (request, response) => {
      response.json(await store.getExpenses(userId(request), routeParam(request, "tripId")));
    }),
  );

  router.post(
    "/api/trips/:tripId/expenses",
    asyncRoute(async (request, response) => {
      response.status(201).json(await store.createExpense(userId(request), routeParam(request, "tripId"), parseBody(expenseSchema, request)));
    }),
  );

  router.put(
    "/api/trips/:tripId/expenses/:expenseId",
    asyncRoute(async (request, response) => {
      response.json(
        await store.updateExpense(
          userId(request),
          routeParam(request, "tripId"),
          routeParam(request, "expenseId"),
          parseBody(expenseSchema, request),
        ),
      );
    }),
  );

  router.delete(
    "/api/trips/:tripId/expenses/:expenseId",
    asyncRoute(async (request, response) => {
      response.json(await store.deleteExpense(userId(request), routeParam(request, "tripId"), routeParam(request, "expenseId")));
    }),
  );

  router.get(
    "/api/trips/:tripId/notes",
    asyncRoute(async (request, response) => {
      response.json(await store.getNotes(userId(request), routeParam(request, "tripId")));
    }),
  );

  router.post(
    "/api/trips/:tripId/notes",
    asyncRoute(async (request, response) => {
      response.status(201).json(await store.createNote(userId(request), routeParam(request, "tripId"), parseBody(noteSchema, request)));
    }),
  );

  router.put(
    "/api/trips/:tripId/notes/:noteId",
    asyncRoute(async (request, response) => {
      response.json(
        await store.updateNote(userId(request), routeParam(request, "tripId"), routeParam(request, "noteId"), parseBody(noteSchema, request)),
      );
    }),
  );

  router.delete(
    "/api/trips/:tripId/notes/:noteId",
    asyncRoute(async (request, response) => {
      response.json(await store.deleteNote(userId(request), routeParam(request, "tripId"), routeParam(request, "noteId")));
    }),
  );

  router.get(
    "/api/trips/:tripId/checklist-items",
    asyncRoute(async (request, response) => {
      response.json(await store.getChecklistItems(userId(request), routeParam(request, "tripId")));
    }),
  );

  router.post(
    "/api/trips/:tripId/checklist-items",
    asyncRoute(async (request, response) => {
      response
        .status(201)
        .json(await store.createChecklistItem(userId(request), routeParam(request, "tripId"), parseBody(checklistItemSchema, request)));
    }),
  );

  router.put(
    "/api/trips/:tripId/checklist-items/:itemId",
    asyncRoute(async (request, response) => {
      response.json(
        await store.updateChecklistItem(
          userId(request),
          routeParam(request, "tripId"),
          routeParam(request, "itemId"),
          parseBody(checklistItemSchema, request),
        ),
      );
    }),
  );

  router.delete(
    "/api/trips/:tripId/checklist-items/:itemId",
    asyncRoute(async (request, response) => {
      response.json(await store.deleteChecklistItem(userId(request), routeParam(request, "tripId"), routeParam(request, "itemId")));
    }),
  );

  return router;
}
