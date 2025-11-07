"use client";

import Link from "next/link";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import CollaboratorsShowcase from "./CollaboratorsShowcase";
import ContactForm from "./ContactForm";
import FAQSection, { FAQ as FAQItem } from "./FAQSection";
import HeroBanner from "./HeroBanner";
import PreviousEditions from "./PreviousEditions";
import CollaboratorProposalForm from "./CollaboratorProposalForm";
import RegistrationForm from "./RegistrationForm";
import ScrollAnimations from "./ScrollAnimations";

type Collaborator = {
  id: number;
  name: string;
  image: string | null;
  created_at: string;
  web_link: string | null;
  position: number | null;
  imageSrc: string | null;
  webLink: string | null;
};

type Props = {
  collaborators: Collaborator[];
  registrationsCount: number;
  faqs: FAQItem[];
};

export default function HomeClient({ collaborators, registrationsCount, faqs }: Props) {
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);

  const friendlyCount = useMemo(() => {
    if (!registrationsCount || registrationsCount < 0) {
      return 0;
    }
    return registrationsCount;
  }, [registrationsCount]);

  return (
    <div className="page-shell min-h-screen w-full bg-[var(--color-blush)] text-[var(--color-ink)]">
      <ScrollAnimations />
      <HeroBanner />
      <main className="relative flex min-h-screen w-full flex-col gap-24 px-6 py-16 pb-32 sm:px-10 lg:px-20 lg:pb-20">
        <div className="shape-sunburst" />
        <div className="shape-cloud" />
        <div className="shape-heartband" />

        <section
          id="registro"
          className="reveal-on-scroll relative flex justify-center gap-10 rounded-[48px] mt-20 lg:items-start"
        >
          <div className="hero-actions organic-card hero-actions--poster flex max-w-[800px] flex-col gap-7 rounded-[36px] bg-white p-8 lg:p-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-black leading-tight lg:text-5xl">
                Súmate a la <span className="accent-text">IV Jornada</span>
              </h2>
              <p className="text-lg leading-relaxed text-[var(--color-ink)]/85 lg:text-xl">
                El Arrastre es la peña de Villanueva de Bogas que desde hace cuatro años organiza una
                jornada solidaria para recaudar dinero y plantar cara a la ELA.
              </p>
            </div>

            <p className="rounded-[26px] py-3 pb-7 my-15 text-4xl text-center font-semibold text-[var(--color-ink)]">
              Ya somos más de{" "}
              <span className="inline-block">
                <span className="left-0 bottom-0 w-full text-5xl h-[0.4em] bg-[var(--color-sun)]/70 px-3 py-1 rounded-2xl z-0">
                  {friendlyCount > 0 ? friendlyCount.toLocaleString("es-ES") : "0"}
                </span>
              </span>{" "}
              personas apuntadas.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                className="button-hero flex-1 text-lg lg:text-xl"
                onClick={() => {
                  setIsCollaboratorModalOpen(false);
                  setIsRegistrationModalOpen(true);
                }}
              >
                ¡Quiero apuntarme!
              </button>
              <button
                type="button"
                className="button-hero button-hero-blue flex-1 text-lg lg:text-xl"
                onClick={() => {
                  setIsRegistrationModalOpen(false);
                  setIsCollaboratorModalOpen(true);
                }}
              >
                ¡Quiero colaborar!
              </button>
            </div>
          </div>
          <RegistrationModal open={isRegistrationModalOpen} onClose={() => setIsRegistrationModalOpen(false)} />
          <CollaboratorModal open={isCollaboratorModalOpen} onClose={() => setIsCollaboratorModalOpen(false)} />
          {/* 
          <div className="organic-card h-full flex flex-col gap-5 p-8 text-lg leading-relaxed text-[var(--color-ink)] lg:text-xl">
           <img className="h-full object-cover rounded-xl" src="/logros2.webp" alt="" />
          </div> */}
        </section>

        <section id="colaboradores" className="reveal-on-scroll flex flex-col gap-10">
          <CollaboratorsShowcase collaborators={collaborators} />
        </section>

        <PreviousEditions />

        <FAQSection faqs={faqs} />

        <section
          id="contacto"
          className="reveal-on-scroll grid gap-8 text-lg lg:grid-cols-[1.2fr_1fr] lg:items-start lg:text-xl"
        >
          <ContactForm />
          <div className="organic-card flex flex-col gap-5 p-8 text-lg leading-relaxed text-[var(--color-ink)] lg:text-xl">
            <h3 className="text-2xl font-semibold lg:text-3xl">
              Propón tu colaboración
            </h3>
            <p>
              ¿Tienes una actuación, un taller o quieres apoyar la logística? Escríbenos y te
              ayudamos a sumarte al cartel solidario.
            </p>
            <div className="grid gap-3 text-lg font-semibold lg:text-xl">
              <span className="rounded-full bg-[var(--color-lilac)]/60 px-4 py-2">
                • Coordinamos voluntariado y logística inclusiva.
              </span>
              <span className="rounded-full bg-[var(--color-sky)]/50 px-4 py-2">
                • Activamos programación artística con sentido social.
              </span>
              <span className="rounded-full bg-[var(--color-blush)]/70 px-4 py-2">
                • Construimos comunidad de cuidado y apoyo mutuo.
              </span>
            </div>
          </div>
        </section>

        <footer className="rounded-[36px] border-4 border-[var(--color-ink)] bg-white px-8 py-6 text-lg font-semibold text-[var(--color-ink)] flex flex-col items-center shadow-[0_12px_0_rgba(27,27,31,0.08)]">
          <p>
            © {new Date().getFullYear()} El Arrastre Solidario · Cultura que abraza,
            comunidad que transforma.
          </p>
          <Link
            href="/admin"
            className="button-secondary flex-1 text-center text-lg mt-8 lg:text-xl w-100"
          >
            Ir al panel admin
          </Link>
        </footer>
      </main>
    </div>
  );
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
};

function RegistrationModal({ open, onClose }: ModalProps) {
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

    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
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

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999] flex min-h-screen items-center justify-center bg-black/55 px-4 py-6"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-2xl rounded-[40px] border-4 border-[var(--color-ink)] bg-white p-6 shadow-[0_24px_0_rgba(27,27,31,0.25)] sm:p-10">
        <button
          type="button"
          aria-label="Cerrar ventana de registro"
          className="absolute right-5 top-5 text-base font-semibold text-[var(--color-ink)] transition hover:text-[var(--color-apricot)]"
          onClick={onClose}
        >
          ✕
        </button>
        <RegistrationForm onSuccess={onClose} />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

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

    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
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

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999] flex min-h-screen items-center justify-center bg-black/55 px-4 py-6"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-2xl rounded-[40px] border-4 border-[var(--color-ink)] bg-white p-6 shadow-[0_24px_0_rgba(27,27,31,0.25)] sm:p-10">
        <button
          type="button"
          aria-label="Cerrar formulario de colaboración"
          className="absolute right-5 top-5 text-base font-semibold text-[var(--color-ink)] transition hover:text-[var(--color-apricot)]"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-black text-[var(--color-ink)]">Quiero colaborar</h2>
          <p className="text-base leading-relaxed text-[var(--color-ink)]/80">
            Cuéntanos tu propuesta y coordinamos contigo para que se sume al programa.
          </p>
          <CollaboratorProposalForm />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
