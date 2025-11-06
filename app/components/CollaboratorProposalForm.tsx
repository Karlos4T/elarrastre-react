"use client";

import { FormEvent, useState } from "react";

type FormState = {
  message: string | null;
  error: string | null;
};

const initialState: FormState = { message: null, error: null };

export default function CollaboratorProposalForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [proposal, setProposal] = useState("");
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
      request: proposal.trim(),
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
        throw new Error(data?.error || "No se pudo enviar tu propuesta.");
      }

      setName("");
      setEmail("");
      setPhone("");
      setProposal("");
      setState({
        message: "¡Gracias! Nos pondremos en contacto para coordinar la colaboración.",
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setState({ message: null, error: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-[var(--color-ink)]">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-2 text-sm font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/30"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-[var(--color-ink)]">Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-2 text-sm font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/30"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-[var(--color-ink)]">
          Teléfono (opcional)
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-2 text-sm font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sun)] focus:ring-2 focus:ring-[var(--color-sun)]/30"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-[var(--color-ink)]">Propuesta</label>
        <textarea
          value={proposal}
          onChange={(event) => setProposal(event.target.value)}
          required
          rows={4}
          className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-2 text-sm font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-tangerine)] focus:ring-2 focus:ring-[var(--color-tangerine)]/30"
        />
      </div>

      <button type="submit" disabled={submitting} className="button-primary w-full">
        {submitting ? "Enviando..." : "Enviar propuesta"}
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
