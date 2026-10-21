import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  error?: string | undefined;
  children: ReactNode;
}

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className={error === undefined ? "field" : "field field-invalid"}>
      <span>{label}</span>
      {children}
      {error !== undefined && <small className="field-error">{error}</small>}
    </label>
  );
}
