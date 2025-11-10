export default function ContactInfoCard() {
  return (
    <div className="organic-card flex flex-col gap-5 p-8 text-lg leading-relaxed text-[var(--color-ink)] lg:text-xl">
      <h3 className="text-2xl font-semibold lg:text-3xl">Propón tu colaboración</h3>
      <p>
        ¿Tienes una actuación, eres DJ o quieres apoyar la logística? Escríbenos y te ayudamos a
        sumarte al cartel solidario.
      </p>
      <div className="grid gap-3 text-lg font-semibold lg:text-xl">
        <span className="rounded-full bg-[var(--color-lilac)]/60 px-4 py-2">
          • Sumando logistica hacemos posible una jornada solidaria que marca la diferencia.
        </span>
        <span className="rounded-full bg-[var(--color-sky)]/50 px-4 py-2">
          • Cada aportación ayuda a que más dinero vaya directo a la lucha contra la ELA.
        </span>
        <span className="rounded-full bg-[var(--color-blush)]/70 px-4 py-2">
          • Si tienes un talento, súmate: música, baile, espectáculo… ¡tu arte también ayuda!
        </span>
      </div>
    </div>
  );
}
