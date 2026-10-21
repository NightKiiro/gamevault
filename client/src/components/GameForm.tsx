import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { GameInput } from "../api/types";
import { EMPTY_FORM, validateGameForm } from "../lib/gameForm";
import type { GameFormErrors, GameFormValues } from "../lib/gameForm";
import { Field } from "./Field";

interface GameFormProps {
  initialValues?: GameFormValues;
  submitLabel: string;
  onSubmit: (input: GameInput) => Promise<boolean>;
  onCancel?: () => void;
}

type TextField = Exclude<keyof GameFormValues, "completed">;

export function GameForm({ initialValues = EMPTY_FORM, submitLabel, onSubmit, onCancel }: GameFormProps) {
  const [values, setValues] = useState<GameFormValues>(initialValues);
  const [errors, setErrors] = useState<GameFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function handleText(field: TextField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateGameForm(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setSubmitting(true);
    const success = await onSubmit(result.value);
    setSubmitting(false);
    if (success && initialValues === EMPTY_FORM) {
      setValues(EMPTY_FORM);
    }
  }

  return (
    <form className="form" onSubmit={(e) => void handleSubmit(e)} noValidate>
      <Field label="Titre" error={errors.title}>
        <input value={values.title} onChange={handleText("title")} maxLength={100} />
      </Field>
      <Field label="Plateforme" error={errors.platform}>
        <input value={values.platform} onChange={handleText("platform")} maxLength={100} />
      </Field>
      <Field label="Genre" error={errors.genre}>
        <input value={values.genre} onChange={handleText("genre")} maxLength={100} />
      </Field>
      <Field label="Note /10" error={errors.rating}>
        <input type="number" min={0} max={10} step={0.5} value={values.rating} onChange={handleText("rating")} />
      </Field>
      <div className="form-row">
        <Field label="Année" error={errors.releaseYear}>
          <input type="number" min={1950} step={1} value={values.releaseYear} onChange={handleText("releaseYear")} />
        </Field>
        <Field label="Heures" error={errors.hoursPlayed}>
          <input type="number" min={0} step={1} value={values.hoursPlayed} onChange={handleText("hoursPlayed")} />
        </Field>
      </div>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={values.completed}
          onChange={(e) => setValues((prev) => ({ ...prev, completed: e.target.checked }))}
        />
        Terminé
      </label>
      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Envoi…" : submitLabel}
        </button>
        {onCancel !== undefined && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
