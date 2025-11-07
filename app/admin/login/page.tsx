"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  error: string | null;
  success: string | null;
};

const initialState: FormState = { error: null, success: null };

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setState(initialState);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo iniciar sesión.");
      }

      setState({ error: null, success: "Sesión iniciada. Redirigiendo..." });
      setUsername("");
      setPassword("");
      setTimeout(() => {
        router.replace("/admin");
      }, 400);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setState({ error: message, success: null });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)]">
      <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
        <div className="shape-sunburst" />
        <form
          onSubmit={handleSubmit}
          className="relative flex w-full flex-col gap-5 rounded-[36px] border-4 border-[var(--color-ink)] bg-white p-8 shadow-[0_16px_0_rgba(27,27,31,0.1)]"
        >
          <h1 className="text-3xl font-extrabold text-[var(--color-ink)]">
            Acceso administrador
          </h1>
          <p className="text-md leading-relaxed text-[var(--color-ink)]/80">
            Introduce tus credenciales para gestionar inscripciones, colaboradores y
            propuestas.
          </p>
          <label className="flex flex-col gap-2 text-md font-semibold text-[var(--color-ink)]">
            Usuario
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
              className="rounded-[26px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-3 text-base font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/40"
            />
          </label>
          <label className="flex flex-col gap-2 text-md font-semibold text-[var(--color-ink)]">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="rounded-[26px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-3 text-base font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sun)] focus:ring-2 focus:ring-[var(--color-sun)]/40"
            />
          </label>
          <button type="submit" disabled={submitting} className="button-primary w-full">
            {submitting ? "Accediendo..." : "Entrar"}
          </button>
          {state.success && (
            <p className="rounded-xl border border-[var(--color-forest)]/20 bg-[var(--color-forest)]/10 px-4 py-2 text-md font-semibold text-[var(--color-forest)]">
              {state.success}
            </p>
          )}
          {state.error && (
            <p className="rounded-xl border border-red-200 bg-red-100 px-4 py-2 text-md font-semibold text-red-600">
              {state.error}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
