import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { GameInput } from "../api/types";
import { EMPTY_FORM, validateGameForm } from "../lib/gameForm";
import type { GameFormErrors, GameFormValues } from "../lib/gameForm";
import { Cover } from "./Cover";
import { CoverPicker } from "./CoverPicker";
import { Field } from "./Field";

interface GameFormProps {
  heading: string;
  initialValues?: GameFormValues;
  submitLabel: string;
  onSubmit: (input: GameInput) => Promise<boolean>;
  onCancel: () => void;
}

type TextField = Exclude<keyof GameFormValues, "completed">;

export function GameForm({ heading, initialValues = EMPTY_FORM, submitLabel, onSubmit, onCancel }: GameFormProps) {
  const [values, setValues] = useState<GameFormValues>(initialValues);
  const [errors, setErrors] = useState<GameFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function setField(field: TextField, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleText(field: TextField) {
    return (event: ChangeEvent<HTMLInputElement>) => setField(field, event.target.value);
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
    if (!success) setSubmitting(false);
  }

  return (
    <form className="game-form" onSubmit={(e) => void handleSubmit(e)} noValidate>
      <div className="game-form-head">
        <h2 id="form-title">{heading}</h2>
        <button type="button" className="icon-btn" onClick={onCancel} aria-label="Fermer le formulaire">
          ✕
        </button>
      </div>

      <div className="game-form-grid">
        <div className="game-form-preview">
          <Cover src={values.coverUrl.trim() || undefined} title={values.title.trim() || "Nouveau jeu"} className="preview-cover" />
        </div>

        <div className="game-form-fields">
          <Field label="Titre" error={errors.title}>
            <input className="input" value={values.title} onChange={handleText("title")} maxLength={100} autoFocus />
          </Field>
          <div className="form-row">
            <Field label="Plateforme" error={errors.platform}>
              <input className="input" value={values.platform} onChange={handleText("platform")} maxLength={100} list="platform-options" />
            </Field>
            <Field label="Genre" error={errors.genre}>
              <input className="input" value={values.genre} onChange={handleText("genre")} maxLength={100} />
            </Field>
          </div>
          <datalist id="platform-options">
            <option value="PC" />
            <option value="PS5" />
            <option value="Xbox Series" />
            <option value="Switch" />
          </datalist>
          <div className="form-row form-row-3">
            <Field label="Note sur 10" error={errors.rating}>
              <input className="input" type="number" min={0} max={10} step={0.5} value={values.rating} onChange={handleText("rating")} />
            </Field>
            <Field label="Sortie" error={errors.releaseYear}>
              <input className="input" type="number" min={1950} step={1} value={values.releaseYear} onChange={handleText("releaseYear")} placeholder="2020" />
            </Field>
            <Field label="Heures" error={errors.hoursPlayed}>
              <input className="input" type="number" min={0} step={1} value={values.hoursPlayed} onChange={handleText("hoursPlayed")} placeholder="0" />
            </Field>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={values.completed}
              onChange={(e) => setValues((prev) => ({ ...prev, completed: e.target.checked }))}
            />
            <span className="switch-track" aria-hidden="true" />
            Je l'ai terminé
          </label>
        </div>
      </div>

      <fieldset className="cover-section">
        <legend>Jaquette</legend>
        <CoverPicker
          gameTitle={values.title}
          selectedCover={values.coverUrl}
          onPick={(c) => {
            setField("coverUrl", c.coverUrl);
            setField("backdropUrl", c.backdropUrl);
          }}
        />
        <details className="manual-urls">
          <summary>Utiliser mes propres images</summary>
          <Field label="URL de la jaquette (portrait)" error={errors.coverUrl}>
            <input className="input" type="url" value={values.coverUrl} onChange={handleText("coverUrl")} placeholder="https://" />
          </Field>
          <Field label="URL de l'image de fond (paysage)" error={errors.backdropUrl}>
            <input className="input" type="url" value={values.backdropUrl} onChange={handleText("backdropUrl")} placeholder="https://" />
          </Field>
        </details>
      </fieldset>

      <div className="game-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
