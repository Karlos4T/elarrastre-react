"use client";

import Image from "next/image";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import Slider from "react-slick";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Edition = {
  edition: string;
  highlight: string;
  description: string;
  image: string;
};

const EDITIONS: Edition[] = [
  {
    edition: 'III',
    highlight: "Fuimos viento solidario",
    description:
      "Artistas locales, microteatro y animadores llenaron la plaza de Villanueva de Bogas de historias que siguen resonando.",
    image: "/edicion-3.webp",
  },
  {
    edition: 'II',
    highlight: "Festival de abrazos",
    description:
      "Más de 300 vecinos se acercaron a la plaza para bailar, colaborar y recaudar fondos vitales para la investigación.",
    image: "/edicion-2.webp",
  },
  {
    edition: 'I',
    highlight: "La primera ola",
    description:
      "Nació la Jornada contra la ELA con una degustación solidaria y la banda sonora improvisada de quienes forman nuestra peña.",
    image: "/edicion-1.webp",
  },
];

type EditionStyle = {
  className: string;
  primary: string;
  secondary: string;
};

const EDITION_STYLES: EditionStyle[] = [
  {
    className: "edition-card--sunburst",
    primary: "var(--color-sun)",
    secondary: "var(--color-tangerine)",
  },
  {
    className: "edition-card--lagoon",
    primary: "var(--color-sky)",
    secondary: "var(--color-lilac)",
  },
  {
    className: "edition-card--meadow",
    primary: "var(--color-forest)",
    secondary: "var(--color-forest)",
  },
];

export default function PreviousEditions() {
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);
    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const cards = Array.from(
        sectionRef.current?.querySelectorAll<HTMLElement>(".edition-card") ?? []
      );

      if (!cards.length) {
        return;
      }

      gsap.set(cards, { opacity: 0, y: 40, rotate: -2, scale: 0.95 });

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        rotate: 0,
        scale: 1,
        duration: 1,
        ease: "elastic.out(1, 0.75)",
        stagger: 0.08,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  const sliderSettings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 5000,
      arrows: false,
      adaptiveHeight: true,
      dotsClass: "slick-dots previous-editions__dots",
    }),
    []
  );

  const renderEditionCard = (edition: Edition, index: number) => {
    const variant = EDITION_STYLES[index % EDITION_STYLES.length];
    const toneStyle = {
      "--edition-accent": variant.primary,
      "--edition-accent-secondary": variant.secondary,
    } as CSSProperties;

    return (
      <article
        key={edition.edition}
        className={`edition-card ${variant.className}`}
        style={toneStyle}
      >
        <div className="edition-card__header">
          <span className="edition-card__badge">{edition.edition}</span>
          {edition.highlight}
        </div>
        <div className="edition-card__image">
          <Image
            src={edition.image}
            alt={edition.highlight}
            fill
            className="object-cover"
          />
        </div>
        <p className="text-md leading-relaxed text-[var(--color-ink)]/80">
          {edition.description}
        </p>
      </article>
    );
  };

  return (
    <section
      id="ediciones"
      className="previous-editions reveal-on-scroll flex flex-col gap-8 rounded-[40px] border-4 border-[var(--color-ink)] bg-white/90 p-6 shadow-[0_14px_0_rgba(27,27,31,0.08)] sm:p-10"
      ref={sectionRef}
    >
      <header className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink)]/60">
          Memoria viva
        </span>
        <h2 className="text-2xl font-extrabold text-[var(--color-ink)]">
          Ediciones anteriores
        </h2>
        <p className="text-md font-medium text-[var(--color-ink)]/70">
          Cada edicion deja una estela de anécdotas, aprendizajes y abrazos. Así hemos ido creciendo y mejorando.
        </p>
      </header>

      {isMobile ? (
        <Slider
          {...sliderSettings}
          className="previous-editions__slider -mx-4 pb-2"
        >
          {EDITIONS.map((edition, index) => (
            <div key={edition.edition} className="px-2">
              {renderEditionCard(edition, index)}
            </div>
          ))}
        </Slider>
      ) : (
        <div className="previous-editions__list grid gap-6 md:grid-cols-3">
          {EDITIONS.map((edition, index) => renderEditionCard(edition, index))}
        </div>
      )}
    </section>
  );
}
