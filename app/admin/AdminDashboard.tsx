"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import CollaboratorForm from "../components/CollaboratorForm";

type Registration = {
  id: number;
  name: string;
  created_at: string;
};

type Collaborator = {
  id: number;
  name: string;
  created_at: string;
  imageSrc: string | null;
};

type ContactRequest = {
  id: number;
  name: string;
  mail: string;
  phone: string | null;
  request: string;
  created_at: string;
};

type Props = {
  registrations: Registration[];
  collaborators: Collaborator[];
  contactRequests: ContactRequest[];
};

type ActionState = {
  message: string | null;
  error: string | null;
};

const initialActionState: ActionState = { message: null, error: null };

export default function AdminDashboard({
  registrations: initialRegistrations,
  collaborators,
  contactRequests,
}: Props) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [drafts, setDrafts] = useState<Record<number, string>>(() =>
    Object.fromEntries(initialRegistrations.map((item) => [item.id, item.name]))
  );
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [actionState, setActionState] = useState<ActionState>(initialActionState);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setRegistrations(initialRegistrations);
    setDrafts(
      Object.fromEntries(initialRegistrations.map((item) => [item.id, item.name]))
    );
  }, [initialRegistrations]);

  const totalRegistrations = registrations.length;
  const totalCollaborators = collaborators.length;
  const totalRequests = contactRequests.length;

  const mostRecentRequest = useMemo(() => {
    return contactRequests
      .slice()
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
  }, [contactRequests]);

  const handleChange = (id: number, value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdate = async (id: number) => {
    const name = drafts[id]?.trim();
    if (!name) {
      setActionState({ error: "El nombre no puede estar vacío.", message: null });
      return;
    }

    setLoadingId(id);
    setActionState(initialActionState);

    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo actualizar el registro.");
      }

      const payload = (await response.json()) as Registration;
      setRegistrations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, name: payload.name } : item))
      );
      setActionState({ message: "Registro actualizado.", error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setActionState({ message: null, error: message });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const registration = registrations.find((item) => item.id === id);
    if (!registration) {
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar a "${registration.name}"?`
    );
    if (!confirmed) {
      return;
    }

    setLoadingId(id);
    setActionState(initialActionState);

    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo eliminar el registro.");
      }

      setRegistrations((prev) => prev.filter((item) => item.id !== id));
      setActionState({ message: "Registro eliminado.", error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setActionState({ message: null, error: message });
    } finally {
      setLoadingId(null);
    }
  };

  const handleLogout = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLoggingOut(true);
    setActionState(initialActionState);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo cerrar la sesión.");
      }

      router.replace("/admin/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      setActionState({ message: null, error: message });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-12">
      <header className="flex flex-col gap-4 rounded-[48px] border-4 border-[var(--color-ink)] bg-white p-8 shadow-[0_18px_0_rgba(27,27,31,0.1)] sm:p-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold text-[var(--color-ink)]">
              Panel de administración
            </h1>
            <p className="text-sm font-medium text-[var(--color-ink)]/70">
              Gestiona participantes, colaboradores y propuestas recibidas.
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center justify-center rounded-full border-2 border-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-blush)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? "Cerrando..." : "Cerrar sesión"}
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Inscripciones" value={totalRegistrations} />
          <StatCard label="Colaboradores" value={totalCollaborators} />
          <StatCard
            label="Propuestas"
            value={totalRequests}
            helper={
              mostRecentRequest
                ? `Última: ${new Date(
                    mostRecentRequest.created_at
                  ).toLocaleDateString()}`
                : null
            }
          />
        </div>
        {actionState.message && (
          <p className="rounded-xl border border-[var(--color-forest)]/20 bg-[var(--color-forest)]/12 px-4 py-2 text-sm font-semibold text-[var(--color-forest)]">
            {actionState.message}
          </p>
        )}
        {actionState.error && (
          <p className="rounded-xl border border-red-200 bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
            {actionState.error}
          </p>
        )}
      </header>

      <section className="organic-card grid gap-6 border-[var(--color-ink)]/0 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">
            Participantes apuntados
          </h2>
          <p className="text-sm font-medium text-[var(--color-ink)]/70">
            Edita los nombres o elimina inscripciones duplicadas.
          </p>
        </div>
        {registrations.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-[var(--color-ink)]/15 px-4 py-8 text-center text-sm font-medium text-[var(--color-ink)]/60">
            Todavía no hay personas registradas.
          </p>
        ) : (
          <ul className="grid gap-4">
            {registrations.map((registration) => (
              <li
                key={registration.id}
                className="grid gap-3 rounded-[32px] border-2 border-[var(--color-ink)]/10 bg-white p-4 shadow-[0_10px_0_rgba(27,27,31,0.05)] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={drafts[registration.id] ?? ""}
                    onChange={(event) =>
                      handleChange(registration.id, event.target.value)
                    }
                    className="rounded-[24px] border-2 border-[var(--color-ink)]/10 bg-white px-3 py-2 text-sm font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-sky)] focus:ring-2 focus:ring-[var(--color-sky)]/30"
                  />
                </div>
                <button
                  onClick={() => handleUpdate(registration.id)}
                  disabled={loadingId === registration.id}
                  className="button-secondary justify-center px-5 py-2 text-sm sm:w-auto"
                >
                  {loadingId === registration.id ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={() => handleDelete(registration.id)}
                  disabled={loadingId === registration.id}
                  className="inline-flex items-center justify-center rounded-full border-2 border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingId === registration.id ? "Eliminando..." : "Eliminar"}
                </button>
                <p className="col-span-full text-xs font-medium text-[var(--color-ink)]/60">
                  Apuntado el{" "}
                  {new Date(registration.created_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="organic-card grid gap-6 border-[var(--color-ink)]/0 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">
            Colaboradores publicados
          </h2>
          <p className="text-sm font-medium text-[var(--color-ink)]/70">
            Revisa quién aparece en la web y súmalos desde el formulario público.
          </p>
        </div>
        {collaborators.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-[var(--color-ink)]/15 px-4 py-8 text-center text-sm font-medium text-[var(--color-ink)]/60">
            Todavía no hay colaboradores publicados.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collaborators.map((collaborator) => (
              <li
                key={collaborator.id}
                className="flex flex-col items-center gap-3 rounded-[32px] border-2 border-[var(--color-ink)]/10 bg-white p-4 text-center shadow-[0_10px_0_rgba(27,27,31,0.05)]"
              >
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-[var(--color-sun)] bg-[var(--color-sun)]/30">
                  {collaborator.imageSrc ? (
                    <img
                      src={collaborator.imageSrc}
                      alt={collaborator.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-ink)]/60">
                      Sin imagen
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  {collaborator.name}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink)]/60">
                  Alta el{" "}
                  {new Date(collaborator.created_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-[var(--color-ink)]/70">
            ¿Necesitas añadir uno nuevo? Usa este formulario.
          </p>
          <CollaboratorForm />
        </div>
      </section>

      <section className="organic-card grid gap-6 border-[var(--color-ink)]/0 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">
            Propuestas recibidas
          </h2>
          <p className="text-sm font-medium text-[var(--color-ink)]/70">
            Contacta con los colaboradores potenciales y coordina su aportación.
          </p>
        </div>
        {contactRequests.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-[var(--color-ink)]/15 px-4 py-8 text-center text-sm font-medium text-[var(--color-ink)]/60">
            No hay propuestas registradas todavía.
          </p>
        ) : (
          <ul className="grid gap-4">
            {contactRequests.map((contact) => (
              <li
                key={contact.id}
                className="grid gap-3 rounded-[32px] border-2 border-[var(--color-ink)]/10 bg-white p-4 shadow-[0_10px_0_rgba(27,27,31,0.05)]"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {contact.name}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/60">
                    Recibido el{" "}
                    {new Date(contact.created_at).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-semibold text-[var(--color-ink)]/60">
                  <span className="rounded-full bg-[var(--color-sky)]/40 px-3 py-1">
                    {contact.mail}
                  </span>
                  {contact.phone && (
                    <span className="rounded-full bg-[var(--color-blush)]/60 px-3 py-1">
                      {contact.phone}
                    </span>
                  )}
                </div>
                <p className="rounded-[24px] border border-[var(--color-ink)]/10 bg-white/80 p-3 text-sm font-medium leading-relaxed text-[var(--color-ink)]">
                  {contact.request}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-[28px] border-2 border-[var(--color-ink)]/10 bg-white/80 p-4 shadow-[0_10px_0_rgba(27,27,31,0.05)]">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink)]/60">
        {label}
      </span>
      <span className="text-2xl font-extrabold text-[var(--color-ink)]">
        {value}
      </span>
      {helper ? (
        <span className="text-xs font-medium text-[var(--color-ink)]/60">{helper}</span>
      ) : null}
    </div>
  );
}
