import { useEffect, useRef, useState } from "react";
import type { CoverCandidate } from "../api/types";
import { isAbortError, searchCovers } from "../api/client";
import { errorNotice } from "../lib/errors";

interface CoverPickerProps {
  gameTitle: string;
  selectedCover: string;
  onPick: (candidate: CoverCandidate) => void;
}

type SearchState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; results: CoverCandidate[] };

export function CoverPicker({ gameTitle, selectedCover, onPick }: CoverPickerProps) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({ kind: "idle" });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function runSearch() {
    const term = query.trim() || gameTitle.trim();
    if (term.length < 2) {
      setState({ kind: "error", message: "Donne d'abord un titre au jeu, ou tape un nom à chercher" });
      return;
    }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ kind: "loading" });
    try {
      const results = await searchCovers(term, controller.signal);
      setState({ kind: "done", results });
    } catch (err) {
      if (!isAbortError(err)) setState({ kind: "error", message: errorNotice(err).message });
    }
  }

  return (
    <div className="picker">
      <div className="picker-search">
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void runSearch();
            }
          }}
          placeholder={gameTitle.trim() === "" ? "Nom du jeu sur Steam" : `Chercher « ${gameTitle.trim()} »`}
          aria-label="Chercher une jaquette sur Steam"
        />
        <button type="button" className="btn btn-ghost" onClick={() => void runSearch()} disabled={state.kind === "loading"}>
          {state.kind === "loading" ? "Recherche…" : "Chercher"}
        </button>
      </div>

      {state.kind === "error" && <p className="inline-error">{state.message}</p>}
      {state.kind === "done" && state.results.length === 0 && (
        <p className="field-hint">Aucun résultat sur Steam. Essaie le titre anglais, ou colle une URL plus bas.</p>
      )}
      {state.kind === "done" && state.results.length > 0 && (
        <ul className="picker-results">
          {state.results.map((c) => (
            <li key={c.appId}>
              <button
                type="button"
                className={c.coverUrl === selectedCover ? "picker-item picker-item-active" : "picker-item"}
                onClick={() => onPick(c)}
                aria-pressed={c.coverUrl === selectedCover}
                title={c.name}
              >
                <img src={c.coverUrl} alt="" loading="lazy" onError={(e) => { e.currentTarget.src = c.thumbUrl; }} />
                <span>{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
