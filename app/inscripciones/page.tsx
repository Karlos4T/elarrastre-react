import Link from "next/link";
import RegistrationForm from "../components/RegistrationForm";

export default function InscripcionesPage() {
  return (
    <div className="page-shell min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)]">
      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-14 px-6 py-16 sm:px-10 lg:px-20">
        <div className="shape-sunburst" />
        <header className="relative flex flex-col gap-6 rounded-[40px] border-4 border-[var(--color-ink)] bg-white p-8 shadow-[0_16px_0_rgba(27,27,31,0.08)] sm:p-12">
          <Link href="/" className="text-md font-semibold text-[var(--color-ink)]">
            ← Volver a la plaza solidaria
          </Link>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Inscripciones <span className="highlight-text">El Arrastre Solidario</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-ink)]/80">
            Déjanos tu nombre para sumarte a la comunidad. Solo lo utilizaremos para
            avisarte de novedades y actividades.
          </p>
        </header>

        <section className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <RegistrationForm />
          <aside className="organic-card h-fit border-[var(--color-ink)]/0 p-6 text-md text-[var(--color-ink)] sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">
              ¿Por qué apuntarte?
            </h2>
            <ul className="mt-4 space-y-2 text-md font-medium">
              <li>• Recibe noticias y convocatorias antes que nadie.</li>
              <li>• Forma parte de una red solidaria llena de ritmo y creatividad.</li>
              <li>• Participa en talleres, conciertos y acciones de comunidad.</li>
            </ul>
          </aside>
        </section>
      </main>
    </div>
  );
}
