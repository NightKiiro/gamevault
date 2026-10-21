import type { LibraryView, StatusFilter } from "../lib/library";
import { ALL_PLATFORMS, SORT_LABELS, isSortKey } from "../lib/library";

interface ToolbarProps {
  view: LibraryView;
  platforms: string[];
  counts: Record<StatusFilter, number>;
  onChange: (view: LibraryView) => void;
}

const TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "playing", label: "En cours" },
  { value: "done", label: "Terminés" },
];

export function Toolbar({ view, platforms, counts, onChange }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="tabs" role="tablist" aria-label="Filtrer par statut">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={view.status === tab.value}
            className={view.status === tab.value ? "tab tab-active" : "tab"}
            onClick={() => onChange({ ...view, status: tab.value })}
          >
            {tab.label}
            <span className="tab-count">{counts[tab.value]}</span>
          </button>
        ))}
      </div>

      <div className="toolbar-selects">
        <select
          className="select"
          value={view.platform}
          onChange={(e) => onChange({ ...view, platform: e.target.value })}
          aria-label="Filtrer par plateforme"
        >
          <option value={ALL_PLATFORMS}>Toutes les plateformes</option>
          {platforms.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          className="select"
          value={view.sort}
          onChange={(e) => {
            const value = e.target.value;
            if (isSortKey(value)) onChange({ ...view, sort: value });
          }}
          aria-label="Trier"
        >
          {Object.entries(SORT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
