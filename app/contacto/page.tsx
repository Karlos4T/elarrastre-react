import Link from "next/link";
import ContactForm from "../components/ContactForm";

export default function ContactoPage() {
  return (
    <div className="page-shell min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)]">
      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-14 px-6 py-16 sm:px-10 lg:px-20">
        <div className="shape-cloud" />
        <header className="relative flex flex-col gap-6 rounded-[40px] border-4 border-[var(--color-ink)] bg-white p-8 shadow-[0_16px_0_rgba(27,27,31,0.08)] sm:p-12">
          <Link href="/" className="text-sm font-semibold text-[var(--color-ink)]">
            ← Volver a la plaza solidaria
          </Link>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Contacto y propuestas <span className="highlight-text">que mueven montañas</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-ink)]/80">
            Déjanos tus datos y te contactaremos para definir la mejor manera de sumar a
            El Arrastre.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <ContactForm />
          <aside className="organic-card h-fit border-[var(--color-ink)]/0 p-6 text-sm text-[var(--color-ink)] sm:p-8">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">
              Ideas que buscamos
            </h2>
            <ul className="mt-4 space-y-2 text-sm font-medium">
              <li>• Programación artística y musical con alma comunitaria.</li>
              <li>• Acciones participativas y talleres colaborativos.</li>
              <li>• Apoyo en comunicación, producción y logística comprometida.</li>
            </ul>
            <p className="mt-4 text-sm font-medium">
              Si ya formas parte de la comunidad, usa este formulario para que nos
              organicemos contigo.
            </p>
          </aside>
        </section>
      </main>
    </div>
  );
}
