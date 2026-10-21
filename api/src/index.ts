import path from "node:path";
import { createApp } from "./app";
import { createGameStore } from "./store/gameStore";
import { createPlatformStore } from "./store/platformStore";
import { createLibrary } from "./services/library";
import { SEED_GAMES } from "./data/seed";
import { SEED_PLATFORMS } from "./data/platformSeed";

const DEFAULT_PORT = 3000;

function readPort(): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw === "") return DEFAULT_PORT;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.warn(`PORT invalide ("${raw}"), utilisation de ${DEFAULT_PORT}`);
    return DEFAULT_PORT;
  }
  return port;
}

function readDataDir(): string | null {
  const raw = process.env.DATA_DIR;
  if (raw === "none") return null;
  return path.resolve(raw === undefined || raw === "" ? "data" : raw);
}

const port = readPort();
const dataDir = readDataDir();

const platforms = createPlatformStore({
  filePath: dataDir === null ? null : path.join(dataDir, "platforms.json"),
  seed: SEED_PLATFORMS,
});
const games = createGameStore({
  filePath: dataDir === null ? null : path.join(dataDir, "games.json"),
  seed: SEED_GAMES,
});

const library = createLibrary(games, platforms);
const fixed = library.reconcile();
if (fixed > 0) console.log(`${fixed} jeu(x) relié(s) à leur plateforme`);

createApp(library).listen(port, () => {
  console.log(`GameVault API sur http://localhost:${port}`);
  console.log(dataDir === null ? "Stockage : mémoire uniquement" : `Stockage : ${dataDir}`);
});
