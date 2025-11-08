"use client";

import Link from "next/link";

type HeroRegistrationSectionProps = {
  friendlyCount: number;
  onShowRegistration: () => void;
  onShowCollaborator: () => void;
};

export default function HeroRegistrationSection({
  friendlyCount,
  onShowRegistration,
  onShowCollaborator,
}: HeroRegistrationSectionProps) {
  return (
    <section
      id="registro"
      className="reveal-on-scroll relative flex justify-center gap-10 rounded-[48px] mt-20 lg:items-start"
    >
      <div className="hero-actions organic-card hero-actions--poster flex max-w-[800px] flex-col gap-8 rounded-[36px] bg-white p-8 lg:p-10">
        <div className="space-y-6">
          <h2 className="text-4xl font-black leading-tight lg:text-5xl">
            Súmate a la <span className="accent-text">IV Jornada</span>
          </h2>
          <div className="grid gap-3 my-5 sm:grid-cols-2">
            {/* Cuándo */}
            <div className="rounded-2xl border border-[var(--color-ink)]/10 bg-[var(--color-sun)]/10 from-[var(--color-cream)]/60 to-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink)]/70 mb-1">
                Cuándo
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-[var(--color-ink)] leading-tight">
                  6 de diciembre
                </p>
                <p className="text-sm text-[var(--color-ink)]/70">13:00 h</p>
              </div>
              <p className="mt-2 inline-flex items-center gap-2 rounded-xl text-[var(--color-ink)]">
                📍 Plaza de Villanueva de Bogas
              </p>
            </div>

            {/* Aportación */}
            <div className="rounded-2xl border border-[var(--color-ink)]/10 bg-[var(--color-sun)]/10 from-white via-[#FEE7FF]/80 to-[#FFF2C5]/70 p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink)]/70 mb-1">
                Aportación
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-[var(--color-ink)] leading-tight">
                  12 €
                </p>
                <p className="text-sm font-semibold text-[var(--color-ink)]/70">
                  por persona*
                </p>
              </div>
              <p className="mt-2 rounded-xl">
                Incluye tapeo, comida, bebida y actividades.
              </p>
            </div>
          </div>

          <p className="text-lg leading-relaxed mt-6 text-[var(--color-ink)]/85 lg:text-xl">
            Una jornada solidaria para apoyar la lucha contra la{" "}
            <span className="highlight-text">ELA</span> con{" "}
            <span className="highlight-text">buena comida</span>, música, deporte
            y actividades para todas las edades. Tu presencia suma y tu
            aportación se destina íntegramente a una asociación en defensa de
            quienes conviven con esta enfermedad.
          </p>

          {/* <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl bg-[var(--color-cloud)] p-6">
              <p className="text-md font-semibold uppercase tracking-wide text-[var(--color-sun)]">
                🍴 Menú solidario
              </p>
              <ul className="mt-3 space-y-2 text-md text-[var(--color-ink)]/90">
                <li>
                  <span className="font-semibold">Tapeo:</span> jamón, queso,
                  choricitos a la sidra, bacon, lacón a la gallega, ensaladilla
                  rusa, paté, patatas fritas, encurtidos y aceitunas.
                </li>
                <li>
                  <span className="font-semibold">Comida:</span> carcamusas
                  toledanas y migas.
                </li>
                <li>
                  <span className="font-semibold">Bebidas:</span> cerveza, vino,
                  refrescos y agua.
                </li>
                <li className="text-[var(--color-ink)]">
                  Y si todo sale según lo previsto, ¡macedonia de frutas de
                  postre!
                </li>
              </ul>
            </div>
          </div> */}
        </div>

        <p className="my-15 rounded-[26px] py-3 pb-7 text-4xl text-center font-semibold text-[var(--color-ink)]">
          Ya somos más de{" "}
          <span className="inline-block">
            <span className="left-0 bottom-0 w-full text-5xl h-[0.4em] bg-[var(--color-sun)]/70 px-3 py-1 rounded-2xl z-0">
              {friendlyCount}
            </span>
          </span>{" "}
          personas apuntadas...
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* <button
            type="button"
            className="button-hero button-hero-blue flex-1 text-lg lg:text-xl"
            onClick={onShowCollaborator}
          >
            ¡Quiero colaborar!
          </button> */}
          <button
            type="button"
            className="button-hero flex-1 text-lg lg:text-xl"
            onClick={onShowRegistration}
          >
            ¡Quiero apuntarme!
          </button>
        </div>
      </div>
    </section>
  );
}
