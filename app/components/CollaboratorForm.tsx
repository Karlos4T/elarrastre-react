"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  message: string | null;
  error: string | null;
};

const initialState: FormState = { message: null, error: null };

export default function CollaboratorForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<FormState>(initialState);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!preview) {
      return;
    }
    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files?.[0] ?? null;
    setFile(newFile);
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState(initialState);
    setSubmitting(true);

    if (!file) {
      setState({
        message: null,
        error: "Selecciona una imagen en formato PNG o JPG.",
      });
      setSubmitting(false);
      return;
    }

    const buffer = await file.arrayBuffer();
    const imageBase64 = arrayBufferToBase64(buffer);

    const payload = {
      name: name.trim(),
      imageBase64,
    };

    try {
      const response = await fetch("/api/collaborators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "No se pudo guardar el colaborador.");
      }

      setName("");
      setFile(null);
      setState({ message: "Colaborador añadido correctamente.", error: null });
      router.refresh();
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
      className="organic-card flex w-full flex-col gap-5 p-6 sm:p-8"
    >
      <h3 className="text-xl font-semibold text-[var(--color-ink)]">
        Añadir colaborador
      </h3>
      <p className="text-sm leading-relaxed text-[var(--color-ink)]/80">
        Completa este formulario para que aparezca en la lista pública. Sube una imagen en
        formato PNG o JPG.
      </p>
      <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-ink)]">
        Nombre del colaborador
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="rounded-[26px] border-2 border-[var(--color-ink)]/10 bg-white px-4 py-3 text-base font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-tangerine)] focus:ring-2 focus:ring-[var(--color-tangerine)]/40"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-ink)]">
        Imagen del colaborador
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          required
          className="rounded-[26px] border-2 border-dashed border-[var(--color-ink)]/15 bg-white px-4 py-3 text-base font-medium text-[var(--color-ink)] outline-none transition focus:border-[var(--color-tangerine)] focus:ring-2 focus:ring-[var(--color-tangerine)]/40"
        />
      </label>
      {preview && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-[var(--color-sky)]/30 bg-[var(--color-sky)]/10 p-3 text-sm text-[var(--color-ink)]">
          <img
            src={preview}
            alt="Previsualización del colaborador"
            className="h-12 w-12 rounded-full object-cover"
          />
          <span>{file?.name}</span>
        </div>
      )}
      <button type="submit" disabled={submitting} className="button-secondary w-full sm:w-auto">
        {submitting ? "Guardando..." : "Publicar colaborador"}
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
