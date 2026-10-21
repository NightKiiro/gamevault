import { createApp } from "./app";

const DEFAULT_PORT = 3000;

function readPort(): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw === "") {
    return DEFAULT_PORT;
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.warn(`PORT invalide ("${raw}"), utilisation de ${DEFAULT_PORT}`);
    return DEFAULT_PORT;
  }
  return port;
}

const port = readPort();

createApp().listen(port, () => {
  console.log(`GameVault API sur http://localhost:${port}`);
});
