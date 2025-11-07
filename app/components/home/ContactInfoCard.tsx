export default function ContactInfoCard() {
  return (
    <div className="organic-card flex flex-col gap-5 p-8 text-lg leading-relaxed text-[var(--color-ink)] lg:text-xl">
      <h3 className="text-2xl font-semibold lg:text-3xl">Propón tu colaboración</h3>
      <p>
        ¿Tienes una actuación, un taller o quieres apoyar la logística? Escríbenos y te ayudamos a
        sumarte al cartel solidario.
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
  );
}
