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
              {friendlyCount}
            </span>
          </span>{" "}
          personas apuntadas.
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
