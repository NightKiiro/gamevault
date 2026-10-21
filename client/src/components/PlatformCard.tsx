import { useState } from "react";
import type { Game, Platform, PlatformInput } from "../api/types";
import { valuesFromPlatform } from "../lib/platformForm";
import { plural } from "../lib/library";
import { Cover } from "./Cover";
import { PlatformForm } from "./PlatformForm";

interface PlatformCardProps {
  platform: Platform;
  games: Game[];
  others: Platform[];
  onUpdate: (platform: Platform, input: PlatformInput) => Promise<void>;
  onDelete: (platform: Platform) => Promise<void>;
  onShowGames: (platform: Platform) => void;
}

type Mode = "view" | "edit" | "confirm";

const FAN_SIZE = 3;

export function PlatformCard({ platform, games, others, onUpdate, onDelete, onShowGames }: PlatformCardProps) {
  const [mode, setMode] = useState<Mode>("view");
  const [deleting, setDeleting] = useState(false);
  const count = games.length;
  const fan = games.slice(0, FAN_SIZE);

  const details: string[] = [];
  if (platform.manufacturer !== undefined) details.push(platform.manufacturer);
  if (platform.releaseYear !== undefined) details.push(`sortie en ${platform.releaseYear}`);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await onDelete(platform);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <li className="platform-card">
      <div className={fan.length === 0 ? "fan fan-empty" : "fan"} aria-hidden="true">
        {fan.length === 0 ? (
          <span>Aucun jeu</span>
        ) : (
          fan.map((game, i) => (
            <Cover key={game.id} src={game.coverUrl} title={game.title} className={`fan-cover fan-${fan.length}-${i}`} decorative />
          ))
        )}
      </div>

      {mode === "edit" ? (
        <PlatformForm
          initialValues={valuesFromPlatform(platform)}
          others={others}
          submitLabel="Enregistrer"
          onSubmit={async (input) => {
            await onUpdate(platform, input);
            setMode("view");
          }}
          onCancel={() => setMode("view")}
        />
      ) : (
        <>
          <div className="platform-head">
            <h3>{platform.name}</h3>
            <span className="platform-count">{count === 0 ? "Aucun jeu" : plural(count, "jeu", "jeux")}</span>
          </div>
          <p className="platform-details">{details.length > 0 ? details.join(", ") : "Pas de détails"}</p>

          {mode === "confirm" ? (
            count > 0 ? (
              <div className="platform-confirm" role="alert">
                <p>
                  {platform.name} est utilisée par {plural(count, "jeu", "jeux")}. Change leur plateforme avant de la supprimer.
                </p>
                <div className="platform-actions">
                  <button type="button" className="btn btn-primary" onClick={() => onShowGames(platform)}>
                    Voir ces jeux
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setMode("view")}>
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <div className="platform-confirm">
                <p>Supprimer {platform.name} ?</p>
                <div className="platform-actions">
                  <button type="button" className="btn btn-danger" disabled={deleting} onClick={() => void confirmDelete()}>
                    Supprimer
                  </button>
                  <button type="button" className="btn btn-ghost" disabled={deleting} onClick={() => setMode("view")}>
                    Garder
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="platform-actions">
              <button type="button" className="btn btn-ghost" disabled={count === 0} onClick={() => onShowGames(platform)}>
                Voir les jeux
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setMode("edit")}>
                Modifier
              </button>
              <button type="button" className="btn btn-ghost btn-danger-text" onClick={() => setMode("confirm")}>
                Supprimer
              </button>
            </div>
          )}
        </>
      )}
    </li>
  );
}
