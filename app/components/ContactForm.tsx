"use client";

import { FormEvent, useState } from "react";

type FormState = {
  message: string | null;
  error: string | null;
};

const initialState: FormState = { message: null, error: null };

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [request, setRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<FormState>(initialState);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState(initialState);
    setSubmitting(true);

    const payload = {
      name: name.trim(),
      mail: email.trim(),
      phone: phone.trim() || null,
      request: request.trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo enviar tu mensaje.");
      }

      setName("");
      setEmail("");
      setPhone("");
      setRequest("");
      setState({ message: "¡Gracias! Te contactaremos pronto.", error: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setState({ message: null, error: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="contact-form organic-card flex w-full flex-col gap-5 p-6 sm:p-8 reveal-on-scroll"
    >
      <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
        ¿Quieres colaborar? <span className="highlight-text">¡Te necesitamos!</span>
      </h2>
      <p className="text-md leading-relaxed text-[var(--color-ink)]/80">
        Déjanos tus datos de contacto y coordinamos cómo puedes aportar a El Arrastre.
      </p>
      <label className="flex flex-col gap-2 text-md font-medium text-[var(--color-ink)]">
        Nombre
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="rounded-[26px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-3 text-base font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/40"
        />
      </label>

      <label className="flex flex-col gap-2 text-md font-medium text-[var(--color-ink)]">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="rounded-[26px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-3 text-base font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/40"
        />
      </label>
      <label className="flex flex-col gap-2 text-md font-medium text-[var(--color-ink)]">
        Teléfono (opcional)
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="rounded-[26px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-3 text-base font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/40"
        />
      </label>
      <label className="flex flex-col gap-2 text-md font-medium text-[var(--color-ink)]">
        Propuesta
        <textarea
          value={request}
          onChange={(event) => setRequest(event.target.value)}
          required
          rows={4}
          className="rounded-[26px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-3 text-base font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sun)] focus:ring-2 focus:ring-[var(--color-sun)]/40"
        />
      </label>
      <button type="submit" disabled={submitting} className="button-secondary w-full sm:w-auto">
        {submitting ? "Enviando..." : "Quiero colaborar"}
      </button>
      {state.message && (
        <p className="rounded-xl border border-[var(--color-forest)]/20 bg-[var(--color-forest)]/10 px-4 py-2 text-md font-semibold text-[var(--color-forest)]">
          {state.message}
        </p>
      )}
      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-100 px-4 py-2 text-md font-semibold text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
