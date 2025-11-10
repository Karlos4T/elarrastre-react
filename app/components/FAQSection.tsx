"use client";

import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export type FAQ = {
  id: number;
  question: string;
  answer: string | null;
  position: number;
  created_at: string;
};

type Props = {
  faqs: FAQ[];
};

type FormState = {
  name: string;
  email: string;
  question: string;
};

type FeedbackState = {
  message: string | null;
  error: string | null;
};

const initialForm: FormState = {
  name: "",
  email: "",
  question: "",
};

const initialFeedback: FeedbackState = { message: null, error: null };

export default function FAQSection({ faqs }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sortedFaqs = useMemo(
    () => [...faqs].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)),
    [faqs]
  );

  return (
    <section
      id="preguntas-frecuentes"
      className="reveal-on-scroll grid gap-6 rounded-[48px] border-4 border-[var(--color-ink)] bg-white/80 p-8 shadow-[0_18px_0_rgba(27,27,31,0.08)]"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-ink)]/60">
            Preguntas frecuentes
          </p>
          <h2 className="text-3xl font-black text-[var(--color-ink)]">
            Resolvemos dudas antes de la jornada
          </h2>
          <p className="text-lg text-[var(--color-ink)]/80">
            Aquí recopilamos las respuestas que más se repiten. Si no ves la tuya, pregúntanos.
          </p>
        </div>
      </div>

      {sortedFaqs.length === 0 ? (
        <p className="rounded-[32px] border-2 border-dashed border-[var(--color-ink)]/15 px-4 py-10 text-center text-base font-medium text-[var(--color-ink)]/60">
          Pronto publicaremos las preguntas más comunes.
        </p>
      ) : (
        <ul className="grid gap-4">
          {sortedFaqs.map((faq) => (
            <li
              key={faq.id}
              className="rounded-[32px] border-2 border-[var(--color-ink)]/10 bg-white px-5 py-4 shadow-[0_10px_0_rgba(27,27,31,0.06)]"
            >
              <details>
                <summary className="cursor-pointer text-lg font-semibold text-[var(--color-ink)]">
                  {faq.question}
                </summary>
                <p className="mt-3 text-base leading-relaxed text-[var(--color-ink)]/80">
                  {faq.answer ?? "Pronto compartiremos la respuesta."}
                </p>
              </details>
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-center mt-6">

        <button
          type="button"
          className="button-tertiary rounded-full px-6 py-3 text-base w-fit"
          onClick={() => setIsModalOpen(true)}
        >
          Tengo una pregunta
        </button>
      </div>
      <AskQuestionModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}

type AskQuestionModalProps = {
  open: boolean;
  onClose: () => void;
};

function AskQuestionModal({ open, onClose }: AskQuestionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [feedback, setFeedback] = useState<FeedbackState>(initialFeedback);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setFeedback(initialFeedback);
    }
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);


  if (!open || typeof document === "undefined" || !mounted) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(initialFeedback);

    const trimmedQuestion = form.question.trim();
    if (!trimmedQuestion) {
      setFeedback({ message: null, error: "Escribe tu pregunta antes de enviarla." });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmedQuestion,
          name: form.name.trim() || undefined,
          email: form.email.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo enviar la pregunta.");
      }

      setFeedback({
        message: "Gracias por tu pregunta. La revisaremos y la sumaremos si aplica.",
        error: null,
      });
      setForm(initialForm);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar el envío.";
      setFeedback({ message: null, error: message });
    } finally {
      setSubmitting(false);
    }
  };

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999] flex min-h-screen items-center justify-center bg-black/55 px-4 py-6"
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl rounded-[40px] border-4 border-[var(--color-ink)] bg-white p-6 shadow-[0_24px_0_rgba(27,27,31,0.25)] sm:p-10">
        <button
          type="button"
          aria-label="Cerrar"
          className="absolute right-5 top-5 text-base font-semibold text-[var(--color-ink)] transition hover:text-[var(--color-apricot)]"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="flex flex-col gap-4">
          <h3 className="text-3xl font-black text-[var(--color-ink)]">
            ¿Tienes una pregunta?
          </h3>
          <p className="text-base leading-relaxed text-[var(--color-ink)]/80">
            Escríbela y la añadiremos al listado una vez la respondamos.
          </p>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--color-ink)]">
                Nombre (opcional)
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-2 text-base text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/30"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--color-ink)]">
                Correo (opcional)
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-2 text-base text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/30"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[var(--color-ink)]">
                Pregunta
              </label>
              <textarea
                value={form.question}
                onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
                required
                rows={4}
                className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-3 text-base text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sun)] focus:ring-2 focus:ring-[var(--color-sun)]/30"
              />
            </div>
            <button type="submit" disabled={submitting} className="button-primary">
              {submitting ? "Enviando..." : "Enviar pregunta"}
            </button>
            {feedback.message && (
              <p className="rounded-xl border border-[var(--color-forest)]/20 bg-[var(--color-forest)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-forest)]">
                {feedback.message}
              </p>
            )}
            {feedback.error && (
              <p className="rounded-xl border border-red-200 bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
                {feedback.error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
