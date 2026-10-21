import express from "express";
import cors from "cors";
import { GameStore } from "./store/gameStore";
import { createGamesRouter } from "./routes/games";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";

export function createApp(store: GameStore): express.Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/games", createGamesRouter(store));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
