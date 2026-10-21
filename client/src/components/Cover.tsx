import { useState } from "react";

interface CoverProps {
  src: string | undefined;
  fallbackSrc?: string | undefined;
  title: string;
  className?: string;
  decorative?: boolean;
}

function hueFor(text: string): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}

function initials(title: string): string {
  return title
    .split(/\s+/)
    .filter((w) => w !== "")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

export function Cover({ src, fallbackSrc, title, className = "", decorative = false }: CoverProps) {
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());
  const candidates = [src, fallbackSrc].filter((s): s is string => s !== undefined && s.trim() !== "");
  const current = candidates.find((s) => !failed.has(s));

  if (current === undefined) {
    const hue = hueFor(title);
    return (
      <div
        className={`cover-fallback ${className}`}
        style={{ background: `linear-gradient(160deg, hsl(${hue} 55% 42%), hsl(${(hue + 50) % 360} 65% 18%))` }}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : `Pas de jaquette pour ${title}`}
        aria-hidden={decorative ? true : undefined}
      >
        <span>{initials(title)}</span>
      </div>
    );
  }

  return (
    <img
      key={current}
      className={className}
      src={current}
      alt={decorative ? "" : `Jaquette de ${title}`}
      loading="lazy"
      onError={() => setFailed((prev) => new Set(prev).add(current))}
    />
  );
}
