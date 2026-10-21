import type { Notice } from "../lib/errors";

interface NoticeBannerProps {
  notice: Notice | null;
  onClose?: () => void;
}

export function NoticeBanner({ notice, onClose }: NoticeBannerProps) {
  if (notice === null) return null;
  return (
    <div className={`notice notice-${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>
      <div>
        <strong>{notice.message}</strong>
        {notice.details.length > 0 && (
          <ul>
            {notice.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </div>
      {onClose !== undefined && (
        <button type="button" className="btn btn-ghost btn-small" onClick={onClose} aria-label="Fermer">
          ✕
        </button>
      )}
    </div>
  );
}
