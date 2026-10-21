import type { Platform, PlatformInput } from "../api/types";

export interface PlatformFormValues {
  name: string;
  manufacturer: string;
  releaseYear: string;
}

export type PlatformFormErrors = Partial<Record<keyof PlatformFormValues, string>>;

export type PlatformFormResult =
  | { ok: true; value: PlatformInput }
  | { ok: false; errors: PlatformFormErrors };

export const EMPTY_PLATFORM_FORM: PlatformFormValues = { name: "", manufacturer: "", releaseYear: "" };

export function valuesFromPlatform(platform: Platform): PlatformFormValues {
  return {
    name: platform.name,
    manufacturer: platform.manufacturer ?? "",
    releaseYear: platform.releaseYear === undefined ? "" : String(platform.releaseYear),
  };
}

export function validatePlatformForm(values: PlatformFormValues, others: Platform[]): PlatformFormResult {
  const errors: PlatformFormErrors = {};
  const name = values.name.trim();
  const manufacturer = values.manufacturer.trim();
  const rawYear = values.releaseYear.trim();
  const year = Number(rawYear);
  const maxYear = new Date().getFullYear() + 5;

  if (name === "") errors.name = "Le nom est obligatoire";
  else if (name.length > 50) errors.name = "50 caractères maximum";
  else if (others.some((p) => p.name.toLocaleLowerCase("fr") === name.toLocaleLowerCase("fr"))) {
    errors.name = "Cette plateforme existe déjà";
  }
  if (manufacturer.length > 50) errors.manufacturer = "50 caractères maximum";
  if (rawYear !== "" && (!Number.isInteger(year) || year < 1970 || year > maxYear)) {
    errors.releaseYear = `Année entre 1970 et ${maxYear}`;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const value: PlatformInput = { name };
  if (manufacturer !== "") value.manufacturer = manufacturer;
  if (rawYear !== "") value.releaseYear = year;
  return { ok: true, value };
}
