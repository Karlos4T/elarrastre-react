"use client";

import { MouseEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import CollaboratorsShowcase from "./CollaboratorsShowcase";
import ContactForm from "./ContactForm";
import FAQSection, { FAQ as FAQItem } from "./FAQSection";
import HeroBanner from "./HeroBanner";
import PreviousEditions from "./PreviousEditions";
import CollaboratorProposalForm from "./CollaboratorProposalForm";
import RegistrationForm from "./RegistrationForm";
import HeroRegistrationSection from "./home/HeroRegistrationSection";
import ContactInfoCard from "./home/ContactInfoCard";
import HomeFooter from "./home/HomeFooter";

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
  const [collaboratorList, setCollaboratorList] = useState(collaborators);
  const [faqList, setFaqList] = useState(faqs);
  const [liveRegistrationsCount, setLiveRegistrationsCount] = useState(
    Number.isFinite(registrationsCount) ? Math.max(0, registrationsCount) : 0
  );

  useEffect(() => {
    setCollaboratorList(collaborators);
  }, [collaborators]);

  useEffect(() => {
    setFaqList(faqs);
  }, [faqs]);

  useEffect(() => {
    setLiveRegistrationsCount(
      Number.isFinite(registrationsCount) ? Math.max(0, registrationsCount) : 0
    );
  }, [registrationsCount]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const refreshData = async () => {
      try {
        const [collabResponse, faqResponse, registrationsResponse] = await Promise.all([
          fetch("/api/collaborators", { signal: controller.signal }),
          fetch("/api/faqs?visible=true", { signal: controller.signal }),
          fetch("/api/registrations?summary=count", { signal: controller.signal }),
        ]);

        if (!collabResponse.ok) {
          throw new Error("No se pudieron obtener los colaboradores.");
        }
        if (!faqResponse.ok) {
          throw new Error("No se pudieron obtener las preguntas frecuentes.");
        }
        if (!registrationsResponse.ok) {
          throw new Error("No se pudo obtener el número de inscripciones.");
        }

        const collabData = (await collabResponse.json()) as Collaborator[];
        const faqData = (await faqResponse.json()) as FAQItem[];
        const { count: latestCount = 0 } = (await registrationsResponse.json()) as {
          count?: number;
        };

        if (cancelled) {
          return;
        }

        setCollaboratorList(
          collabData
            .map((item, index) => ({
              ...item,
              imageSrc: item.image,
              webLink: item.web_link,
              position: item.position ?? index + 1,
            }))
            .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))
        );

        setFaqList(
          (faqData ?? [])
            .map((item, index) => ({
              ...item,
              position: item.position ?? index + 1,
            }))
            .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))
        );
        setLiveRegistrationsCount(Math.max(0, latestCount));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("No se pudo refrescar la información pública", error);
      }
    };

    refreshData();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const friendlyCount = Number.isFinite(liveRegistrationsCount)
    ? Math.max(0, liveRegistrationsCount)
    : 0;

  return (
    <div className="page-shell min-h-screen w-full bg-[var(--color-blush)] text-[var(--color-ink)]">
      <HeroBanner />
      <main className="flex min-h-screen w-full flex-col gap-24 px-6 py-16 pb-32 sm:px-10 lg:px-20 lg:pb-20">
        <div className="shape-sunburst" />
        <div className="shape-cloud" />
        <div className="shape-heartband" />

        <HeroRegistrationSection
          friendlyCount={friendlyCount}
          onShowRegistration={() => {
            setIsCollaboratorModalOpen(false);
            setIsRegistrationModalOpen(true);
          }}
          onShowCollaborator={() => {
            setIsRegistrationModalOpen(false);
            setIsCollaboratorModalOpen(true);
          }}
        />
        <RegistrationModal open={isRegistrationModalOpen} onClose={() => setIsRegistrationModalOpen(false)} />
        <CollaboratorModal open={isCollaboratorModalOpen} onClose={() => setIsCollaboratorModalOpen(false)} />

        <section id="colaboradores" className="reveal-on-scroll flex flex-col gap-10">
          <CollaboratorsShowcase collaborators={collaboratorList} />
        </section>

        <PreviousEditions />

        <FAQSection faqs={faqList} />

        <section
          id="contacto"
          className="reveal-on-scroll grid gap-8 text-lg lg:grid-cols-[1.2fr_1fr] lg:items-start lg:text-xl"
        >
          <ContactForm />
          <ContactInfoCard />
        </section>

        <HomeFooter />
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
