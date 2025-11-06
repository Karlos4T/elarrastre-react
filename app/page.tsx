import Link from "next/link";
import RegistrationForm from "./components/RegistrationForm";
import ContactForm from "./components/ContactForm";
import { createSupabaseAdminClient } from "../lib/supabaseAdmin";
import HeroBanner from "./components/HeroBanner";
import CollaboratorsShowcase from "./components/CollaboratorsShowcase";
import ScrollAnimations from "./components/ScrollAnimations";
import PreviousEditions from "./components/PreviousEditions";
import MobileNav from "./components/MobileNav";

type CollaboratorRow = {
  id: number;
  name: string;
  image: string | null;
  created_at: string;
  web_link: string | null;
  position: number | null;
};

type Collaborator = CollaboratorRow & { imageSrc: string | null; webLink: string | null };

export default async function Home() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("collaborators")
    .select("id, name, image, created_at, web_link, position")
    .order("position", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`No se pudo obtener la lista de colaboradores: ${error.message}`);
  }

  const normalizeImage = (image: string | null) => {
    if (!image) return null;
    if (image.startsWith("\\x")) {
      return Buffer.from(image.slice(2), "hex").toString("base64");
    }
    return image;
  };

  const collaborators: Collaborator[] = (data ?? [])
    .map((item, index) => ({
      ...item,
      imageSrc: (() => {
        const base64 = normalizeImage(item.image);
        return base64 ? `data:image/png;base64,${base64}` : null;
      })(),
      webLink: item.web_link,
      position: item.position ?? index + 1,
    }))
    .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));

  return (
    <div className="page-shell min-h-screen w-full bg-[var(--color-blush)] text-[var(--color-ink)]">
      <ScrollAnimations />
      <HeroBanner />
      <main className="relative flex min-h-screen w-full flex-col gap-16 px-6 py-16 pb-32 sm:px-10 lg:px-20 lg:pb-20">
        <div className="shape-sunburst" />
        <div className="shape-cloud" />
        <div className="shape-heartband" />

        <section
          id="registro"
          className="reveal-on-scroll relative grid gap-8 rounded-[48px] lg:grid-cols-[1.2fr_1fr] lg:items-start lg:p-10"
        >
          <RegistrationForm />
          <div className="organic-card flex flex-col gap-4 p-6 text-sm leading-relaxed text-[var(--color-ink)] sm:p-8">
            <h3 className="text-xl font-semibold">
              ¿Qué es <span className="accent-text">El Arrastre</span>?
            </h3>
            <p className="mt-3 leading-relaxed">
              Una comunidad vibrante que impulsa experiencias culturales para apoyar a las
              personas con ELA. Cada nombre sumado amplifica la causa y abre puertas a
              acciones solidarias.
            </p>
            <ul className="grid gap-2 text-sm font-medium">
              <li>• Acceso prioritario a actividades y encuentros solidarios.</li>
              <li>• Información cercana sobre la causa y cómo sumar desde tu barrio.</li>
              <li>• Comunidad llena de energía, apoyo y alegría compartida.</li>
            </ul>
          </div>
        </section>

        <section id="colaboradores" className="reveal-on-scroll flex flex-col gap-10">
          <CollaboratorsShowcase collaborators={collaborators} />
        </section>

        <PreviousEditions />

        <section
          id="contacto"
          className="reveal-on-scroll grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start"
        >
          <ContactForm />
          <div className="organic-card flex flex-col gap-4 p-6 text-sm leading-relaxed text-[var(--color-ink)] sm:p-8">
            <h3 className="text-xl font-semibold">
              Propón tu colaboración
            </h3>
            <p>
              Cuéntanos qué te gustaría aportar: talleres, música, comunicación, logística o
              cualquier idea loca que sume esperanza. Cada propuesta se escucha y se celebra.
            </p>
            <div className="grid gap-3 text-sm font-medium">
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
        </section>

        <footer className="rounded-[36px] border-4 border-[var(--color-ink)] bg-white px-8 py-6 text-sm font-semibold text-[var(--color-ink)] shadow-[0_12px_0_rgba(27,27,31,0.08)]">
          <p>
            © {new Date().getFullYear()} El Arrastre Solidario · Cultura que abraza,
            comunidad que transforma.
          </p>
          <Link
            href="/admin"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full border-2 border-[var(--color-ink)] px-6 py-2 text-base font-semibold transition hover:bg-[var(--color-ink)] hover:text-white sm:w-auto"
          >
            Panel de administración
          </Link>
        </footer>
      </main>
    </div>
  );
}
