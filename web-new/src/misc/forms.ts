import { FormEvent, useEffect } from "react";

// a validation failure that names the field it's about, so the dialog can focus and mark it
export class FieldError extends Error {
  constructor(public field: string, message: string) {
    super(message);
  }
}

// a name is the one thing a folder, project or document needs; the description is optional
export const checkForName = (data: Record<string, string>) => {
  if (data.name.trim() === '') throw new FieldError("name", "Please enter a name");
}

export const generateDate = () => {
  return new Date().toString();
}

// read the named fields of a submitted form into a plain object
export const readForm = (event: FormEvent) => {
  const form = event.currentTarget as HTMLFormElement;
  const data: Record<string, string> = {};
  new FormData(form).forEach((value, key) => { data[key] = String(value); });
  return data;
}

// close a modal on Escape
export const useEscape = (onEscape: () => void) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onEscape]);
}
