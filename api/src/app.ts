import express from "express";
import cors from "cors";
import { Library } from "./services/library";
import { CoverSearch, searchSteamCovers } from "./covers/steam";
import { createGamesRouter } from "./routes/games";
import { createPlatformsRouter } from "./routes/platforms";
import { createCoversRouter } from "./routes/covers";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";

export interface AppOptions {
  logRequests?: boolean;
  coverSearch?: CoverSearch;
}

export function createApp(library: Library, options: AppOptions = {}): express.Express {
  const { logRequests = true, coverSearch = searchSteamCovers } = options;
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));
  if (logRequests) app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/games", createGamesRouter(library));
  app.use("/platforms", createPlatformsRouter(library));
  app.use("/covers", createCoversRouter(coverSearch));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
