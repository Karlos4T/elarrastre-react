"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import fitty from "fitty";

export default function HeroBanner() {
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fitty(".hero-panel__text--campaign p", {
      minSize: 10,
      maxSize: 27,
      multiLine: false
    });
  }, []);

  useLayoutEffect(() => {
    if (!bannerRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      // Configuración inicial más compacta
      gsap.set(".hero-blush-abstract-2", { y: -20 });
      gsap.set(".hero-blush-abstract-1", { x: 80 });
      gsap.set(".hero-blush-medal", { x: -120 });
      gsap.set(".hero-blush-star", { x: -30 });

      gsap.set(".hero-campaign", { y: -15 });
      gsap.set(".hero-venue-medal", { x: -40 });
      gsap.set(".green-flower", { x: -15 });

      gsap.set(".hero-square-left", { x: -15, y: 15 });
      gsap.set(".hero-circle-date", { x: 20, y: 8 });
      gsap.set(".hero-square-bottom", { x: 15, y: 50 });
      gsap.set(".hero-apuntate-marker", { y: 30, opacity: 0, scale: 0.9 });

      // Timeline principal con duraciones reducidas y overlaps mejorados
      const timeline = gsap.timeline({
        defaults: {
          ease: "power2.out",
          duration: 0.4
        }
      });

      timeline
        // Primer grupo - Aparecen casi simultáneamente
        .from(".hero-blush-abstract-2", {
          opacity: 0,
          y: 40,
          duration: 0.5,
        })
        .from(".hero-blush-medal", {
          opacity: 0,
          rotate: -180,
          x: -40,
          duration: 0.5,
        }, "-=0.3")
        .from(".hero-blush-abstract-1", {
          opacity: 0,
          x: -30,
          duration: 0.5,
        }, "-=0.2")
        .from(".hero-blush-star", {
          opacity: 0,
          rotate: 180,
          x: -40,
          duration: 0.5,
        }, "-=0.2")
        // Segundo grupo - Elementos principales
        .from(".hero-star", {
          opacity: 0,
          scale: 0.9,
          duration: 0.4,
        }, "-=0.1")
        .from(".hero-campaign", {
          opacity: 0,
          x: 300,
          duration: 0.6,
        }, "-=0.1")
        .from(".hero-gear-blue", {
          opacity: 0,
          x: "+=80",
          rotate: 90,
          duration: 0.5,
        }, "-=0.2")
        .from(".hero-square-left", {
          opacity: 0,
          x: -80,
          duration: 0.4,
        }, "-=0.2")

        // Tercer grupo - Elementos secundarios
        .from(".hero-venue-medal", {
          opacity: 0,
          x: -100,
          duration: 0.4,
        }, "-=0.1")
        .from(".hero-green-flower", {
          opacity: 0,
          scale: 0,
          rotate: -180,
          duration: 0.4,
        }, "-=0.1")
        .from(".hero-square-bottom", {
          opacity: 0,
          x: -60,
          y: 60,
          duration: 0.4,
        }, "-=0.1")
        .from(".hero-pill", {
          opacity: 0,
          y: 60,
          duration: 0.3,
        }, "-=0.1")
        .from(".hero-circle-date", {
          opacity: 0,
          scale: 0.8,
          duration: 0.4,
        }, "-=0.1")
        .from(".hero-gear-orange", {
          opacity: 0,
          rotate: -90,
          duration: 0.5,
        }, "-=0.2")
        .from(".hero-spain-flag", {
          opacity: 0,
          scale: 0.8,
          y: 20,
          duration: 0.4,
        }, "-=0.1")
        .from(".hero-info", {
          opacity: 0,
          y: 15,
          duration: 0.4,
        }, "-=0.1")
        .from(".hero-payment-card", {
          opacity: 0,
          y: 20,
          duration: 0.4,
        }, "-=0.1")

        // Elementos de acción
        .from(".hero-action-button", {
          y: "+=120",
          scale: 0.9,
          duration: 0.5,
        }, "-=0.2")
        .to(".hero-apuntate-marker", {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        }, "-=0.1");

      // Animación adicional para el texto principal
      gsap.from(".hero-star__text .line", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.2,
        ease: "power2.out"
      });

      // Animaciones continuas
      gsap.to(".hero-blush-medal", {
        rotate: "+=360",
        duration: 12,
        ease: "linear",
        repeat: -1,
      });

      // gsap.to(".hero-gear-orange", {
      //   rotate: "-=360",
      //   duration: 16,
      //   ease: "linear",
      //   repeat: -1,
      // });

      gsap.to(".hero-gear-blue", {
        rotate: "+=360",
        duration: 20,
        ease: "linear",
        repeat: -1,
      });

    }, bannerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <>
      <header ref={bannerRef} className="hero-banner w-full">
        <div className="hero-grid hero-grid--mosaic">
          <BlushAbstractOne />
          <BlushAbstractTwo />
          <BlushMedal />
          <BlushStar />
          <GreenFlower />
          <CampaignAnnouncement />
          <VenueMedal />
          <DateCircle />
          <HeroStarMessage />
          <OrangeGear />
          <BlueGear />
          <SpainFlag />
          <Info />
          {/* <GreenSquare className="hero-square-left" />
          <GreenSquare className="hero-square-bottom" variant="corner" />
          <GreenPill /> */}
          <ActionButton />
          <PaymentCard />
        </div>
        <ApuntateMarker />
      </header>
    </>
  );
}

// Los componentes restantes se mantienen igual...
function HeroStarMessage() {
  return (
    <div className="hero-star hero-star--main">
      <div className="hero-star__text">
        <h1 className="line iv">IV</h1>
        <h1 className="line jornada-solidaria">
          jornada solidaria
        </h1>
        <p className="line contra-la">contra la <span className="ela">ELA</span></p>
      </div>
    </div>
  );
}

function CampaignAnnouncement() {
  return (
    <div className="hero-panel hero-panel--campaign hero-campaign">
      <span className="hero-panel__lead hero-panel__lead--campaign">12€</span>
      <div className="hero-panel__text hero-panel__text--campaign">
        <p className="first">PULSERA</p>
        <p className="second">SOLIDARIA</p>
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
    <div className="hero-venue-medal">
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
      <span className="sabado">Sábado</span>
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

function BlushAbstractOne() {
  return <div className="hero-shape hero-blush-abstract-1" aria-hidden="true" />;
}

function BlushAbstractTwo() {
  return <div className="hero-shape hero-blush-abstract-2" aria-hidden="true" />;
}

function BlushMedal() {
  return <div className="hero-shape hero-blush-medal" aria-hidden="true" />;
}

function BlushStar() {
  return <div className="hero-shape hero-blush-star" aria-hidden="true" />;
}

function GreenFlower() {
  return <div className="hero-shape hero-green-flower" aria-hidden="true" />;
}

function SpainFlag() {
  return <div className="hero-shape hero-spain-flag" aria-hidden="true" />;
}

function Info() {
  return <div className="hero-info info" aria-hidden="true" >
    <span className="word">COMIDA</span>
    <span className="dot">·</span>
    <span className="word">DJ</span>
    <span className="dot">·</span>
    <span className="word">DIVERSIÓN</span>
  </div>;
}

function PaymentCard() {
  return <div className="hero-payment-card"/>;
}

function ActionButton() {
  return (
    <div className="hero-action-button">
      <img src="/shapes/logo-ayto.svg" alt="" />
    </div>
  );
}

function ApuntateMarker() {
  return (
    <div className="hero-apuntate-marker" aria-hidden="true">
      <span className="hero-apuntate-marker__text">¡Apúntate ya!</span>
    </div>
  );
}