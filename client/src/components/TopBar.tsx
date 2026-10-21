import type { Theme } from "../hooks/useTheme";
import { MoonIcon, PlusIcon, SearchIcon, SunIcon } from "./Icons";

interface TopBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onAdd: () => void;
}

export function TopBar({ query, onQueryChange, theme, onToggleTheme, onAdd }: TopBarProps) {
  return (
    <header className="topbar">
      <a className="wordmark" href="/">
        <span className="wordmark-seal" aria-hidden="true" />
        GameVault
      </a>

      <label className="search">
        <SearchIcon />
        <input
          type="search"
          placeholder="Rechercher un titre, un genre, une plateforme"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Rechercher dans la bibliothèque"
        />
      </label>

      <div className="topbar-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
          title={theme === "dark" ? "Thème clair" : "Thème sombre"}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
        <button type="button" className="btn btn-primary" onClick={onAdd}>
          <PlusIcon />
          <span>Ajouter un jeu</span>
        </button>
      </div>
    </header>
  );
}
