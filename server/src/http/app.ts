import cors from "cors";
import express from "express";
import { sendError } from "../errors";
import type { QuwaStore } from "../store/QuwaStore";
import { createRoutes } from "./routes";

export function createApp({ store }: { store: QuwaStore }) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(createRoutes(store));
  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    sendError(response, error);
  });

  return app;
}

