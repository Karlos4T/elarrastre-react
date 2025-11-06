import RegistrationForm from "./components/RegistrationForm";
import ContactForm from "./components/ContactForm";
import { createSupabaseAdminClient } from "../lib/supabaseAdmin";
import HeroBanner from "./components/HeroBanner";
import CollaboratorsShowcase from "./components/CollaboratorsShowcase";

type CollaboratorRow = {
  id: number;
  name: string;
  image: string | null;
  created_at: string;
};

type Collaborator = CollaboratorRow & { imageSrc: string | null };

export default async function Home() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("collaborators")
    .select("id, name, image, created_at")
    .order("created_at", { ascending: false });

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

  const collaborators: Collaborator[] =
    data?.map((item) => ({
      ...item,
      imageSrc: (() => {
        const base64 = normalizeImage(item.image);
        return base64 ? `data:image/png;base64,${base64}` : null;
      })(),
    })) ?? [];

  return (
    <div className="page-shell min-h-screen w-full bg-[var(--color-blush)] text-[var(--color-ink)]">
      <HeroBanner />
      <main className="relative flex min-h-screen w-full flex-col gap-16 px-6 py-16 sm:px-10 lg:px-20">
        <div className="shape-sunburst" />
        <div className="shape-cloud" />
        <div className="shape-heartband" />

        <section
          id="registro"
          className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start"
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

        <section id="colaboradores" className="flex flex-col gap-10">
          <CollaboratorsShowcase collaborators={collaborators} />
        </section>

        <section
          id="contacto"
          className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start"
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
          © {new Date().getFullYear()} El Arrastre Solidario · Cultura que abraza, comunidad
          que transforma.
        </footer>
      </main>
    </div>
  );
}
