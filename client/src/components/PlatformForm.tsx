import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Platform, PlatformInput } from "../api/types";
import { ApiError } from "../api/client";
import { errorNotice } from "../lib/errors";
import { EMPTY_PLATFORM_FORM, validatePlatformForm } from "../lib/platformForm";
import type { PlatformFormErrors, PlatformFormValues } from "../lib/platformForm";
import { Field } from "./Field";

interface PlatformFormProps {
  initialValues?: PlatformFormValues;
  others: Platform[];
  submitLabel: string;
  onSubmit: (input: PlatformInput) => Promise<void>;
  onCancel?: () => void;
  resetOnSuccess?: boolean;
}

export function PlatformForm({
  initialValues = EMPTY_PLATFORM_FORM,
  others,
  submitLabel,
  onSubmit,
  onCancel,
  resetOnSuccess = false,
}: PlatformFormProps) {
  const [values, setValues] = useState<PlatformFormValues>(initialValues);
  const [errors, setErrors] = useState<PlatformFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handle(field: keyof PlatformFormValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setFormError(null);
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validatePlatformForm(values, others);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(result.value);
      if (resetOnSuccess) setValues(EMPTY_PLATFORM_FORM);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setErrors({ name: err.message });
      else setFormError(errorNotice(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="platform-form" onSubmit={(e) => void handleSubmit(e)} noValidate>
      <Field label="Nom" error={errors.name}>
        <input className="input" value={values.name} onChange={handle("name")} maxLength={50} placeholder="Steam Deck" />
      </Field>
      <Field label="Fabricant" error={errors.manufacturer}>
        <input className="input" value={values.manufacturer} onChange={handle("manufacturer")} maxLength={50} placeholder="Valve" />
      </Field>
      <Field label="Sortie" error={errors.releaseYear}>
        <input className="input" type="number" min={1970} step={1} value={values.releaseYear} onChange={handle("releaseYear")} placeholder="2022" />
      </Field>
      <div className="platform-form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Enregistrement…" : submitLabel}
        </button>
        {onCancel !== undefined && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
            Annuler
          </button>
        )}
      </div>
      {formError !== null && <p className="inline-error">{formError}</p>}
    </form>
  );
}
