import { useEffect } from "react";
import type { Notice } from "../lib/errors";

interface ToastProps {
  notice: Notice | null;
  onClose: () => void;
}

const SUCCESS_DURATION_MS = 4000;

export function Toast({ notice, onClose }: ToastProps) {
  useEffect(() => {
    if (notice === null || notice.kind === "error") return;
    const timer = window.setTimeout(onClose, SUCCESS_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [notice, onClose]);

  if (notice === null) return null;

  return (
    <div className={`toast toast-${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>
      <div>
        <p className="toast-message">{notice.message}</p>
        {notice.details.length > 0 && (
          <ul>
            {notice.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </div>
      <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer le message">
        ✕
      </button>
    </div>
  );
}
