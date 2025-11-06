import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import { createSupabaseAdminClient } from "../../lib/supabaseAdmin";
import { getAdminSession } from "../../lib/auth";

type CollaboratorRow = {
  id: number;
  name: string;
  image: string | null;
  created_at: string;
  web_link: string | null;
  position: number | null;
};

type RegistrationRow = {
  id: number;
  name: string;
  created_at: string;
};

type ContactRequestRow = {
  id: number;
  name: string;
  mail: string;
  phone: string | null;
  request: string;
  created_at: string;
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const supabase = createSupabaseAdminClient();
  const [registrationsResult, collaboratorsResult, contactRequestsResult] =
    await Promise.all([
      supabase
        .from("registrations")
        .select("id, name, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("collaborators")
        .select("id, name, image, created_at, web_link, position")
        .order("position", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true }),
      supabase
        .from("contact_requests")
        .select("id, name, mail, phone, request, created_at")
        .order("created_at", { ascending: false }),
    ]);

  if (registrationsResult.error) {
    throw new Error(
      `No se pudo obtener las inscripciones: ${registrationsResult.error.message}`
    );
  }

  if (collaboratorsResult.error) {
    throw new Error(
      `No se pudo obtener la lista de colaboradores: ${collaboratorsResult.error.message}`
    );
  }

  if (contactRequestsResult.error) {
    throw new Error(
      `No se pudo obtener las propuestas: ${contactRequestsResult.error.message}`
    );
  }

  const normalizeImage = (image: string | null) => {
    if (!image) return null;
    if (image.startsWith("\\x")) {
      return Buffer.from(image.slice(2), "hex").toString("base64");
    }
    return image;
  };

  const collaborators = (collaboratorsResult.data ?? [])
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
    <div className="page-shell min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)]">
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:px-10 lg:px-20">
        <div className="shape-sunburst" />
        <div className="shape-cloud" />
        <AdminDashboard
          registrations={registrationsResult.data ?? []}
          collaborators={collaborators}
          contactRequests={contactRequestsResult.data ?? []}
        />
      </main>
    </div>
  );
}
