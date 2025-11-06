"use client";

import Image from "next/image";

type Edition = {
  year: number;
  highlight: string;
  description: string;
  image: string;
};

const EDITIONS: Edition[] = [
  {
    year: 2023,
    highlight: "Fuimos viento solidario",
    description:
      "Más de 300 vecinos se arrastraron por la plaza para bailar, cocinar y recaudar fondos vitales para la investigación.",
    image: "/shapes/orange-gear.png",
  },
  {
    year: 2022,
    highlight: "Festival de abrazos",
    description:
      "Artistas locales, microteatro y talleres inclusivos llenaron Villanueva de Bogas de historias que siguen resonando.",
    image: "/shapes/purple-medal.svg",
  },
  {
    year: 2021,
    highlight: "La primera ola",
    description:
      "Nació El Arrastre con una degustación solidaria y la banda sonora improvisada de quienes hoy forman nuestra peña.",
    image: "/shapes/logo-ayto.svg",
  },
];

export default function PreviousEditions() {
  return (
    <section
      id="ediciones"
      className="previous-editions reveal-on-scroll flex flex-col gap-8 rounded-[40px] border-4 border-[var(--color-ink)] bg-white/90 p-6 shadow-[0_14px_0_rgba(27,27,31,0.08)] sm:p-10"
    >
      <header className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-ink)]/60">
          Memoria viva
        </span>
        <h2 className="text-2xl font-extrabold text-[var(--color-ink)]">
          Ediciones anteriores
        </h2>
        <p className="max-w-2xl text-sm font-medium text-[var(--color-ink)]/70">
          Cada arrastre deja una estela de anécdotas, aprendizajes y abrazos. Así hemos
          ido creciendo como comunidad.
        </p>
      </header>

      <div className="previous-editions__list grid gap-6 md:grid-cols-3">
        {EDITIONS.map((edition) => (
          <article
            key={edition.year}
            className="flex flex-col gap-4 rounded-[28px] border-2 border-[var(--color-ink)]/15 bg-[var(--color-cream)]/80 p-4 text-[var(--color-ink)] shadow-[0_10px_0_rgba(27,27,31,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_0_rgba(27,27,31,0.12)]"
          >
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-ink)]/70">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white text-base font-bold">
                {edition.year}
              </span>
              {edition.highlight}
            </div>
            <div className="relative h-24 w-full overflow-hidden rounded-[18px] border border-[var(--color-ink)]/15 bg-white/70">
              <Image
                src={edition.image}
                alt={edition.highlight}
                fill
                className="object-contain p-3"
              />
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-ink)]/80">
              {edition.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
