import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  error?: string | undefined;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, error, hint, children }: FieldProps) {
  return (
    <label className={error === undefined ? "field" : "field field-invalid"}>
      <span className="field-label">{label}</span>
      {children}
      {error !== undefined ? (
        <small className="field-error">{error}</small>
      ) : (
        hint !== undefined && <small className="field-hint">{hint}</small>
      )}
    </label>
  );
}
