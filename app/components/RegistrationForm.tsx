"use client";

import { FormEvent, useState } from "react";

type FormState = {
  message: string | null;
  error: string | null;
};

const initialState: FormState = { message: null, error: null };

type RegistrationFormProps = {
  onSuccess?: () => void;
};

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [name, setName] = useState("");
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<FormState>(initialState);

  const addCompanionField = () => {
    setCompanionNames((prev) => [...prev, ""]);
  };

  const updateCompanionName = (index: number, value: string) => {
    setCompanionNames((prev) => prev.map((name, i) => (i === index ? value : name)));
  };

  const removeCompanionField = (index: number) => {
    setCompanionNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setState(initialState);
    setSubmitting(true);

    const names = [name.trim()];
    companionNames.forEach((extra) => {
      const trimmed = extra.trim();
      if (trimmed) {
        names.push(trimmed);
      }
    });

    const payload = {
      name: names.filter(Boolean).join(" + "),
    };

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo guardar tu inscripción.");
      }

      setName("");
      setCompanionNames([]);
      setState({ message: "¡Gracias por unirte!", error: null });
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setState({ message: null, error: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="registration-card organic-card flex w-full flex-col gap-5 p-6 sm:p-8 reveal-on-scroll"
    >
      <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
        ¡Apúntate a esta <span className="highlight-text">ola solidaria!</span>
      </h2>
      <p className="text-sm leading-relaxed text-[var(--color-ink)]/80">
        Deja tu nombre y súmate al movimiento <span className="accent-text">#ElArrastrePorLaELA</span>.
      </p>
      <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-ink)]">
        Nombre completo
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="rounded-[26px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-3 text-base font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/40"
        />
      </label>
      {companionNames.length > 0 && (
        <div className="flex flex-col gap-3 rounded-3xl border-2 border-[var(--color-ink)]/10 bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">
            Acompañantes
          </p>
          {companionNames.map((companion, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={companion}
                onChange={(event) => updateCompanionName(index, event.target.value)}
                placeholder={`Nombre extra ${index + 1}`}
                className="flex-1 rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-3 py-2 text-sm font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/30"
              />
              <button
                type="button"
                onClick={() => removeCompanionField(index)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-ink)]/15 text-base text-[var(--color-ink)]/80 transition hover:bg-red-50 hover:text-red-500"
                aria-label={`Eliminar acompañante ${index + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        className="button-secondary w-full sm:w-auto"
        onClick={addCompanionField}
      >
        Añadir acompañante
      </button>
      <button type="submit" disabled={submitting} className="button-primary w-full sm:w-auto">
        {submitting ? "Enviando..." : "Quiero participar"}
      </button>
      {state.message && (
        <p className="rounded-xl border border-[var(--color-forest)]/20 bg-[var(--color-forest)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-forest)]">
          {state.message}
        </p>
      )}
      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
