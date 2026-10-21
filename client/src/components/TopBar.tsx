import type { Theme } from "../hooks/useTheme";
import { MoonIcon, PlusIcon, SearchIcon, SunIcon } from "./Icons";

export type Page = "library" | "platforms";

interface TopBarProps {
  page: Page;
  onNavigate: (page: Page) => void;
  query: string;
  onQueryChange: (query: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
  onAdd: () => void;
}

const PAGES: { value: Page; label: string }[] = [
  { value: "library", label: "Bibliothèque" },
  { value: "platforms", label: "Plateformes" },
];

export function TopBar({ page, onNavigate, query, onQueryChange, theme, onToggleTheme, onAdd }: TopBarProps) {
  return (
    <header className="topbar">
      <a className="wordmark" href="/">
        <span className="wordmark-seal" aria-hidden="true" />
        GameVault
      </a>

      <nav className="nav" aria-label="Sections">
        {PAGES.map((p) => (
          <button
            key={p.value}
            type="button"
            className={page === p.value ? "nav-link nav-link-active" : "nav-link"}
            aria-current={page === p.value ? "page" : undefined}
            onClick={() => onNavigate(p.value)}
          >
            {p.label}
          </button>
        ))}
      </nav>

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
