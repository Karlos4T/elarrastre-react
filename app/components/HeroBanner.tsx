"use client";

import { MouseEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import RegistrationForm from "./RegistrationForm";
import fitty from "fitty";

export default function HeroBanner() {
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    fitty(".hero-panel__text--campaign p", {
      minSize: 10,  // tamaño mínimo
      maxSize: 27, // tamaño máximo
      multiLine: false
    });
  }, []);
  useLayoutEffect(() => {
    if (!bannerRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(".hero-gear-blue", { x: 250 });
      gsap.set(".hero-square-left", { x: -20 });
      gsap.set(".hero-campaign", { y: -20 });
      gsap.set(".hero-medal", { x: -110 });
      gsap.set(".hero-circle-date", { x: 50, y: 50 });

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .from(".hero-campaign", {
          opacity: 0,
          y: -60,
          duration: 0.7,
        })
        .from(".hero-gear-blue", {
          opacity: 0,
          x: "+=120",
          rotate: 140,
          duration: 0.9,
        }, "-=0.4")
        .from(
          ".hero-square-left",
          {
            opacity: 0,
            x: -120,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          ".hero-medal",
          {
            opacity: 0,
            scale: 0.7,
            duration: 0.6,
          },
          "-=0.2"
        )
        .from(
          ".hero-square-bottom",
          {
            opacity: 0,
            x: -90,
            y: 90,
            duration: 0.6,
          },
          "-=0.3"
        )
        .from(
          ".hero-pill",
          {
            opacity: 0,
            y: 80,
            duration: 0.5,
          },
          "-=0.3"
        )
        .from(
          ".hero-circle-date",
          {
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
          },
          "-=0.2"
        )
        .from(
          ".hero-gear-orange",
          {
            opacity: 0,
            rotate: -140,
            duration: 0.7,
          },
          "-=0.4"
        )
        .from(
          ".hero-star",
          {
            opacity: 0,
            scale: 0.9,
            duration: 0.6,
          },
          "-=0.3"
        );

      gsap.from(".hero-actions", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.4,
      });

      gsap.to(".hero-gear-blue", {
        rotate: "+=360",
        duration: 18,
        ease: "linear",
        repeat: -1,
      });

      // gsap.to(".hero-gear-orange", {
      //   rotate: "-=360",
      //   duration: 22,
      //   ease: "linear",
      //   repeat: -1,
      // });
    }, bannerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const body = document.body;

    if (!isModalOpen) {
      body.style.removeProperty("overflow");
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    body.style.overflow = "hidden";
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      body.style.removeProperty("overflow");
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [isModalOpen]);

  return (
    <>
      <header ref={bannerRef} className="hero-banner w-full">
        <div className="hero-grid hero-grid--mosaic">
          <CampaignAnnouncement />
          <BlueGear />
          <GreenSquare className="hero-square-left" />
          <VenueMedal />
          <GreenSquare className="hero-square-bottom" variant="corner" />
          <GreenPill />
          <DateCircle />
          <OrangeGear />
          <HeroStarMessage />
        </div>

        <div className="hero-actions hero-actions--poster">
          <button type="button" className="button-hero" onClick={() => setIsModalOpen(true)}>
            ¡Quiero apuntarme!
          </button>
          <div className="hero-secondary-links">
            <Link href="/admin">Panel admin</Link>
            <Link href="/contacto">Enviar propuesta</Link>
          </div>
        </div>
      </header>

      <RegistrationModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
};

function RegistrationModal({ open, onClose }: ModalProps) {
  if (!open) {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        onClick={handleOverlayClick}
      >
        <div className="relative w-full max-w-xl rounded-[34px] border-4 border-[var(--color-ink)] bg-white p-6 shadow-[0_18px_0_rgba(27,27,31,0.18)] sm:p-8">
          <button
            type="button"
            aria-label="Cerrar ventana de registro"
            className="absolute right-4 top-4 text-sm font-semibold text-[var(--color-ink)] transition hover:text-[var(--color-apricot)]"
            onClick={onClose}
          >
            ✕
          </button>
          <RegistrationForm onSuccess={onClose} />
        </div>
      </div>
    </>
  );
}

function HeroStarMessage() {
  return (
    <div className="hero-star hero-star--main">
      <div className="hero-star__text">
        <h1 className="line con">CON</h1>
        <h1 className="line elapoyo">
          <span className="ela">ELA</span>
          <span className="poyo">poyo</span>
        </h1>
        <p className="line de-todos">de todos</p>
        <p className="line avanzamos">avanzamos</p>
      </div>
    </div>
  );
}

function CampaignAnnouncement() {
  return (
    <div className="hero-panel hero-panel--campaign hero-campaign">
      <span className="hero-panel__lead hero-panel__lead--campaign">IV</span>
      <div className="hero-panel__text hero-panel__text--campaign">
        <p className="first">jornada solidaria</p>
        <p className="second">contra la ELA</p>
      </div>
    </div>
  );
}

function BlueGear() {
  return <div className="hero-gear hero-gear-blue" aria-hidden="true" />;
}

type GreenSquareProps = {
  className?: string;
  variant?: "default" | "corner";
};

function GreenSquare({ className = "", variant = "default" }: GreenSquareProps) {
  return (
    <div
      className={`hero-square ${variant === "corner" ? "hero-square--corner" : ""} ${className}`}
      aria-hidden="true"
    />
  );
}

function VenueMedal() {
  return (
    <div className="hero-medal">
      <span className="title">Villanueva de Bogas</span>
      <span className="subtitle">Plaza de la Constitución</span>
    </div>
  );
}

function GreenPill() {
  return <div className="hero-pill" aria-hidden="true" />;
}

function DateCircle() {
  return (
    <div className="hero-circle-date">
      <span>6 de</span>
      <span>Diciembre</span>
      <span>2025</span>
    </div>
  );
}

function OrangeGear() {
  return <div className="hero-gear hero-gear-orange" aria-hidden="true" >
    <img src="/shapes/logo-arrastre.svg" alt="" />
  </div>;
}
