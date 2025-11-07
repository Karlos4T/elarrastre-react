"use client";

import { CSSProperties, MouseEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import CollaboratorProposalForm from "./CollaboratorProposalForm";

type Collaborator = {
  id: number;
  name: string;
  imageSrc: string | null;
  webLink?: string | null;
};

const CARD_COLORS = [
  "#FFDB3B",
  "#FF8C42",
  "#178F50",
  "#CFA5FF",
  "#6AA8FF",
  "#F7B8C6",
];

type Props = {
  collaborators: Collaborator[];
};

export default function CollaboratorsShowcase({ collaborators }: Props) {
  const [open, setOpen] = useState(false);

  const decorated = useMemo(
    () =>
      collaborators.map((collaborator, index) => ({
        ...collaborator,
        tone: CARD_COLORS[index % CARD_COLORS.length],
      })),
    [collaborators]
  );

  return (
    <>
      <div className="reveal-on-scroll flex flex-col gap-10">
        <div className="collab-header flex">
          <div className="flex flex-col">
            <h2 className="text-3xl font-extrabold text-[var(--color-ink)]">Colaboradores</h2>
            <p className="max-w-5xl text-lg font-medium text-[var(--color-ink)]/70">
              Artistas, vecinas, asociaciones y colectivos que se arrastran por la causa. Si
              quieres sumarte, cuéntanos tu propuesta.
            </p>
          </div>
        </div>

        {decorated.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-[var(--color-ink)]/20 px-6 py-12 text-center text-md font-medium text-[var(--color-ink)]/60">
            Todavía no hay colaboradores publicados. ¡Sé la primera persona en sumarte!
          </p>
        ) : (
          <div className="collab-grid">
            {decorated.map((collaborator) => (
              <article
                key={collaborator.id}
                className="collab-card reveal-on-scroll"
                style={{ "--collab-tone": collaborator.tone } as CSSProperties}
              >
                <div className="collab-avatar">
                  {collaborator.imageSrc ? (
                    <img src={collaborator.imageSrc} alt={collaborator.name} />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs font-semibold text-[var(--color-ink)]/60">
                      Sin imagen
                    </div>
                  )}
                </div>
                {collaborator.webLink ? (
                  <a
                    href={collaborator.webLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="collab-name underline-offset-4 hover:underline"
                  >
                    {collaborator.name}
                  </a>
                ) : (
                  <span className="collab-name">{collaborator.name}</span>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <button onClick={() => setOpen(true)} className="button-secondary">
          <b>
            ¡QUIERO COLABORAR!
          </b>
        </button>
      </div>
      <CollaboratorModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
};

function CollaboratorModal({ open, onClose }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


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

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const modal = (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div className="modal-card max-w-2xl" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          aria-label="Cerrar"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-3xl font-extrabold text-[var(--color-ink)]">
          Comparte tu propuesta
        </h3>
        <p className="mb-4 text-base font-medium text-[var(--color-ink)]/70">
          Cuéntanos cómo quieres colaborar y te contactaremos enseguida.
        </p>
        <CollaboratorProposalForm />
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
