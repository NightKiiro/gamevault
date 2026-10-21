import path from "node:path";
import { createApp } from "./app";
import { createGameStore } from "./store/gameStore";
import { SEED_GAMES } from "./data/seed";

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

function readDataFile(): string | null {
  const raw = process.env.DATA_FILE;
  if (raw === "none") return null;
  return path.resolve(raw === undefined || raw === "" ? "data/games.json" : raw);
}

const port = readPort();
const dataFile = readDataFile();
const store = createGameStore({ filePath: dataFile, seed: SEED_GAMES });

createApp(store).listen(port, () => {
  console.log(`GameVault API sur http://localhost:${port}`);
  console.log(dataFile === null ? "Stockage : mémoire uniquement" : `Stockage : ${dataFile}`);
});
